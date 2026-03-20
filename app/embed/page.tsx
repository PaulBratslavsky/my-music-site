import { getStrapiURL, getStreamURL, fetchSongs } from "@/lib/strapi";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";

export const revalidate = 60;

export default async function EmbedPage() {
  const strapiUrl = getStrapiURL();
  const embedUrl = `${strapiUrl}/api/strapi-plugin-music-manager/embed`;
  const result = await fetchSongs(1, 5);
  const songs = result.data;

  return (
    <div className="min-h-screen bg-white dark:bg-black transition-colors">
      <Navbar />

      <div className="max-w-5xl mx-auto px-6 md:px-12 py-16">
        <div className="text-center mb-12">
          <p className="text-player-accent text-lg italic mb-1 font-serif">
            embeddable player
          </p>
          <h1 className="text-black dark:text-white text-3xl md:text-4xl font-black uppercase tracking-tight font-heading">
            Embed Options
          </h1>
          <div className="w-12 h-0.75 bg-black dark:bg-white mx-auto mt-4" />
        </div>

        {/* Single song embed */}
        {songs[0] && (
          <div className="mb-16">
            <h2 className="text-black dark:text-white text-sm font-extrabold uppercase tracking-[0.15em] font-heading mb-2">
              Single Song Embed
            </h2>
            <p className="text-black/50 dark:text-white/50 text-sm font-sans mb-4">
              Compact player for embedding a single track. ~120px height.
            </p>
            <div className="rounded-lg overflow-hidden border border-black/10 dark:border-white/10">
              <iframe
                src={`${embedUrl}?song=${songs[0].documentId}`}
                width="100%"
                height="130"
                style={{ border: "none" }}
                title="Single Song Embed"
              />
            </div>
            <pre className="bg-neutral-100 dark:bg-neutral-900 text-black/70 dark:text-white/70 text-xs p-4 rounded-lg overflow-x-auto font-mono mt-3">
{`<iframe src="${embedUrl}?song=${songs[0].documentId}" width="100%" height="130" frameborder="0"></iframe>`}
            </pre>
          </div>
        )}

        {/* Single song dark */}
        {songs[0] && (
          <div className="mb-16">
            <h2 className="text-black dark:text-white text-sm font-extrabold uppercase tracking-[0.15em] font-heading mb-2">
              Single Song — Dark
            </h2>
            <div className="rounded-lg overflow-hidden border border-black/10 dark:border-white/10">
              <iframe
                src={`${embedUrl}?song=${songs[0].documentId}&theme=dark`}
                width="100%"
                height="130"
                style={{ border: "none" }}
                title="Single Song Embed (Dark)"
              />
            </div>
          </div>
        )}

        {/* Full playlist embed */}
        <div className="mb-16">
          <h2 className="text-black dark:text-white text-sm font-extrabold uppercase tracking-[0.15em] font-heading mb-2">
            Full Playlist Embed
          </h2>
          <p className="text-black/50 dark:text-white/50 text-sm font-sans mb-4">
            Complete player with song list, waveform, and controls.
          </p>
          <div className="rounded-lg overflow-hidden border border-black/10 dark:border-white/10">
            <iframe
              src={`${embedUrl}?mode=full`}
              width="100%"
              height="500"
              style={{ border: "none" }}
              title="Full Playlist Embed"
            />
          </div>
          <pre className="bg-neutral-100 dark:bg-neutral-900 text-black/70 dark:text-white/70 text-xs p-4 rounded-lg overflow-x-auto font-mono mt-3">
{`<iframe src="${embedUrl}?mode=full" width="100%" height="500" frameborder="0"></iframe>`}
          </pre>
        </div>

        {/* Native audio */}
        <div className="mb-16">
          <h2 className="text-black dark:text-white text-sm font-extrabold uppercase tracking-[0.15em] font-heading mb-2">
            Native Audio
          </h2>
          <p className="text-black/50 dark:text-white/50 text-sm font-sans mb-4">
            Browser&apos;s built-in audio player using the stream URL directly.
          </p>
          <div className="space-y-4">
            {songs.map((song) => {
              const streamUrl = getStreamURL(song.documentId);
              return (
                <div
                  key={song.documentId}
                  className="flex items-center gap-4 p-4 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-black/5 dark:border-white/5"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-black dark:text-white text-sm font-bold truncate font-sans">
                      {song.title}
                    </p>
                    <p className="text-black/50 dark:text-white/50 text-xs font-sans">
                      {song.artist?.name ?? "Unknown"}
                    </p>
                  </div>
                  {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                  <audio controls preload="none" className="h-8 w-64 shrink-0">
                    <source src={streamUrl} />
                  </audio>
                </div>
              );
            })}
          </div>
          {songs[0] && (
            <pre className="bg-neutral-100 dark:bg-neutral-900 text-black/70 dark:text-white/70 text-xs p-4 rounded-lg overflow-x-auto font-mono mt-3">
{`<audio controls preload="none">
  <source src="${getStreamURL(songs[0].documentId)}" />
</audio>`}
            </pre>
          )}
        </div>
        {/* Script tag embed */}
        <div className="mb-16">
          <h2 className="text-black dark:text-white text-sm font-extrabold uppercase tracking-[0.15em] font-heading mb-2">
            Script Tag — Full Widget
          </h2>
          <p className="text-black/50 dark:text-white/50 text-sm font-sans mb-4">
            Drop a single script tag into any website. Renders a floating music player with trigger button, minimized bar, and expanded view.
          </p>
          <pre className="bg-neutral-100 dark:bg-neutral-900 text-black/70 dark:text-white/70 text-xs p-4 rounded-lg overflow-x-auto font-mono">
{`<script src="${strapiUrl}/api/strapi-plugin-music-manager/widget.js"></script>`}
          </pre>
          <p className="text-black/40 dark:text-white/40 text-xs font-sans mt-2">
            With a specific song pre-selected:
          </p>
          <pre className="bg-neutral-100 dark:bg-neutral-900 text-black/70 dark:text-white/70 text-xs p-4 rounded-lg overflow-x-auto font-mono mt-2">
{`<script
  src="${strapiUrl}/api/strapi-plugin-music-manager/widget.js"
  data-song="${songs[0]?.documentId ?? "DOCUMENT_ID"}"
></script>`}
          </pre>
        </div>

        {/* Script tag — single song embed */}
        <div className="mb-16">
          <h2 className="text-black dark:text-white text-sm font-extrabold uppercase tracking-[0.15em] font-heading mb-2">
            Script Tag — Single Song
          </h2>
          <p className="text-black/50 dark:text-white/50 text-sm font-sans mb-4">
            Compact inline player for a single track. Add a container element and the embed script.
          </p>
          <pre className="bg-neutral-100 dark:bg-neutral-900 text-black/70 dark:text-white/70 text-xs p-4 rounded-lg overflow-x-auto font-mono">
{`<div id="strapi-music-embed"></div>
<script
  src="${strapiUrl}/api/strapi-plugin-music-manager/embed.js"
  data-song="${songs[0]?.documentId ?? "DOCUMENT_ID"}"
></script>`}
          </pre>
          <p className="text-black/40 dark:text-white/40 text-xs font-sans mt-2">
            Dark theme:
          </p>
          <pre className="bg-neutral-100 dark:bg-neutral-900 text-black/70 dark:text-white/70 text-xs p-4 rounded-lg overflow-x-auto font-mono mt-2">
{`<div id="strapi-music-embed"></div>
<script
  src="${strapiUrl}/api/strapi-plugin-music-manager/embed.js"
  data-song="${songs[0]?.documentId ?? "DOCUMENT_ID"}"
  data-theme="dark"
></script>`}
          </pre>
        </div>
      </div>

      <Footer />
    </div>
  );
}
