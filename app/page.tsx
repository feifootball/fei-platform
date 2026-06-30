'use client'

import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";

type Lang = 'en' | 'es';

const translations = {
  en: {
    tagline: "Football is global.",
    hero_subtitle: "Communication Creates Opportunity.",
    hero_description: "FEI helps football professionals build the English communication skills needed for trials, clubs, interviews, agents, scouts, and the global game.",
    cta_start: "Get Started",
    cta_login: "Login",
    stats: [
      { value: "11", label: "Roles" },
      { value: "126", label: "Scenarios" },
      { value: "4", label: "CEFR Levels" },
      { value: "504", label: "Unique Tasks" },
    ],
    how_title: "How it works",
    how_subtitle: "Three steps to professional English in football.",
    steps: [
      { step: "01", title: "Take the Diagnostic", description: "Complete a role-specific assessment to find your CEFR level and communication gaps." },
      { step: "02", title: "Get Your Path", description: "Receive a personalized learning path based on your role, level, and professional goals." },
      { step: "03", title: "Train & Progress", description: "Work through real football scenarios and track your progress toward fluency." },
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
    hero_subtitle: "La comunicación crea oportunidades.",
    hero_description: "FEI ayuda a los profesionales del fútbol a desarrollar las habilidades de comunicación en inglés necesarias para pruebas, clubes, entrevistas, agentes, scouts y el juego global.",
    cta_start: "Comenzar",
    cta_login: "Ingresar",
    stats: [
      { value: "11", label: "Roles" },
      { value: "126", label: "Escenarios" },
      { value: "4", label: "Niveles CEFR" },
      { value: "504", label: "Tareas únicas" },
    ],
    how_title: "Cómo funciona",
    how_subtitle: "Tres pasos hacia el inglés profesional en el fútbol.",
    steps: [
      { step: "01", title: "Haz el diagnóstico", description: "Completa una evaluación específica para tu rol y descubre tu nivel CEFR y tus brechas de comunicación." },
      { step: "02", title: "Obtén tu ruta", description: "Recibe un camino de aprendizaje personalizado según tu rol, nivel y objetivos profesionales." },
      { step: "03", title: "Entrena y progresa", description: "Trabaja con escenarios reales del fútbol y haz seguimiento de tu progreso hacia la fluidez." },
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
    const saved = localStorage.getItem('fei_lang') as Lang;
    if (saved === 'en' || saved === 'es') setLang(saved);

    function handleLangChange(e: Event) {
      const custom = e as CustomEvent<Lang>;
      setLang(custom.detail);
    }

    window.addEventListener('fei_lang_change', handleLangChange);
    return () => window.removeEventListener('fei_lang_change', handleLangChange);
  }, []);

  const t = translations[lang];

  return (
    <div className="flex min-h-full flex-col">
      <Navbar />

      <section className="relative overflow-hidden px-6 py-20 sm:py-28 lg:py-36">
        <div className="mx-auto max-w-4xl">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-fei-sky">{t.tagline}</p>
          <h1 className="mt-6 text-6xl font-black leading-[1.1] text-fei-text sm:text-7xl lg:text-8xl">
            Football<br />English<br />
            <span className="bg-gradient-to-r from-fei-yellow to-fei-sky bg-clip-text text-transparent">Intelligence.</span>
          </h1>
          <p className="mt-8 text-lg font-semibold text-fei-text">{t.hero_subtitle}</p>
          <p className="mt-4 max-w-xl text-fei-text/60">{t.hero_description}</p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <a href="/register" className="inline-flex items-center gap-2 rounded-full bg-fei-yellow px-8 py-3 font-semibold text-fei-bg">{t.cta_start} <span>→</span></a>
            <a href="/login" className="inline-flex items-center justify-center rounded-full border border-fei-sky px-8 py-3 font-semibold text-fei-sky">{t.cta_login}</a>
          </div>
        </div>
      </section>

      <section id="diagnostic" className="scroll-mt-32 border-y border-fei-text/10 bg-fei-text/[0.02] px-6 py-12 sm:py-14">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 sm:grid-cols-4 sm:gap-4">
          {t.stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-4xl font-bold tracking-tight text-fei-yellow sm:text-5xl">{stat.value}</p>
              <p className="mt-1.5 text-sm text-fei-sky">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="scroll-mt-32 px-6 py-20 sm:py-28">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{t.how_title}</h2>
            <p className="mx-auto mt-4 max-w-2xl text-fei-text/60">{t.how_subtitle}</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {t.steps.map((item) => (
              <div key={item.step} className="rounded-2xl border border-fei-text/10 bg-fei-text/[0.03] p-6">
                <p className="text-4xl font-black text-fei-yellow/20">{item.step}</p>
                <h3 className="mt-3 text-lg font-semibold text-fei-text">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-fei-text/60">{item.description}</p>
              </div>
            ))}
          </div>

          <div id="about" className="mt-24 scroll-mt-32 border-t border-fei-text/10 pt-20">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{t.about_title} <span className="text-fei-sky">FEI</span>?</h2>
              <p className="mx-auto mt-4 max-w-2xl text-fei-text/60">{t.about_subtitle}</p>
            </div>
            <div className="grid gap-6 sm:grid-cols-3">
              {t.features.map((feature) => (
                <article key={feature.title} className="rounded-2xl border border-fei-text/10 bg-fei-text/[0.03] p-6">
                  <h3 className="text-lg font-semibold text-fei-text">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-fei-text/60">{feature.description}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="roles" className="scroll-mt-32 border-t border-fei-text/10 px-6 py-20 sm:py-28">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{t.roles_title}</h2>
            <p className="mx-auto mt-4 max-w-2xl text-fei-text/60">{t.roles_subtitle}</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {roles.map((role) => (
              <article key={role.name} className="flex flex-col items-center gap-1.5 rounded-xl border border-transparent bg-[#162033] px-4 py-5 text-center">
                <span className="text-sm font-bold text-fei-yellow">{role.name}</span>
                <span className="text-xs leading-snug text-fei-sky">{lang === 'en' ? role.en : role.es}</span>
              </article>
            ))}
            <article className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-fei-text/20 bg-fei-text/[0.02] px-4 py-5 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-6 w-6 text-fei-text/40"><circle cx="12" cy="12" r="10" /><path d="M12 6v6m3-3H9" /></svg>
              <span className="text-xs font-semibold uppercase tracking-[0.15em] text-fei-text/50">{t.coming_soon}</span>
              <p className="text-xs leading-snug text-fei-text/40">{t.suggest_role_text}</p>
              <a href="/suggest-role" className="mt-2 text-xs font-semibold text-fei-sky underline hover:text-fei-yellow">{t.suggest_role_link}</a>
            </article>
          </div>
        </div>
      </section>

      <section id="for-clubs" className="scroll-mt-32 border-t border-fei-text/10 px-6 py-20 sm:py-28">
        <div className="mx-auto max-w-5xl">
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
        <div className="mx-auto max-w-5xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-fei-sky">{t.pricing_label}</p>
          <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">{t.pricing_title}</h2>
          <p className="mx-auto mt-4 max-w-xl text-fei-text/60">{t.pricing_subtitle}</p>
          <a href="/register" className="mt-8 inline-flex rounded-full bg-fei-yellow px-8 py-3 font-semibold text-fei-bg transition hover:bg-fei-yellow/90">{t.pricing_cta}</a>
        </div>
      </section>

      <footer className="mt-auto border-t border-fei-text/10 px-6 py-10">
        <div className="mx-auto max-w-5xl">
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
