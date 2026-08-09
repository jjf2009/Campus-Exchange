export function getAppUrl() {
  const explicitUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (explicitUrl) return explicitUrl;

  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl) return `https://${vercelUrl}`;

  if (process.env.NODE_ENV === "production") {
    throw new Error("NEXT_PUBLIC_APP_URL is required in production");
  }

  return "http://localhost:3000";
}

