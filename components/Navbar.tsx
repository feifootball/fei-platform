"use client";

import { useEffect, useState, type MouseEvent } from "react";

type Lang = "en" | "es";
type NavbarVariant = "dark" | "light";

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

export function Navbar({
  hideSectionLinks = false,
  variant = "dark",
}: {
  hideSectionLinks?: boolean;
  variant?: NavbarVariant;
} = {}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [lang, setLang] = useState<Lang>("en");
  const [activeSection, setActiveSection] = useState("");

  const isLight = variant === "light";

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
      let closestDistance = Number.POSITIVE_INFINITY;

      for (const id of sectionIds) {
        const element = document.getElementById(id);
        if (!element) continue;

        const rect = element.getBoundingClientRect();
        const distance = Math.abs(rect.top - 96);

        if (rect.top <= window.innerHeight * 0.55 && rect.bottom >= 96 && distance < closestDistance) {
          current = id;
          closestDistance = distance;
        }
      }

      setActiveSection(current);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("hashchange", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("hashchange", handleScroll);
    };
  }, []);

  function toggleLang() {
    const next: Lang = lang === "en" ? "es" : "en";
    setLang(next);
    localStorage.setItem("fei_lang_v2", next);
    window.dispatchEvent(new CustomEvent("fei_lang_v2_v2_change", { detail: next }));
  }

  function slowScrollTo(element: HTMLElement, duration = 950) {
    const headerOffset = 88;
    const startPosition = window.scrollY;
    const targetPosition = element.getBoundingClientRect().top + window.scrollY - headerOffset;
    const distance = targetPosition - startPosition;
    const startTime = performance.now();

    function easeInOutCubic(t: number) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function animate(currentTime: number) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeInOutCubic(progress);

      window.scrollTo(0, startPosition + distance * easedProgress);

      if (progress < 1) requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
  }

  function handleNavClick(event: MouseEvent<HTMLAnchorElement>, sectionId: string, href: string) {
    setActiveSection(sectionId);
    setMenuOpen(false);

    if (window.location.pathname === "/") {
      event.preventDefault();

      const section = document.getElementById(sectionId);
      if (section) {
        slowScrollTo(section);
        window.history.pushState(null, "", href);
      }

      window.setTimeout(() => {
        setActiveSection(sectionId);
      }, 1000);
    }
  }

  const links = navLinks[lang];

  const navLinkClass = (sectionId: string) =>
    `inline-flex rounded-full px-4 py-2 text-sm font-medium transition duration-300 ${
      activeSection === sectionId
        ? isLight
          ? "bg-[#2B78C5] text-white shadow-sm"
          : "bg-white/[0.06] text-fei-text shadow-[0_0_14px_rgba(255,255,255,0.055)]"
        : isLight
          ? "text-[#2B78C5]/65 hover:bg-[#2B78C5]/[0.06] hover:text-[#2B78C5]"
          : "text-fei-text/55 hover:bg-white/[0.03] hover:text-fei-text/82"
    }`;

  return (
    <header className={`sticky top-0 z-50 border-b backdrop-blur-xl ${isLight ? "border-[#2B78C5]/10 bg-white/95" : "border-fei-text/10 bg-white/95"}`}>
      <nav className="mx-auto flex w-full max-w-[1600px] items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8 2xl:px-10">
        <a href="/" className="flex items-center">
          <img src="/logo-nav.svg" alt="FEI" className="h-10 w-auto" />
        </a>

        <div className="hidden items-center md:flex">
          {!hideSectionLinks && (
            <div className={`flex items-center gap-1 rounded-full border p-1.5 ${isLight ? "border-[#2B78C5]/10 bg-[#2B78C5]/[0.025]" : "border-fei-text/10 bg-white/[0.025]"}`}>
              {links.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={(event) => handleNavClick(event, link.sectionId, link.href)}
                  className={navLinkClass(link.sectionId)}
                >
                  {link.label}
                </a>
              ))}
            </div>
          )}

          <div className={`${hideSectionLinks ? "" : "ml-5"} flex items-center gap-3`}>
            <button
              onClick={toggleLang}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${
                isLight
                  ? "border-[#2B78C5]/15 text-[#2B78C5]/70 hover:border-[#2B78C5]/30 hover:text-[#2B78C5]"
                  : "border-fei-text/20 text-fei-text/60 hover:border-fei-text/40 hover:text-fei-text"
              }`}
              aria-label="Change language"
            >
              {lang === "en" ? "ES" : "EN"}
            </button>

            <a
              href="/login"
              className={`rounded-full border px-5 py-2 text-sm font-medium transition ${
                isLight
                  ? "border-[#2B78C5]/18 text-[#2B78C5] hover:bg-[#2B78C5]/[0.05]"
                  : "border-fei-sky/45 text-fei-sky hover:bg-fei-sky/10"
              }`}
            >
              {lang === "en" ? "Login" : "Ingresar"}
            </a>

            <a
              href="/register"
              className="rounded-full bg-fei-yellow px-5 py-2 text-sm font-bold text-[#2B78C5] transition hover:bg-fei-yellow/90 hover:shadow-lg hover:shadow-fei-yellow/20"
            >
              {lang === "en" ? "Register" : "Registrarse"}
            </a>
          </div>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={toggleLang}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition ${isLight ? "border-[#2B78C5]/20 text-[#2B78C5]/70 hover:text-[#2B78C5]" : "border-fei-text/20 text-fei-text/60 hover:text-fei-text"}`}
            aria-label="Change language"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3.5 w-3.5 text-fei-sky"
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

          <button
            onClick={() => setMenuOpen((open) => !open)}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${isLight ? "border-[#2B78C5]/20 text-[#2B78C5]/75 hover:text-[#2B78C5]" : "border-fei-text/20 text-fei-text/70 hover:text-fei-text"}`}
            aria-label="Open menu"
          >
            Menu
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div className={`border-t px-6 py-4 md:hidden ${isLight ? "border-[#2B78C5]/10 bg-white/95" : "border-fei-text/10 bg-[#2B78C5]/95"}`}>
          <div className="flex flex-col gap-4">
            {!hideSectionLinks && links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(event) => handleNavClick(event, link.sectionId, link.href)}
                className={`text-sm font-medium transition ${
                  activeSection === link.sectionId
                    ? isLight ? "text-[#2B78C5]" : "text-fei-yellow/85"
                    : isLight ? "text-[#2B78C5]/70 hover:text-[#2B78C5]" : "text-fei-text/65 hover:text-fei-text"
                }`}
              >
                {link.label}
              </a>
            ))}

            <div className="flex gap-3 pt-2">
              <a
                href="/login"
                className={`flex-1 rounded-full border px-4 py-2 text-center text-sm font-medium transition ${isLight ? "border-[#2B78C5]/20 text-[#2B78C5] hover:bg-[#2B78C5]/[0.05]" : "border-fei-sky/45 text-fei-sky hover:bg-fei-sky/10"}`}
              >
                {lang === "en" ? "Login" : "Ingresar"}
              </a>

              <a
                href="/register"
                className="flex-1 rounded-full bg-fei-yellow px-4 py-2 text-center text-sm font-bold text-[#2B78C5] transition hover:bg-fei-yellow/90"
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
