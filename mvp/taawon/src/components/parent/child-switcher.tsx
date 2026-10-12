"use client";
import { useTransition } from "react";
import type { Child } from "@/db/schema";
import { setActiveChildAction } from "@/app/actions";
import { Avatar } from "@/components/ui";

export function ChildSwitcher({
  childrenList,
  activeChildId,
}: {
  childrenList: Child[];
  activeChildId: string | null;
}) {
  const [, startTransition] = useTransition();

  if (childrenList.length === 0) return null;

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
      {childrenList.map((child) => {
        const isActive = child.id === activeChildId;
        const firstName = child.name.split(" ")[0];
        return (
          <form
            key={child.id}
            action={(formData) => {
              startTransition(() => {
                setActiveChildAction(formData);
              });
            }}
          >
            <input type="hidden" name="childId" value={child.id} />
            <button
              type="submit"
              className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                isActive
                  ? "bg-brand-600 text-white shadow-sm ring-2 ring-brand-600/30"
                  : "bg-white text-slate-700 hover:bg-slate-100 border border-line"
              }`}
            >
              <Avatar name={child.name} size="sm" className="size-5 text-[10px]" />
              <span className="truncate max-w-[100px]">{firstName}</span>
            </button>
          </form>
        );
      })}
    </div>
  );
}
