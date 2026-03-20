import Image from "next/image";
import Link from "next/link";
import {
  fetchArtistById,
  fetchArtistSongs,
  getStrapiMedia,
} from "@/lib/strapi";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { ArtistSongs } from "./ArtistSongs";
import { ArtistMusicPlayer } from "./ArtistPageClient";
import { Calendar, Mail, Phone, Music, MapPin, Briefcase } from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ArtistPage({ params }: Readonly<Props>) {
  const { id } = await params;
  const [artist, songs] = await Promise.all([
    fetchArtistById(id),
    fetchArtistSongs(id),
  ]);

  if (!artist) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <p className="text-black/50 dark:text-white/50 text-lg font-heading">
          Artist not found
        </p>
      </div>
    );
  }

  const imageUrl = getStrapiMedia(artist.image?.url ?? null);

  const infoItems = [
    artist.dob && { icon: Calendar, label: `DOB: ${artist.dob}` },
    artist.email && { icon: Mail, label: artist.email },
    artist.education && {
      icon: Music,
      label: `Education: ${artist.education}`,
    },
    artist.phone && { icon: Phone, label: artist.phone },
    artist.location && { icon: MapPin, label: `Based in: ${artist.location}` },
    artist.website && { icon: Briefcase, label: artist.website },
  ].filter(Boolean) as { icon: typeof Calendar; label: string }[];

  const socials = [
    artist.spotify && { name: "Spotify", url: artist.spotify },
    artist.instagram && { name: "Instagram", url: artist.instagram },
    artist.facebook && { name: "Facebook", url: artist.facebook },
  ].filter(Boolean) as { name: string; url: string }[];

  return (
    <div className="min-h-screen bg-white dark:bg-black transition-colors">
      {/* Navbar */}
      <Navbar />

      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Left — Artist image */}
        <div className="relative w-full lg:w-1/2 h-[60vh] lg:h-auto lg:min-h-screen bg-black shrink-0">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={artist.image?.alternativeText ?? artist.name}
              fill
              className="object-cover brightness-[0.4] saturate-[0.6]"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black" />
          )}
          {/* Blue/purple color overlay for moody tone */}
          <div
            className="absolute inset-0 mix-blend-color opacity-50 pointer-events-none"
            style={{
              background:
                "radial-gradient(circle at 30% 70%, #3b82f6 0%, #7c3aed 50%, #ec4899 100%)",
            }}
          />
        </div>

        {/* Right — Artist info */}
        <div className="w-full lg:w-1/2 px-8 md:px-16 lg:px-20 py-16 lg:py-32 flex flex-col justify-center">
          <p className="text-player-accent text-xl md:text-2xl italic mb-1 font-serif">
            about the artist
          </p>
          <h1 className="text-black dark:text-white text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight font-heading leading-none">
            {artist.name}
          </h1>
          <div className="w-16 h-[3px] bg-black dark:bg-white mt-6 mb-8" />

          {artist.bio && (
            <p className="text-black/70 dark:text-white/70 text-base leading-relaxed max-w-lg mb-10">
              {artist.bio}
            </p>
          )}

          {/* Info grid */}
          {infoItems.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-5 mb-10">
              {infoItems.map((item) => (
                <div key={item.label} className="flex items-start gap-3">
                  <item.icon className="size-5 text-black/40 dark:text-white/40 shrink-0 mt-0.5" />
                  <span className="text-black/80 dark:text-white/80 text-sm">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Social links */}
          {socials.length > 0 && (
            <div className="flex items-center gap-4 mb-10">
              {socials.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="size-10 rounded-full border border-black/20 dark:border-white/20 flex items-center justify-center text-black/60 dark:text-white/60 hover:text-player-accent hover:border-player-accent transition-colors"
                  aria-label={social.name}
                >
                  <SocialIcon name={social.name} />
                </a>
              ))}
            </div>
          )}

          {/* Back link */}
          <Link
            href="/"
            className="text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white text-xs font-bold tracking-[0.15em] uppercase transition-colors font-heading"
          >
            &larr; Back to Home
          </Link>
        </div>
      </div>

      {/* Songs by this artist */}
      {songs.length > 0 && <ArtistSongs songs={songs} />}

      {/* Music player */}
      <ArtistMusicPlayer />

      <Footer />
    </div>
  );
}

function SocialIcon({ name }: { name: string }) {
  switch (name) {
    case "Spotify":
      return (
        <svg className="size-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
        </svg>
      );
    case "Instagram":
      return (
        <svg className="size-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
        </svg>
      );
    case "Facebook":
      return (
        <svg className="size-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      );
    default:
      return null;
  }
}
