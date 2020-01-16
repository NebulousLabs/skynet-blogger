# Blog Demo

### Getting started

It's pretty easy to get your blog up and running.  
The only thing you have to do is write a blog post, and then run the deploy script.

Seeing as markdown seems to be the go-to for technical writing lately, I
followed suit.  
The markdown will be automically converted to HTML.

**To write a blog posts:**
- add a new markdown file to the blog directory
- write your blog post
- add a header

The header is necessary to be able to render a decent table of contents.  
It has the following format, not all fields are required but it looks better.

```
---
title:
image:
description:
author:
date:
---
```

**To deploy your blog:**
- run the following commands:
```
npm install
npm run deploy -- -n http://siasky.net
```

After running the deploy script, you'll get a link to your static blog site.  
Et voilà, that's it!