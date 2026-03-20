import { fetchSongs } from "@/lib/strapi";
import { Navbar } from "@/components/landing/Navbar";
import { HeroSlider } from "@/components/landing/HeroSlider";
import { DiscographyGridClient } from "@/components/landing/DiscographyGridClient";
import { AboutSection } from "@/components/landing/AboutSection";
import { LatestArtists } from "@/components/landing/LatestArtists";
import { Footer } from "@/components/landing/Footer";

export const revalidate = 60;

export default async function LandingPage() {
  const result = await fetchSongs(1, 20);

  return (
    <div className="bg-white dark:bg-black min-h-screen transition-colors">
      {/* Navbar overlays the hero */}
      <div className="absolute top-0 left-0 right-0 z-50">
        <Navbar overlay />
      </div>
      {/* Hero slider with featured songs */}
      <HeroSlider songs={result.data} />
      {/* Section header */}
      <div className="text-center pt-16 pb-10 px-6">
        <p className="text-black/40 dark:text-white/40 text-[15px] tracking-[0.2em] lowercase mb-3 font-sans">
          discography
        </p>
        <h1 className="text-black dark:text-white text-3xl md:text-[42px] font-black uppercase tracking-[0.02em] leading-tight font-heading">
          Gallery IV Columns Joined/Wide
        </h1>
      </div>
      {/* Interactive grid */}
      <DiscographyGridClient
        initialSongs={result.data}
        initialPageCount={result.meta.pagination.pageCount}
      />
      <AboutSection />
      <LatestArtists songs={result.data} />
      <Footer />
    </div>
  );
}
