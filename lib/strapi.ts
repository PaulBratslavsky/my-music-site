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

export interface PaginatedSongs {
  data: Song[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export async function fetchSongs(page = 1, pageSize = 20): Promise<PaginatedSongs> {
  const baseUrl = getStrapiURL();
  const url = new URL("/api/strapi-plugin-music-manager/songs", baseUrl);
  url.search = qs.stringify({
    sort: ["createdAt:desc"],
    populate: {
      artist: {
        fields: ["name"],
        populate: {
          image: { fields: ["url", "alternativeText"] },
        },
      },
      image: { fields: ["url", "alternativeText"] },
    },
    pagination: { page, pageSize },
  });

  const res = await fetch(url.href);
  if (!res.ok) {
    console.error(`Failed to fetch songs: ${res.status} ${res.statusText}`);
    return { data: [], meta: { pagination: { page: 1, pageSize, pageCount: 0, total: 0 } } };
  }

  return res.json();
}

export async function fetchSongById(documentId: string): Promise<Song | null> {
  const baseUrl = getStrapiURL();
  const url = new URL(`/api/strapi-plugin-music-manager/songs/${documentId}`, baseUrl);
  url.search = qs.stringify({
    populate: {
      artist: {
        fields: ["name"],
        populate: {
          image: { fields: ["url", "alternativeText"] },
        },
      },
      image: { fields: ["url", "alternativeText"] },
    },
  });

  const res = await fetch(url.href);
  if (!res.ok) return null;
  const json = await res.json();
  return json.data ?? null;
}
