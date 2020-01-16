type Dict<T> = { [key: string]: T }

export type BlogPostHeader = {
    title: string;
    date: string;
    description: string;
    image: string;
    author: string;
    linkfile: string;
}

export type BlogAssets = Dict<string>

export type BlogLink = {
    tag: string,
    link: string
}