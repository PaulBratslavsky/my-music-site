"use client";

import Image from "next/image";
import Link from "next/link";
import { getStrapiMedia } from "@/lib/strapi";
import type { Song } from "@/lib/types";

interface ArtistSongsProps {
  songs: Song[];
}

export function ArtistSongs({ songs }: Readonly<ArtistSongsProps>) {
  return (
    <section className="py-20 px-8 md:px-16 lg:px-20 bg-white dark:bg-black">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-black/40 dark:text-white/40 text-[15px] tracking-[0.2em] lowercase mb-3 font-sans">
            discography
          </p>
          <h2 className="text-black dark:text-white text-2xl md:text-4xl font-black uppercase tracking-tight font-heading">
            Gallery III Columns
          </h2>
        </div>

        {/* 3-column grid, large square tiles, no text below */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
          {songs.map((song) => {
            const coverUrl = getStrapiMedia(song.image?.url ?? null);
            return (
              <Link
                key={song.documentId}
                href={`/music/${song.documentId}`}
                className="group"
              >
                <div className="aspect-square relative overflow-hidden bg-black/5 dark:bg-white/5">
                  {coverUrl ? (
                    <Image
                      src={coverUrl}
                      alt={song.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-player-accent/20 to-pink-500/20" />
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
