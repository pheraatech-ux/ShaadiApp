"use client";

import { Check } from "lucide-react";

const REQUIREMENTS = [
  { label: "8+ characters", test: (p: string) => p.length >= 8 },
  { label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "One number", test: (p: string) => /[0-9]/.test(p) },
  { label: "One special character", test: (p: string) => /[^A-Za-z0-9]/.test(p) },
] as const;

export function PasswordRequirements({ password }: { password: string }) {
  if (!password) return null;

  return (
    <ul className="mt-2 space-y-1.5">
      {REQUIREMENTS.map(({ label, test }) => {
        const met = test(password);
        return (
          <li
            key={label}
            className={`flex items-center gap-2 text-xs transition-colors duration-200 ${
              met ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
            }`}
          >
            <span
              className={`flex size-4 shrink-0 items-center justify-center rounded-full border transition-all duration-200 ${
                met
                  ? "border-emerald-500 bg-emerald-500/15"
                  : "border-muted-foreground/30 bg-transparent"
              }`}
            >
              {met && <Check className="size-2.5" strokeWidth={3} />}
            </span>
            {label}
          </li>
        );
      })}
    </ul>
  );
}
