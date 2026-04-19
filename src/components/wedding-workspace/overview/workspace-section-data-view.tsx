type WorkspaceSectionDataViewProps = {
  title: string;
  subtitle: string;
  totalLabel: string;
  emptyState: string;
  items: { id: string; primary: string; secondary?: string }[];
};

export function WorkspaceSectionDataView({
  title,
  subtitle,
  totalLabel,
  emptyState,
  items,
}: WorkspaceSectionDataViewProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">{title}</h1>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
      <section className="rounded-xl border border-border/70 bg-card">
        <header className="border-b border-border/60 px-4 py-3">
          <p className="text-sm font-medium text-foreground">{totalLabel}</p>
        </header>
        {items.length === 0 ? (
          <p className="px-4 py-4 text-sm text-muted-foreground">{emptyState}</p>
        ) : (
          <div className="divide-y divide-border/60">
            {items.map((item) => (
              <article key={item.id} className="px-4 py-3">
                <p className="text-sm font-medium text-foreground">{item.primary}</p>
                {item.secondary ? <p className="text-xs text-muted-foreground">{item.secondary}</p> : null}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
