"use client";

import { useState, useCallback } from "react";
import { Navbar } from "@/components/landing/Navbar";
import { DiscographyGrid } from "@/components/landing/DiscographyGrid";
import { ToursSection } from "@/components/landing/ToursSection";
import { AboutSection } from "@/components/landing/AboutSection";
import { Footer } from "@/components/landing/Footer";
import { NeonGradientBg } from "@/components/landing/NeonGradientBg";
import { fetchSongs } from "@/lib/strapi";
import type { Song } from "@/lib/types";

const PAGE_SIZE = 20;

interface LandingClientProps {
  initialSongs: Song[];
  initialPageCount: number;
}

export function LandingClient({ initialSongs, initialPageCount }: LandingClientProps) {
  const [songs, setSongs] = useState<Song[]>(initialSongs);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(1 < initialPageCount);
  const [loadingMore, setLoadingMore] = useState(false);

  const loadMore = useCallback(async () => {
    const nextPage = page + 1;
    setPage(nextPage);
    setLoadingMore(true);
    const result = await fetchSongs(nextPage, PAGE_SIZE);
    setSongs((prev) => [...prev, ...result.data]);
    setHasMore(nextPage < result.meta.pagination.pageCount);
    setLoadingMore(false);
  }, [page]);

  return (
    <div className="relative bg-white dark:bg-black min-h-screen transition-colors">
      {/* Background neon tint */}
      <NeonGradientBg />
      <div className="relative z-10">
      <Navbar />
      {/* Section header */}
      <div className="text-center pt-12 pb-10 px-6">
        <p className="text-black/40 dark:text-white/40 text-[15px] tracking-[0.2em] lowercase mb-3 font-sans">
          discography
        </p>
        <h1 className="text-black dark:text-white text-3xl md:text-[42px] font-black uppercase tracking-[0.02em] leading-tight font-heading">
          Gallery IV Columns Joined/Wide
        </h1>
      </div>
      {/* Full-width seamless grid */}
      <DiscographyGrid songs={songs} />
      {/* Load more */}
      {hasMore && songs.length > 0 && (
        <div className="flex justify-center py-12">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white text-xs font-bold tracking-[0.2em] uppercase border border-black/20 dark:border-white/20 hover:border-black dark:hover:border-white px-10 py-3 transition-all duration-300 disabled:opacity-40 font-heading"
          >
            {loadingMore ? "Loading..." : "Load More"}
          </button>
        </div>
      )}
      <ToursSection />
      <AboutSection />
      <Footer />
      </div>
    </div>
  );
}
