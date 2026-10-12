import { getParentContext } from "@/lib/parent";
import { AppShell } from "@/components/shell/app-shell";
import { ChildSwitcher } from "@/components/parent/child-switcher";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const { user, children: childList, activeChild } = await getParentContext();

  return (
    <AppShell
      user={user}
      headerSlot={
        <div className="flex items-center gap-3">
          <ChildSwitcher
            childrenList={childList}
            activeChildId={activeChild?.id ?? null}
          />
        </div>
      }
    >
      {children}
    </AppShell>
  );
}
