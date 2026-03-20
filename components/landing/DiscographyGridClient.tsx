"use client";

import { useState, useCallback } from "react";
import { DiscographyGrid } from "@/components/landing/DiscographyGrid";
import { fetchSongs } from "@/lib/strapi";
import type { Song } from "@/lib/types";

const PAGE_SIZE = 20;

interface DiscographyGridClientProps {
  initialSongs: Song[];
  initialPageCount: number;
}

export function DiscographyGridClient({ initialSongs, initialPageCount }: DiscographyGridClientProps) {
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
    <>
      <DiscographyGrid songs={songs} />
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
    </>
  );
}
