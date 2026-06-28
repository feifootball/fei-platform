import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const roles = [
  {
    value: "player",
    label: "Player",
    description:
      "Improve your football English for trials, clubs, agents, media, and global opportunities.",
  },
  {
    value: "parent",
    label: "Parent",
    description:
      "Support your child’s football journey with clearer communication and better guidance.",
  },
  {
    value: "coach",
    label: "Coach",
    description:
      "Communicate more effectively with players, families, clubs, and international environments.",
  },
  {
    value: "agent",
    label: "Agent",
    description:
      "Strengthen communication with players, clubs, scouts, and global football stakeholders.",
  },
] as const;

type RoleValue = (typeof roles)[number]["value"];

async function saveRole(formData: FormData) {
  "use server";

  const role = String(formData.get("role") || "");
  const validRoles = roles.map((item) => item.value);

  if (!validRoles.includes(role as RoleValue)) {
    throw new Error("Invalid role selected.");
  }

  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  const { data: existingProfile, error: lookupError } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (lookupError) {
    throw new Error(`Could not check profile: ${lookupError.message}`);
  }

  if (existingProfile) {
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ role })
      .eq("user_id", user.id);

    if (updateError) {
      throw new Error(`Could not update profile role: ${updateError.message}`);
    }
  } else {
    const { error: insertError } = await supabase.from("profiles").insert({
      user_id: user.id,
      role,
    });

    if (insertError) {
      throw new Error(`Could not create profile role: ${insertError.message}`);
    }
  }

  redirect("/onboarding");
}

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <section className="mb-10 rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 shadow-2xl">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.35em] text-white/45">
            FEI Platform
          </p>

          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-6xl">
            Choose your FEI role
          </h1>

          <p className="mt-5 max-w-2xl text-lg leading-8 text-white/60">
            Select your role to personalize your FEI diagnostic assessment and learning path.
          </p>
        </section>

        <div className="grid gap-5 md:grid-cols-2">
          {roles.map((role) => (
            <form key={role.value} action={saveRole}>
              <input type="hidden" name="role" value={role.value} />

              <button
                type="submit"
                className="group h-full w-full rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 text-left transition hover:-translate-y-1 hover:border-white/25 hover:bg-white/[0.07]"
              >
                <h2 className="text-3xl font-semibold tracking-tight">
                  {role.label}
                </h2>

                <p className="mt-5 max-w-xl text-base leading-7 text-white/60">
                  {role.description}
                </p>

                <div className="mt-8 inline-flex rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white transition group-hover:border-white group-hover:bg-white group-hover:text-black">
                  Continue as {role.label}
                </div>
              </button>
            </form>
          ))}
        </div>
      </div>
    </main>
  );
}
