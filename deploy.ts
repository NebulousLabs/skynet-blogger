import execa from 'execa';
import fs from 'fs-extra';
import Listr from 'listr';
import path from 'path';
import { Blog } from './src/blog';
import { splitN, upload, viewnodeLink } from './src/utils';

type Ctx = {
    args: {
        portal: string;
        uploadpath: string;
        indexLocation: string;
        blogLocation: string;
        announcement: boolean;
    };
    blog: Blog;
    url: string;
}

const tasks = new Listr([
    {
        title: 'Parse blog',
        task: (ctx: Ctx) => {
            const bkp = bkpLocation(ctx.args.indexLocation)
            if (fs.existsSync(bkp)) {
                fs.unlinkSync(ctx.args.indexLocation)
                fs.moveSync(bkp, ctx.args.indexLocation)
            }
            ctx.blog = new Blog(ctx.args.indexLocation, ctx.args.blogLocation, ctx.args.announcement)
        }
    },
    {
        title: 'Publish assets',
        task: async (ctx: Ctx) => {
            const uploaded = {}
            for (const asset of Object.keys(ctx.blog.assets)) {
                const skylink = await upload(ctx.args.portal, ctx.args.uploadpath, asset)
                uploaded[asset] = viewnodeLink(ctx.args.portal, skylink)
            }
            ctx.blog.update(uploaded)
        },
    },
    {
        title: 'Publish blog posts',
        task: async (ctx: Ctx) => {
            await ctx.blog.publish(ctx.args.portal, ctx.args.uploadpath)
            const bkp = bkpLocation(ctx.args.indexLocation)
            fs.copyFileSync(ctx.args.indexLocation, bkp)
            fs.writeFileSync(ctx.args.indexLocation, ctx.blog.html, 'utf-8')
        },
    },
    {
        title: 'Build blog',
        task: async (ctx: Ctx) => {
            await execa('parcel', ['build', ctx.args.indexLocation, '--public-url', '.'])
        }
    },
    {
        title: 'Deploy blog',
        task: async (ctx: Ctx) => {
            const dist = distLocation(ctx.args.indexLocation)
            const lf = await upload(ctx.args.portal, ctx.args.uploadpath, dist)
            ctx.url = viewnodeLink(ctx.args.portal, lf)
        }
    }
]);

const printUsage = () => {
    console.log(`
    Usage: npm run deploy [options]
    
    Options:
    -h, --help          print this message
    -p, --portal        specify the skynet portal
    -u, --uploadpath    specify the upload path
    -i, --index         specify the location of the index.html
    -b, --blog          specify the location of the blog posts
    -a, --announcement  specify if it's an announcement (1 pager)
    `)
}

const parseArgs = (args: string[]): {
    portal: string;
    uploadpath: string;
    indexLocation: string;
    blogLocation: string;
    announcement: boolean;
} => {
    const out = defaults
    for (let i = 0; i < args.length; i += 2) {
        switch (args[i]) {
            case '-p':
            case '--portal':
                out['portal'] = args[i + 1]
                break;
            case '-u':
            case '--uploadpath':
                out['uploadpath'] = args[i + 1]
                break;
            case '-i':
            case '--index':
                out['indexLocation'] = args[i + 1]
                break;
            case '-b':
            case '--blog':
                out['blogLocation'] = args[i + 1]
                break;
            case '-a':
            case '--announcement':
                out['announcement'] = true
                break;
            case '-h':
            case '--help':
                printUsage()
                process.exit(0)
            default:
                console.log("ERROR: unknown option", args[i])
                printUsage()
                process.exit(0)
        }
    }

    if (!fs.existsSync(out['indexLocation'])) {
        if (fs.existsSync(templateLocation(out['indexLocation']))) {
            fs.copyFileSync(
                templateLocation(out['indexLocation']),
                out['indexLocation']
            )
        } else {
            throw new Error(`index.html not found at ${out['indexLocation']}`)
        }
    }

    if (!fs.existsSync(out['blogLocation'])) {
        throw new Error(`blog not found at ${out['blogLocation']}`)
    }

    return out
}

const defaults = {
    'portal': 'http://siasky.net',
    'uploadpath': '/api/skyfile',
    'indexLocation': `${__dirname}/index.html`,
    'blogLocation': `${__dirname}/blog`,
    'announcement': false,
};

const bkpLocation = (location: string) => {
    const dirname = path.dirname(location)
    const basename = path.basename(location)
    const parts = splitN(basename, ".", 2)
    return `${dirname}/${parts[0]}_bkp.${parts[1]}`
}

const templateLocation = (location: string) => {
    const dirname = path.dirname(location)
    const basename = path.basename(location)
    const parts = splitN(basename, ".", 2)
    return `${dirname}/${parts[0]}_template.${parts[1]}`
}

const distLocation = (location: string) => {
    const basename = path.basename(location)
    return `${__dirname}/dist/${basename}`
}

(async () => {
    try {
        var args = parseArgs(process.argv.slice(2));
        const ctx = await tasks.run({ args: args, blog: null, url: null })
        console.log(`\nVisit your blog at ${ctx.url}\n`)
    } catch (err) {
        // error will be displayed in the task's output
    }
})();