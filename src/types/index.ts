export interface SvgFile {
    name: string;
    download_url: string;
    folder: string;
    content?: string;
}

export interface Category {
    id: string;
    name: string;
    count: number;
}