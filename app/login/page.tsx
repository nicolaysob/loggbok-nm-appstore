import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/dal";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Logg inn – N&M",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ slettet?: string }>;
}) {
  const user = await getCurrentUser();
  if (user) {
    redirect(user.role === "CUSTOMER" ? "/portal" : "/");
  }

  const { slettet } = await searchParams;

  return (
    <main className="flex min-h-full flex-1 flex-col bg-hero text-white">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-end px-5 pt-[max(2.75rem,env(safe-area-inset-top))]">
        <header className="mb-14">
          <h1 className="text-display">Loggbok</h1>
          <p className="mt-2 text-body text-white/55">
            N&amp;M Vaktmesterservice
          </p>
        </header>
      </div>

      <div className="rounded-t-3xl bg-canvas text-ink">
        <div className="mx-auto w-full max-w-md px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-8">
          {slettet === "1" && (
            <p
              role="status"
              className="mb-5 rounded-2xl border border-hair bg-surface px-4 py-3.5 text-body text-ink"
            >
              Kontoen er slettet.
            </p>
          )}

          <LoginForm />

          <p className="mt-8 text-center text-meta text-ink-2">
            <Link href="/support" className="font-medium">
              Support
            </Link>
            {" · "}
            <Link href="/personvern" className="font-medium">
              Personvern
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
