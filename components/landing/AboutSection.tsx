"use client";

export function AboutSection() {
  return (
    <section id="about" className="relative py-32 px-6 md:px-12 overflow-hidden">
      <div className="relative z-10 max-w-4xl mx-auto grid md:grid-cols-2 gap-16 items-center">
        {/* Image placeholder */}
        <div className="aspect-[3/4] w-full relative overflow-hidden">
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(160deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white/10 text-9xl font-black font-heading">E</span>
          </div>
        </div>

        {/* Bio text */}
        <div>
          <p className="text-black/40 dark:text-white/40 text-sm tracking-[0.3em] lowercase mb-4">
            about the artist
          </p>
          <h2 className="text-black dark:text-white text-3xl md:text-5xl font-black uppercase tracking-tight mb-6 font-heading">
            Echo
            <br />
            Verse
          </h2>
          <p className="text-black/50 dark:text-white/50 text-sm leading-relaxed mb-4">
            Born from the intersection of electronic music and visual art, EchoVerse pushes
            the boundaries of what a live performance can be. Each show is a unique
            audiovisual experience, blending generative visuals with carefully crafted
            soundscapes.
          </p>
          <p className="text-black/50 dark:text-white/50 text-sm leading-relaxed mb-8">
            With four studio albums and collaborations spanning across continents, the
            project continues to evolve, drawing from ambient, techno, and experimental
            electronic traditions.
          </p>
          <div className="flex gap-6">
            {["Spotify", "Apple Music", "SoundCloud"].map((platform) => (
              <span
                key={platform}
                className="text-black/30 dark:text-white/30 hover:text-black dark:hover:text-white text-xs tracking-[0.15em] uppercase cursor-pointer transition-colors duration-300"
              >
                {platform}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
