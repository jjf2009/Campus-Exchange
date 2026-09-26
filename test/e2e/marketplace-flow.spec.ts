import { expect, test, type Browser, type Page } from "@playwright/test";
import {
  backdateE2EListing,
  getE2EContactsForListing,
  getE2EListingById,
  getE2EListingByTitle,
  getE2ENotificationCount,
  getE2EUserByEmail,
  resetE2EDatabase,
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

/** Tap "Chat on WhatsApp" and return the WhatsApp URL the new tab lands on. */
async function chatOnWhatsApp(page: Page) {
  const popupPromise = page.waitForEvent("popup");
  await page.getByRole("button", { name: /Chat on WhatsApp|Open WhatsApp again/ }).click();
  const popup = await popupPromise;
  await popup.waitForURL(/wa\.me|\/listing\//);
  const url = popup.url();
  await popup.close();
  return url;
}

test.beforeEach(async () => {
  await resetE2EDatabase();
  const listing = await seedE2EListing();
  listingId = listing.id;
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

test("chat opens WhatsApp and puts the item on hold", async ({ browser }) => {
  const buyer = await loginAs(browser, BUYER_ONE, `/listing/${listingId}`);
  const url = await chatOnWhatsApp(buyer);

  expect(url).toContain("https://wa.me/919800000001");
  const message = decodeURIComponent(url);
  expect(message).toContain("E2E Test Boiler");
  expect(message).toContain("hidden this item while we talk");
  expect(message).toContain(`/listing/${listingId}/relist`);

  const buyerOne = await getE2EUserByEmail(BUYER_ONE);
  const listing = await getE2EListingById(listingId);
  expect(listing?.status).toBe("RESERVED");
  expect(listing?.heldByUserId).toBe(buyerOne!.id);
  expect(await getE2EContactsForListing(listingId)).toHaveLength(1);

  // The holder can reopen the chat; no duplicate contact.
  await buyer.reload();
  await expect(buyer.getByText(/on hold for you/i)).toBeVisible();
  expect(await chatOnWhatsApp(buyer)).toContain("wa.me");
  expect(await getE2EContactsForListing(listingId)).toHaveLength(1);

  // Hidden from the marketplace and blocked for other buyers.
  const other = await loginAs(browser, BUYER_TWO, "/marketplace");
  await expect(other.getByText("E2E Test Boiler")).toHaveCount(0);
  await other.goto(`/listing/${listingId}`);
  await expect(other.getByText(/Someone is already talking to the seller/)).toBeVisible();
  await expect(other.getByRole("button", { name: "Chat on WhatsApp" })).toHaveCount(0);

  // No notification system any more.
  expect(await getE2ENotificationCount()).toBe(0);
});

test("a buyer can hold at most 2 items", async ({ browser }) => {
  const second = await seedE2EListing("Second Item");
  const third = await seedE2EListing("Third Item");
  const buyer = await loginAs(browser, BUYER_ONE, `/listing/${listingId}`);

  await chatOnWhatsApp(buyer);
  await buyer.goto(`/listing/${second.id}`);
  await chatOnWhatsApp(buyer);

  await buyer.goto(`/listing/${third.id}`);
  const url = await chatOnWhatsApp(buyer);
  expect(url).toContain(`/listing/${third.id}?error=limit`);
  expect((await getE2EListingById(third.id))?.status).toBe("AVAILABLE");
});

test("buyers are rate limited per day", async ({ browser }) => {
  const buyerOne = await getE2EUserByEmail(BUYER_ONE);
  await seedE2EContacts(buyerOne!.id, 15);

  const buyer = await loginAs(browser, BUYER_ONE, `/listing/${listingId}`);
  const url = await chatOnWhatsApp(buyer);
  expect(url).toContain("error=daily");
  expect((await getE2EListingById(listingId))?.status).toBe("AVAILABLE");
});

test("only the seller can relist from the WhatsApp link", async ({ browser }) => {
  await chatOnWhatsApp(await loginAs(browser, BUYER_ONE, `/listing/${listingId}`));
  const relistPath = `/listing/${listingId}/relist`;

  // Another student can't relist it.
  const other = await loginAs(browser, BUYER_TWO, relistPath);
  await expect(other.getByText("Only the seller can do this")).toBeVisible();

  // The seller can.
  const seller = await loginAs(browser, SELLER, relistPath);
  await expect(seller.getByText(/On hold for Buyer One/)).toBeVisible();
  await seller.getByRole("button", { name: "Put it back on the marketplace" }).click();
  await seller.waitForURL(new RegExp(`/listing/${listingId}$`));

  const listing = await getE2EListingById(listingId);
  expect(listing?.status).toBe("AVAILABLE");
  expect(listing?.heldByUserId).toBeNull();

  await other.goto("/marketplace");
  await expect(other.getByText("E2E Test Boiler")).toBeVisible();
});

test("seller marks an on-hold item sold to the holder", async ({ browser }) => {
  await chatOnWhatsApp(await loginAs(browser, BUYER_ONE, `/listing/${listingId}`));

  const seller = await loginAs(browser, SELLER, `/listing/${listingId}/relist`);
  await seller.getByRole("button", { name: /mark as sold/ }).click();
  await seller.waitForURL(new RegExp(`/listing/${listingId}$`));

  const buyerOne = await getE2EUserByEmail(BUYER_ONE);
  const listing = await getE2EListingById(listingId);
  expect(listing?.status).toBe("SOLD");
  expect(listing?.soldToUserId).toBe(buyerOne!.id);
});

test("cron quietly hides listings untouched for 30 days", async ({ request }) => {
  expect((await request.get("/api/cron/listings")).status()).toBe(401);
  const auth = { headers: { authorization: `Bearer ${CRON_SECRET}` } };

  await backdateE2EListing(listingId, 29);
  expect(await (await request.get("/api/cron/listings", auth)).json()).toEqual({ expired: 0 });

  await backdateE2EListing(listingId, 31);
  expect(await (await request.get("/api/cron/listings", auth)).json()).toEqual({ expired: 1 });
  expect((await getE2EListingById(listingId))?.status).toBe("EXPIRED");
  expect(await getE2ENotificationCount()).toBe(0);
});

test("non-college accounts cannot sign in", async ({ page }) => {
  await page.goto("/test/login?email=someone%40gmail.com&next=/marketplace");
  await page.waitForURL(/\/login/);
});
