# Blog Demo

### Getting started

It's pretty easy to get your blog up and running.  
If you want a sneak peek of how it looks like, you can check out mine [here][1].

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

[1]: http://siasky.net/api/sialink/jABfYMv0eyszQ-vhHdfkttwxTVbSV9mDfYpvPqlH5AkfLQ