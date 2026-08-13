import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/dal";
import { listCustomerMessageMonths } from "@/lib/customer-activity";
import { calendarMonth, parseYearMonth } from "@/lib/period";
import { formatDate } from "@/lib/time";
import { backLinkClass, cardStaticClass } from "@/lib/ui";
import { MonthFolderList } from "@/components/month-folder-list";

export default async function MessageArchivePage({
  params,
  searchParams,
}: PageProps<"/kunde/[id]/meldingsarkiv">) {
  await requireUser();
  const { id } = await params;
  const { maaned } = await searchParams;

  const customer = await db.customer.findUnique({
    where: { id },
    select: { id: true, name: true },
  });

  if (!customer) notFound();

  const parsed = parseYearMonth(
    typeof maaned === "string" ? maaned : undefined,
  );

  if (parsed) {
    const period = calendarMonth(parsed.year, parsed.month);
    const messages = await db.customerMessage.findMany({
      where: {
        customerId: id,
        readAt: { not: null },
        createdAt: { gte: period.start, lt: period.end },
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        body: true,
        createdAt: true,
        readAt: true,
        user: { select: { name: true } },
        signedBy: { select: { name: true } },
      },
    });

    return (
      <div className="flex animate-rise flex-col gap-6">
        <div className="flex flex-col gap-2">
          <Link
            href={`/kunde/${customer.id}/meldingsarkiv`}
            className={backLinkClass}
          >
            ← Meldingsarkiv
          </Link>
          <h1 className="text-display tracking-tight">{period.label}</h1>
          <p className="text-body text-navy-700">
            Signerte meldinger denne måneden.
          </p>
        </div>

        {messages.length === 0 ? (
          <p className={`px-4 py-5 text-body text-navy-700 ${cardStaticClass}`}>
            Ingen signerte meldinger denne måneden.
          </p>
        ) : (
          <ul className="divide-y divide-line overflow-hidden rounded-md border border-line bg-white shadow-card">
            {messages.map((message) => (
              <li key={message.id} className="flex flex-col gap-1 px-4 py-3.5">
                <p className="text-meta font-medium text-navy-700">
                  <span className="font-mono">
                    {formatDate(message.createdAt)}
                  </span>
                  {" · "}
                  {message.user.name}
                </p>
                <p className="text-body whitespace-pre-wrap text-navy-900">
                  {message.body}
                </p>
                {message.readAt && message.signedBy && (
                  <p className="text-meta font-medium text-green-700">
                    Signert av {message.signedBy.name} ·{" "}
                    {formatDate(message.readAt)}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  const folders = await listCustomerMessageMonths(customer.id);

  return (
    <div className="flex animate-rise flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Link href={`/kunde/${customer.id}`} className={backLinkClass}>
          ← {customer.name}
        </Link>
        <h1 className="text-display tracking-tight">Meldingsarkiv</h1>
        <p className="text-body text-navy-700">
          Velg en måned. Når måneden er over, ligger den igjen som mappe.
        </p>
      </div>

      <MonthFolderList
        folders={folders}
        hrefFor={(param) =>
          `/kunde/${customer.id}/meldingsarkiv?maaned=${param}`
        }
        emptyText="Ingen signerte meldinger ennå."
        countLabel={(count) =>
          count === 1 ? "1 melding" : `${count} meldinger`
        }
      />
    </div>
  );
}
