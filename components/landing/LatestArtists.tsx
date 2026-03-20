import Image from "next/image";
import Link from "next/link";
import { getStrapiMedia } from "@/lib/strapi";
import type { Song } from "@/lib/types";

interface LatestArtistsProps {
  songs: Song[];
}

// Extract unique artists from songs
function getUniqueArtists(songs: Song[]) {
  const seen = new Set<string>();
  const artists: { name: string; imageUrl: string | null; songTitle: string; documentId: string }[] = [];
  for (const song of songs) {
    const id = song.artist?.documentId;
    if (!id || seen.has(id)) continue;
    seen.add(id);
    artists.push({
      name: song.artist?.name ?? "Unknown",
      imageUrl: getStrapiMedia(song.artist?.image?.url ?? song.image?.url ?? null),
      songTitle: song.title,
      documentId: id,
    });
    if (artists.length >= 5) break;
  }
  return artists;
}

// Staggered positions for the scattered layout
const POSITIONS = [
  { className: "col-start-1 row-start-1 row-span-2 self-start", size: "w-64 md:w-80" },
  { className: "col-start-2 row-start-1 row-span-3 self-center", size: "w-72 md:w-96", featured: true },
  { className: "col-start-3 row-start-1 row-span-2 self-start", size: "w-64 md:w-80" },
  { className: "col-start-1 row-start-3 self-end", size: "w-56 md:w-72" },
  { className: "col-start-3 row-start-3 self-end", size: "w-56 md:w-72" },
];

const LABELS = [
  { stage: "main stage", venue: "PRODIGAL SUNBURN" },
  { stage: "edge stage", venue: "ROCKYARD" },
  { stage: "main stage", venue: "AGOURA PHOBIA" },
  { stage: "sunset stage", venue: "NEON DRIFT" },
  { stage: "warehouse", venue: "ECHO CHAMBER" },
];

export function LatestArtists({ songs }: LatestArtistsProps) {
  const artists = getUniqueArtists(songs);
  if (artists.length === 0) return null;

  return (
    <section id="artists" className="py-24 px-6 md:px-12 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-player-accent text-lg md:text-xl italic mb-2">
            check out our
          </p>
          <h2 className="text-black dark:text-white text-3xl md:text-5xl font-black uppercase tracking-tight font-heading">
            Latest Artists
          </h2>
          <div className="w-12 h-[3px] bg-black dark:bg-white mx-auto mt-4" />
        </div>

        {/* Scattered grid */}
        <div className="hidden md:grid grid-cols-3 grid-rows-3 gap-6 min-h-[600px] items-center justify-items-center">
          {artists.map((artist, i) => {
            const pos = POSITIONS[i % POSITIONS.length];
            const label = LABELS[i % LABELS.length];

            return (
              <Link
                href={`/artist/${artist.documentId}`}
                key={artist.documentId}
                className={`relative group ${pos.className}`}
              >
                <div className="flex items-end gap-3">
                  {/* Artist image */}
                  <div
                    className={`${pos.size} aspect-square relative overflow-hidden shrink-0 ${
                      pos.featured
                        ? "rounded-lg border-2 border-player-accent/20 shadow-[0_0_30px_color-mix(in_oklch,var(--player-accent)_15%,transparent)]"
                        : ""
                    }`}
                  >
                    {artist.imageUrl ? (
                      <Image
                        src={artist.imageUrl}
                        alt={artist.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        sizes="(max-width: 768px) 50vw, 400px"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-player-accent to-pink-500" />
                    )}
                    {/* Synth overlay */}
                    <div
                      className="absolute inset-0 mix-blend-color opacity-40 dark:opacity-60 pointer-events-none"
                      style={{ background: "radial-gradient(circle at 30% 70%, #3b82f6 0%, #ec4899 60%, #f43f5e 100%)" }}
                    />
                  </div>

                  {/* Vertical label */}
                  <div className="flex flex-col items-center gap-1 pb-2">
                    <span className="text-[10px] text-black/40 dark:text-white/40 tracking-[0.15em] uppercase [writing-mode:vertical-rl] rotate-180">
                      {label.stage}
                    </span>
                    <span className="text-xs text-black dark:text-white font-black uppercase tracking-tight font-heading [writing-mode:vertical-rl] rotate-180">
                      {artist.name}
                    </span>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" className="text-black dark:text-white mt-1">
                      <path d="M7 10l5 5 5-5z" />
                    </svg>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Mobile: simple horizontal scroll */}
        <div className="flex md:hidden gap-6 overflow-x-auto pb-4 snap-x snap-mandatory -mx-6 px-6">
          {artists.map((artist, i) => {
            const label = LABELS[i % LABELS.length];
            return (
              <Link href={`/artist/${artist.documentId}`} key={artist.documentId} className="shrink-0 snap-start w-64 group">
                <div className="aspect-square relative overflow-hidden rounded-lg">
                  {artist.imageUrl ? (
                    <Image
                      src={artist.imageUrl}
                      alt={artist.name}
                      fill
                      className="object-cover"
                      sizes="256px"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-player-accent to-pink-500" />
                  )}
                  <div
                    className="absolute inset-0 mix-blend-color opacity-40 dark:opacity-60 pointer-events-none"
                    style={{ background: "radial-gradient(circle at 30% 70%, #3b82f6 0%, #ec4899 60%, #f43f5e 100%)" }}
                  />
                </div>
                <div className="mt-3">
                  <p className="text-[10px] text-black/40 dark:text-white/40 tracking-[0.15em] uppercase">{label.stage}</p>
                  <p className="text-sm text-black dark:text-white font-black uppercase tracking-tight font-heading">{artist.name}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
