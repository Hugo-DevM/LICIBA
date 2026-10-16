export function AdminPageHeader({
  eyebrow,
  title,
  actions,
}: {
  eyebrow: string;
  title: string;
  actions?: React.ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2.5 border-b border-liciba-border bg-white px-5 py-4">
      <div>
        <div className="mb-1.5 font-mono text-xs text-liciba-muted">{eyebrow}</div>
        <h1 className="m-0 font-display text-[26px] font-bold uppercase">{title}</h1>
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </header>
  );
}
