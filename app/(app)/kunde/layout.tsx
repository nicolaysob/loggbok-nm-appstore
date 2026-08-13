export default function FieldLayout({ children }: LayoutProps<"/">) {
  // Feltflaten er smal — én kolonne for tommelbruk ute på anlegg.
  return <div className="mx-auto w-full max-w-lg">{children}</div>;
}
