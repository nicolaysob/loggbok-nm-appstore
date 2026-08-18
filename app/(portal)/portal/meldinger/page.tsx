import { db } from "@/lib/db";
import { requireCustomer } from "@/lib/dal";
import { listCustomerMessageMonths } from "@/lib/customer-activity";
import { calendarMonth, parseYearMonth } from "@/lib/period";
import { formatDate } from "@/lib/time";
import { cardStaticClass } from "@/lib/ui";
import { BackLink } from "@/components/back-link";
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
        <div className="flex flex-col gap-4">
          <BackLink fallback="/portal/meldinger" />
          <div className="flex flex-col gap-1">
            <h1 className="text-display text-ink">
              {period.label}
            </h1>
            <p className="text-body text-ink-2">
              Signerte meldinger denne måneden.
            </p>
          </div>
        </div>

        {messages.length === 0 ? (
          <p className={`px-4 py-5 text-body text-ink-2 ${cardStaticClass}`}>
            Ingen signerte meldinger denne måneden.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {messages.map((message) => (
              <li
                key={message.id}
                className={`flex flex-col gap-1 px-4 py-3.5 ${cardStaticClass}`}
              >
                <span className="text-meta tabular-nums text-ink-2">
                  {formatDate(message.createdAt)}
                </span>
                <p className="text-body whitespace-pre-wrap text-ink">
                  {message.body}
                </p>
                {message.readAt && message.signedBy && (
                  <p className="text-meta font-medium text-ok">
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
      <div className="flex flex-col gap-4">
        <BackLink fallback="/portal" />
        <div className="flex flex-col gap-1">
          <h1 className="text-display text-ink">
            Meldingsarkiv
          </h1>
          <p className="text-body text-ink-2">
            Velg en måned. Når måneden er over, ligger den igjen som mappe.
          </p>
        </div>
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
