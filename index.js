const showdown = require('showdown');
const converter = new showdown.Converter();

import axios from 'axios';

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
    const sialink = event.currentTarget.dataset['content']
    if (cache[sialink]) {
        loadDetail(header, cache[sialink])
        return
    }

    const url = "http://www.siasky.net/api/sialink/" + trimPrefix(sialink, 'sia://')
    axios.get(url, { withCredentials: false }).then(resp => {
        console.log(converter.makeHtml(resp.data))
        cache[sialink] = converter.makeHtml(resp.data)
        loadDetail(header, cache[sialink])
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