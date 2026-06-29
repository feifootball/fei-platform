"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

const navLinks = {
  en: [
    { label: "How it works", href: "/#how-it-works" },
    { label: "Roles", href: "/#roles" },
    { label: "For Clubs", href: "/#for-clubs" },
    { label: "Pricing", href: "/#pricing" },
    { label: "About", href: "/#about" },
  ],
  es: [
    { label: "Cómo funciona", href: "/#how-it-works" },
    { label: "Roles", href: "/#roles" },
    { label: "Para Clubes", href: "/#for-clubs" },
    { label: "Precios", href: "/#pricing" },
    { label: "Nosotros", href: "/#about" },
  ],
};

type Lang = 'en' | 'es';

interface NavbarProps {
  lang?: Lang;
  onToggleLang?: () => void;
}

export function Navbar({ lang = 'en', onToggleLang }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
      setAuthLoading(false);
    }
    checkAuth();
  }, []);

  const links = navLinks[lang];

  return (
    <header className="fixed inset-x-0 top-4 z-50 px-4 sm:top-6 sm:px-6">
      <nav className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between rounded-full border border-white/10 bg-[#070b12]/90 px-4 py-3 shadow-[0_18px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:px-5">

          <a href="/" className="flex min-w-0 items-center gap-3">
            <img src="/logo.svg" alt="FEI" className="h-7 w-auto sm:h-8" />
            <span className="hidden whitespace-nowrap text-xs font-medium tracking-wide text-fei-sky/80 lg:block">Football English Intelligence</span>
          </a>

          <div className="hidden items-center gap-1 rounded-full bg-white/[0.03] px-2 py-1 md:flex">
            {links.map((link) => (
              <a key={link.label} href={link.href} className="rounded-full px-4 py-2 text-sm font-medium text-white/60 transition hover:bg-white/[0.06] hover:text-white">
                {link.label}
              </a>
            ))}
          </div>

          <div className="hidden items-center gap-2 md:flex">
            <a href="https://instagram.com/fei.football" target="_blank" rel="noopener noreferrer" className="inline-flex h-9 w-9 items-center justify-center rounded-full text-white/40 transition hover:bg-white/[0.06] hover:text-fei-sky" aria-label="Instagram">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/>
              </svg>
            </a>
            <a href="https://linkedin.com/company/football-english-intelligence" target="_blank" rel="noopener noreferrer" className="inline-flex h-9 w-9 items-center justify-center rounded-full text-white/40 transition hover:bg-white/[0.06] hover:text-fei-sky" aria-label="LinkedIn">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>
              </svg>
            </a>

            {/* Language toggle */}
            {onToggleLang && (
              <button onClick={onToggleLang} className="rounded-full border border-white/10 px-3 py-1.5 text-xs font-semibold text-white/60 transition hover:bg-white/[0.06] hover:text-white">
                {lang === 'en' ? 'ES' : 'EN'}
              </button>
            )}

            {!authLoading && isAuthenticated && (
              <a href="/notifications" className="inline-flex h-9 w-9 items-center justify-center rounded-full text-white/40 transition hover:bg-white/[0.06] hover:text-fei-sky" aria-label="Notifications">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
              </a>
            )}

            <a href="/login" className="rounded-full border border-fei-sky/70 px-5 py-2 text-sm font-medium text-fei-sky transition hover:bg-fei-sky/10">{lang === 'en' ? 'Login' : 'Ingresar'}</a>
            <a href="/register" className="rounded-full bg-fei-yellow px-5 py-2 text-sm font-semibold text-fei-bg transition hover:bg-fei-yellow/90">{lang === 'en' ? 'Get Started' : 'Comenzar'}</a>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            {onToggleLang && (
              <button onClick={onToggleLang} className="rounded-full border border-white/10 px-3 py-1.5 text-xs font-semibold text-white/60 transition hover:bg-white/[0.06] hover:text-white">
                {lang === 'en' ? 'ES' : 'EN'}
              </button>
            )}

            {!authLoading && isAuthenticated && (
              <a href="/notifications" className="inline-flex h-10 w-10 items-center justify-center rounded-full text-white/45 transition hover:bg-white/[0.06] hover:text-fei-sky">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
              </a>
            )}

            <button type="button" onClick={() => setMenuOpen((v) => !v)} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white transition hover:bg-white/[0.08]">
              {menuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M4 7h16"/><path d="M4 12h16"/><path d="M4 17h16"/></svg>
              )}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="mt-3 overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#070b12]/95 p-3 shadow-[0_18px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl md:hidden">
            <div className="grid gap-1">
              {links.map((link) => (
                <a key={link.label} href={link.href} onClick={() => setMenuOpen(false)} className="rounded-2xl px-4 py-3 text-base font-medium text-white/75 transition hover:bg-white/[0.06] hover:text-white">
                  {link.label}
                </a>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-2 border-t border-white/10 pt-3">
              <a href="https://instagram.com/fei.football" target="_blank" rel="noopener noreferrer" className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 text-white/55 transition hover:text-fei-sky">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/>
                </svg>
              </a>
              <a href="https://linkedin.com/company/football-english-intelligence" target="_blank" rel="noopener noreferrer" className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 text-white/55 transition hover:text-fei-sky">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>
                </svg>
              </a>
              <a href="/login" onClick={() => setMenuOpen(false)} className="ml-auto rounded-full border border-fei-sky/70 px-4 py-3 text-sm font-semibold text-fei-sky">{lang === 'en' ? 'Login' : 'Ingresar'}</a>
              <a href="/register" onClick={() => setMenuOpen(false)} className="rounded-full bg-fei-yellow px-4 py-3 text-sm font-bold text-fei-bg">{lang === 'en' ? 'Get Started' : 'Comenzar'}</a>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
