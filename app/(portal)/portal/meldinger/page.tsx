import Link from "next/link";
import { db } from "@/lib/db";
import { requireCustomer } from "@/lib/dal";
import { listCustomerMessageMonths } from "@/lib/customer-activity";
import { calendarMonth, parseYearMonth } from "@/lib/period";
import { formatDate } from "@/lib/time";
import { backLinkClass, cardStaticClass } from "@/lib/ui";
import { MonthFolderList } from "@/components/month-folder-list";

export default async function PortalMessageArchivePage({
  searchParams,
}: PageProps<"/portal/meldinger">) {
  const user = await requireCustomer();
  const { maaned } = await searchParams;
  const parsed = parseYearMonth(
    typeof maaned === "string" ? maaned : undefined,
  );

  if (parsed) {
    const period = calendarMonth(parsed.year, parsed.month);
    const messages = await db.customerMessage.findMany({
      where: {
        customerId: user.customerId,
        readAt: { not: null },
        createdAt: { gte: period.start, lt: period.end },
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        body: true,
        createdAt: true,
        readAt: true,
        signedBy: { select: { name: true } },
      },
    });

    return (
      <div className="flex animate-rise flex-col gap-6">
        <div className="flex flex-col gap-2">
          <Link href="/portal/meldinger" className={backLinkClass}>
            ← Meldingsarkiv
          </Link>
          <h1 className="text-display tracking-tight text-navy-900">
            {period.label}
          </h1>
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
                <span className="font-mono text-meta font-medium text-navy-700">
                  {formatDate(message.createdAt)}
                </span>
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

  const folders = await listCustomerMessageMonths(user.customerId);

  return (
    <div className="flex animate-rise flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Link href="/portal" className={backLinkClass}>
          ← Forside
        </Link>
        <h1 className="text-display tracking-tight text-navy-900">
          Meldingsarkiv
        </h1>
        <p className="text-body text-navy-700">
          Velg en måned. Når måneden er over, ligger den igjen som mappe.
        </p>
      </div>

      <MonthFolderList
        folders={folders}
        hrefFor={(param) => `/portal/meldinger?maaned=${param}`}
        emptyText="Ingen signerte meldinger ennå."
        countLabel={(count) =>
          count === 1 ? "1 melding" : `${count} meldinger`
        }
      />
    </div>
  );
}
