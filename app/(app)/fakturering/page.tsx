import { redirect } from "next/navigation";

type Search = { maaned?: string | string[] };

export default async function FaktureringRedirect({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const params = await searchParams;
  const maaned = typeof params.maaned === "string" ? params.maaned : undefined;
  redirect(maaned ? `/mnd?maaned=${maaned}` : "/mnd");
}
