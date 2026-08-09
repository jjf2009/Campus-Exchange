export type BrowserNotificationPermission =
  "default" | "denied" | "granted" | "unsupported";

export function canUseBrowserNotifications() {
  return typeof window !== "undefined" && "Notification" in window;
}

export function getBrowserNotificationPermission():
  | BrowserNotificationPermission
  | "unsupported" {
  if (!canUseBrowserNotifications()) return "unsupported";
  return Notification.permission;
}

export async function requestPermission(): Promise<BrowserNotificationPermission> {
  if (!canUseBrowserNotifications()) {
    return "unsupported";
  }

  return Notification.requestPermission();
}

export async function subscribe() {
  return null;
}

export async function send() {
  return false;
}
