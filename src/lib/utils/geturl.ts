export default function GetUrl(path: string): string {
  const baseUrl =
    process.env.GO_SERVER_URL ||
    process.env.NEXT_PUBLIC_GO_SERVER_URL ||
    "http://localhost:8080";
  return `${baseUrl}${path}`;
}

export function GetAIUrl(path: string): string {
  const baseUrl =
    process.env.AI_SERVER_URL ||
    process.env.NEXT_PUBLIC_AI_SERVER_URL ||
    "http://localhost:3001";
  return `${baseUrl}${path}`;
}

export function GetNextJSURL(url: string): string {
  if (typeof window === "undefined") {
    const base =
      process.env.NEXT_PUBLIC_BASE_URL ||
      process.env.NEXTAUTH_URL ||
      "http://localhost:3000";
    url = `${base}/api/gettoken`;
  }
  return url;
}

export function GetAIExportUrl(path: string): string {
  const baseUrl =
    process.env.AI_EXPORT_SERVER_URL ||
    process.env.NEXT_PUBLIC_AI_EXPORT_SERVER_URL ||
    "http://localhost:5001";
  return `${baseUrl}${path}`;
}