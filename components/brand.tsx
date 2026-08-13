export function BrandIcon({
  size = 36,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    // SVG trenger ikke next/image — optimizeren blokkerer dem som standard
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/brand/ikon.svg"
      alt=""
      width={size}
      height={size}
      className={`shrink-0 ${className}`}
      decoding="async"
    />
  );
}

export function BrandLogo({
  className = "",
  priority = false,
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/brand/logo.svg"
      alt="N&M Vaktmesterservice"
      width={729}
      height={290}
      className={`h-auto w-full ${className}`}
      decoding="async"
      {...(priority ? { fetchPriority: "high" as const } : {})}
    />
  );
}

export function BrandLogoWide({
  className = "",
}: {
  className?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/brand/logo-bred.svg"
      alt="N&M Vaktmesterservice AS"
      width={900}
      height={200}
      className={`h-auto w-full ${className}`}
      decoding="async"
    />
  );
}
