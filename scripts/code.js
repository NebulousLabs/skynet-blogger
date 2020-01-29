var self = window

var Code = (function (window) {
    return {
        // ToTabs will group all consecutive code blocks and turn them into a
        // tabbed layout
        ToTabs: function () {
            const codeBlocks = this.findConsecutiveBlocks(2)
            console.log(codeBlocks)
            for (const cb of codeBlocks) {
                // build tabs html
                let html = '<ul class="tabs">'
                const index = 0
                for (const code of cb) {
                    index++
                    const language = code.className.split('-')[1]
                    if (index == 1) {
                        html += `
                        <li class="tab">
                        <input type="radio" name="tabs" id="tab${index}" checked />
                        <label for="tab${index}">${language}</label>
                        <div id="tab-content${index}" class="content">${code.innerHTML}</div>
                        </li>
                        `
                    } else {
                        html += `
                        <li class="tab">
                        <input type="radio" name="tabs" id="tab${index}" />
                        <label for="tab${index}">${language}</label>
                        <div id="tab-content${index}" class="content">${code.innerHTML}</div>
                        </li>
                        `
                    }
                }
                html += '</ul>'

                // insert the tabs just before the first code block
                cb[0].parentNode.insertBefore(this.htmlToElement(html), cb[0])

                // remove the <pre> elements
                for (const code of cb) {
                    code.parentNode.removeChild(code)
                }
            }
        },


        // findConsecutiveBlocks will search for all <pre> tags and return a
        // nested array of consectuive blocks of minLength
        findConsecutiveBlocks: function (minLength) {
            const pres = window.document.getElementsByTagName('pre')

            let blocks = []
            let block = []
            let curr, next;
            for (let i = 0; i < pres.length; i++) {
                curr = pres[i]
                next = pres[i + 1]

                block.push(curr)
                if (curr.nextElementSibling != next) {
                    blocks.push(block)
                    block = []
                }
            }
            blocks.push(block)

            blocks = blocks.filter(el => el.length >= minLength).filter(Boolean)
            return blocks
        },

        // htmlToElement turns an html string into a DOM element
        htmlToElement(html) {
            // TODO: check if browser supports templates
            var template = document.createElement('template');
            html = html.trim();
            template.innerHTML = html;
            return template.content.firstChild;
        },
    }
})(self)

export default Code