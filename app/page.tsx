'use client';

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
              'radial-gradient(ellipse at 74% 34%, rgba(125, 211, 252, 0.32), transparent 64%), radial-gradient(ellipse at 54% 62%, rgba(250, 204, 21, 0.14), transparent 72%)',
            WebkitMaskImage:
              'linear-gradient(to bottom, black 0%, black 68%, rgba(0,0,0,0.45) 84%, transparent 100%)',
            maskImage:
              'linear-gradient(to bottom, black 0%, black 68%, rgba(0,0,0,0.45) 84%, transparent 100%)',
          }}
        />

        <div className="pointer-events-none absolute right-[-7rem] top-[8rem] hidden h-[620px] w-[620px] opacity-[0.18] lg:block">
          <svg
            viewBox="0 0 620 620"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="h-full w-full"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="footballPatternGradient" x1="120" y1="80" x2="540" y2="560" gradientUnits="userSpaceOnUse">
                <stop stopColor="#7DD3FC" stopOpacity="0.78" />
                <stop offset="0.55" stopColor="#07111F" stopOpacity="0.2" />
                <stop offset="1" stopColor="#FACC15" stopOpacity="0.42" />
              </linearGradient>
            </defs>

            <g
              stroke="url(#footballPatternGradient)"
              strokeWidth="1.25"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M420 60L515 115V225L420 280L325 225V115L420 60Z" />
              <path d="M530 180L625 235V345L530 400L435 345V235L530 180Z" />
              <path d="M405 285L500 340V450L405 505L310 450V340L405 285Z" />
              <path d="M255 165L350 220V330L255 385L160 330V220L255 165Z" />
              <path d="M515 395L610 450V560L515 615L420 560V450L515 395Z" opacity="0.86" />
              <path d="M285 415L380 470V580L285 635L190 580V470L285 415Z" opacity="0.82" />
              <path d="M600 70L680 118V210L600 258L520 210V118L600 70Z" opacity="0.72" />
            </g>
          </svg>
        </div>



        <div className="mx-auto w-full max-w-[1500px]">
          <div className="max-w-5xl">
            <p className="mt-[1.5cm] text-sm font-black uppercase tracking-[0.32em] text-fei-bg/55">{t.tagline}</p>

            <h1 className="mt-6 text-5xl font-extrabold leading-[1.03] text-fei-bg sm:text-6xl lg:text-7xl xl:text-8xl">
              Football English<br />
              <span className="bg-gradient-to-r from-[#facc15] via-[#bdd58f] to-[#7dd3fc] bg-clip-text font-black text-transparent">
                Intelligence.
              </span>
            </h1>

            <div className="mt-8 max-w-[1320px] text-[15px] font-normal leading-7 text-fei-bg/62 sm:text-base sm:leading-8">
              {lang === 'en' ? (
                <p>
                  <span className="block sm:whitespace-nowrap">FEI is a football-specific English training platform that helps football professionals diagnose their level,</span>
                  <span className="block sm:whitespace-nowrap">train real communication scenarios, and build the confidence to perform in international environments.</span>
                </p>
              ) : (
                <p>
                  <span className="block sm:whitespace-nowrap">FEI es una plataforma de entrenamiento en inglés especializada en fútbol que ayuda a profesionales del fútbol a diagnosticar su nivel,</span>
                  <span className="block sm:whitespace-nowrap">entrenar situaciones reales de comunicación y ganar confianza para desenvolverse en entornos internacionales.</span>
                </p>
              )}
            </div>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a href="/register" className="inline-flex items-center justify-center rounded-full bg-fei-yellow px-8 py-3 font-bold text-fei-bg transition hover:bg-fei-yellow/90 hover:shadow-lg hover:shadow-fei-yellow/25">{t.cta_start}</a>
            </div>
          </div>

          <div
            className="mt-8 max-w-5xl rounded-[1.75rem] border border-fei-bg/10 bg-white/80 p-3 shadow-[0_18px_55px_rgba(7,17,31,0.07)] backdrop-blur relative overflow-hidden"
            style={{
              WebkitMaskImage: "linear-gradient(to right, black 0%, black 84%, rgba(0,0,0,0.7) 92%, transparent 100%)",
              maskImage: "linear-gradient(to right, black 0%, black 84%, rgba(0,0,0,0.7) 92%, transparent 100%)",
            }}
          >
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {t.stats.map((stat, index) => (
                <div
                  key={stat.label}
                  className="group relative overflow-hidden rounded-[1.25rem] px-5 py-4 transition duration-300 hover:bg-[#F7F8FA]"
                >
                  <div className="absolute inset-x-5 top-0 h-[2px] bg-gradient-to-r from-fei-yellow via-fei-sky to-transparent opacity-90 transition duration-300 group-hover:inset-x-4 group-hover:h-[4px] group-hover:opacity-100" />
                  <div className="pointer-events-none absolute -right-8 -top-10 h-20 w-20 rounded-full bg-fei-sky/10 blur-2xl transition duration-300 group-hover:bg-fei-sky/18" />

                  <div className="relative">
                    <div>
                      <p className="text-[2rem] font-black leading-none tracking-tight text-fei-bg transition duration-300 group-hover:text-fei-sky sm:text-[2.25rem]">
                        {stat.value}
                      </p>
                      <p className="mt-3 text-xs font-bold uppercase tracking-[0.18em] text-fei-bg/50 transition duration-300 group-hover:text-fei-bg/70">
                        {stat.label}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="bg-white px-5 py-14 sm:px-8 sm:py-18">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-[2rem] border border-fei-bg/10 bg-[#F7F8FA] p-6 shadow-[0_18px_55px_rgba(7,17,31,0.05)] sm:p-8 lg:p-10">
            <div className="max-w-3xl">
              <p className="text-sm font-black uppercase tracking-[0.32em] text-fei-bg/55">
                {lang === "en" ? "THE FEI METHOD" : "EL MÉTODO FEI"}
              </p>

              <h2 className="mt-6 text-4xl font-black tracking-tight text-fei-bg sm:text-5xl lg:text-6xl">
                {lang === "en" ? (
                  <>
                    How <span className="text-fei-sky">FEI</span> works
                  </>
                ) : (
                  <>
                    Cómo funciona <span className="text-fei-sky">FEI</span>
                  </>
                )}
              </h2>

              <p className="mt-5 max-w-2xl text-[15px] font-normal leading-7 text-fei-bg/62 sm:text-base sm:leading-8">
                {lang === "en"
                  ? "From level check to real football communication."
                  : "Del diagnóstico inicial a la comunicación que exige el fútbol real."}
              </p>
            </div>

            <div className="mt-10 grid gap-4 lg:grid-cols-[1fr_auto_1fr_auto_1fr] lg:items-stretch">
              {[
                {
                  number: "01",
                  title: lang === "en" ? "Diagnostic" : "Diagnóstico",
                  description:
                    lang === "en"
                      ? "Understand your current level and role-specific communication needs."
                      : "Identifica tu nivel actual y lo que necesitas comunicar mejor según tu rol.",
                },
                {
                  number: "02",
                  title: lang === "en" ? "Personalization" : "Personalización",
                  description:
                    lang === "en"
                      ? "Follow a training path shaped by your role, objectives, and football context."
                      : "Recibe una ruta de entrenamiento alineada con tu rol, tus objetivos y tu contexto futbolístico.",
                },
                {
                  number: "03",
                  title: lang === "en" ? "Practice" : "Práctica",
                  description:
                    lang === "en"
                      ? "Build confidence through interviews, meetings, feedback, and pressure moments."
                      : "Entrena entrevistas, reuniones, feedback y momentos de presión con lenguaje real del fútbol.",
                },
              ].map((step, index) => (
                <>
                  <div
                    key={step.number}
                    className="relative rounded-[1.45rem] border border-fei-bg/10 bg-white p-5"
                  >
                    <div className="absolute inset-x-5 top-0 h-px bg-gradient-to-r from-fei-yellow via-fei-sky to-transparent opacity-80" />

                    <p className="text-sm font-black uppercase tracking-[0.22em] text-fei-sky">
                      {step.number}
                    </p>

                    <h3 className="mt-5 text-2xl font-black tracking-tight text-fei-bg">
                      {step.title}
                    </h3>

                    <p className="mt-3 text-[15px] font-normal leading-7 text-fei-bg/62">
                      {step.description}
                    </p>
                  </div>

                  {index < 2 && (
                    <div className="hidden items-center justify-center lg:flex" aria-hidden="true">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-fei-sky/30 bg-white text-fei-bg shadow-[0_10px_24px_rgba(125,211,252,0.10)]">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4"
                        >
                          <path d="M5 12h14" />
                          <path d="m13 6 6 6-6 6" />
                        </svg>
                      </div>
                    </div>
                  )}
                </>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="roles" className="scroll-mt-24 bg-white px-5 py-8 sm:px-8 sm:py-10">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-6xl">
            <p className="text-sm font-black uppercase tracking-[0.32em] text-fei-bg/55">
              {lang === "en" ? "ROLE INTELLIGENCE" : "INTELIGENCIA POR ROL"}
            </p>

            <h2 className="mt-5 text-4xl font-black tracking-tight text-fei-bg sm:text-5xl lg:whitespace-nowrap lg:text-6xl">
              {lang === "en" ? (
                <>
                  Built for every <span className="text-fei-sky">role</span> in the club
                </>
              ) : (
                <>
                  Creado para cada <span className="text-fei-sky">rol</span> del club
                </>
              )}
            </h2>

            <p className="mt-5 max-w-2xl text-[15px] font-normal leading-7 text-fei-bg/62 sm:text-base">
              {lang === "en"
                ? "Choose your role. Train the communication you actually use."
                : "Elige tu rol y entrena el inglés que necesitas en situaciones reales."}
            </p>
          </div>

          <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                number: "01",
                role: lang === "en" ? "Professional Player" : "Jugador profesional",
                description: lang === "en" ? "Interviews, teammates, pressure." : "Entrevistas, vestuario y momentos de presión.",
              },
              {
                number: "02",
                role: lang === "en" ? "Head Coach" : "Director técnico",
                description: lang === "en" ? "Tactics, media, leadership." : "Táctica, medios y liderazgo de equipo.",
              },
              {
                number: "03",
                role: lang === "en" ? "Assistant Coach" : "Asistente técnico",
                description: lang === "en" ? "Sessions, feedback, players." : "Sesiones, feedback y comunicación con jugadores.",
              },
              {
                number: "04",
                role: lang === "en" ? "Scout" : "Scout / Observador",
                description: lang === "en" ? "Reports and player profiles." : "Observación, reportes y perfiles de jugadores.",
              },
              {
                number: "05",
                role: lang === "en" ? "Head of Scouting" : "Director de scouting",
                description: lang === "en" ? "Recruitment and decisions." : "Estrategia de scouting y toma de decisiones.",
              },
              {
                number: "06",
                role: lang === "en" ? "Academy Director" : "Director de academia",
                description: lang === "en" ? "Development and pathways." : "Desarrollo de jugadores y rutas formativas.",
              },
              {
                number: "07",
                role: lang === "en" ? "Performance Analyst" : "Analista de rendimiento",
                description: lang === "en" ? "Data, clips, tactics." : "Datos, videoanálisis y comunicación táctica.",
              },
              {
                number: "08",
                role: lang === "en" ? "Fitness Coach" : "Preparador físico",
                description: lang === "en" ? "Load, recovery, readiness." : "Carga, recuperación y preparación física.",
              },
              {
                number: "09",
                role: lang === "en" ? "Physiotherapist" : "Fisioterapeuta",
                description: lang === "en" ? "Rehab and return-to-play." : "Rehabilitación, evolución y retorno al juego.",
              },
              {
                number: "10",
                role: lang === "en" ? "Sports Psychologist" : "Psicólogo deportivo",
                description: lang === "en" ? "Confidence and pressure." : "Confianza, presión y fortaleza mental.",
              },
              {
                number: "11",
                role: lang === "en" ? "Nutritionist" : "Nutricionista",
                description: lang === "en" ? "Habits and performance." : "Hábitos, nutrición y rendimiento.",
              },
            ].map((item) => (
              <a
                key={item.role}
                href={`/register?role=${encodeURIComponent(item.role)}`}
                className="group relative min-h-[92px] overflow-hidden rounded-[1.25rem] border border-fei-bg/[0.055] bg-[#FAFBFC] px-5 py-3.5 transition duration-300 hover:-translate-y-0.5 hover:border-fei-sky/24 hover:bg-white hover:shadow-[0_14px_34px_rgba(7,17,31,0.045)]"
              >
                <span className="pointer-events-none absolute -right-1 -top-5 text-6xl font-black leading-none text-fei-sky/[0.10] transition duration-300 group-hover:text-fei-yellow/[0.34]">
                  {item.number}
                </span>

                <div className="absolute inset-x-5 top-0 h-px bg-gradient-to-r from-fei-yellow via-fei-sky to-transparent opacity-80 transition duration-300 group-hover:h-[2px] group-hover:opacity-100" />

                <div className="relative">
                  <h3 className="text-[17px] font-black tracking-tight text-fei-bg">
                    {item.role}
                  </h3>

                  <p className="mt-1.5 max-w-[18rem] text-sm leading-5 text-fei-bg/58">
                    {item.description}
                  </p>

                  <p className="mt-2 text-xs font-bold uppercase tracking-[0.14em] text-fei-sky opacity-0 transition duration-300 group-hover:opacity-100">
                    {lang === "en" ? "Register now →" : "Regístrate ahora →"}
                  </p>
                </div>
              </a>
            ))}

            <a
              href="/role-request"
              className="group relative min-h-[92px] overflow-hidden rounded-[1.25rem] border border-fei-yellow/35 bg-fei-yellow/[0.08] px-5 py-3.5 transition duration-300 hover:-translate-y-0.5 hover:bg-fei-yellow/15 hover:shadow-[0_18px_45px_rgba(250,204,21,0.12)]"
            >
              <span className="pointer-events-none absolute -right-1 -top-5 text-6xl font-black leading-none text-fei-yellow/[0.18]">
                +
              </span>

              <div className="absolute inset-x-5 top-0 h-px bg-gradient-to-r from-fei-yellow via-fei-sky to-transparent opacity-90" />

              <div className="relative">
                <h3 className="text-[17px] font-black tracking-tight text-fei-bg">
                  {lang === "en" ? "Can't find your role?" : "¿No encuentras tu rol?"}
                </h3>

                <p className="mt-1.5 max-w-[18rem] text-sm leading-5 text-fei-bg/58">
                  {lang === "en"
                    ? "Start with the closest path."
                    : "Cuéntanos qué rol deberíamos añadir."}
                </p>

                <p className="mt-2 text-xs font-bold uppercase tracking-[0.14em] text-fei-bg opacity-0 transition duration-300 group-hover:opacity-100">
                  {lang === "en" ? "Suggest a role →" : "Sugerir un rol →"}
                </p>
              </div>
            </a>
          </div>
        </div>
      </section>

      <section id="for-clubs" className="scroll-mt-24 bg-white px-5 py-14 sm:px-8 sm:py-18">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-[2rem] border border-fei-bg/10 bg-[#F7F8FA] p-6 shadow-[0_18px_55px_rgba(7,17,31,0.05)] sm:p-8 lg:p-10">
            <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-stretch">
              <div className="flex flex-col justify-between">
                <div>
                  <p className="text-sm font-black uppercase tracking-[0.32em] text-fei-bg/55">
                    {lang === "en" ? "FOR CLUBS" : "PARA CLUBES"}
                  </p>

                  <h2 className="mt-6 text-4xl font-black tracking-tight text-fei-bg sm:text-5xl lg:text-6xl">
                    {lang === "en" ? (
                      <>
                        Train your entire <span className="text-fei-sky">squad</span> and staff
                      </>
                    ) : (
                      <>
                        Entrena a todo tu <span className="text-fei-sky">plantel</span> y staff
                      </>
                    )}
                  </h2>

                  <div className="mt-6 grid max-w-2xl gap-4">
                    {[
                      lang === "en"
                        ? "Flexible club licenses for teams and staff."
                        : "Licencias institucionales flexibles para equipos y staff.",
                      lang === "en"
                        ? "Diagnostics, training by role, real football situations, and progress reports."
                        : "Incluye diagnóstico de nivel, entrenamiento por rol, situaciones reales del fútbol y reportes de progreso.",
                      lang === "en"
                        ? "Quoted by users, roles, and training needs."
                        : "La cotización se adapta al número de usuarios, roles seleccionados y necesidades del club.",
                    ].map((item) => (
                      <div key={item} className="flex items-start gap-3">
                        <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-fei-sky/14 text-xs font-black text-fei-bg">
                          ✓
                        </span>
                        <p className="text-[15px] font-normal leading-7 text-fei-bg/62 sm:text-base">
                          {item}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <a
                  href="/contact"
                  className="mt-8 inline-flex w-fit items-center justify-center rounded-full bg-fei-bg px-7 py-3 text-sm font-bold text-white transition duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-fei-bg/15"
                >
                  {lang === "en" ? "Contact us" : "Contáctanos"}
                </a>
              </div>

              <div className="relative overflow-hidden rounded-[1.75rem] bg-fei-bg p-6 text-white shadow-[0_18px_55px_rgba(7,17,31,0.12)] sm:p-8">
                <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-fei-sky/12 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-fei-yellow/10 blur-3xl" />

                <div className="relative">
                  <p className="text-sm font-black uppercase tracking-[0.32em] text-fei-yellow">
                    {lang === "en" ? "INTERESTED?" : "¿TE INTERESA?"}
                  </p>

                  <h3 className="mt-6 text-3xl font-black tracking-tight text-white sm:text-4xl">
                    {lang === "en" ? "Book a demo for your club" : "Agenda una demo para tu club"}
                  </h3>

                  <p className="mt-5 max-w-xl text-[15px] leading-7 text-white/68 sm:text-base sm:leading-8">
                    {lang === "en"
                      ? "See how FEI can support communication across your club with training designed for real football roles."
                      : "Te mostramos cómo FEI puede ayudar a tu club a comunicarse mejor dentro y fuera de la cancha."}
                  </p>

                  <a
                    href="/contact"
                    className="mt-8 inline-flex w-full items-center justify-center rounded-full border border-fei-yellow/60 px-7 py-3 text-sm font-bold text-fei-yellow transition duration-300 hover:-translate-y-0.5 hover:bg-fei-yellow hover:text-fei-bg"
                  >
                    {lang === "en" ? "Book a demo" : "Agendar demo"}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="scroll-mt-24 bg-white px-5 py-10 sm:px-8 sm:py-12">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-5xl">
            <p className="text-sm font-black uppercase tracking-[0.32em] text-fei-bg/55">
              {lang === "en" ? "PRICING" : "PRECIOS"}
            </p>

            <h2 className="mt-5 text-4xl font-black tracking-tight text-fei-bg sm:text-5xl lg:text-6xl">
              {lang === "en" ? (
                <>
                  Simple, transparent <span className="text-fei-sky">pricing</span>
                </>
              ) : (
                <>
                  Precios simples y <span className="text-fei-sky">transparentes</span>
                </>
              )}
            </h2>

            <p className="mt-5 max-w-2xl text-[15px] font-normal leading-7 text-fei-bg/62 sm:text-base">
              {lang === "en"
                ? "Choose the access that fits your football journey."
                : "Elige el plan que mejor se adapta a tu etapa y a tus objetivos."}
            </p>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {[
              {
                label: lang === "en" ? "PLAN" : "PLAN",
                name: lang === "en" ? "Free Access" : "Acceso gratuito",
                price: lang === "en" ? "Free" : "Gratis",
                note: lang === "en" ? "Initial diagnostic + limited preview" : "Diagnóstico inicial + vista previa limitada",
                features:
                  lang === "en"
                    ? ["Initial FEI diagnostic", "Estimated communication level", "Limited module preview"]
                    : ["Diagnóstico inicial FEI", "Nivel comunicativo estimado", "Vista previa limitada de módulos"],
                button: lang === "en" ? "Start Free" : "Empezar gratis",
                href: "/register",
                featured: false,
              },
              {
                label: lang === "en" ? "BEST VALUE" : "MEJOR VALOR",
                badge: lang === "en" ? "POPULAR" : "POPULAR",
                name: lang === "en" ? "Individual Premium" : "Premium individual",
                price: "$49",
                note: lang === "en" ? "USD / month or $399 USD / year" : "USD / mes o $399 USD / año",
                features:
                  lang === "en"
                    ? ["Full role-based modules", "Football-specific scenarios", "Progress recommendations"]
                    : ["Módulos completos por rol", "Escenarios reales del fútbol", "Recomendaciones de progreso"],
                button: lang === "en" ? "Unlock Premium" : "Activar Premium",
                href: "/register",
                featured: true,
              },
              {
                label: lang === "en" ? "PLAN" : "PLAN",
                name: lang === "en" ? "Institutional Plans" : "Planes institucionales",
                price: "$199",
                note: lang === "en" ? "from USD / month" : "desde USD / mes",
                features:
                  lang === "en"
                    ? ["For clubs and academies", "Multiple users and licenses", "Reports and implementation options"]
                    : ["Para clubes y academias", "Múltiples usuarios y licencias", "Reportes e implementación"],
                button: lang === "en" ? "Contact FEI" : "Contactar a FEI",
                href: "/contact",
                featured: false,
              },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`group relative flex min-h-[365px] flex-col overflow-hidden rounded-[1.55rem] border p-5 transition duration-300 ${
                  plan.featured
                    ? "border-fei-sky/60 bg-gradient-to-br from-fei-sky/[0.18] via-white to-fei-yellow/[0.14] shadow-[0_18px_50px_rgba(125,211,252,0.18)] hover:-translate-y-2 hover:scale-[1.025] hover:border-fei-yellow/70 hover:shadow-[0_30px_75px_rgba(125,211,252,0.28)]"
                    : "border-fei-bg/[0.055] bg-[#FAFBFC] hover:-translate-y-2 hover:scale-[1.015] hover:border-fei-sky/24 hover:bg-white hover:shadow-[0_26px_65px_rgba(7,17,31,0.08)]"
                }`}
              >
                <div className="absolute inset-x-5 top-0 h-[2px] bg-gradient-to-r from-fei-yellow via-fei-sky to-transparent opacity-90 transition duration-300 group-hover:inset-x-4 group-hover:h-[4px] group-hover:opacity-100" />

                {plan.badge && (
                  <span className="absolute right-5 top-5 rounded-full bg-fei-bg px-3.5 py-1 text-[9px] font-black uppercase tracking-[0.2em] text-fei-yellow shadow-[0_10px_24px_rgba(7,17,31,0.14)]">
                    {plan.badge}
                  </span>
                )}

                <p className="text-xs font-black uppercase tracking-[0.28em] text-fei-sky">
                  {plan.label}
                </p>

                <h3 className="mt-3 text-[1.35rem] font-black tracking-tight text-fei-bg">
                  {plan.name}
                </h3>

                <div className="mt-6">
                  <p className="text-4xl font-black tracking-tight text-fei-bg transition duration-300 group-hover:text-fei-sky">
                    {plan.price}
                  </p>
                  <p className="mt-2 text-sm font-semibold leading-6 text-fei-bg/55">
                    {plan.note}
                  </p>
                </div>

                <ul className="mt-6 grid gap-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex gap-3 text-sm leading-6 text-fei-bg/62">
                      <span className="text-fei-sky">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <a
                  href={plan.href}
                  className={`mt-auto inline-flex w-full items-center justify-center rounded-full px-5 py-2.5 text-sm font-bold transition duration-300 hover:-translate-y-0.5 ${
                    plan.featured
                      ? "bg-fei-bg text-white hover:bg-fei-sky hover:text-fei-bg hover:shadow-lg hover:shadow-fei-sky/20"
                      : "border border-fei-bg/15 text-fei-bg hover:border-fei-bg/35 hover:bg-white"
                  }`}
                >
                  {plan.button}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-white px-5 pb-5 sm:px-8">
        <div className="mx-auto max-w-[1600px] rounded-t-[1.75rem] border border-fei-bg/10 bg-white px-6 py-4 shadow-[0_-10px_32px_rgba(7,17,31,0.035)] sm:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <img
                src="/fei-logo-navbar-vector.svg"
                alt="FEI"
                className="h-9 w-auto"
              />

              <p className="hidden max-w-xs text-sm leading-6 text-fei-bg/45 sm:block">
                {lang === "en"
                  ? "Communication intelligence for global football."
                  : "Inteligencia comunicativa para el fútbol global."}
              </p>
            </div>

            <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-medium text-fei-bg/54">
              <a href="/terms" className="transition hover:text-fei-bg">
                {lang === "en" ? "Terms of Use" : "Términos de uso"}
              </a>

              <span className="hidden h-4 w-px bg-fei-bg/12 sm:block" />

              <a href="/privacy" className="transition hover:text-fei-bg">
                {lang === "en" ? "Privacy Policy" : "Política de privacidad"}
              </a>

              <span className="hidden h-4 w-px bg-fei-bg/12 sm:block" />

              <a href="/faqs" className="transition hover:text-fei-bg">
                FAQs
              </a>

              <span className="hidden h-4 w-px bg-fei-bg/12 sm:block" />

              <a href="/contact" className="transition hover:text-fei-bg">
                {lang === "en" ? "Contact" : "Contacto"}
              </a>
            </nav>

            <div className="flex items-center gap-3">
              <a
                href="https://www.linkedin.com"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-fei-bg/10 text-sm font-black text-fei-bg transition hover:-translate-y-0.5 hover:border-fei-sky/35 hover:bg-fei-sky/10"
              >
                in
              </a>

              <a
                href="https://www.instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-fei-bg/10 text-fei-bg transition hover:-translate-y-0.5 hover:border-fei-yellow/45 hover:bg-fei-yellow/12"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4.5 w-4.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <rect x="4" y="4" width="16" height="16" rx="5" />
                  <circle cx="12" cy="12" r="3.5" />
                  <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        <p className="mx-auto mt-3 max-w-7xl text-center text-sm text-fei-bg/40">
          © 2026 Football English Intelligence. {lang === "en" ? "All rights reserved." : "Todos los derechos reservados."}
        </p>
      </footer>
    </div>
  );
}
