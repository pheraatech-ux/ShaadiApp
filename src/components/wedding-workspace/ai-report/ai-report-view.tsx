type AiReportViewProps = {
  coupleName: string;
  reportText: string | null;
  reportError: string | null;
  signalCount: number;
};

type Section = { heading: string; lines: { bullet: boolean; text: string }[] };

function parseReport(text: string): Section[] {
  const sections: Section[] = [];
  let current: Section | null = null;

  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (!line) continue;

    if (line.startsWith("## ")) {
      current = { heading: line.replace(/^##\s+/, ""), lines: [] };
      sections.push(current);
      continue;
    }

    const bulletMatch = line.match(/^[-*]\s+(.*)/);
    if (current) {
      current.lines.push({ bullet: !!bulletMatch, text: bulletMatch ? bulletMatch[1] : line });
    }
  }

  return sections;
}

export function AiReportView({ coupleName, reportText, reportError, signalCount }: AiReportViewProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">AI Report</h1>
        <p className="text-sm text-muted-foreground">Readiness summary for {coupleName}</p>
      </div>

      {reportError ? (
        <section className="rounded-xl border border-destructive/40 bg-destructive/5 px-4 py-4">
          <p className="text-sm font-medium text-destructive">Could not generate report</p>
          <p className="mt-1 text-xs text-muted-foreground">{reportError}</p>
        </section>
      ) : reportText ? (
        <div className="space-y-3">
          {parseReport(reportText).map((section, i) => (
            <section key={i} className="rounded-xl border border-border/70 bg-card">
              <header className="border-b border-border/60 px-4 py-3">
                <p className="text-sm font-medium text-foreground">{section.heading}</p>
              </header>
              <div className="px-4 py-3">
                {section.lines.some((l) => l.bullet) ? (
                  <ul className="space-y-1 list-disc list-inside">
                    {section.lines.map((l, j) => (
                      <li key={j} className="text-sm text-foreground leading-relaxed">
                        {l.text}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="space-y-1">
                    {section.lines.map((l, j) => (
                      <p key={j} className="text-sm text-foreground leading-relaxed">
                        {l.text}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </section>
          ))}
          <p className="text-xs text-muted-foreground px-1">
            Generated from {signalCount} planning signals · Powered by Gemini
          </p>
        </div>
      ) : (
        <section className="rounded-xl border border-border/70 bg-card px-4 py-4">
          <p className="text-sm text-muted-foreground">
            No operational data yet. Add tasks, vendors, budget, and docs to generate richer AI reports.
          </p>
        </section>
      )}
    </div>
  );
}
