import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function formatRole(role: string) {
  return role
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default async function OnboardingPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (profileError) {
    throw new Error(`Could not load profile: ${profileError.message}`);
  }

  if (!profile?.role) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-4xl">
        <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 shadow-2xl sm:p-10">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.35em] text-white/45">
            FEI Diagnostic Assessment
          </p>

          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-6xl">
            Your diagnostic is ready
          </h1>

          <div className="mt-8 rounded-[1.5rem] border border-white/10 bg-black/40 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/40">
              Selected role
            </p>
            <p className="mt-3 text-3xl font-semibold">
              {formatRole(profile.role)}
            </p>
          </div>

          <p className="mt-8 max-w-2xl text-lg leading-8 text-white/60">
            FEI will use your selected role to personalize your diagnostic assessment.
            This first diagnostic will identify your communication strengths and the
            areas that matter most for your football journey.
          </p>

          <button
            type="button"
            className="mt-8 rounded-full bg-white px-6 py-4 text-sm font-semibold text-black transition hover:bg-white/90"
          >
            Start Diagnostic
          </button>
        </section>
      </div>
    </main>
  );
}
