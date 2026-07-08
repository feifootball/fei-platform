'use client'

import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";

type Lang = 'en' | 'es';

const translations = {
  en: {
    tagline: "Football is global.",
    hero_subtitle: "",
    hero_description: "The football-specific English platform that helps players, coaches, scouts and football professionals communicate with confidence in interviews, meetings, reports, team environments and international opportunities.",
    cta_start: "Register now",
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
    cta_start: "Regístrate ahora",
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
      <Navbar variant="light" />

      <section className="relative flex min-h-[calc(100vh-73px)] overflow-hidden bg-white px-6 py-20 text-fei-bg sm:py-24 lg:items-center lg:py-16">
        <div
          className="pointer-events-none absolute inset-y-0 right-0 hidden w-[58%] opacity-90 blur-3xl lg:block"
          style={{
            background:
              'radial-gradient(ellipse at 74% 34%, rgba(125, 211, 252, 0.32), transparent 64%), radial-gradient(ellipse at 54% 70%, rgba(250, 204, 21, 0.18), transparent 68%)',
          }}
        />



        <div className="mx-auto w-full max-w-[1500px]">
          <div className="max-w-5xl">
            <p className="text-sm font-black uppercase tracking-[0.32em] text-fei-bg/55">{t.tagline}</p>

            <h1 className="mt-6 text-5xl font-extrabold leading-[1.03] text-fei-bg sm:text-6xl lg:text-7xl xl:text-8xl">
              Football English<br />
              <span className="bg-gradient-to-r from-[#facc15] via-[#bdd58f] to-[#7dd3fc] bg-clip-text font-black text-transparent">
                Intelligence.
              </span>
            </h1>

            <div className="mt-8 max-w-[980px] text-[15px] font-normal leading-7 text-fei-bg/62 sm:text-base sm:leading-8">
              {lang === 'en' ? (
                <p>
                  FEI is a football-specific English training platform that helps<br className="hidden sm:block" />
                  football professionals diagnose their level, train real communication scenarios, and build the confidence to perform in international environments.
                </p>
              ) : (
                <p>
                  FEI es una plataforma de entrenamiento en inglés especializada en fútbol que ayuda<br className="hidden sm:block" />
                  a profesionales del fútbol a diagnosticar su nivel, entrenar situaciones reales de comunicación y ganar confianza para desenvolverse en entornos internacionales.
                </p>
              )}
            </div>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a href="/register" className="inline-flex items-center justify-center rounded-full bg-fei-yellow px-8 py-3 font-bold text-fei-bg transition hover:bg-fei-yellow/90 hover:shadow-lg hover:shadow-fei-yellow/25">{t.cta_start}</a>
            </div>
          </div>

          <div className="mt-12 max-w-5xl rounded-[1.75rem] border border-fei-bg/10 bg-white/78 p-3 shadow-[0_18px_55px_rgba(7,17,31,0.07)] backdrop-blur">
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {t.stats.map((stat, index) => (
                <div
                  key={stat.label}
                  className="group relative overflow-hidden rounded-[1.25rem] px-5 py-4 transition duration-300 hover:bg-[#F7F8FA]"
                >
                  <div className="absolute inset-x-5 top-0 h-px bg-gradient-to-r from-fei-yellow via-fei-sky to-transparent opacity-70" />
                  <div className="pointer-events-none absolute -right-8 -top-10 h-20 w-20 rounded-full bg-fei-sky/10 blur-2xl transition duration-300 group-hover:bg-fei-sky/18" />

                  <div className="relative flex items-end justify-between gap-4">
                    <div>
                      <p className="text-[2rem] font-black leading-none tracking-tight text-fei-bg sm:text-[2.25rem]">
                        {stat.value}
                      </p>
                      <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.2em] text-fei-bg/42">
                        {stat.label}
                      </p>
                    </div>

                    <div className="mb-1 flex h-8 w-8 items-center justify-center rounded-full border border-fei-sky/20 bg-fei-sky/10 text-[11px] font-black text-fei-bg/70 transition duration-300 group-hover:border-fei-yellow/40 group-hover:bg-fei-yellow/20">
                      {String(index + 1).padStart(2, "0")}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="scroll-mt-24 flex min-h-[calc(100vh-73px)] items-center bg-white px-6 py-20 text-fei-bg sm:py-24">
        <div className="mx-auto grid w-full max-w-[1500px] gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="max-w-2xl">
            <p className="mb-4 text-xs font-black uppercase tracking-[0.28em] text-fei-bg/70">
              The FEI Method
            </p>

            <h2 className="text-4xl font-black tracking-tight text-fei-bg sm:text-5xl lg:text-6xl">
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

            <p className="mt-6 text-lg leading-8 text-fei-bg/60">
              {t.how_subtitle}
            </p>
          </div>

          <div className="relative">
            <div className="absolute left-6 top-8 hidden h-[calc(100%-4rem)] w-px bg-gradient-to-b from-fei-sky/35 via-fei-bg/10 to-fei-yellow/35 sm:block" />

            <div className="space-y-10">
              {t.steps.map((item, index) => (
                <article key={item.step} className="group relative grid cursor-pointer gap-5 sm:grid-cols-[8rem_1fr] sm:gap-8">
                  <div className="relative z-10 flex items-center gap-3 sm:block">
                    <span className="block text-6xl font-black leading-none tracking-tight text-fei-bg transition duration-300 group-hover:scale-105 group-hover:text-fei-bg/90 sm:text-7xl">
                      {item.step}
                    </span>

                    <div className="mt-0 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-fei-yellow text-fei-bg shadow-lg shadow-fei-yellow/20 transition duration-300 group-hover:-translate-y-1 group-hover:rotate-3 group-hover:shadow-xl group-hover:shadow-fei-yellow/30 sm:mt-4">
                      {index === 0 && (
                        <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                          <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="2.2" />
                          <path d="M16 16l4 4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                        </svg>
                      )}
                      {index === 1 && (
                        <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                          <path d="M5 7h14M5 12h9M5 17h6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                          <path d="M16.5 16.5l1.8 1.8 3.2-4.1" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                      {index === 2 && (
                        <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                          <path d="M6 13l4 4L18 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M5 20h14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                        </svg>
                      )}
                    </div>
                  </div>

                  <div className="border-b border-fei-bg/10 pb-10 last:border-b-0 last:pb-0">
                    <div className="mb-3 flex items-center gap-4">
                      <span className="h-px w-20 bg-fei-yellow/70 transition-all duration-300 group-hover:w-28 group-hover:bg-fei-yellow" />
                      <span className="h-px flex-1 bg-fei-bg/10" />
                    </div>

                    <h3 className="text-2xl font-black tracking-tight text-fei-bg transition duration-300 group-hover:text-fei-sky sm:text-3xl">
                      {item.title}
                    </h3>

                    <p className="mt-3 max-w-2xl text-base leading-7 text-fei-bg/60 transition duration-300 group-hover:text-fei-bg/75 sm:text-lg sm:leading-8">
                      {item.description}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="roles" className="scroll-mt-28 bg-white px-6 py-20 text-fei-bg sm:py-24">
        <div className="mx-auto max-w-[1500px]">
          <div className="mb-10 max-w-3xl">
            <p className="mb-4 text-xs font-black uppercase tracking-[0.28em] text-fei-sky">
              Role Intelligence
            </p>

            <h2 className="text-4xl font-black tracking-tight text-fei-bg sm:text-5xl">
              {lang === 'en' ? 'Built for every role in the club.' : 'Diseñado para cada rol del club.'}
            </h2>

            <p className="mt-5 text-base leading-7 text-fei-bg/60 sm:text-lg">
              {lang === 'en'
                ? 'Choose your football role and start a diagnostic designed around the communication situations you actually face.'
                : 'Elige tu rol en el fútbol y comienza un diagnóstico diseñado alrededor de las situaciones de comunicación que realmente enfrentas.'}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[
              { role: 'Professional Player', esRole: 'Jugador profesional', text: 'Interviews, teammates and pressure moments.', esText: 'Entrevistas, compañeros y momentos de presión.' },
              { role: 'Head Coach', esRole: 'Entrenador principal', text: 'Tactics, media and staff leadership.', esText: 'Táctica, medios y liderazgo del staff.' },
              { role: 'Assistant Coach', esRole: 'Asistente técnico', text: 'Session delivery and player feedback.', esText: 'Sesiones de entrenamiento y feedback a jugadores.' },
              { role: 'Scout', esRole: 'Scout', text: 'Reports, observations and player profiles.', esText: 'Reportes, observaciones y perfiles de jugador.' },
              { role: 'Head of Scouting', esRole: 'Jefe de scouting', text: 'Strategy, recruitment and decision briefs.', esText: 'Estrategia, reclutamiento y reportes de decisión.' },
              { role: 'Academy Director', esRole: 'Director de academia', text: 'Development, parents and staff alignment.', esText: 'Desarrollo, familias y alineación del staff.' },
              { role: 'Performance Analyst', esRole: 'Analista de rendimiento', text: 'Data, clips and tactical communication.', esText: 'Datos, videos y comunicación táctica.' },
              { role: 'Fitness Coach', esRole: 'Preparador físico', text: 'Load, recovery and physical plans.', esText: 'Carga, recuperación y planes físicos.' },
              { role: 'Physiotherapist', esRole: 'Fisioterapeuta', text: 'Injury updates and return-to-play.', esText: 'Lesiones y retorno al juego.' },
              { role: 'Sports Psychologist', esRole: 'Psicólogo deportivo', text: 'Confidence, pressure and mental routines.', esText: 'Confianza, presión y rutinas mentales.' },
              { role: 'Nutritionist', esRole: 'Nutricionista', text: 'Meal plans, habits and performance fuel.', esText: 'Planes de alimentación, hábitos y rendimiento.' },
            ].map((item, index) => {
              const displayRole = lang === 'en' ? item.role : item.esRole;
              const displayText = lang === 'en' ? item.text : item.esText;

              return (
                <a
                  key={item.role}
                  href={`/register?role=${encodeURIComponent(item.role)}`}
                  className="group relative min-h-[142px] overflow-hidden rounded-[1.3rem] border border-fei-bg/10 bg-[#F7F8FA] p-4 transition duration-500 hover:-translate-y-1 hover:border-fei-sky/45 hover:bg-white hover:shadow-xl hover:shadow-fei-bg/7"
                >
                  <div className="pointer-events-none absolute -right-1 -top-4 text-6xl font-black leading-none text-fei-sky/[0.12] transition duration-500 group-hover:text-fei-yellow/25">
                    {String(index + 1).padStart(2, '0')}
                  </div>

                  <div className="relative z-10 flex min-h-[110px] flex-col">
                    <p className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-fei-sky/85">
                      {lang === 'en' ? 'Role path' : 'Ruta por rol'}
                    </p>

                    <h3 className="max-w-[13rem] text-lg font-black leading-6 text-fei-bg">
                      {displayRole}
                    </h3>

                    <p className="mt-2 text-[13px] leading-5 text-fei-bg/58">
                      {displayText}
                    </p>

                    <p className="mt-auto translate-y-2 pt-3 text-[11px] font-black uppercase tracking-[0.15em] text-fei-yellow opacity-0 transition duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                      {lang === 'en' ? 'Register now →' : 'Regístrate ahora →'}
                    </p>
                  </div>
                </a>
              );
            })}

            <a
              href="/suggest-role"
              className="group relative min-h-[142px] overflow-hidden rounded-[1.3rem] border border-fei-yellow/30 bg-fei-yellow/[0.10] p-4 transition duration-500 hover:-translate-y-1 hover:border-fei-yellow/55 hover:bg-fei-yellow/[0.16] hover:shadow-xl hover:shadow-fei-bg/7"
            >
              <div className="pointer-events-none absolute -right-1 -top-7 text-6xl font-black leading-none text-fei-yellow/25 transition duration-500 group-hover:text-fei-yellow/35">
                +
              </div>

              <div className="relative z-10 flex min-h-[110px] flex-col">
                <p className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-fei-bg/45">
                  {lang === 'en' ? 'Missing role' : 'Rol faltante'}
                </p>

                <h3 className="max-w-[13rem] text-lg font-black leading-6 text-fei-bg">
                  {lang === 'en' ? "Can't find your role?" : '¿No encuentras tu rol?'}
                </h3>

                <p className="mt-auto pt-3 text-[11px] font-black uppercase tracking-[0.15em] text-fei-bg/65 transition duration-300 group-hover:text-fei-bg">
                  {lang === 'en' ? 'Suggest a new role →' : 'Sugiere un nuevo rol →'}
                </p>
              </div>
            </a>
          </div>
        </div>
      </section>

      <section id="for-clubs" className="scroll-mt-32 bg-white px-6 py-16 text-fei-bg sm:py-20">
        <div className="mx-auto max-w-[1500px]">
          <div className="overflow-hidden rounded-[2rem] border border-fei-bg/10 bg-[#F7F8FA] shadow-sm">
            <div className="grid lg:grid-cols-[0.95fr_1.05fr]">
              <div className="p-8 sm:p-10 lg:p-12">
                <p className="text-xs font-black uppercase tracking-[0.28em] text-fei-sky">{t.clubs_label}</p>

                <h2 className="mt-5 max-w-2xl text-4xl font-black tracking-tight text-fei-bg sm:text-5xl">
                  {t.clubs_title}
                </h2>

                <p className="mt-5 max-w-2xl text-lg leading-8 text-fei-bg/62">
                  {t.clubs_description}
                </p>

                <a href="/contact" className="mt-9 inline-flex rounded-full bg-fei-bg px-8 py-3 font-bold text-white transition hover:bg-fei-bg/90">
                  {t.contact_us}
                </a>
              </div>

              <div className="relative border-t border-fei-bg/10 bg-fei-bg p-8 text-white sm:p-10 lg:border-l lg:border-t-0 lg:p-12">
                <div
                  className="pointer-events-none absolute inset-0 opacity-35"
                  style={{
                    background:
                      'radial-gradient(ellipse at 72% 22%, rgba(125,211,252,0.52), transparent 62%), radial-gradient(ellipse at 18% 86%, rgba(250,204,21,0.18), transparent 56%)',
                  }}
                />

                <div className="relative flex min-h-[300px] flex-col justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.28em] text-fei-yellow">{t.clubs_interested}</p>

                    <h3 className="mt-5 text-3xl font-black tracking-tight text-white sm:text-4xl">
                      {t.clubs_demo_title}
                    </h3>

                    <p className="mt-4 max-w-xl text-base leading-8 text-white/68">
                      {t.clubs_demo_description}
                    </p>
                  </div>

                  <div className="mt-10 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-5">
                      <p className="text-3xl font-black text-fei-sky">11</p>
                      <p className="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-white/55">
                        {lang === 'en' ? 'Role paths' : 'Rutas por rol'}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-5">
                      <p className="text-3xl font-black text-fei-yellow">126</p>
                      <p className="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-white/55">
                        {lang === 'en' ? 'Scenarios' : 'Escenarios'}
                      </p>
                    </div>
                  </div>

                  <a href="/contact" className="mt-8 inline-flex w-full items-center justify-center rounded-full border border-fei-yellow/45 px-6 py-3 text-sm font-bold text-fei-yellow transition hover:bg-fei-yellow hover:text-fei-bg">
                    {lang === 'en' ? 'Book a demo' : 'Solicitar demo'}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="scroll-mt-32 bg-white px-6 pb-20 pt-10 text-fei-bg sm:pb-28 sm:pt-12">
        <div className="mx-auto max-w-[1500px]">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-fei-sky">{t.pricing_label}</p>

            <h2 className="mt-5 text-4xl font-black tracking-tight text-fei-bg sm:text-5xl">
              {t.pricing_title}
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-fei-bg/60 sm:text-lg">
              {t.pricing_subtitle}
            </p>
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
                className={`relative flex min-h-[420px] flex-col rounded-[1.8rem] border p-6 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-fei-bg/6 ${
                  plan.highlight
                    ? 'border-fei-yellow/55 bg-fei-yellow/[0.11]'
                    : 'border-fei-bg/10 bg-[#F7F8FA] hover:border-fei-sky/45 hover:bg-white'
                }`}
              >
                {plan.highlight && (
                  <div className="absolute right-5 top-5 rounded-full bg-fei-bg px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-fei-yellow">
                    {lang === 'en' ? 'Popular' : 'Popular'}
                  </div>
                )}

                <div>
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-fei-sky">
                    {plan.highlight ? (lang === 'en' ? 'Best value' : 'Mejor opción') : (lang === 'en' ? 'Plan' : 'Plan')}
                  </p>

                  <h3 className="mt-3 text-2xl font-black tracking-tight text-fei-bg">
                    {plan.name}
                  </h3>

                  <div className="mt-7">
                    <span className="text-5xl font-black tracking-tight text-fei-bg">{plan.price}</span>
                    <p className="mt-2 text-sm font-medium text-fei-bg/55">{plan.detail}</p>
                  </div>
                </div>

                <ul className="mt-8 space-y-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex gap-3 text-sm leading-6 text-fei-bg/68">
                      <span className="mt-0.5 text-fei-sky">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-auto pt-8">
                  <a
                    href={plan.href}
                    className={`inline-flex w-full items-center justify-center rounded-full px-6 py-3 text-sm font-bold transition ${
                      plan.highlight
                        ? 'bg-fei-bg text-white hover:bg-fei-bg/90'
                        : 'border border-fei-bg/20 text-fei-bg hover:bg-fei-bg hover:text-white'
                    }`}
                  >
                    {plan.cta}
                  </a>
                </div>
              </article>
            ))}
          </div>

          <p className="mx-auto mt-8 max-w-3xl text-center text-xs leading-6 text-fei-bg/45">
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
