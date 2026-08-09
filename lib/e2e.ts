export const E2E_TEST_COOKIE = "gec-e2e-user";

export function isE2ETestMode() {
  return process.env.E2E_TEST_MODE === "true";
}

export function parseE2EUserCookie(value?: string | null) {
  if (!value) return null;

  try {
    const parsed = JSON.parse(value) as { email?: string };
    return typeof parsed.email === "string" ? parsed.email : null;
  } catch {
    return null;
  }
}

