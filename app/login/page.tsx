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
    <main className="flex min-h-full flex-1 flex-col bg-white">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-12 animate-rise">
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
            className="mb-5 rounded-md border border-line bg-navy-50 px-3.5 py-3 text-body text-navy-800"
          >
            Kontoen er slettet. Kontakt support hvis dette var en feil.
          </p>
        )}

        <LoginForm />
      </div>

      <footer className="border-t border-line px-6 py-4 text-center">
        <p className="text-meta text-navy-700">
          N&amp;M Vaktmesterservice AS
          {" · "}
          <Link
            href="/support"
            className="font-medium text-navy-700 underline underline-offset-2 hover:text-navy-900"
          >
            Support
          </Link>
          {" · "}
          <Link
            href="/personvern"
            className="font-medium text-navy-700 underline underline-offset-2 hover:text-navy-900"
          >
            Personvern
          </Link>
        </p>
      </footer>
    </main>
  );
}
