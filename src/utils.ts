import axios from "axios";
import FormData from 'form-data';
import fs from "fs-extra";
import path from 'path';
import { BlogAssets } from "./types";

require('dotenv').config();

export async function upload(node: string, path: string): Promise<string> {
    const formData = new FormData();
    formData.append('file', fs.createReadStream(path));

    try {
        const resp = await axios.post(node + '/api/linkfile', formData, {
            auth: {
                username: process.env.SIANODE_AUTH_USERNAME,
                password: process.env.SIANODE_AUTH_PASSWORD,
            },
            headers: formData.getHeaders()
        })
        return resp.data['sialink']
    } catch (err) {
        throw new Error(`Upload failed with error ${err}`)
    }
}

export function viewnodeLink(node: string, sialink: string) {
    if (!node) {
        throw new Error('Could not generate viewnode link, node undefined')
    }
    if (!sialink) {
        throw new Error('Could not generate viewnode link, sialink undefined')
    }
    return node + "/api/sialink/" + trimPrefix(sialink, "sia://")
}

export function findAndReplace(input: string, dict: object) {
    Object.keys(dict).forEach(key => {
        input = input.replace(key, dict[key])
    })
    return input
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