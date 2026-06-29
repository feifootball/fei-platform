"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import Link from "next/link";

const navLinks = [
  { label: "Product", href: "#get-started" },
  { label: "Diagnostic", href: "#diagnostic" },
  { label: "Roles", href: "#roles" },
  { label: "For Clubs", href: "#clubs" },
  { label: "About", href: "#about" },
];

function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const supabase = createClient();

  useEffect(() => {
    async function loadUnreadCount() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { count } = await supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("read", false);

      setUnreadCount(count || 0);
    }

    loadUnreadCount();
    const interval = setInterval(loadUnreadCount, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Link
      href="/notifications"
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/60 transition hover:bg-white/[0.06] hover:text-white"
      aria-label="Notifications"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-5 w-5" aria-hidden>
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
      {unreadCount > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </Link>
  );
}

function InstagramIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
      setLoading(false);
    }
    checkAuth();
  }, []);

  return (
    <header className="fixed inset-x-0 top-4 z-50 px-4 sm:top-6 sm:px-6">
      <nav className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between rounded-full border border-white/10 bg-[#070b12]/90 px-4 py-3 shadow-[0_18px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:px-5">
          <a href="/" className="flex min-w-0 items-center gap-3" aria-label="FEI Home">
            <img src="/logo.svg" alt="FEI" className="h-7 w-auto sm:h-8" />
            <span className="hidden whitespace-nowrap text-xs font-medium tracking-wide text-fei-sky/80 lg:block">
              Football English Intelligence
            </span>
          </a>

          <div className="hidden items-center gap-1 rounded-full bg-white/[0.03] px-2 py-1 md:flex">
            {navLinks.map((link) => (
              <a key={link.label} href={link.href} className="rounded-full px-4 py-2 text-sm font-medium text-white/60 transition hover:bg-white/[0.06] hover:text-white">
                {link.label}
              </a>
            ))}
          </div>

          <div className="hidden items-center gap-2 md:flex">
            <a href="https://instagram.com/fei.football" target="_blank" rel="noopener noreferrer" className="inline-flex h-9 w-9 items-center justify-center rounded-full text-white/40 transition hover:bg-white/[0.06] hover:text-fei-sky" aria-label="FEI Instagram">
              <InstagramIcon />
            </a>

            <a href="https://linkedin.com/company/football-english-intelligence" target="_blank" rel="noopener noreferrer" className="inline-flex h-9 w-9 items-center justify-center rounded-full text-white/40 transition hover:bg-white/[0.06] hover:text-fei-sky" aria-label="FEI LinkedIn">
              <LinkedInIcon />
            </a>

            {!loading && isAuthenticated && <NotificationBell />}

            <a href="/login" className="rounded-full border border-fei-sky/70 px-5 py-2 text-sm font-medium text-fei-sky transition hover:bg-fei-sky/10">
              Login
            </a>

            <a href="/register" className="rounded-full bg-fei-yellow px-5 py-2 text-sm font-semibold text-fei-bg transition hover:bg-fei-yellow/90 hover:shadow-[0_0_28px_rgba(250,204,21,0.28)]">
              Get Started
            </a>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <a href="https://instagram.com/fei.football" target="_blank" rel="noopener noreferrer" className="hidden h-10 w-10 items-center justify-center rounded-full text-white/45 transition hover:bg-white/[0.06] hover:text-fei-sky xs:inline-flex" aria-label="FEI Instagram">
              <InstagramIcon />
            </a>

            {!loading && isAuthenticated && <NotificationBell />}

            <button type="button" onClick={() => setMenuOpen((value) => !value)} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white transition hover:bg-white/[0.08]" aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen}>
              {menuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5" aria-hidden>
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5" aria-hidden>
                  <path d="M4 7h16" />
                  <path d="M4 12h16" />
                  <path d="M4 17h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="mt-3 overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#070b12]/95 p-3 shadow-[0_18px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl md:hidden">
            <div className="grid gap-1">
              {navLinks.map((link) => (
                <a key={link.label} href={link.href} onClick={() => setMenuOpen(false)} className="rounded-2xl px-4 py-3 text-base font-medium text-white/75 transition hover:bg-white/[0.06] hover:text-white">
                  {link.label}
                </a>
              ))}
            </div>

            <div className="mt-3 flex items-center gap-2 border-t border-white/10 pt-3">
              <a href="https://instagram.com/fei.football" target="_blank" rel="noopener noreferrer" className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 text-white/55 transition hover:bg-white/[0.06] hover:text-fei-sky" aria-label="FEI Instagram">
                <InstagramIcon />
              </a>

              <a href="https://linkedin.com/company/football-english-intelligence" target="_blank" rel="noopener noreferrer" className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 text-white/55 transition hover:bg-white/[0.06] hover:text-fei-sky" aria-label="FEI LinkedIn">
                <LinkedInIcon />
              </a>

              <a href="/login" onClick={() => setMenuOpen(false)} className="ml-auto rounded-full border border-fei-sky/70 px-4 py-3 text-center text-sm font-semibold text-fei-sky transition hover:bg-fei-sky/10">
                Login
              </a>

              <a href="/register" onClick={() => setMenuOpen(false)} className="rounded-full bg-fei-yellow px-4 py-3 text-center text-sm font-bold text-fei-bg transition hover:bg-fei-yellow/90">
                Get Started
              </a>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
