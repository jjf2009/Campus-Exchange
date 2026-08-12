import { expect, test } from "@playwright/test";
import {
  getE2EListingByTitle,
  getE2ENotificationCount,
  getE2ERequestsForListing,
  getE2EUserByEmail,
  resetE2EEmailEvents,
  resetE2EDatabase,
  seedE2EListing,
} from "./helpers";

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000";

test.beforeEach(async ({ page }) => {
  await resetE2EDatabase();
  await seedE2EListing();
  await resetE2EEmailEvents(BASE_URL);
  const seller = await getE2EUserByEmail("seller.demo@gec.ac.in");
  if (!seller) throw new Error("Missing seller");
  await page.goto(`/test/login?email=${encodeURIComponent(seller.email)}&next=/marketplace`);
});

test("seller can create a listing and two buyers can request it without using email credits", async ({ page, browser }) => {
  await expect(page.getByText("Marketplace")).toBeVisible();

  await page.goto("/new-listing");
  await page.getByLabel("Title").fill("Playwright Boiler");
  await page.getByLabel("Description").fill("Created during automated testing.");
  await page.getByLabel("Price").fill("500");
  await page.getByLabel("Category").selectOption("Boiler");
  await page.getByLabel("Condition").selectOption("Good");
  await page.getByRole("button", { name: "Create listing" }).click();

  await page.waitForURL(/\/listing\/.+/);
  const createdListingTitle = await page.getByRole("heading", { level: 1 }).textContent();
  expect(createdListingTitle).toBe("Playwright Boiler");

  const listing = await getE2EListingByTitle("Playwright Boiler");
  if (!listing) throw new Error("Listing not created");

  const buyerOne = await getE2EUserByEmail("buyer.one@gec.ac.in");
  const buyerTwo = await getE2EUserByEmail("buyer.two@gec.ac.in");
  if (!buyerOne || !buyerTwo) throw new Error("Missing buyers");

  const buyerContextOne = await browser.newContext({ baseURL: BASE_URL });
  const buyerPageOne = await buyerContextOne.newPage();
  await buyerPageOne.goto(`/test/login?email=${encodeURIComponent(buyerOne.email)}&next=/listing/${listing.id}`);
  await buyerPageOne.getByRole("button", { name: "Request Item" }).click();
  await buyerPageOne.getByRole("button", { name: "Request" }).click();
  await expect(buyerPageOne.getByText("Request Sent")).toBeVisible();

  const buyerContextTwo = await browser.newContext({ baseURL: BASE_URL });
  const buyerPageTwo = await buyerContextTwo.newPage();
  await buyerPageTwo.goto(`/test/login?email=${encodeURIComponent(buyerTwo.email)}&next=/listing/${listing.id}`);
  await buyerPageTwo.getByRole("button", { name: "Request Item" }).click();
  await buyerPageTwo.getByRole("button", { name: "Request" }).click();
  await expect(buyerPageTwo.getByText("Request Sent")).toBeVisible();

  await page.goto("/test/login?email=seller.demo%40gec.ac.in&next=/dashboard/requests");
  await expect(page.getByText("Playwright Boiler")).toBeVisible();

  const requests = await getE2ERequestsForListing(listing.id);
  expect(requests).toHaveLength(2);
  expect(requests.map((request) => request.status).sort()).toEqual(["PENDING", "PENDING"]);

  await page.goto("/dashboard/notifications");
  await expect(page.getByText("Notifications")).toBeVisible();
  const seller = await getE2EUserByEmail("seller.demo@gec.ac.in");
  if (!seller) throw new Error("Missing seller");
  expect(await getE2ENotificationCount(seller.id)).toBeGreaterThanOrEqual(2);
});

test("email sending is skipped in test mode and the app still works", async ({ page }) => {
  await page.goto("/marketplace");
  await expect(page.getByText("Marketplace")).toBeVisible();
  const listing = await getE2EListingByTitle("E2E Test Boiler");
  if (!listing) throw new Error("Missing seed listing");

  await page.goto(`/test/login?email=buyer.one%40gec.ac.in&next=/listing/${listing.id}`);
  await page.getByRole("button", { name: "Request Item" }).click();
  await page.getByRole("button", { name: "Request" }).click();
  await expect(page.getByText("Request Sent")).toBeVisible();

  const response = await page.request.get("/api/e2e/email-events");
  expect(response.ok()).toBeTruthy();
  const data = (await response.json()) as { count: number };
  expect(data.count).toBe(0);
});
