const showdown = require('showdown');
const converter = new showdown.Converter();
converter.setFlavor('github')

import axios from 'axios';
import Code from './code';

window.onload = init;
function init() {
    initUI()
}

function onclickBack(event) {
    event.preventDefault();
    toggleUI()
}

const cache = {}
function onclickEntry(event) {
    event.stopPropagation();
    event.preventDefault();

    const header = event.currentTarget.innerHTML
    const skylink = event.currentTarget.dataset['content']
    if (cache[skylink]) {
        loadDetail(header, cache[skylink])
        return
    }

    const url = "http://www.siasky.net/web/" + trimPrefix(skylink, 'sia://')
    axios.get(url, { withCredentials: false }).then(resp => {
        cache[skylink] = converter.makeHtml(resp.data)
        loadDetail(header, cache[skylink])
    }).catch(error => {
        console.log(error)
    })
}

function loadDetail(headerHTML, contentHTML) {
    const detail = document.getElementById("detail");
    detail.innerHTML = "" // clear

    const header = document.createElement('div')
    header.innerHTML = headerHTML
    detail.appendChild(header)

    const content = document.createElement('div')
    content.innerHTML = contentHTML
    detail.appendChild(content)

    Prism.highlightAll();
    Code.ToTabs();
    toggleUI()
}

function initUI() {
    const entries = document.getElementsByClassName("blog-entry")
    for (let i = 0; i < entries.length; i++) {
        entries[i].addEventListener('click', onclickEntry)
    }

    const backBtn = document.getElementById("back")
    backBtn.addEventListener('click', onclickBack)
}

function toggleUI() {
    const toggle = function (el) { el.style.display = el.style.display === "none" ? "block" : "none" }
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