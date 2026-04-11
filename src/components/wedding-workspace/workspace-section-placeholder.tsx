type WorkspaceSectionPlaceholderProps = {
  title: string;
};

export function WorkspaceSectionPlaceholder({ title }: WorkspaceSectionPlaceholderProps) {
  return (
    <div className="space-y-2">
      <h1 className="text-xl font-semibold tracking-tight text-foreground">{title}</h1>
      <p className="text-sm text-muted-foreground">This section is coming soon.</p>
    </div>
  );
}
