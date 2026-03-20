import qs from "qs";
import type { Song } from "./types";

export function getStrapiURL() {
  return process.env.NEXT_PUBLIC_STRAPI_URL ?? "http://localhost:1337";
}

export function getStrapiMedia(url: string | null): string | null {
  if (url == null) return null;
  if (url.startsWith("data:")) return url;
  if (url.startsWith("http") || url.startsWith("//")) return url;
  return `${getStrapiURL()}${url}`;
}

export function getStreamURL(documentId: string): string {
  return `${getStrapiURL()}/api/strapi-plugin-music-manager/songs/${documentId}/stream`;
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export async function fetchSongs(): Promise<Song[]> {
  const baseUrl = getStrapiURL();
  const url = new URL("/api/strapi-plugin-music-manager/songs", baseUrl);
  url.search = qs.stringify({
    sort: ["createdAt:desc"],
    populate: {
      artist: {
        fields: ["name"],
        populate: { image: { fields: ["url", "alternativeText"] } },
      },
      image: { fields: ["url", "alternativeText"] },
    },
    pagination: { pageSize: 100 },
  });

  const res = await fetch(url.href);
  if (!res.ok) return [];
  const json = await res.json();
  return json.data ?? [];
}
