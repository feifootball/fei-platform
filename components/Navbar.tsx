"use client";

import { useEffect, useState } from "react";

type Lang = "en" | "es";

type NavLink = {
  label: string;
  href: string;
  sectionId: string;
};

const navLinks: Record<Lang, NavLink[]> = {
  en: [
    { label: "How it works", href: "/#how-it-works", sectionId: "how-it-works" },
    { label: "Roles", href: "/#roles", sectionId: "roles" },
    { label: "For Clubs", href: "/#for-clubs", sectionId: "for-clubs" },
    { label: "Pricing", href: "/#pricing", sectionId: "pricing" },
  ],
  es: [
    { label: "Cómo funciona", href: "/#how-it-works", sectionId: "how-it-works" },
    { label: "Roles", href: "/#roles", sectionId: "roles" },
    { label: "Para Clubes", href: "/#for-clubs", sectionId: "for-clubs" },
    { label: "Precios", href: "/#pricing", sectionId: "pricing" },
  ],
};

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [lang, setLang] = useState<Lang>("en");
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("fei_lang_v2") as Lang;
    if (saved === "en" || saved === "es") setLang(saved);

    function handleLangChange(e: Event) {
      const custom = e as CustomEvent<Lang>;
      setLang(custom.detail);
    }

    window.addEventListener("fei_lang_v2_v2_change", handleLangChange);
    return () => window.removeEventListener("fei_lang_v2_v2_change", handleLangChange);
  }, []);

  useEffect(() => {
    const sectionIds = ["how-it-works", "roles", "for-clubs", "pricing"];

    function handleScroll() {
      let current = "";

      for (const id of sectionIds) {
        const element = document.getElementById(id);
        if (!element) continue;

        const rect = element.getBoundingClientRect();

        if (rect.top <= 120 && rect.bottom >= 120) {
          current = id;
          break;
        }
      }

      setActiveSection(current);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function toggleLang() {
    const next: Lang = lang === "en" ? "es" : "en";
    setLang(next);
    localStorage.setItem("fei_lang_v2", next);
    window.dispatchEvent(new CustomEvent("fei_lang_v2_v2_change", { detail: next }));
  }

  const links = navLinks[lang];

  const navLinkClass = (sectionId: string) =>
    `inline-flex rounded-full px-2.5 py-1.5 text-[15px] font-semibold transition duration-300 ${
      activeSection === sectionId
        ? "bg-white/[0.06] text-fei-text shadow-[0_0_22px_rgba(255,255,255,0.12)]"
        : "text-fei-text/60 hover:bg-white/[0.04] hover:text-fei-text"
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-fei-text/10 bg-fei-bg/90 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <a href="/" className="flex items-center">
          <img src="/logo.svg" alt="FEI" className="h-9 w-auto" />
        </a>

        <div className="hidden items-center md:flex">
          <div className="flex items-center gap-4">
            {links.map((link) => (
              <a key={link.label} href={link.href} className={navLinkClass(link.sectionId)}>
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
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-fei-sky"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M3 12h18" />
                <path d="M12 3c2.2 2.4 3.3 5.4 3.3 9S14.2 18.6 12 21" />
                <path d="M12 3c-2.2 2.4-3.3 5.4-3.3 9S9.8 18.6 12 21" />
              </svg>
              {lang === "en" ? "ES" : "EN"}
            </button>

            <a
              href="/login"
              className="rounded-full border border-fei-sky/45 px-5 py-2 text-sm font-semibold text-fei-sky transition hover:bg-fei-sky/10"
            >
              {lang === "en" ? "Login" : "Ingresar"}
            </a>

            <a
              href="/register"
              className="rounded-full bg-fei-yellow px-5 py-2 text-sm font-bold text-fei-bg transition hover:bg-fei-yellow/90"
            >
              {lang === "en" ? "Register" : "Registrarse"}
            </a>
          </div>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={toggleLang}
            className="inline-flex items-center gap-1.5 rounded-full border border-fei-text/20 px-3 py-1.5 text-xs font-bold text-fei-text/60 transition hover:text-fei-text"
            aria-label="Change language"
          >
            {lang === "en" ? "ES" : "EN"}
          </button>

          <button
            onClick={() => setMenuOpen((open) => !open)}
            className="rounded-full border border-fei-text/20 px-3 py-1.5 text-xs font-bold text-fei-text/70 transition hover:text-fei-text"
            aria-label="Open menu"
          >
            Menu
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div className="border-t border-fei-text/10 bg-fei-bg/95 px-6 py-4 md:hidden">
          <div className="flex flex-col gap-4">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`text-sm font-medium transition ${
                  activeSection === link.sectionId
                    ? "text-fei-yellow"
                    : "text-fei-text/70 hover:text-fei-text"
                }`}
              >
                {link.label}
              </a>
            ))}

            <div className="flex gap-3 pt-2">
              <a
                href="/login"
                className="flex-1 rounded-full border border-fei-sky/45 px-4 py-2 text-center text-sm font-semibold text-fei-sky transition hover:bg-fei-sky/10"
              >
                {lang === "en" ? "Login" : "Ingresar"}
              </a>

              <a
                href="/register"
                className="flex-1 rounded-full bg-fei-yellow px-4 py-2 text-center text-sm font-bold text-fei-bg transition hover:bg-fei-yellow/90"
              >
                {lang === "en" ? "Register" : "Registrarse"}
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
