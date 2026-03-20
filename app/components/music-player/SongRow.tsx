import { useRef, useEffect } from "react";
import Image from "next/image";
import { formatTime } from "./api";
import type { Song } from "./types";

export function SongRow({
  song,
  index,
  isActive,
  thumbUrl,
  avatarUrl,
  duration,
  onClick,
  scrollRef,
}: {
  song: Song;
  index: number;
  isActive: boolean;
  thumbUrl: string | null;
  avatarUrl: string | null;
  duration?: number;
  onClick: () => void;
  scrollRef: React.RefObject<string | null>;
}) {
  const rowRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isActive && rowRef.current && scrollRef.current !== song.documentId) {
      scrollRef.current = song.documentId;
      requestAnimationFrame(() => {
        rowRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      });
    }
  }, [isActive, song.documentId, scrollRef]);

  return (
    <button
      ref={rowRef}
      type="button"
      onClick={onClick}
      className={`w-full grid grid-cols-[32px_44px_1fr_28px_1fr_64px_88px] gap-3 items-center px-4 py-2.5 border-b border-neutral-800 text-left transition-colors last:border-b-0 ${
        isActive ? "bg-pink-500 text-white rounded-md" : "hover:bg-white/5"
      }`}
    >
      <span className="text-xs text-center opacity-50">{index + 1}</span>

      <div className="w-10 h-10 rounded bg-neutral-800 overflow-hidden shrink-0 relative">
        {thumbUrl && (
          <Image src={thumbUrl} alt={song.title ?? ""} fill className="object-cover" sizes="40px" />
        )}
      </div>

      <span className={`text-sm truncate ${isActive ? "font-semibold" : ""}`}>
        {song.title || "Untitled"}
      </span>

      <div className="w-7 h-7 rounded-full bg-neutral-800 overflow-hidden shrink-0 relative">
        {avatarUrl && (
          <Image src={avatarUrl} alt={song.artist?.name ?? ""} fill className="object-cover" sizes="28px" />
        )}
      </div>

      <span className="text-sm truncate opacity-60">{song.artist?.name || "\u2014"}</span>
      <span className="text-sm opacity-60 tabular-nums">{duration ? formatTime(duration) : "\u2014"}</span>
      <span className="text-sm opacity-60">
        {new Date(song.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
      </span>
    </button>
  );
}

export function HeaderCell({ children }: { children: React.ReactNode }) {
  return <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{children}</span>;
}
