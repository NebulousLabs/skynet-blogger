import fs, { removeSync, rmdirSync } from "fs-extra";
import path from 'path';
import { dirSync } from 'tmp';
import { BlogAssets, BlogLink, BlogPostHeader } from "./types";
import { splitN, toAbsolute, toRelative, upload } from "./utils";

export class BlogPost {
    public header: BlogPostHeader;
    public assets: BlogAssets;
    public links: BlogLink[];
    public raw: string;

    private bre = new RegExp("^---(?<header>.*?)---(?<post>.*)", "ms")
    private lre = new RegExp("(?<tag>\\[.*\\]):(?<link>.*)", "g")


    constructor(private location: string) { this.parse() }

    public async publish(portal: string, uploadpath: string) {
        if (this.isPublished()) {
            return
        }

        console.log(`Publishing ${path.basename(this.location)}`)

        // Get the (updated) contents
        const matches = this.bre.exec(this.raw)
        const contents = matches.groups['post'].trim();

        // Write them to a tmp file
        const tmp = dirSync({ prefix: 'blogposttmp' })
        const tmpfile = `${tmp.name}/tmp${path.basename(this.location)}`
        fs.writeFileSync(tmpfile, contents, 'utf-8')

        // Upload & cleanup
        this.header.linkfile = await upload(portal, uploadpath, tmpfile)
        removeSync(tmpfile)
        rmdirSync(tmp.name)

        // Update the header
        let updated = "---\n";
        Object.keys(this.header).forEach(key => {
            if (this.header[key]) {
                updated += `${key}: ${this.header[key]}\n`
            }
        })
        updated += "---\n";
        updated += contents
        fs.writeFileSync(this.location, updated, 'utf-8')
    }

    public isPublished(): boolean {
        return this.header.linkfile != null
    }

    public update(assets: BlogAssets) {
        const assetsRel = toRelative(assets, this.location)
        if (assetsRel[this.header.image]) {
            this.header.image = assetsRel[this.header.image]
        }
        Object.keys(assetsRel).forEach(key => {
            this.raw = this.raw.replace(key, assetsRel[key])
        })
    }

    private parse() {
        this.raw = fs.readFileSync(this.location).toString()
        const matches = this.bre.exec(this.raw)
        this.parseHeader(matches.groups['header'].trim())
        this.parseLinks(matches.groups['post'].trim())
        this.parseAssets()
    }

    private parseHeader(header: string) {
        this.header = this.defaultHeader()
        const isField = (input: string): boolean => {
            const fields = Object.keys(this.header);
            for (let i = 0; i < fields.length; i++) {
                if (input.startsWith(fields[i])) {
                    return true
                }
            }
            return false
        }

        let prev: string;
        let parts: string[];
        header.split('\n').forEach(line => {
            // allow multi-line fields
            if (!isField(line)) {
                this.header[prev] += "\n"
                this.header[prev] += line.trim()
                return
            }
            parts = splitN(line, ":", 2)
            Object.keys(this.header).forEach(h => {
                if (parts[0].toLowerCase() == h) {
                    this.header[h] = parts[1].trim()
                    prev = h
                }
            })
        })
    }

    private parseLinks(raw: string) {
        this.links = []
        let match = this.lre.exec(raw)
        while (match != null) {
            this.links.push(match.groups as { tag: string; link: string });
            match = this.lre.exec(raw);
        }
    }

    private parseAssets() {
        const assets: BlogAssets = {}
        if (this.header.image) {
            assets[this.header.image] = null
        }
        this.links.forEach(link => {
            if (link.link.indexOf('://') == -1) {
                assets[link.link.trim()] = null
            }
        })
        this.assets = toAbsolute(assets, this.location)
    }

    private defaultHeader(): BlogPostHeader {
        return {
            title: null,
            image: null,
            description: null,
            author: null,
            date: null,
            linkfile: null,
        }
    }
}