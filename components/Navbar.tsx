"use client";

import { useEffect, useState } from "react";

type Lang = 'en' | 'es';

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

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [lang, setLang] = useState<Lang>('en');

  useEffect(() => {
    const saved = localStorage.getItem('fei_lang') as Lang;
    if (saved === 'en' || saved === 'es') setLang(saved);

    function handleLangChange(e: Event) {
      const custom = e as CustomEvent<Lang>;
      setLang(custom.detail);
    }

    window.addEventListener('fei_lang_change', handleLangChange);
    return () => window.removeEventListener('fei_lang_change', handleLangChange);
  }, []);

  function toggleLang() {
    const next: Lang = lang === 'en' ? 'es' : 'en';
    setLang(next);
    localStorage.setItem('fei_lang', next);
    window.dispatchEvent(new CustomEvent('fei_lang_change', { detail: next }));
  }

  const links = navLinks[lang];

  return (
    <header className="border-b border-fei-text/10 bg-fei-bg/95">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <a href="/" className="flex items-center">
          <img src="/logo.svg" alt="FEI" className="h-9 w-auto" />
        </a>

        <div className="hidden items-center md:flex">
          <div className="flex items-center gap-7">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-fei-text/55 transition hover:text-fei-text"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="ml-8 flex items-center gap-3">
            <button
              onClick={toggleLang}
              className="inline-flex items-center gap-2 rounded-full border border-fei-text/20 px-4 py-2 text-sm font-semibold text-fei-text/60 transition hover:border-fei-text/40 hover:text-fei-text"
              aria-label="Change language"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-fei-sky" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9" />
                <path d="M3 12h18" />
                <path d="M12 3c2.2 2.4 3.3 5.4 3.3 9S14.2 18.6 12 21" />
                <path d="M12 3c-2.2 2.4-3.3 5.4-3.3 9S9.8 18.6 12 21" />
              </svg>
              {lang === 'en' ? 'ES' : 'EN'}
            </button>

            <a
              href="/login"
              className="rounded-full border border-fei-sky/45 px-5 py-2 text-sm font-semibold text-fei-sky transition hover:bg-fei-sky/10"
            >
              {lang === 'en' ? 'Login' : 'Ingresar'}
            </a>

            <a
              href="/register"
              className="rounded-full bg-fei-yellow px-5 py-2 text-sm font-bold text-fei-bg transition hover:bg-fei-yellow/90"
            >
              {lang === 'en' ? 'Register' : 'Registrarse'}
            </a>
          </div>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={toggleLang}
            className="inline-flex items-center gap-1.5 rounded-full border border-fei-text/20 px-3 py-1.5 text-xs font-bold text-fei-text/60 transition hover:text-fei-text"
            aria-label="Change language"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-fei-sky" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9" />
              <path d="M3 12h18" />
              <path d="M12 3c2.2 2.4 3.3 5.4 3.3 9S14.2 18.6 12 21" />
              <path d="M12 3c-2.2 2.4-3.3 5.4-3.3 9S9.8 18.6 12 21" />
            </svg>
            {lang === 'en' ? 'ES' : 'EN'}
          </button>

          <button
            type="button"
            onClick={() => setMenuOpen((value) => !value)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-fei-text/20 text-fei-text/70 transition hover:text-fei-text"
            aria-label="Open menu"
          >
            {menuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M4 7h16" />
                <path d="M4 12h16" />
                <path d="M4 17h16" />
              </svg>
            )}
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div className="border-t border-fei-text/10 bg-fei-bg px-6 py-4 md:hidden">
          <div className="mx-auto grid max-w-7xl gap-1">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="rounded-xl px-3 py-3 text-sm font-medium text-fei-text/65 transition hover:bg-fei-text/[0.04] hover:text-fei-text"
              >
                {link.label}
              </a>
            ))}

            <div className="mt-3 flex gap-3 border-t border-fei-text/10 pt-4">
              <a
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="flex-1 rounded-full border border-fei-sky/45 px-4 py-3 text-center text-sm font-semibold text-fei-sky"
              >
                {lang === 'en' ? 'Login' : 'Ingresar'}
              </a>
              <a
                href="/register"
                onClick={() => setMenuOpen(false)}
                className="flex-1 rounded-full bg-fei-yellow px-4 py-3 text-center text-sm font-bold text-fei-bg"
              >
                {lang === 'en' ? 'Register' : 'Registrarse'}
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
