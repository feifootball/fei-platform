import { Navbar } from "@/components/Navbar";

export default function RoleRequestPage() {
  return (
    <main className="min-h-screen bg-white text-fei-bg">
      <Navbar />

      <section className="px-5 pt-44 sm:px-8">
        <div className="mx-auto max-w-3xl rounded-[2rem] border border-fei-bg/10 bg-[#F7F8FA] p-6 shadow-[0_18px_55px_rgba(7,17,31,0.05)] sm:p-8">
          <p className="text-sm font-black uppercase tracking-[0.32em] text-fei-bg/55">
            Role request
          </p>

          <h1 className="mt-6 text-4xl font-black tracking-tight text-fei-bg sm:text-5xl">
            Tell us your role
          </h1>

          <p className="mt-6 text-[15px] leading-7 text-fei-bg/62 sm:text-base sm:leading-8">
            Can’t find your exact football role? Send it to us and we’ll consider it for future FEI pathways.
          </p>

          <form
            action="mailto:hello@footballenglishintelligence.com"
            method="post"
            encType="text/plain"
            className="mt-8 grid gap-4"
          >
            <label className="grid gap-2">
              <span className="text-sm font-bold text-fei-bg/70">Your role</span>
              <input
                name="Requested role"
                required
                placeholder="Example: Goalkeeper Coach"
                className="rounded-2xl border border-fei-bg/10 bg-white px-4 py-3 text-fei-bg outline-none transition focus:border-fei-sky/50"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-bold text-fei-bg/70">Why should FEI add it?</span>
              <textarea
                name="Why this role matters"
                rows={5}
                placeholder="Tell us what communication situations this role needs in football."
                className="rounded-2xl border border-fei-bg/10 bg-white px-4 py-3 text-fei-bg outline-none transition focus:border-fei-sky/50"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-bold text-fei-bg/70">Your email</span>
              <input
                name="Email"
                type="email"
                placeholder="name@example.com"
                className="rounded-2xl border border-fei-bg/10 bg-white px-4 py-3 text-fei-bg outline-none transition focus:border-fei-sky/50"
              />
            </label>

            <button
              type="submit"
              className="mt-3 w-fit rounded-full bg-fei-yellow px-7 py-3 text-sm font-bold text-fei-bg transition hover:-translate-y-0.5 hover:shadow-md"
            >
              Send role request
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
