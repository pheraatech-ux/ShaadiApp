import { Sparkles, Pencil, BarChart3 } from "lucide-react";

const items = [
  {
    Icon: Sparkles,
    title: "We suggest allocation",
    description: "Based on current industry trends and your wedding location.",
  },
  {
    Icon: Pencil,
    title: "You're in control",
    description: "You can edit any allocation in the next step.",
  },
  {
    Icon: BarChart3,
    title: "Track easily",
    description: "We'll help you track expenses and stay within budget.",
  },
];

export function BudgetSetupHowItWorks() {
  return (
    <div className="space-y-5">
      <p className="text-sm font-semibold">How it works</p>
      <div className="space-y-5">
        {items.map(({ Icon, title, description }) => (
          <div key={title} className="flex gap-3">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
              <Icon className="size-4" />
            </div>
            <div>
              <p className="text-sm font-semibold">{title}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
