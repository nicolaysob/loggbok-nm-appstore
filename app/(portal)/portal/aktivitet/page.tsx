import { redirect } from "next/navigation";

// Aktivitetsarkivet er slått sammen med månedsrapporten — den viste det
// samme innholdet, bare uten oppsummeringen. Gamle lenker sendes dit.
export default async function PortalActivityArchivePage({
  searchParams,
}: PageProps<"/portal/aktivitet">) {
  const { maaned } = await searchParams;
  redirect(
    typeof maaned === "string"
      ? `/portal/rapport?maaned=${maaned}`
      : "/portal/rapport",
  );
}
