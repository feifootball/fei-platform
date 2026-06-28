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

      <section className="relative overflow-hidden px-6 py-20 sm:py-28 lg:py-36">
        <div className="mx-auto max-w-4xl">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-fei-sky">Football is global.</p>
          <h1 className="mt-6 text-5xl font-black leading-tight text-fei-text sm:text-6xl">
            Football
            <br />
            English
            <br />
            <span className="text-fei-yellow">Intelligence.</span>
          </h1>
          <p className="mt-6 text-lg font-semibold text-fei-text">Communication Creates Opportunity.</p>
          <p className="mt-3 max-w-xl text-fei-text/60">FEI helps football professionals build the English communication skills needed for trials, clubs, interviews, agents, scouts, and the global game.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a href="/register" className="inline-flex items-center gap-2 rounded-full bg-fei-yellow px-8 py-3 font-semibold text-fei-bg">
              Get Started
              <span>→</span>
            </a>
            <a href="/login" className="inline-flex items-center justify-center rounded-full border border-fei-sky px-8 py-3 font-semibold text-fei-sky">
              Login
            </a>
          </div>
        </div>
      </section>

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

      <section id="get-started" className="px-6 py-20 sm:py-28">
        <div className="mx-auto max-w-5xl">
          <div id="about" className="mb-12 scroll-mt-32 text-center">
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
          <div id="roles" className="mt-24 scroll-mt-32 border-t border-fei-text/10 pt-20">
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
            </div>
          </div>
        </div>
      </section>

      <section id="clubs" className="relative scroll-mt-32 overflow-hidden px-6 py-20 sm:py-28">
        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-5xl">Ready to Perform at the Highest Level?</h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-fei-text/60 sm:text-xl">Join clubs and professionals already training with FEI.</p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a href="/register" className="rounded-full bg-fei-yellow px-8 py-3.5 text-base font-semibold text-fei-bg">Get Started</a>
            <a href="#" className="rounded-full border border-fei-sky px-8 py-3.5 text-base font-medium text-fei-sky">Book a Demo</a>
          </div>
        </div>
      </section>

      <footer className="mt-auto border-t border-fei-text/10 px-6 py-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2.5">
            <img src="/logo.svg" alt="FEI" className="h-6 w-auto" />
            <span className="text-sm text-fei-text/50">Football English Intelligence</span>
          </div>
          <p className="text-sm text-fei-text/40">© {new Date().getFullYear()} FEI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
