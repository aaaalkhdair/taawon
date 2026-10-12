import { requireUser } from "@/lib/auth";
import { AppShell } from "@/components/shell/app-shell";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const user = await requireUser("specialist");
  return <AppShell user={user}>{children}</AppShell>;
}
