import axios from "axios";
import FormData from 'form-data';
import fs from "fs-extra";
import path from 'path';
import { BlogAssets } from "./types";

require('dotenv').config();

export async function upload(portal: string, uploadpath: string, path: string): Promise<string> {
    const formData = new FormData();
    formData.append('file', fs.createReadStream(path));

    try {
        const resp = await axios.post(portal + uploadpath, formData, {
            auth: {
                username: process.env.SIANODE_AUTH_USERNAME,
                password: process.env.SIANODE_AUTH_PASSWORD,
            },
            headers: formData.getHeaders()
        })
        return resp.data['skylink']
    } catch (err) {
        throw new Error(`Upload failed with error ${err}`)
    }
}

export function viewnodeLink(portal: string, skylink: string) {
    if (!portal) {
        throw new Error('Could not generate viewnode link, portal undefined')
    }
    if (!skylink) {
        throw new Error('Could not generate viewnode link, skylink undefined')
    }
    return `${trimTrailingSlash(portal)}/${skylink}`
}

export function findAndReplace(input: string, dict: object) {
    Object.keys(dict).forEach(key => {
        input = input.replace(key, dict[key])
    })
    return input
}

export function trimTrailingSlash(str: string) {
    if (str.substr(-1) === '/') {
        return str.substr(0, str.length - 1);
    }
    return str;
}

export function trimPrefix(str, prefix) {
    return str.startsWith(prefix) ? str.slice(prefix.length) : str
}

export function splitN(str: string, delimiter: string, limit: number) {
    if (limit < 2) {
        return [str]
    }

    const parts = str.split(delimiter)
    const head = parts.slice(0, limit - 1)
    const tail = parts.slice(limit - 1)
    return [...head, tail.join(delimiter)];
}

export function toAbsolute(assets: BlogAssets, location: string): BlogAssets {
    const dirname = path.dirname(location)
    const absolute = {}
    for (const key of Object.keys(assets)) {
        absolute[`${dirname}/${key}`] = assets[key]
    }
    return absolute
}

export function toRelative(assets: BlogAssets, location: string): BlogAssets {
    const dirname = path.dirname(location)
    const relative = {}
    for (const key of Object.keys(assets)) {
        relative[trimPrefix(key, `${dirname}/`)] = assets[key]
    }
    return relative
}