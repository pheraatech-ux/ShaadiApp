import { redirect } from "next/navigation";

import { getCurrentPersona } from "@/lib/employee/persona";

export default async function AppIndexPage() {
  const { persona } = await getCurrentPersona();
  if (persona === "employee") {
    redirect("/app/employee/dashboard");
  }
  redirect("/app/dashboard");
}
