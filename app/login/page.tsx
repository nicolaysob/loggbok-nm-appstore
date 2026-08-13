import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BrandLogo } from "@/components/brand";
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
    <main className="flex min-h-full flex-1 flex-col bg-page">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-8 animate-rise">
        <header className="mb-8">
          <BrandLogo priority className="w-[11.5rem]" />
          <h1 className="mt-8 text-display tracking-tight text-navy-900">
            Logg inn
          </h1>
          <p className="mt-1.5 text-body text-navy-700">
            For ansatte og kunder hos N&amp;M Vaktmesterservice
          </p>
        </header>

        {slettet === "1" && (
          <p
            role="status"
            className="mb-5 rounded-md bg-white px-4 py-3.5 text-body text-navy-800 shadow-card"
          >
            Kontoen er slettet. Kontakt support hvis dette var en feil.
          </p>
        )}

        <LoginForm />
      </div>

      <footer className="px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-2 text-center">
        <p className="text-meta text-navy-700">
          N&amp;M Vaktmesterservice AS
          {" · "}
          <Link href="/support" className="font-medium text-navy-700">
            Support
          </Link>
          {" · "}
          <Link href="/personvern" className="font-medium text-navy-700">
            Personvern
          </Link>
        </p>
      </footer>
    </main>
  );
}
