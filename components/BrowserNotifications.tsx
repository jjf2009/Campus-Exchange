"use client";

import { useEffect, useState } from "react";
import { BellRing } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  canUseBrowserNotifications,
  getBrowserNotificationPermission,
  requestPermission,
} from "@/lib/notifications/browser";
import type { NavbarNotificationSummary } from "@/types";

const STORAGE_KEY = "gec-browser-notifications-seen";
const PROMPT_KEY = "gec-browser-notifications-prompted";

function readSeen(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function writeSeen(ids: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids.slice(-100)));
}

function hasPromptedThisSession() {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(PROMPT_KEY) === "true";
}

function markPromptedThisSession() {
  sessionStorage.setItem(PROMPT_KEY, "true");
}

export function BrowserNotifications({
  notifications,
  autoPrompt = false,
}: {
  notifications?: NavbarNotificationSummary | null;
  autoPrompt?: boolean;
}) {
  const [permission, setPermission] = useState<
    "default" | "denied" | "granted" | "unsupported"
  >("unsupported");

  useEffect(() => {
    setPermission(getBrowserNotificationPermission());
  }, []);

  useEffect(() => {
    if (!autoPrompt) return;
    if (!canUseBrowserNotifications()) return;
    if (Notification.permission !== "default") return;
    if (hasPromptedThisSession()) return;

    markPromptedThisSession();
    void requestPermission().then((result) => {
      setPermission(result);
    });
  }, [autoPrompt]);

  useEffect(() => {
    if (!canUseBrowserNotifications()) return;
    if (Notification.permission !== "granted") return;
    if (!notifications?.items.length) return;

    const seen = new Set(readSeen());
    const nextSeen = [...seen];

    for (const item of notifications.items) {
      if (item.isRead || seen.has(item.id)) continue;
      new Notification(item.title, {
        body: item.message,
        tag: item.id,
      });
      nextSeen.push(item.id);
    }

    if (nextSeen.length !== seen.size) {
      writeSeen(nextSeen);
    }
  }, [notifications]);

  if (permission === "granted") return null;

  return (
    autoPrompt ? (
      <div className="hidden sm:flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-muted-foreground">
        <BellRing className="h-3.5 w-3.5" />
        Notifications available
      </div>
    ) : (
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="hidden sm:inline-flex"
        onClick={async () => {
          const result = await requestPermission();
          setPermission(result);
        }}
        disabled={!canUseBrowserNotifications() || permission === "denied"}
      >
        <BellRing className="mr-1.5 h-4 w-4" />
        Enable alerts
      </Button>
    )
  );
}
