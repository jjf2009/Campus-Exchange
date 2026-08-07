export type BrowserNotificationPermission =
  "default" | "denied" | "granted" | "unsupported";

export async function requestPermission(): Promise<BrowserNotificationPermission> {
  if (typeof window === "undefined" || !("Notification" in window)) {
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
