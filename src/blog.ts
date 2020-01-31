
import axios from "axios";
import fs from "fs-extra";
import { HTMLElement, parse } from 'node-html-parser';
import { BlogPost } from "./blogpost";
import { BlogAssets } from "./types";
import { toAbsolute, toRelative } from './utils';

// Blog is a collection of blog posts. It requires the location of the
// index.html file and the directory of where the blog posts (written in
// markdown) are located.
//
// A blog can be published to a Sia viewnode. To publish a blog, all the
// required assets will need to be uploaded separately. This includes all of the
// assets used by the index.html and assets that are used in the blog posts.
//
// The resulting sia linkfiles are string replaced into their appropriate
// location. Once all assets are published, a table of contents is created and
// inserted into the index.html.
export class Blog {
    public html: string;
    public posts: BlogPost[];
    public assets: BlogAssets;

    constructor(
        private indexLocation: string,
        private blogLocation: string,
        private announcement: boolean
    ) { this.parse() }

    public async publish(portal: string, uploadpath: string) {
        if (!this.posts.length) {
            return
        }

        if (this.announcement) {
            await this.publishAnnouncement(portal, uploadpath)
            return
        }
        await this.publishBlog(portal, uploadpath)
    }

    public update(assets: BlogAssets) {
        // update asset links in html w/published asset links
        const assetsRel = toRelative(assets, this.blogLocation)
        Object.keys(assetsRel).forEach(key => {
            this.html = this.html.replace(key, assetsRel[key])
        })

        // update asset links in markdown w/published asset links
        for (const post of this.posts) {
            if (!post.isPublished()) {
                post.update(assets)
            }
        }
    }

    private async publishAnnouncement(portal: string, uploadpath: string) {
        if (this.posts.length != 1) {
            throw new Error("Announcement can only be 1 post")
        }

        // upload the post
        await this.posts[0].publish(portal, uploadpath)
        const skylink = this.posts[0].header.linkfile

        // set the announcement skylink        
        const root = parse(this.html.toString()) as unknown as HTMLElement
        root.querySelector('#announcement').set_content(skylink)

        // hide the #noposts div
        root.querySelector('#noposts').set_content("")
        this.html = root.toString()

        // fetch post contents
        const response = await axios.get(`${portal}/web/${skylink}`)
        this.html = this.html.replace(skylink, response.data)
    }

    private async publishBlog(portal: string, uploadpath: string) {
        // publish all posts separately
        await Promise.all(this.posts.map(p => p.publish(portal, uploadpath)))

        // build a table of contents
        const toc = this.buildToC();

        // update the #toc div
        const root = parse(this.html.toString()) as unknown as HTMLElement
        const htoc = root.querySelector('#toc') as unknown as HTMLElement
        htoc.set_content(toc)

        // hide the #noposts div
        root.querySelector('#noposts').set_content("")
        this.html = root.toString()
    }

    private parse() {
        this.html = fs.readFileSync(this.indexLocation).toString()
        this.posts = fs.readdirSync(this.blogLocation)
            .filter(p => !p.startsWith("."))
            .map(p => new BlogPost(`${this.blogLocation}/${p}`))

        this.parseAssets()
    }

    private parseAssets() {
        let assets: BlogAssets = {}

        const root = parse(this.html) as unknown as HTMLElement
        [
            'audio',
            'embed',
            'iframe',
            'img',
            'input',
            // 'script',
            'source',
            'track',
            'video',
        ].forEach(el => {
            root.querySelectorAll(el).forEach(el => {
                if (el.attributes.src.indexOf('://') == -1) {
                    assets[el.attributes.src] = null
                }
            })
        })
        assets = toAbsolute(assets, this.blogLocation)

        for (const post of this.posts) {
            if (!post.isPublished()) {
                assets = { ...assets, ...post.assets }
            }
        }
        this.assets = assets
    }

    private buildToC() {
        // TODO order by date
        let toc = '<ul>'
        this.posts.reverse().forEach(post => {
            const header = post.header
            toc += `<li class="blog-entry" data-content="${header.linkfile}">`
            toc += header.title ? `<h2>${header.title}</h2>` : ''
            toc += header.image ? `<img src="${header.image}"/>` : ''
            toc += header.description ? `<p class="blog-entry-description">${header.description}</p>` : ''
            toc += header.author ? `<h5 class="blog-entry-author">${header.author}</h5>` : ''
            toc += header.date ? `<h5 class="blog-entry-date">${header.date}</h5>` : ''
            toc += '</li>'
        })
        toc += '</ul>'
        return toc;
    }
}