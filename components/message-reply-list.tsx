export function MessageReplyList({
  replies,
}: {
  replies: { id: string; body: string; at: string; author: string }[];
}) {
  if (replies.length === 0) return null;

  return (
    <ol className="flex flex-col gap-2.5 border-t border-hair pt-3">
      {replies.map((reply) => (
        <li key={reply.id} className="flex gap-2.5">
          <span
            aria-hidden
            className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand"
          />
          <div className="min-w-0 flex-1">
            <p className="text-micro tabular-nums text-ink-3">
              {reply.at} · {reply.author}
            </p>
            <p className="mt-0.5 text-meta whitespace-pre-wrap text-ink">
              {reply.body}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
