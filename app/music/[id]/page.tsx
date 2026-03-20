import { fetchSongById } from "@/lib/strapi";
import { SongDetailClient } from "./SongDetailClient";
import { Navbar } from "@/components/landing/Navbar";
import { NeonGradientBg } from "@/components/landing/NeonGradientBg";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function SongPage({ params }: Props) {
  const { id } = await params;
  const song = await fetchSongById(id);

  if (!song) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <p className="text-black/50 dark:text-white/50 text-lg font-heading">Song not found</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-white dark:bg-black transition-colors">
      <NeonGradientBg />
      <div className="relative z-10">
        <Navbar />
        {/* Song title header */}
        <div className="text-center pt-12 pb-8 px-6">
          <p className="text-black/40 dark:text-white/40 text-sm tracking-[0.3em] lowercase mb-2">
            {song.artist?.name ?? "Unknown Artist"}
          </p>
          <h1 className="text-black dark:text-white text-3xl md:text-5xl font-black uppercase tracking-tight font-heading">
            {song.title}
          </h1>
        </div>
        {/* Two-column layout */}
        <SongDetailClient song={song} />
      </div>
    </div>
  );
}
