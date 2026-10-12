"use client";
import { useState } from "react";
import { Bell, Check } from "lucide-react";
import { useT } from "@/i18n/client";
import { Button } from "@/components/ui";

export function NotifyButton() {
  const { t } = useT();
  const [notified, setNotified] = useState(false);

  return (
    <div>
      <Button
        variant={notified ? "secondary" : "primary"}
        onClick={() => setNotified(true)}
        className="gap-2"
      >
        {notified ? (
          <>
            <Check className="size-4 text-emerald-600" />
            <span>{t("parent.learning.notified")}</span>
          </>
        ) : (
          <>
            <Bell className="size-4" />
            <span>{t("parent.learning.notifyBtn")}</span>
          </>
        )}
      </Button>
    </div>
  );
}
