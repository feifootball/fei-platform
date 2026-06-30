'use client'

import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";

type Lang = 'en' | 'es';

const translations = {
  en: {
    tagline: "Football is global.",
    hero_subtitle: "",
    hero_description: "The only English platform built for elite football.\nCommunication is your competitive advantage.",
    cta_start: "Start your diagnostic",
    cta_login: "Login",
    stats: [
      { value: "11", label: "Roles" },
      { value: "126", label: "Scenarios" },
      { value: "4", label: "CEFR Levels" },
      { value: "504", label: "Unique Tasks" },
    ],
    how_title: "How FEI works",
    how_subtitle: "A focused process for football professionals who need role-specific communication.",
    steps: [
      { step: "01", title: "Diagnose", description: "Find your starting level with a short assessment built around your role." },
      { step: "02", title: "Personalize", description: "Receive a pathway shaped by your level, objectives, and football context." },
      { step: "03", title: "Practice", description: "Train with real situations from the professional game." },
    ],
    about_title: "What is",
    about_subtitle: "A purpose-built platform for football — not generic language courses, but professional English for those who live the game.",
    features: [
      { title: "Built for Elite Football", description: "English training designed for the professional game — players, coaches, scouts, and club staff who operate at the highest level." },
      { title: "Real-World Scenarios", description: "Practice press conferences, contract talks, tactical briefings, and matchday communication — the English you actually need on and off the pitch." },
      { title: "Intelligence-Driven Learning", description: "Adaptive, AI-powered paths that evolve with your role, level, and goals — so every session moves you closer to fluency under pressure." },
    ],
    roles_title: "Built for Every Role in the Club",
    roles_subtitle: "From the dressing room to the boardroom.",
    coming_soon: "Coming soon",
    suggest_role_text: "Missing a role? Tell us",
    suggest_role_link: "Suggest a role",
    clubs_label: "For Clubs",
    clubs_title: "Train your entire squad and staff",
    clubs_description: "FEI offers club licenses for professional teams who want to train multiple staff members simultaneously — from players to coaches to analysts.",
    clubs_features: ["Bulk licenses for full squads", "Progress tracking for all members", "Role-specific paths for every position", "Dedicated club dashboard"],
    clubs_interested: "Interested?",
    clubs_demo_title: "Book a demo for your club",
    clubs_demo_description: "We'll show you how FEI can help your team communicate better on and off the pitch.",
    contact_us: "Contact us",
    pricing_label: "Pricing",
    pricing_title: "Simple, transparent pricing",
    pricing_subtitle: "Coming soon. Get early access by signing up today.",
    pricing_cta: "Get Early Access",
    footer_faq: "FAQ",
    footer_contact: "Contact",
    footer_privacy: "Privacy",
    footer_terms: "Terms",
    footer_rights: "All rights reserved.",
  },
  es: {
    tagline: "El fútbol es global.",
    hero_subtitle: "",
    hero_description: "La única plataforma de inglés diseñada para el fútbol de élite.\nLa comunicación es tu ventaja competitiva.",
    cta_start: "Comenzar diagnóstico",
    cta_login: "Ingresar",
    stats: [
      { value: "11", label: "Roles" },
      { value: "126", label: "Escenarios" },
      { value: "4", label: "Niveles CEFR" },
      { value: "504", label: "Tareas únicas" },
    ],
    how_title: "Cómo funciona FEI",
    how_subtitle: "Del diagnóstico al entrenamiento de comunicación por rol.",
    steps: [
      { step: "01", title: "Diagnostica", description: "Identifica tu nivel inicial con una evaluación específica para tu rol." },
      { step: "02", title: "Personaliza", description: "Recibe una ruta adaptada a tu rol, nivel y necesidades de comunicación." },
      { step: "03", title: "Practica", description: "Entrena con situaciones reales del fútbol y gana confianza progresivamente." },
    ],
    about_title: "¿Qué es",
    about_subtitle: "Una plataforma diseñada para el fútbol — no cursos genéricos de idiomas, sino inglés profesional para quienes viven el juego.",
    features: [
      { title: "Diseñado para el fútbol de élite", description: "Entrenamiento en inglés diseñado para el juego profesional — jugadores, entrenadores, scouts y personal de club que opera al más alto nivel." },
      { title: "Escenarios del mundo real", description: "Practica conferencias de prensa, negociaciones de contratos, sesiones tácticas y comunicación en partido — el inglés que realmente necesitas." },
      { title: "Aprendizaje impulsado por inteligencia", description: "Rutas adaptativas con IA que evolucionan según tu rol, nivel y objetivos — para que cada sesión te acerque más a la fluidez bajo presión." },
    ],
    roles_title: "Diseñado para cada rol en el club",
    roles_subtitle: "Del vestuario a la sala de juntas.",
    coming_soon: "Muy pronto",
    suggest_role_text: "¿Falta un rol? Cuéntanos",
    suggest_role_link: "Sugerir rol",
    clubs_label: "Para Clubes",
    clubs_title: "Entrena a todo tu plantel y cuerpo técnico",
    clubs_description: "FEI ofrece licencias para equipos profesionales que quieren entrenar a múltiples miembros simultáneamente — desde jugadores hasta entrenadores y analistas.",
    clubs_features: ["Licencias para planteles completos", "Seguimiento del progreso de todos los miembros", "Rutas específicas por posición", "Panel de control dedicado para el club"],
    clubs_interested: "¿Interesado?",
    clubs_demo_title: "Solicita una demo para tu club",
    clubs_demo_description: "Te mostraremos cómo FEI puede ayudar a tu equipo a comunicarse mejor dentro y fuera del campo.",
    contact_us: "Contáctanos",
    pricing_label: "Precios",
    pricing_title: "Precios simples y transparentes",
    pricing_subtitle: "Próximamente. Regístrate hoy para obtener acceso anticipado.",
    pricing_cta: "Acceso anticipado",
    footer_faq: "Preguntas frecuentes",
    footer_contact: "Contacto",
    footer_privacy: "Privacidad",
    footer_terms: "Términos",
    footer_rights: "Todos los derechos reservados.",
  },
};

const roles = [
  { name: "Scout", en: "Identify and report talent globally", es: "Identificar y reportar talento a nivel global" },
  { name: "Head Coach", en: "Lead tactical communication", es: "Liderar la comunicación táctica" },
  { name: "Academy Director", en: "Build the next generation", es: "Construir la próxima generación" },
  { name: "Assistant Coach", en: "Translate vision into action", es: "Traducir la visión en acción" },
  { name: "Performance Analyst", en: "Convert data into decisions", es: "Convertir datos en decisiones" },
  { name: "Head of Scouting", en: "Drive recruitment strategy", es: "Impulsar la estrategia de captación" },
  { name: "Fitness Coach", en: "Protect player availability", es: "Proteger la disponibilidad del jugador" },
  { name: "Sports Psychologist", en: "Facilitate mental performance", es: "Facilitar el rendimiento mental" },
  { name: "Physiotherapist", en: "Communicate with medical precision", es: "Comunicar con precisión médica" },
  { name: "Nutritionist", en: "Turn nutrition into performance", es: "Convertir la nutrición en rendimiento" },
  { name: "Professional Player", en: "Represent the club on the global stage", es: "Representar al club en el escenario global" },
];

export default function Home() {
  const [lang, setLang] = useState<Lang>('en');

  useEffect(() => {
    const saved = localStorage.getItem('fei_lang_v2') as Lang;
    if (saved === 'en' || saved === 'es') setLang(saved);

    function handleLangChange(e: Event) {
      const custom = e as CustomEvent<Lang>;
      setLang(custom.detail);
    }

    window.addEventListener('fei_lang_v2_v2_change', handleLangChange);
    return () => window.removeEventListener('fei_lang_v2_v2_change', handleLangChange);
  }, []);

  const t = translations[lang];

  return (
    <div className="flex min-h-full flex-col">
      <Navbar />

      <section className="relative overflow-hidden px-6 py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-fei-sky">{t.tagline}</p>

          <h1 className="mt-6 text-5xl font-black leading-[1.05] text-fei-text sm:text-6xl lg:text-7xl xl:text-8xl">
            Football English<br />
            <span className="bg-gradient-to-r from-fei-yellow to-fei-sky bg-clip-text text-transparent">Intelligence.</span>
          </h1>

          <div className="mt-7 max-w-2xl text-lg leading-8 text-fei-text/65 sm:text-xl sm:leading-9">
            {lang === 'en' ? (
              <>
                <p>The only English platform built for elite football.</p>
                <p><span className="font-bold text-fei-text">Communication</span> is your competitive advantage.</p>
              </>
            ) : (
              <>
                <p>La única plataforma de inglés diseñada para el fútbol de élite.</p>
                <p><span className="font-bold text-fei-text">La comunicación</span> es tu ventaja competitiva.</p>
              </>
            )}
          </div>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <a href="/register" className="inline-flex items-center justify-center rounded-full bg-fei-yellow px-8 py-3 font-semibold text-fei-bg transition hover:bg-fei-yellow/90">{t.cta_start}</a>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="scroll-mt-28 px-6 py-14 sm:py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 max-w-3xl">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.28em] text-fei-sky">
              The FEI Method
            </p>
            <h2 className="text-3xl font-black tracking-tight text-fei-text sm:text-4xl">
              {t.how_title.includes('FEI') ? (
                <>
                  {t.how_title.split('FEI')[0]}
                  <span className="text-fei-sky">FEI</span>
                  {t.how_title.split('FEI').slice(1).join('FEI')}
                </>
              ) : (
                t.how_title
              )}
            </h2>
            <p className="mt-3 max-w-5xl text-base leading-7 text-fei-text/60 sm:text-lg lg:whitespace-nowrap">{t.how_subtitle}</p>
          </div>

          <div className="grid gap-8 border-y border-fei-text/10 py-8 md:grid-cols-3 md:gap-0">
            {t.steps.map((item, index) => (
              <article key={item.step} className="group relative md:border-l md:border-fei-text/10 md:pl-8 md:first:border-l-0 md:first:pl-0">
                <div className="pointer-events-none absolute -top-4 right-4 text-7xl font-black leading-none text-fei-sky/[0.09] transition duration-300 group-hover:text-fei-yellow/[0.16] sm:text-8xl">
                  {item.step}
                </div>

                <div className="mb-6 flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border border-fei-yellow/25 bg-fei-yellow/[0.08] text-fei-yellow">
                    {index === 0 && (
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    )}
                    {index === 1 && (
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M4 7h16M4 12h10M4 17h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    )}
                    {index === 2 && (
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>

                  <span className="text-2xl font-black tracking-tight text-fei-yellow sm:text-3xl">{item.step}</span>
                </div>

                <h3 className="text-xl font-bold text-fei-text">{item.title}</h3>
                <p className="mt-3 max-w-sm text-base leading-7 text-fei-text/60">{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="roles" className="scroll-mt-28 border-t border-fei-text/10 px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:items-start">
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.28em] text-fei-sky">
                Role Intelligence
              </p>

              <h2 className="text-3xl font-black tracking-tight text-fei-text sm:text-4xl">
                Built for every role in the club.
              </h2>

              <p className="mt-4 max-w-xl text-base leading-7 text-fei-text/60 sm:text-lg">
                <span className="font-semibold text-fei-sky">FEI</span> adapts communication training to the decisions, pressure, and language each football professional faces.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <span className="rounded-full border border-fei-yellow/30 bg-fei-yellow/[0.08] px-4 py-2 text-sm font-bold text-fei-yellow">
                  11 Roles
                </span>
                <span className="rounded-full border border-fei-sky/25 bg-fei-sky/[0.07] px-4 py-2 text-sm font-bold text-fei-sky">
                  126 Scenarios
                </span>
              </div>

            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { role: 'Professional Player', insight: 'Interviews, teammates, pressure moments.' },
                { role: 'Head Coach', insight: 'Tactics, media, staff leadership.' },
                { role: 'Assistant Coach', insight: 'Session delivery and player feedback.' },
                { role: 'Scout', insight: 'Reports, observations, player profiles.' },
                { role: 'Head of Scouting', insight: 'Strategy, recruitment, decision briefs.' },
                { role: 'Academy Director', insight: 'Development, parents, staff alignment.' },
                { role: 'Performance Analyst', insight: 'Data, clips, tactical communication.' },
                { role: 'Fitness Coach', insight: 'Load, recovery, physical plans.' },
                { role: 'Physiotherapist', insight: 'Injury updates and return-to-play.' },
                { role: 'Sports Psychologist', insight: 'Confidence, pressure, mental routines.' },
                { role: 'Nutritionist', insight: 'Meal plans, habits, performance fuel.' },
              ].map((item, index) => (
                <article
                  key={item.role}
                  className="group relative min-h-[150px] overflow-hidden rounded-3xl border border-fei-text/10 bg-fei-text/[0.025] p-5 transition duration-300 hover:-translate-y-1 hover:border-fei-yellow/35 hover:bg-fei-yellow/[0.045] hover:shadow-[0_18px_55px_rgba(0,0,0,0.18)]"
                >
                  <div className="pointer-events-none absolute -right-1 -top-4 text-7xl font-black leading-none text-fei-sky/[0.12] transition duration-300 group-hover:text-fei-yellow/[0.24] sm:text-8xl">
                    {String(index + 1).padStart(2, '0')}
                  </div>

                  <div className="relative z-10 flex h-full flex-col justify-between">
                    <h3 className="max-w-[12rem] text-xl font-semibold leading-6 text-fei-text sm:text-2xl">
                      {item.role}
                    </h3>

                    <p className="mt-5 translate-y-2 text-sm leading-5 text-fei-text/0 transition duration-300 group-hover:translate-y-0 group-hover:text-fei-text/65">
                      {item.insight}
                    </p>
                  </div>
                </article>
              ))}

              <a
                href="/suggest-role"
                className="group relative min-h-[150px] overflow-hidden rounded-3xl border border-fei-sky/25 bg-fei-sky/[0.07] p-5 transition duration-300 hover:-translate-y-1 hover:border-fei-sky/45 hover:bg-fei-sky/[0.12] hover:shadow-[0_18px_55px_rgba(0,0,0,0.18)]"
              >
                <div className="pointer-events-none absolute -right-1 -top-4 text-7xl font-black leading-none text-fei-sky/[0.18] transition duration-300 group-hover:text-fei-yellow/[0.20] sm:text-8xl">
                  +
                </div>

                <div className="relative z-10 flex h-full flex-col justify-between">
                  <h3 className="max-w-[12rem] text-xl font-semibold leading-6 text-fei-text sm:text-2xl">
                    {lang === 'en' ? "Can't find your role?" : '¿No encuentras tu rol?'}
                  </h3>

                  <p className="mt-5 text-sm font-semibold leading-5 text-fei-sky transition duration-300 group-hover:text-fei-yellow">
                    {lang === 'en' ? 'Suggest a new role' : 'Sugiere un nuevo rol'}
                  </p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </section>

      <section id="for-clubs" className="scroll-mt-32 border-t border-fei-text/10 px-6 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-fei-sky">{t.clubs_label}</p>
              <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">{t.clubs_title}</h2>
              <p className="mt-4 text-fei-text/60">{t.clubs_description}</p>
              <ul className="mt-6 space-y-3">
                {t.clubs_features.map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-fei-text/70"><span className="text-fei-yellow">✓</span> {item}</li>
                ))}
              </ul>
              <a href="mailto:info@feifootball.com" className="mt-8 inline-flex rounded-full bg-fei-yellow px-8 py-3 font-semibold text-fei-bg transition hover:bg-fei-yellow/90">{t.contact_us}</a>
            </div>
            <div className="rounded-2xl border border-fei-text/10 bg-fei-text/[0.03] p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-fei-sky">{t.clubs_interested}</p>
              <h3 className="mt-4 text-xl font-bold text-fei-text">{t.clubs_demo_title}</h3>
              <p className="mt-2 text-sm text-fei-text/60">{t.clubs_demo_description}</p>
              <a href="mailto:info@feifootball.com" className="mt-6 inline-flex w-full items-center justify-center rounded-full border border-fei-sky px-6 py-3 text-sm font-semibold text-fei-sky transition hover:bg-fei-sky/10">info@feifootball.com</a>
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="scroll-mt-32 border-t border-fei-text/10 px-6 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-fei-sky">{t.pricing_label}</p>
          <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">{t.pricing_title}</h2>
          <p className="mx-auto mt-4 max-w-xl text-fei-text/60">{t.pricing_subtitle}</p>
          <a href="/register" className="mt-8 inline-flex rounded-full bg-fei-yellow px-8 py-3 font-semibold text-fei-bg transition hover:bg-fei-yellow/90">{t.pricing_cta}</a>
        </div>
      </section>

      <footer className="mt-auto border-t border-fei-text/10 px-6 py-10">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-2.5">
              <img src="/logo.svg" alt="FEI" className="h-6 w-auto" />
              <span className="text-sm text-fei-text/50">Football English Intelligence</span>
            </div>
            <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              <a href="/faq" className="text-sm text-fei-text/40 transition hover:text-fei-text">{t.footer_faq}</a>
              <a href="mailto:info@feifootball.com" className="text-sm text-fei-text/40 transition hover:text-fei-text">{t.footer_contact}</a>
              <a href="/privacy" className="text-sm text-fei-text/40 transition hover:text-fei-text">{t.footer_privacy}</a>
              <a href="/terms" className="text-sm text-fei-text/40 transition hover:text-fei-text">{t.footer_terms}</a>
            </nav>
            <div className="flex items-center gap-3">
              <a href="https://instagram.com/fei.football" target="_blank" rel="noopener noreferrer" className="text-fei-text/40 transition hover:text-fei-sky">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/>
                </svg>
              </a>
              <a href="https://linkedin.com/company/football-english-intelligence" target="_blank" rel="noopener noreferrer" className="text-fei-text/40 transition hover:text-fei-sky">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>
                </svg>
              </a>
            </div>
          </div>
          <p className="mt-6 text-center text-xs text-fei-text/30">© {new Date().getFullYear()} Football English Intelligence. {t.footer_rights}</p>
        </div>
      </footer>
    </div>
  );
}
