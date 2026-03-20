"use client";

import { useState, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { MusicPlayer } from "@/components/music-player";
import { AudioBackground } from "@/components/audio-background/AudioBackground";
import { useAudioAnalyser } from "@/components/audio-background/useAudioAnalyser";
import { fetchArtistById, getStrapiMedia } from "@/lib/strapi";
import type { Artist } from "@/lib/types";
import type { Song } from "@/components/music-player/types";

export default function MusicPage() {
  const [audioEl, setAudioEl] = useState<HTMLAudioElement | null>(null);
  const [artist, setArtist] = useState<Artist | null>(null);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const { sample } = useAudioAnalyser(audioEl);
  const lastArtistIdRef = useRef<string | null>(null);

  const handleSongChange = useCallback((song: Song | null) => {
    setCurrentSong(song);
    const artistId = song?.artist?.documentId ?? null;
    if (artistId === lastArtistIdRef.current) return;
    lastArtistIdRef.current = artistId;
    if (!artistId) {
      setArtist(null);
      return;
    }
    fetchArtistById(artistId).then(setArtist);
  }, []);

  const artistImageUrl = getStrapiMedia(artist?.image?.url ?? null);

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-black transition-colors">
      <Navbar />

      {/* Main content: full-width with audio bg, two columns inside */}
      <div className="relative flex-1">
        <AudioBackground sample={sample} />

        <div className="relative z-10 flex flex-col lg:flex-row items-start gap-6 p-6 lg:p-8 h-full min-h-[calc(100vh-8rem)]">
          {/* Left column — Music player + song list */}
          <div className="flex-1 min-w-0 self-stretch">
            <MusicPlayer
              onAudioElement={setAudioEl}
              onSongChange={handleSongChange}
              sample={sample}
            />
          </div>

          {/* Right column — Artist profile */}
          <div className="w-full lg:w-80 xl:w-96 shrink-0 rounded-lg border border-black/10 dark:border-white/10 bg-white/80 dark:bg-black/60 backdrop-blur-xl p-8 flex flex-col">
            {artist ? (
              <>
                {/* Artist image */}
                <Link href={`/artist/${artist.documentId}`} className="group">
                  <div className="aspect-square relative overflow-hidden rounded-lg bg-black/5 dark:bg-white/5 mb-6">
                    {artistImageUrl ? (
                      <Image
                        src={artistImageUrl}
                        alt={artist.image?.alternativeText ?? artist.name}
                        fill
                        className="object-cover brightness-[0.5] saturate-[0.7] transition-transform duration-700 group-hover:scale-105"
                        sizes="384px"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-linear-to-br from-gray-900 to-black" />
                    )}
                    {/* Color overlay */}
                    <div
                      className="absolute inset-0 mix-blend-color opacity-40 pointer-events-none"
                      style={{
                        background:
                          "radial-gradient(circle at 30% 70%, #3b82f6 0%, #7c3aed 50%, #ec4899 100%)",
                      }}
                    />
                  </div>
                </Link>

                {/* Artist details */}
                <p className="text-player-accent text-sm italic mb-1 font-serif">
                  now playing
                </p>
                <h3 className="text-black dark:text-white text-xl font-black uppercase tracking-tight font-heading leading-tight">
                  {currentSong?.title}
                </h3>
                <p className="text-black/50 dark:text-white/50 text-sm mt-1 mb-4">
                  by {artist.name}
                </p>

                {artist.bio && (
                  <p className="text-black/60 dark:text-white/60 text-sm leading-relaxed mb-6 line-clamp-4">
                    {artist.bio}
                  </p>
                )}

                <Link
                  href={`/artist/${artist.documentId}`}
                  className="text-player-accent hover:text-player-accent/80 text-xs font-bold tracking-[0.15em] uppercase transition-colors font-heading mt-auto"
                >
                  View Artist Profile &rarr;
                </Link>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-black/30 dark:text-white/30 text-sm">
                Select a song to see artist info
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
