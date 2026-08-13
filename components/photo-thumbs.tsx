export function PhotoThumbs({
  urls,
  label = "Bilder",
}: {
  urls: string[];
  label?: string;
}) {
  if (urls.length === 0) return null;

  return (
    <div className="mt-3 flex flex-col gap-2">
      <p className="sr-only">{label}</p>
      <ul className="flex flex-wrap gap-2">
        {urls.map((url, index) => (
          <li key={index}>
            {/* data-URL fra opplasting — next/image støtter ikke det uten konfig */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <a href={url} target="_blank" rel="noreferrer">
              <img
                src={url}
                alt=""
                className="size-20 rounded-md object-cover"
              />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
