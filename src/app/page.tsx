import { CalendarCheck2, IndianRupee, ListChecks, UsersRound } from "lucide-react";
import Link from "next/link";

import { HashSessionCapture } from "@/components/auth/hash-session-capture";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function Home() {
  const highlights = [
    {
      title: "Wedding Timeline",
      description: "Build milestones from engagement to bidaai with owner, due date, and progress.",
      icon: CalendarCheck2,
    },
    {
      title: "Vendor Management",
      description: "Track photographers, decorators, caterers, and payments in one workspace.",
      icon: UsersRound,
    },
    {
      title: "Budget Control",
      description: "Set category budgets, monitor spending, and avoid last-minute surprises.",
      icon: IndianRupee,
    },
    {
      title: "Task Execution",
      description: "Assign tasks to family, planner team, and vendors with clear accountability.",
      icon: ListChecks,
    },
  ];

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-10 sm:px-8 md:py-14">
      <HashSessionCapture />
      <section className="rounded-2xl border bg-card p-8 shadow-sm md:p-12">
        <Badge className="mb-4" variant="secondary">
          Wedding Operations Platform
        </Badge>
        <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
          Shaadi Wedding Planner for couples, planners, and vendors
        </h1>
        <p className="mt-5 max-w-2xl text-muted-foreground md:text-lg">
          Launch your planning workflow with Next.js, Supabase, and a scalable UI system. This starter
          includes architecture for auth, vendor coordination, budgeting, and event timeline execution.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button
            size="lg"
            nativeButton={false}
            render={<Link href="/auth">Create Wedding Workspace</Link>}
          />
          <Button size="lg" variant="outline">
            Explore Product Roadmap
          </Button>
        </div>
      </section>

      <section className="mt-10 grid gap-4 md:grid-cols-2">
        {highlights.map(({ title, description, icon: Icon }) => (
          <Card key={title}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Icon className="size-5 text-primary" />
                {title}
              </CardTitle>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </section>

      <section className="mt-10">
        <Card>
          <CardHeader>
            <CardTitle>Recommended initial modules</CardTitle>
            <CardDescription>
              Add these first to move from starter to production-grade wedding operations.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>1. Auth & RBAC with Supabase Auth for couple, planner, and vendor personas.</p>
            <Separator />
            <p>2. Project workspace with events, budget heads, guest list, and custom checklists.</p>
            <Separator />
            <p>3. Vendor directory and contracts with milestone-based payment tracking.</p>
            <Separator />
            <p>4. Timeline calendar with reminders, task dependencies, and real-time updates.</p>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
