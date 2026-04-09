export default function AppHomePage() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 py-10 sm:px-8">
      <h1 className="text-3xl font-semibold tracking-tight">Authenticated App Area</h1>
      <p className="mt-3 text-muted-foreground">
        You are signed in. Build protected planner modules under this route group.
      </p>
    </main>
  );
}
