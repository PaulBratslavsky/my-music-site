import { Separator } from "@/components/ui/separator";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-black border-t border-white/10 py-12 px-6 md:px-12 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <Link href="/" className="text-white font-black text-3xl tracking-tighter font-heading">
            V
          </Link>
          <div className="flex gap-8">
            {["Instagram", "Twitter", "YouTube", "Spotify"].map((social) => (
              <span
                key={social}
                className="text-white/30 hover:text-white text-sm tracking-[0.15em] uppercase cursor-pointer transition-colors duration-300 font-heading"
              >
                {social}
              </span>
            ))}
          </div>
        </div>
        <Separator className="bg-white/10 my-8" />
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/20 text-sm tracking-wider">
            &copy; 2026 EchoVerse. All rights reserved.
          </p>
          <div className="flex gap-6">
            <span className="text-white/20 hover:text-white/50 text-sm cursor-pointer transition-colors">
              Privacy
            </span>
            <span className="text-white/20 hover:text-white/50 text-sm cursor-pointer transition-colors">
              Terms
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
