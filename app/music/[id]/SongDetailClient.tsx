"use client";

import Image from "next/image";
import Link from "next/link";
import { getStrapiMedia } from "@/lib/strapi";
import { SongPlayer } from "@/components/landing/SongPlayer";
import { Separator } from "@/components/ui/separator";
import type { Song } from "@/lib/types";

interface SongDetailClientProps {
  song: Song;
}

export function SongDetailClient({ song }: SongDetailClientProps) {
  const artistImageUrl = getStrapiMedia(song.artist?.image?.url ?? null);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-12 pb-20">
      <div className="flex flex-col lg:grid lg:grid-cols-[1fr_420px] gap-10 lg:gap-12">

        {/* Left column — Song info / blog */}
        <div className="order-2 lg:order-1">
          <div className="mt-2">
            <h2 className="text-black dark:text-white text-xl font-black uppercase tracking-tight font-heading mb-4">
              About Song
            </h2>
            <p className="text-black/50 dark:text-white/50 text-sm leading-relaxed">
              A track that explores the boundaries of sound and emotion, blending
              electronic textures with organic warmth. Each layer has been carefully crafted
              to create an immersive listening experience.
            </p>

            <Separator className="my-8 bg-black/10 dark:bg-white/10" />

            {/* Metadata */}
            <div className="space-y-4">
              <div>
                <h3 className="text-black dark:text-white text-sm font-black uppercase tracking-tight font-heading">
                  Artist:
                </h3>
                <div className="flex items-center gap-3 mt-1">
                  {artistImageUrl && (
                    <div className="size-8 relative rounded-full overflow-hidden">
                      <Image src={artistImageUrl} alt={song.artist?.name ?? ""} fill className="object-cover" sizes="32px" />
                    </div>
                  )}
                  <p className="text-black/60 dark:text-white/60 text-sm">
                    {song.artist?.name ?? "Unknown Artist"}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-black dark:text-white text-sm font-black uppercase tracking-tight font-heading">
                  Release Date:
                </h3>
                <p className="text-black/60 dark:text-white/60 text-sm mt-1">
                  {new Date(song.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "2-digit",
                  })}
                </p>
              </div>
            </div>

            <Separator className="my-8 bg-black/10 dark:bg-white/10" />

            <Link
              href="/"
              className="text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white text-xs font-bold tracking-[0.15em] uppercase transition-colors font-heading"
            >
              &larr; Back to Discography
            </Link>
          </div>
        </div>

        {/* Right column — Clean player */}
        <div className="order-1 lg:order-2">
          <div className="lg:sticky lg:top-8">
            <SongPlayer song={song} />
          </div>
        </div>
      </div>
    </div>
  );
}
