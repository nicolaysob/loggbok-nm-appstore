import { redirect } from "next/navigation";

// Oppgaveskjermen er slått sammen med Loggfør — gamle lenker sendes dit.
export default async function TasksPage({
  params,
}: PageProps<"/kunde/[id]/oppgaver">) {
  const { id } = await params;
  redirect(`/kunde/${id}/loggfor`);
}
