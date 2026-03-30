import { PreviewData } from "../ts/interfaces";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export async function fetchPublicLinkPreview(url: string): Promise<PreviewData> {
  const response = await fetch(
    `${API_BASE}/public/preview?url=${encodeURIComponent(url)}`
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = (await response.json()) as PreviewData & { error?: string };

  if (data.error) {
    throw new Error(data.error);
  }

  return data;
}

export function buildProxyImageUrl(url: string): string {
  if (!url) return "";

  try {
    const urlObj = new URL(url);
    if (typeof window !== "undefined" && urlObj.hostname !== window.location.hostname) {
      return `${API_BASE}/public/image-proxy?url=${encodeURIComponent(url)}`;
    }
    return url;
  } catch {
    return url;
  }
}
