# Blog Demo

### Getting started

It's pretty easy to get your blog up and running.  
If you want a sneak peek of how it looks like, you can check out mine here
[sia://HABdQ9i0l0xJpRh2J2h-4c8oPyZQNH5SoBIWqcg8HrsvzQ][1].

The only thing you have to do is write a blog post and run a script.  
Seeing as markdown seems to be the go-to for technical writing lately, I
followed suit.  
The markdown will be automically converted to HTML.

**To write a blog posts:**
- add a new post in the blog directory
- add a header
- (!) use markdown reference links at the bottom of your file

The header is necessary to be able to render a decent table of contents.  
It has the following format, not all fields are required but it looks better.

```bash
---
title:
image:
description:
author:
date:
---
```

**To deploy your blog:**  
- run the following commands
- (!) it will currently deploy your blog to the siasky.net portal, you can
pass in your own portal using the `--portal` flag.

```bash
npm install
npm run deploy
```

After running the deploy script, you'll get a link to your static blog site.  
Et voilà, that's it!

[1]: http://siasky.net/HABdQ9i0l0xJpRh2J2h-4c8oPyZQNH5SoBIWqcg8HrsvzQ