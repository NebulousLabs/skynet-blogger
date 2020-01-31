const showdown = require('showdown');
const converter = new showdown.Converter();
converter.setFlavor('github')

import axios from 'axios';
import Code from './code';

window.onload = init;
window.onpopstate = function (event) {
    toggleUI()
}

function init() {
    initUI()
}

function onclickBack(event) {
    event.preventDefault();
    window.history.back()
}

const cache = {}
function onclickEntry(event) {
    event.stopPropagation();
    event.preventDefault();

    const header = event.currentTarget.innerHTML
    const skylink = event.currentTarget.dataset['content']
    if (cache[skylink]) {
        loadDetail(header, cache[skylink])
        toggleUI()
        return
    }

    const url = "http://www.siasky.net/web/" + trimPrefix(skylink, 'sia://')
    axios.get(url, { withCredentials: false }).then(resp => {
        cache[skylink] = converter.makeHtml(resp.data)
        loadDetail(header, cache[skylink])
        toggleUI()
    }).catch(error => {
        console.log(error)
    })
}

function loadDetail(headerHTML, contentHTML) {
    const detail = document.getElementById("detail");
    detail.innerHTML = "" // clear

    const header = document.createElement('div')
    header.innerHTML = headerHTML
    // detail.appendChild(header) 

    const content = document.createElement('div')
    content.innerHTML = contentHTML
    detail.appendChild(content)

    const title = header.getElementsByTagName("h2")[0]
    window.history.pushState({ page: 1 }, title.innerHTML)
    window.history.forward()

    Prism.highlightAll();
    Code.ToTabs();
}

function initUI() {
    const entries = document.getElementsByClassName("blog-entry")

    // announcement
    if (entries.length == 0) {
        // announcement hack
        const announcement = document.getElementById("announcement")
        const contentHTML = converter.makeHtml(announcement.innerHTML)

        // Don't look at me. I'm hideous
        const tmp = document.createElement('div')
        tmp.innerHTML = contentHTML
        const title = tmp.getElementsByTagName('h1')[0].innerHTML
        const headerHTML = `<h2>${title}</h2>`
        loadDetail(headerHTML, contentHTML)

        toggle(document.getElementById("detail"))
        return
    }

    // blog
    else {
        for (let i = 0; i < entries.length; i++) {
            entries[i].addEventListener('click', onclickEntry)
        }

        const backBtn = document.getElementById("back")
        backBtn.addEventListener('click', onclickBack)

        toggle(document.getElementById("nav"))
        toggle(document.getElementById("toc"))
    }
}

function toggle(el) {
    el.style.display = el.style.display === "none" ? "block" : "none"
}

function toggleUI() {
    toggle(document.getElementById("toc"))
    toggle(document.getElementById("back"))
    toggle(document.getElementById("detail"))
}

function trimPrefix(str, prefix) {
    if (str.startsWith(prefix)) {
        return str.slice(prefix.length)
    } else {
        return str
    }
}