import { Navbar } from "@/components/Navbar";

const features = [
  {
    title: "Built for Elite Football",
    description:
      "English training designed for the professional game — players, coaches, scouts, and club staff who operate at the highest level.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        className="size-7"
        aria-hidden
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
        <path d="M2 12h20" />
      </svg>
    ),
  },
  {
    title: "Real-World Scenarios",
    description:
      "Practice press conferences, contract talks, tactical briefings, and matchday communication — the English you actually need on and off the pitch.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        className="size-7"
        aria-hidden
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    title: "Intelligence-Driven Learning",
    description:
      "Adaptive, AI-powered paths that evolve with your role, level, and goals — so every session moves you closer to fluency under pressure.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        className="size-7"
        aria-hidden
      >
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
        <circle cx="12" cy="12" r="4" />
      </svg>
    ),
  },
];

const roles = [
  { name: "Scout", emoji: "🔭" },
  { name: "Head Coach", emoji: "📋" },
  { name: "Academy Director", emoji: "🎓" },
  { name: "Assistant Coach", emoji: "🤝" },
  { name: "Performance Analyst", emoji: "📊" },
  { name: "Head of Scouting", emoji: "🗺️" },
  { name: "Fitness Coach", emoji: "💪" },
  { name: "Sports Psychologist", emoji: "🧠" },
  { name: "Physiotherapist", emoji: "🩹" },
  { name: "Nutritionist", emoji: "🥗" },
  { name: "Professional Players", emoji: "⚽" },
];

export default function Home() {
  return (
    <div className="flex min-h-full flex-col">
      <Navbar />

      {/* Hero */}
      <section className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-6 py-24 sm:py-32">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(125,211,252,0.12)_0%,_transparent_60%)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -top-24 left-1/2 size-96 -translate-x-1/2 rounded-full bg-fei-sky/5 blur-3xl"
          aria-hidden
        />

        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <p className="mb-4 text-sm font-medium uppercase tracking-[0.25em] text-fei-sky">
            Football English Intelligence
          </p>

          <h1 className="text-6xl font-bold tracking-tight sm:text-8xl">
            <span className="text-fei-yellow">FEI</span>
          </h1>

          <p className="mt-6 text-xl font-light leading-relaxed text-fei-text/80 sm:text-2xl">
            Professional English for Elite Football
          </p>

          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-fei-text/60">
            The SaaS platform that equips football professionals with the
            language skills to perform on the global stage.
          </p>

          <div className="mt-10">
            <a
              href="#get-started"
              className="inline-flex items-center gap-2 rounded-full bg-fei-yellow px-8 py-3.5 text-base font-semibold text-fei-bg transition-all hover:bg-fei-yellow/90 hover:shadow-[0_0_32px_rgba(250,204,21,0.35)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fei-yellow"
            >
              Get Started
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="size-4"
                aria-hidden
              >
                <path
                  fillRule="evenodd"
                  d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z"
                  clipRule="evenodd"
                />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section
        id="get-started"
        className="border-t border-fei-text/10 px-6 py-20 sm:py-28"
      >
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              What is <span className="text-fei-sky">FEI</span>?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-fei-text/60">
              A purpose-built platform for the football industry — not generic
              language courses, but professional English for those who live the
              game.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            {features.map((feature) => (
              <article
                key={feature.title}
                className="group rounded-2xl border border-fei-text/10 bg-fei-text/[0.03] p-6 transition-colors hover:border-fei-sky/30 hover:bg-fei-sky/[0.04]"
              >
                <div className="mb-4 inline-flex rounded-xl bg-fei-sky/10 p-3 text-fei-sky transition-colors group-hover:bg-fei-sky/20">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-fei-text">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-fei-text/60">
                  {feature.description}
                </p>
              </article>
            ))}
          </div>

          <div className="mt-24 border-t border-fei-text/10 pt-20">
            <div className="mb-10 text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Built for Every Role in the Club
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-fei-text/60">
                From the dressing room to the boardroom.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
              {roles.map((role) => (
                <article
                  key={role.name}
                  className="flex flex-col items-center gap-2 rounded-xl border border-transparent bg-[#162033] px-4 py-5 text-center transition-colors hover:border-fei-sky"
                >
                  <span className="text-2xl" aria-hidden>
                    {role.emoji}
                  </span>
                  <span className="text-sm font-medium text-fei-text">
                    {role.name}
                  </span>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-fei-text/10 px-6 py-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-fei-yellow">FEI</span>
            <span className="text-sm text-fei-text/50">
              Football English Intelligence
            </span>
          </div>
          <p className="text-sm text-fei-text/40">
            © {new Date().getFullYear()} FEI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
