'use client'

import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";

type Lang = 'en' | 'es';

const translations = {
  en: {
    tagline: "Football is global.",
    hero_subtitle: "",
    hero_description: "The football-specific English platform that helps players, coaches, scouts and football professionals communicate with confidence in interviews, meetings, reports, team environments and international opportunities.",
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
    pricing_subtitle: "Choose the access that fits your football journey — from an initial diagnostic to premium role-based training and institutional plans.",
    pricing_cta: "Start Free Diagnostic",
    footer_faq: "FAQs",
    footer_contact: "Contact",
    footer_privacy: "Privacy Policy",
    footer_terms: "Terms of Use",
    footer_linkedin: "LinkedIn",
    footer_instagram: "Instagram",
    footer_rights: "All rights reserved.",
  },
  es: {
    tagline: "El fútbol es global.",
    hero_subtitle: "",
    hero_description: "La plataforma de inglés especializada en fútbol que ayuda a jugadores, entrenadores, scouts y profesionales del fútbol a comunicarse con confianza en entrevistas, reuniones, reportes, entornos de equipo y oportunidades internacionales.",
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
    pricing_subtitle: "Elige el acceso que se adapta a tu camino en el fútbol: desde un diagnóstico inicial hasta entrenamiento premium por rol y planes institucionales.",
    pricing_cta: "Empezar diagnóstico gratis",
    footer_faq: "FAQs",
    footer_contact: "Contacto",
    footer_privacy: "Política de privacidad",
    footer_terms: "Términos de uso",
    footer_linkedin: "LinkedIn",
    footer_instagram: "Instagram",
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

      <section className="relative flex min-h-[calc(100vh-73px)] overflow-hidden px-6 py-20 sm:py-24 lg:items-center lg:py-16">
        <div className="pointer-events-none absolute right-[-14rem] top-10 h-[34rem] w-[34rem] rounded-full bg-fei-sky/[0.11] blur-3xl" />
        <div className="pointer-events-none absolute bottom-[-14rem] left-[-10rem] h-[28rem] w-[28rem] rounded-full bg-fei-yellow/[0.08] blur-3xl" />

        <div className="mx-auto w-full max-w-[1500px]">
          <div className="max-w-5xl">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-fei-sky">{t.tagline}</p>

            <h1 className="mt-6 text-5xl font-black leading-[1.03] text-fei-text sm:text-6xl lg:text-7xl xl:text-8xl">
              Football English<br />
              <span className="bg-gradient-to-r from-fei-yellow to-fei-sky bg-clip-text text-transparent">Intelligence.</span>
            </h1>

            <div className="mt-7 max-w-3xl text-lg leading-8 text-fei-text/65 sm:text-xl sm:leading-9">
              {lang === 'en' ? (
                <p>The only English platform built for elite football.</p>
              ) : (
                <p>La única plataforma de inglés diseñada para el fútbol de élite.</p>
              )}
            </div>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <a href="/register" className="inline-flex items-center justify-center rounded-full bg-fei-yellow px-8 py-3 font-semibold text-fei-bg transition hover:bg-fei-yellow/90">{t.cta_start}</a>
            </div>
          </div>

          <div className="mt-16 grid max-w-6xl gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {t.stats.map((stat) => (
              <div key={stat.label} className="rounded-3xl border border-fei-text/10 bg-white/[0.025] px-6 py-5 backdrop-blur">
                <p className="text-3xl font-black tracking-tight text-fei-text">{stat.value}</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-fei-text/40">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="scroll-mt-28 bg-white px-6 py-20 text-fei-bg sm:py-24">
        <div className="mx-auto max-w-[1500px]">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <div>
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.28em] text-fei-sky">
                The FEI Method
              </p>

              <h2 className="text-4xl font-black tracking-tight text-fei-bg sm:text-5xl">
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
            </div>

            <p className="max-w-3xl text-lg leading-8 text-fei-bg/60 lg:justify-self-end">
              {t.how_subtitle}
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {t.steps.map((item) => (
              <article key={item.step} className="rounded-[2rem] border border-fei-bg/10 bg-[#F7F8FA] p-8 transition hover:-translate-y-1 hover:border-fei-sky/25 hover:bg-white hover:shadow-xl hover:shadow-fei-bg/5">
                <div className="mb-10 flex items-center justify-between">
                  <span className="rounded-full border border-fei-bg/10 bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-fei-bg/45">
                    Step {item.step}
                  </span>

                  <span className="h-2 w-2 rounded-full bg-fei-sky" />
                </div>

                <h3 className="text-2xl font-black tracking-tight text-fei-bg">{item.title}</h3>
                <p className="mt-4 text-base leading-7 text-fei-bg/60">{item.description}</p>
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

            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
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
                  className="group relative min-h-[108px] overflow-hidden rounded-2xl border border-fei-text/10 bg-fei-text/[0.025] p-3.5 transition duration-300 hover:-translate-y-1 hover:border-fei-yellow/35 hover:bg-fei-yellow/[0.045] hover:shadow-[0_18px_55px_rgba(0,0,0,0.18)]"
                >
                  <div className="pointer-events-none absolute -right-1 -top-3 text-6xl font-black leading-none text-fei-sky/[0.12] transition duration-300 group-hover:text-fei-yellow/[0.24] sm:text-7xl">
                    {String(index + 1).padStart(2, '0')}
                  </div>

                  <div className="relative z-10 flex h-full flex-col justify-between">
                    <h3 className="max-w-[11rem] text-base font-medium leading-5 text-fei-text sm:text-lg">
                      {item.role}
                    </h3>

                    <p className="mt-4 translate-y-2 text-xs leading-5 text-fei-text/0 transition duration-300 group-hover:translate-y-0 group-hover:text-fei-text/65">
                      {item.insight}
                    </p>
                  </div>
                </article>
              ))}

              <a
                href="/suggest-role"
                className="group relative min-h-[108px] overflow-hidden rounded-2xl border border-fei-yellow/25 bg-fei-yellow/[0.07] p-3.5 transition duration-300 hover:-translate-y-1 hover:border-fei-yellow/45 hover:bg-fei-yellow/[0.12] hover:shadow-[0_18px_55px_rgba(0,0,0,0.18)]"
              >
                <div className="pointer-events-none absolute -right-1 -top-3 text-6xl font-black leading-none text-fei-yellow/[0.20] transition duration-300 group-hover:text-fei-yellow/[0.30] sm:text-7xl">
                  +
                </div>

                <div className="relative z-10 flex h-full flex-col justify-between">
                  <h3 className="max-w-[11rem] text-base font-semibold leading-5 text-fei-yellow sm:text-lg">
                    {lang === 'en' ? "Can't find your role?" : '¿No encuentras tu rol?'}
                  </h3>

                  <p className="mt-4 text-xs font-semibold leading-5 text-fei-text/65 transition duration-300 group-hover:text-fei-yellow">
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
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-fei-sky">{t.pricing_label}</p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">{t.pricing_title}</h2>
            <p className="mx-auto mt-4 max-w-2xl text-fei-text/60">{t.pricing_subtitle}</p>
          </div>

          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {[
              {
                name: lang === 'en' ? 'Free Access' : 'Acceso gratuito',
                price: lang === 'en' ? 'Free' : 'Gratis',
                detail: lang === 'en' ? 'Initial diagnostic + limited preview' : 'Diagnóstico inicial + vista previa limitada',
                features: lang === 'en'
                  ? ['Initial FEI diagnostic', 'Estimated communication level', 'Limited module preview']
                  : ['Diagnóstico inicial FEI', 'Nivel estimado de comunicación', 'Vista previa limitada de módulos'],
                cta: lang === 'en' ? 'Start Free' : 'Empezar gratis',
                href: '/register',
                highlight: false,
              },
              {
                name: lang === 'en' ? 'Individual Premium' : 'Premium Individual',
                price: '$49',
                detail: lang === 'en' ? 'USD / month or $399 USD / year' : 'USD / mes o $399 USD / año',
                features: lang === 'en'
                  ? ['Full role-based modules', 'Football-specific scenarios', 'Progress tracking and recommendations']
                  : ['Módulos completos por rol', 'Escenarios específicos de fútbol', 'Seguimiento de progreso y recomendaciones'],
                cta: lang === 'en' ? 'Unlock Premium' : 'Desbloquear Premium',
                href: '/register',
                highlight: true,
              },
              {
                name: lang === 'en' ? 'Institutional Plans' : 'Planes Institucionales',
                price: '$199',
                detail: lang === 'en' ? 'from USD / month' : 'desde USD / mes',
                features: lang === 'en'
                  ? ['For clubs and academies', 'Multiple users and licenses', 'Reports and implementation options']
                  : ['Para clubes y academias', 'Múltiples usuarios y licencias', 'Reportes y opciones de implementación'],
                cta: lang === 'en' ? 'Contact FEI' : 'Contactar FEI',
                href: '/contact',
                highlight: false,
              },
            ].map((plan) => (
              <article
                key={plan.name}
                className={`relative flex min-h-[430px] flex-col rounded-3xl border p-6 transition duration-300 hover:-translate-y-1 ${
                  plan.highlight
                    ? 'border-fei-yellow/45 bg-fei-yellow/[0.07] shadow-[0_24px_80px_rgba(250,204,21,0.10)]'
                    : 'border-fei-text/10 bg-fei-text/[0.025] hover:border-fei-sky/30'
                }`}
              >
                {plan.highlight && (
                  <div className="absolute right-5 top-5 rounded-full border border-fei-yellow/30 bg-fei-yellow/[0.12] px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-fei-yellow">
                    {lang === 'en' ? 'Popular' : 'Popular'}
                  </div>
                )}

                <div>
                  <h3 className="text-xl font-bold tracking-tight text-fei-text">{plan.name}</h3>
                  <div className="mt-7 flex items-end gap-2">
                    <span className="text-5xl font-black tracking-tight text-fei-text">{plan.price}</span>
                    <span className="pb-2 text-sm font-medium text-fei-text/55">{plan.detail}</span>
                  </div>
                </div>

                <ul className="mt-8 space-y-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex gap-3 text-sm leading-6 text-fei-text/70">
                      <span className="mt-0.5 text-fei-yellow">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-auto pt-8">
                  <a
                    href={plan.href}
                    className={`inline-flex w-full items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition ${
                      plan.highlight
                        ? 'bg-fei-yellow text-fei-bg hover:bg-fei-yellow/90'
                        : 'border border-fei-sky/40 text-fei-sky hover:bg-fei-sky/10'
                    }`}
                  >
                    {plan.cta}
                  </a>
                </div>
              </article>
            ))}
          </div>

          <p className="mx-auto mt-8 max-w-3xl text-center text-xs leading-6 text-fei-text/45">
            {lang === 'en'
              ? 'Prices may vary by country, promotion, number of users, licenses, included features, support level, and institutional conditions. FEI will always show the applicable price before any payment.'
              : 'Los precios pueden variar según país, promoción, número de usuarios, licencias, funciones incluidas, nivel de soporte y condiciones institucionales. FEI siempre mostrará el precio aplicable antes de cualquier pago.'}
          </p>
        </div>
      </section>

      <footer className="mt-auto border-t border-fei-text/10 bg-[#0F172A] px-6 py-5">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-5 lg:grid-cols-[1fr_auto_1fr] lg:items-center">
            <div className="hidden lg:block" aria-hidden="true" />

            <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-[#94A3B8]">
              <a href="/terms" className="transition hover:text-[#F8FAFC]">
                {t.footer_terms}
              </a>

              <span className="h-4 w-px bg-white/15" aria-hidden="true" />

              <a href="/privacy" className="transition hover:text-[#F8FAFC]">
                {t.footer_privacy}
              </a>

              <span className="h-4 w-px bg-white/15" aria-hidden="true" />

              <a href="/faq" className="transition hover:text-[#F8FAFC]">
                {t.footer_faq}
              </a>

              <span className="h-4 w-px bg-white/15" aria-hidden="true" />

              <a href="/contact" className="transition hover:text-[#F8FAFC]">
                {t.footer_contact}
              </a>
            </nav>

            <div className="flex items-center justify-center gap-2 lg:justify-end">
              <a
                href="https://linkedin.com/company/football-english-intelligence"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow FEI on LinkedIn"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-sm font-black text-fei-yellow/85 transition hover:border-fei-sky/40 hover:text-fei-sky"
              >
                in
              </a>

              <a
                href="https://instagram.com/fei.football"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow FEI on Instagram"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-fei-yellow/85 transition hover:border-fei-sky/40 hover:text-fei-sky"
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
                </svg>
              </a>
            </div>
          </div>

          <div className="mt-5 border-t border-white/10 pt-3">
            <p className="text-center text-xs leading-6 text-[#94A3B8]">
              © 2026 Football English Intelligence. {t.footer_rights}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
