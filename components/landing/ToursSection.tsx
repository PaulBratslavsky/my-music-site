"use client";

import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

const UPCOMING_SHOWS = [
  { date: "APR 12", venue: "The Roundhouse", city: "London, UK", status: "On Sale" },
  { date: "APR 18", venue: "Berghain", city: "Berlin, DE", status: "Sold Out" },
  { date: "MAY 02", venue: "Webster Hall", city: "New York, US", status: "On Sale" },
  { date: "MAY 15", venue: "Fabric", city: "London, UK", status: "On Sale" },
  { date: "JUN 08", venue: "Rex Club", city: "Paris, FR", status: "Coming Soon" },
  { date: "JUL 20", venue: "Sonar Festival", city: "Barcelona, ES", status: "On Sale" },
];

export function ToursSection() {
  return (
    <section id="tours" className="bg-black/80 dark:bg-black/60 backdrop-blur-sm py-24 px-6 md:px-12">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-white/40 text-sm tracking-[0.3em] lowercase mb-3">
            live shows
          </p>
          <h2 className="text-white text-3xl md:text-5xl font-black uppercase tracking-tight font-heading">
            Upcoming Tours
          </h2>
        </div>

        <div className="space-y-0">
          {UPCOMING_SHOWS.map((show, i) => (
            <div key={i}>
              <div className="flex items-center justify-between py-6 group hover:bg-white/5 px-4 -mx-4 transition-colors duration-300 cursor-pointer">
                <div className="w-20 md:w-28 shrink-0">
                  <span className="text-white/40 text-xs md:text-sm font-bold tracking-[0.15em] uppercase group-hover:text-white/70 transition-colors">
                    {show.date}
                  </span>
                </div>
                <div className="flex-1 min-w-0 px-4">
                  <h3 className="text-white text-sm md:text-lg font-bold truncate">
                    {show.venue}
                  </h3>
                  <p className="text-white/40 text-xs md:text-sm">{show.city}</p>
                </div>
                <div className="shrink-0">
                  {show.status === "Sold Out" ? (
                    <span className="text-white/30 text-xs font-bold tracking-[0.1em] uppercase">
                      Sold Out
                    </span>
                  ) : show.status === "Coming Soon" ? (
                    <span className="text-white/50 text-xs font-bold tracking-[0.1em] uppercase">
                      Coming Soon
                    </span>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-white/20 text-white hover:bg-white hover:text-black text-xs tracking-[0.1em] uppercase rounded-none font-bold transition-all duration-300"
                    >
                      Tickets
                    </Button>
                  )}
                </div>
              </div>
              {i < UPCOMING_SHOWS.length - 1 && (
                <Separator className="bg-white/10" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
