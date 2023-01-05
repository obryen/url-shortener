
export interface IshortenerRequest {
    url: string;
    shortCode?: string;
}

export interface IsaveShortenedUrl {
    url: string;
    shortCode: string;
    shortUrl: string;
}