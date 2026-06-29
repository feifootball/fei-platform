import { Navbar } from "@/components/Navbar";

const features = [
  {
    title: "Built for Elite Football",
    description: "English training designed for the professional game — players, coaches, scouts, and club staff who operate at the highest level.",
  },
  {
    title: "Real-World Scenarios",
    description: "Practice press conferences, contract talks, tactical briefings, and matchday communication — the English you actually need on and off the pitch.",
  },
  {
    title: "Intelligence-Driven Learning",
    description: "Adaptive, AI-powered paths that evolve with your role, level, and goals — so every session moves you closer to fluency under pressure.",
  },
];

const stats = [
  { value: "11", label: "Roles" },
  { value: "126", label: "Scenarios" },
  { value: "4", label: "CEFR Levels" },
  { value: "504", label: "Unique Tasks" },
];

const roles = [
  { name: "Scout", description: "Identify and report talent globally" },
  { name: "Head Coach", description: "Lead tactical communication" },
  { name: "Academy Director", description: "Build the next generation" },
  { name: "Assistant Coach", description: "Translate vision into action" },
  { name: "Performance Analyst", description: "Convert data into decisions" },
  { name: "Head of Scouting", description: "Drive recruitment strategy" },
  { name: "Fitness Coach", description: "Protect player availability" },
  { name: "Sports Psychologist", description: "Facilitate mental performance" },
  { name: "Physiotherapist", description: "Communicate with medical precision" },
  { name: "Nutritionist", description: "Turn nutrition into performance" },
  { name: "Professional Players", description: "Represent the club on the global stage" },
];

export default function Home() {
  return (
    <div className="flex min-h-full flex-col">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden px-6 py-20 sm:py-28 lg:py-36">
        <div className="mx-auto max-w-4xl">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-fei-sky">Football is global.</p>
          <h1 className="mt-6 text-6xl font-black leading-[1.1] text-fei-text sm:text-7xl lg:text-8xl">
            Football
            <br />
            English
            <br />
            <span className="bg-gradient-to-r from-fei-yellow to-fei-sky bg-clip-text text-transparent">
              Intelligence.
            </span>
          </h1>
          <p className="mt-8 text-lg font-semibold text-fei-text">Communication Creates Opportunity.</p>
          <p className="mt-4 max-w-xl text-fei-text/60">FEI helps football professionals build the English communication skills needed for trials, clubs, interviews, agents, scouts, and the global game.</p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <a href="/register" className="inline-flex items-center gap-2 rounded-full bg-fei-yellow px-8 py-3 font-semibold text-fei-bg">
              Get Started <span>→</span>
            </a>
            <a href="/login" className="inline-flex items-center justify-center rounded-full border border-fei-sky px-8 py-3 font-semibold text-fei-sky">
              Login
            </a>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section id="diagnostic" className="scroll-mt-32 border-y border-fei-text/10 bg-fei-text/[0.02] px-6 py-12 sm:py-14">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 sm:grid-cols-4 sm:gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-4xl font-bold tracking-tight text-fei-yellow sm:text-5xl">{stat.value}</p>
              <p className="mt-1.5 text-sm text-fei-sky">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="scroll-mt-32 px-6 py-20 sm:py-28">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">How it works</h2>
            <p className="mx-auto mt-4 max-w-2xl text-fei-text/60">Three steps to professional English in football.</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              { step: "01", title: "Take the Diagnostic", description: "Complete a role-specific assessment to find your CEFR level and communication gaps." },
              { step: "02", title: "Get Your Path", description: "Receive a personalized learning path based on your role, level, and professional goals." },
              { step: "03", title: "Train & Progress", description: "Work through real football scenarios and track your progress toward fluency." },
            ].map((item) => (
              <div key={item.step} className="rounded-2xl border border-fei-text/10 bg-fei-text/[0.03] p-6">
                <p className="text-4xl font-black text-fei-yellow/20">{item.step}</p>
                <h3 className="mt-3 text-lg font-semibold text-fei-text">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-fei-text/60">{item.description}</p>
              </div>
            ))}
          </div>

          {/* What is FEI */}
          <div id="about" className="mt-24 scroll-mt-32 border-t border-fei-text/10 pt-20">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">What is <span className="text-fei-sky">FEI</span>?</h2>
              <p className="mx-auto mt-4 max-w-2xl text-fei-text/60">A purpose-built platform for football — not generic language courses, but professional English for those who live the game.</p>
            </div>
            <div className="grid gap-6 sm:grid-cols-3">
              {features.map((feature) => (
                <article key={feature.title} className="rounded-2xl border border-fei-text/10 bg-fei-text/[0.03] p-6">
                  <h3 className="text-lg font-semibold text-fei-text">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-fei-text/60">{feature.description}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Roles */}
      <section id="roles" className="scroll-mt-32 border-t border-fei-text/10 px-6 py-20 sm:py-28">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Built for Every Role in the Club</h2>
            <p className="mx-auto mt-4 max-w-2xl text-fei-text/60">From the dressing room to the boardroom.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {roles.map((role) => (
              <article key={role.name} className="flex flex-col items-center gap-1.5 rounded-xl border border-transparent bg-[#162033] px-4 py-5 text-center">
                <span className="text-sm font-bold text-fei-yellow">{role.name}</span>
                <span className="text-xs leading-snug text-fei-sky">{role.description}</span>
              </article>
            ))}
            <article className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-fei-text/20 bg-fei-text/[0.02] px-4 py-5 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-6 w-6 text-fei-text/40">
                <circle cx="12" cy="12" r="10" /><path d="M12 6v6m3-3H9" />
              </svg>
              <span className="text-xs font-semibold uppercase tracking-[0.15em] text-fei-text/50">Muy pronto</span>
              <p className="text-xs leading-snug text-fei-text/40">¿Falta un rol? Cuéntanos</p>
              <a href="/suggest-role" className="mt-2 text-xs font-semibold text-fei-sky underline hover:text-fei-yellow">Sugerir rol</a>
            </article>
          </div>
        </div>
      </section>

      {/* For Clubs */}
      <section id="for-clubs" className="scroll-mt-32 border-t border-fei-text/10 px-6 py-20 sm:py-28">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-fei-sky">For Clubs</p>
              <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">Train your entire squad and staff</h2>
              <p className="mt-4 text-fei-text/60">FEI offers club licenses for professional teams who want to train multiple staff members simultaneously — from players to coaches to analysts.</p>
              <ul className="mt-6 space-y-3">
                {["Bulk licenses for full squads", "Progress tracking for all members", "Role-specific paths for every position", "Dedicated club dashboard"].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-fei-text/70">
                    <span className="text-fei-yellow">✓</span> {item}
                  </li>
                ))}
              </ul>
              <a href="mailto:info@feifootball.com" className="mt-8 inline-flex rounded-full bg-fei-yellow px-8 py-3 font-semibold text-fei-bg transition hover:bg-fei-yellow/90">
                Contact us
              </a>
            </div>
            <div className="rounded-2xl border border-fei-text/10 bg-fei-text/[0.03] p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-fei-sky">Interested?</p>
              <h3 className="mt-4 text-xl font-bold text-fei-text">Book a demo for your club</h3>
              <p className="mt-2 text-sm text-fei-text/60">We'll show you how FEI can help your team communicate better on and off the pitch.</p>
              <a href="mailto:info@feifootball.com" className="mt-6 inline-flex w-full items-center justify-center rounded-full border border-fei-sky px-6 py-3 text-sm font-semibold text-fei-sky transition hover:bg-fei-sky/10">
                info@feifootball.com
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing placeholder */}
      <section id="pricing" className="scroll-mt-32 border-t border-fei-text/10 px-6 py-20 sm:py-28">
        <div className="mx-auto max-w-5xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-fei-sky">Pricing</p>
          <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">Simple, transparent pricing</h2>
          <p className="mx-auto mt-4 max-w-xl text-fei-text/60">Coming soon. Get early access by signing up today.</p>
          <a href="/register" className="mt-8 inline-flex rounded-full bg-fei-yellow px-8 py-3 font-semibold text-fei-bg transition hover:bg-fei-yellow/90">
            Get Early Access
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-fei-text/10 px-6 py-10">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-2.5">
              <img src="/logo.svg" alt="FEI" className="h-6 w-auto" />
              <span className="text-sm text-fei-text/50">Football English Intelligence</span>
            </div>

            <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              <a href="/faq" className="text-sm text-fei-text/40 transition hover:text-fei-text">FAQ</a>
              <a href="mailto:info@feifootball.com" className="text-sm text-fei-text/40 transition hover:text-fei-text">Contact</a>
              <a href="/privacy" className="text-sm text-fei-text/40 transition hover:text-fei-text">Privacy</a>
              <a href="/terms" className="text-sm text-fei-text/40 transition hover:text-fei-text">Terms</a>
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

          <p className="mt-6 text-center text-xs text-fei-text/30">© {new Date().getFullYear()} Football English Intelligence. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
