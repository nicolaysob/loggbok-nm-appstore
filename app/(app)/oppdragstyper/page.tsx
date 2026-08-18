import { requireAdmin } from "@/lib/dal";
import { db } from "@/lib/db";
import { JobTypesManager } from "./job-types-manager";

export default async function JobTypesPage() {
  await requireAdmin();

  const types = await db.jobType.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      _count: { select: { jobs: true } },
    },
  });

  return (
    <div className="mx-auto flex w-full max-w-lg animate-rise flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-display">Oppdragstyper</h1>
        <p className="text-body text-ink-2">
          Disse dukker opp i rullgardinen når du legger oppdrag på en kunde.
        </p>
      </div>

      <JobTypesManager
        types={types.map((type) => ({
          id: type.id,
          name: type.name,
          jobCount: type._count.jobs,
        }))}
      />
    </div>
  );
}
