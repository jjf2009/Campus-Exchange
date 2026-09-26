import { expect, test, type Browser, type Page } from "@playwright/test";
import {
  backdateE2EListing,
  getE2EContactsForListing,
  getE2EListingById,
  getE2EListingByTitle,
  getE2ENotifications,
  getE2EUserByEmail,
  resetE2EDatabase,
  resetE2EEmailEvents,
  seedE2EContacts,
  seedE2EListing,
} from "./helpers";

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000";
const CRON_SECRET = "e2e-cron-secret";
const SELLER = "seller.demo@gec.ac.in";
const BUYER_ONE = "buyer.one@gec.ac.in";
const BUYER_TWO = "buyer.two@gec.ac.in";

let listingId: string;

async function loginAs(browser: Browser, email: string, next: string) {
  const context = await browser.newContext({ baseURL: BASE_URL });
  // Don't hit the real WhatsApp site; just capture where we were sent.
  await context.route("https://wa.me/**", (route) =>
    route.fulfill({ contentType: "text/html", body: "whatsapp stub" })
  );
  const page = await context.newPage();
  page.on("dialog", (dialog) => dialog.accept());
  await page.goto(`/test/login?email=${encodeURIComponent(email)}&next=${next}`);
  return page;
}

async function chatOnWhatsApp(page: Page) {
  const popupPromise = page.waitForEvent("popup");
  await page.getByRole("button", { name: /Chat (again )?on WhatsApp/ }).click();
  const popup = await popupPromise;
  await popup.waitForURL(/wa\.me/);
  const url = popup.url();
  await popup.close();
  return url;
}

test.beforeEach(async () => {
  await resetE2EDatabase();
  const listing = await seedE2EListing();
  listingId = listing.id;
  await resetE2EEmailEvents(BASE_URL);
});

test("seller can create a listing", async ({ browser }) => {
  // First run compiles several dev routes on demand.
  test.slow();
  const page = await loginAs(browser, SELLER, "/new-listing");
  await page.getByLabel("Title").fill("Playwright Boiler");
  await page.getByLabel("Description").fill("Created during automated testing.");
  await page.getByLabel("Price").fill("500");
  await page.getByRole("combobox", { name: "Category" }).click();
  await page.getByRole("option", { name: "Boiler" }).click();
  await page.getByRole("combobox", { name: "Condition" }).click();
  await page.getByRole("option", { name: "Good", exact: true }).click();
  await page.getByRole("button", { name: "Publish listing" }).click();

  await page.waitForURL(/\/listing\/.+/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Playwright Boiler");
  expect(await getE2EListingByTitle("Playwright Boiler")).not.toBeNull();
});

test("buyer chats instantly; seller is notified once", async ({ browser }) => {
  const buyer = await loginAs(browser, BUYER_ONE, `/listing/${listingId}`);

  const url = await chatOnWhatsApp(buyer);
  expect(url).toContain("https://wa.me/919800000001");
  expect(decodeURIComponent(url)).toContain("E2E Test Boiler");

  // A second tap reopens the chat without a duplicate contact/notification.
  await chatOnWhatsApp(buyer);
  expect(await getE2EContactsForListing(listingId)).toHaveLength(1);

  const seller = await getE2EUserByEmail(SELLER);
  expect(await getE2ENotifications(seller!.id, "NEW_CONTACT")).toHaveLength(1);

  const sellerPage = await loginAs(browser, SELLER, "/dashboard/requests");
  await expect(sellerPage.getByText("Buyer One")).toBeVisible();

  // Nothing is emailed for a contact.
  const events = await (await buyer.request.get("/api/e2e/email-events")).json();
  expect(events.count).toBe(0);
});

test("buyers are rate limited", async ({ browser }) => {
  const buyerOne = await getE2EUserByEmail(BUYER_ONE);
  await seedE2EContacts(buyerOne!.id, 15);

  const buyer = await loginAs(browser, BUYER_ONE, `/listing/${listingId}`);
  await buyer.getByRole("button", { name: "Chat on WhatsApp" }).click();
  await expect(buyer.getByText(/contacted a lot of sellers today/)).toBeVisible();
  expect(await getE2EContactsForListing(listingId)).toHaveLength(0);
});

test("seller reserves, unreserves, then sells to a buyer", async ({ browser }) => {
  for (const email of [BUYER_ONE, BUYER_TWO]) {
    await chatOnWhatsApp(await loginAs(browser, email, `/listing/${listingId}`));
  }

  const seller = await loginAs(browser, SELLER, `/listing/${listingId}`);
  await seller.getByRole("button", { name: "Reserve", exact: true }).click();
  await expect(seller.getByRole("button", { name: "Unreserve" })).toBeVisible();
  expect((await getE2EListingById(listingId))?.status).toBe("RESERVED");

  await seller.getByRole("button", { name: "Unreserve" }).click();
  await expect(seller.getByRole("button", { name: "Reserve", exact: true })).toBeVisible();
  expect((await getE2EListingById(listingId))?.status).toBe("AVAILABLE");

  await seller.getByRole("button", { name: "Mark Sold", exact: true }).click();
  await seller.getByLabel("Who bought it? (optional)").selectOption({ label: "Buyer One" });
  await seller.getByRole("button", { name: "Mark sold", exact: true }).click();
  await expect(seller.getByText("Marked as sold")).toBeVisible();

  const listing = await getE2EListingById(listingId);
  const buyerOne = await getE2EUserByEmail(BUYER_ONE);
  const buyerTwo = await getE2EUserByEmail(BUYER_TWO);
  expect(listing?.status).toBe("SOLD");
  expect(listing?.soldToUserId).toBe(buyerOne!.id);
  expect(await getE2ENotifications(buyerTwo!.id, "LISTING_SOLD")).toHaveLength(1);
  expect(await getE2ENotifications(buyerOne!.id, "LISTING_SOLD")).toHaveLength(0);

  await seller.goto("/marketplace");
  await expect(seller.getByText("E2E Test Boiler")).toHaveCount(0);
});

test("two buyer reports hide a listing until the seller renews it", async ({ browser }) => {
  for (const email of [BUYER_ONE, BUYER_TWO]) {
    const buyer = await loginAs(browser, email, `/listing/${listingId}`);
    await chatOnWhatsApp(buyer);
    await buyer.getByRole("button", { name: "Report as sold" }).click();
    await expect(buyer.getByText(/You reported this as sold/)).toBeVisible();
  }

  expect((await getE2EListingById(listingId))?.status).toBe("EXPIRED");
  const sellerUser = await getE2EUserByEmail(SELLER);
  expect(await getE2ENotifications(sellerUser!.id, "LISTING_REPORTED")).toHaveLength(1);

  const seller = await loginAs(browser, SELLER, "/dashboard");
  await expect(seller.getByText("Are these still available?")).toBeVisible();
  await seller.getByRole("button", { name: "Renew" }).click();
  await expect(seller.getByText("Listing is live again")).toBeVisible();

  const listing = await getE2EListingById(listingId);
  expect(listing?.status).toBe("AVAILABLE");
  const contacts = await getE2EContactsForListing(listingId);
  expect(contacts.every((c) => c.reportedUnavailableAt === null)).toBe(true);
});

test("cron nudges stale listings once and expires old ones", async ({ request }) => {
  expect((await request.get("/api/cron/listings")).status()).toBe(401);
  const auth = { headers: { authorization: `Bearer ${CRON_SECRET}` } };

  await backdateE2EListing(listingId, { lastConfirmedDaysAgo: 15 });
  let body = await (await request.get("/api/cron/listings", auth)).json();
  expect(body).toMatchObject({ nudged: 1, expired: 0 });

  // Already nudged: a second run does nothing.
  body = await (await request.get("/api/cron/listings", auth)).json();
  expect(body).toMatchObject({ nudged: 0, expired: 0 });

  const seller = await getE2EUserByEmail(SELLER);
  expect(await getE2ENotifications(seller!.id, "CONFIRM_AVAILABILITY")).toHaveLength(1);
  const emails = await (await request.get("/api/e2e/email-events")).json();
  expect(emails.count).toBe(1);

  await backdateE2EListing(listingId, { lastConfirmedDaysAgo: 22 });
  body = await (await request.get("/api/cron/listings", auth)).json();
  expect(body).toMatchObject({ expired: 1 });
  expect((await getE2EListingById(listingId))?.status).toBe("EXPIRED");
});

test("cron nudges the seller two days after a buyer makes contact", async ({ browser, request }) => {
  await chatOnWhatsApp(await loginAs(browser, BUYER_ONE, `/listing/${listingId}`));
  const auth = { headers: { authorization: `Bearer ${CRON_SECRET}` } };

  let body = await (await request.get("/api/cron/listings", auth)).json();
  expect(body).toMatchObject({ nudged: 0 });

  await backdateE2EListing(listingId, { lastConfirmedDaysAgo: 3, contactsHoursAgo: 49 });
  body = await (await request.get("/api/cron/listings", auth)).json();
  expect(body).toMatchObject({ nudged: 1 });
});

test("non-college accounts cannot sign in", async ({ page }) => {
  await page.goto("/test/login?email=someone%40gmail.com&next=/marketplace");
  await page.waitForURL(/\/login/);
});
