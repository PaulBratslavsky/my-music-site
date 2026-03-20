"use client";

import { useState } from "react";
import Link from "next/link";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ThemeSwitcher } from "./ThemeSwitcher";

const NAV_LINKS = [
  { label: "HOME", href: "/" },
  { label: "DISCOGRAPHY", href: "#discography" },
  { label: "ABOUT", href: "#about" },
  { label: "ARTISTS", href: "#artists" },
  { label: "LISTEN", href: "/music" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="relative z-50 bg-transparent">
      <nav className="flex items-center justify-between px-6 md:px-12 h-16">
        {/* Logo */}
        <Link href="/" className="text-black dark:text-white font-black text-3xl tracking-tighter leading-none font-heading">
          V
        </Link>

        {/* Desktop Nav */}
        <ul className="hidden md:flex items-center gap-10">
          {NAV_LINKS.map((link) => (
            <li key={link.label}>
              <Link
                href={link.href}
                className="text-black dark:text-white text-[11px] font-extrabold tracking-[0.15em] uppercase transition-colors duration-200 hover:opacity-60 font-heading"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <ThemeSwitcher />

          {/* Hamburger for mobile */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger className="md:hidden flex flex-col gap-[3px] cursor-pointer p-2">
              <span className="block w-5 h-[2px] bg-black dark:bg-white" />
              <span className="block w-5 h-[2px] bg-black dark:bg-white" />
              <span className="block w-5 h-[2px] bg-black dark:bg-white" />
            </SheetTrigger>
            <SheetContent side="right" className="bg-white dark:bg-black border-black/10 dark:border-white/10 w-72">
              <nav className="flex flex-col gap-6 mt-12">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="text-black dark:text-white text-lg font-extrabold tracking-[0.15em] uppercase hover:opacity-60 transition-opacity"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>

          {/* Desktop hamburger icon (decorative) */}
          <div className="hidden md:flex flex-col gap-[3px] cursor-pointer">
            <span className="block w-5 h-[2px] bg-black dark:bg-white" />
            <span className="block w-5 h-[2px] bg-black dark:bg-white" />
            <span className="block w-5 h-[2px] bg-black dark:bg-white" />
            <span className="block w-5 h-[2px] bg-black dark:bg-white" />
          </div>
        </div>
      </nav>
    </header>
  );
}
