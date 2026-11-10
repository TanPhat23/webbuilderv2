export const isExternalMedia = (url: string): boolean =>
  url.startsWith("http://") || url.startsWith("https://");

export const isExternalLink = (url: string): boolean =>
  isExternalMedia(url) || url.startsWith("//");
