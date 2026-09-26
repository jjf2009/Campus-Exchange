import { getAppUrl } from "@/lib/app-url";
import { sendEmailNotification } from "@/lib/notifications/notification-service";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function buildEmailShell(title: string, preview: string, body: string) {
  return `
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>${escapeHtml(title)}</title>
      </head>
      <body style="margin:0;background:#f8fafc;font-family:Arial,sans-serif;color:#0f172a;">
        <span style="display:none!important;opacity:0;color:transparent;height:0;width:0;overflow:hidden;">
          ${escapeHtml(preview)}
        </span>
        ${body}
      </body>
    </html>
  `;
}

function buildSellerEmailHtml(params: {
  sellerName: string;
  heading: string;
  body: string;
  ctaLabel: string;
}) {
  const dashboardUrl = `${getAppUrl()}/dashboard`;
  return buildEmailShell(
    params.heading,
    params.body,
    `
      <div style="max-width:600px;margin:24px auto;padding:24px;background:#fff;border-radius:12px;">
        <h2 style="margin:0 0 16px;font-size:24px;line-height:1.2;">Hi ${escapeHtml(params.sellerName)},</h2>
        <p style="margin:0 0 20px;font-size:16px;line-height:1.6;">${escapeHtml(params.body)}</p>
        <a href="${dashboardUrl}" style="display:inline-block;padding:12px 20px;background:#0f172a;color:#fff;border-radius:8px;text-decoration:none;font-weight:bold;">${escapeHtml(params.ctaLabel)}</a>
        <p style="margin:20px 0 0;font-size:14px;line-height:1.6;color:#475569;">It takes one tap, and keeps the marketplace accurate for everyone.</p>
      </div>
    `
  );
}

export async function sendConfirmAvailabilityEmail(params: {
  to: string;
  sellerName: string;
  listingTitle: string;
}) {
  await sendEmailNotification({
    to: params.to,
    subject: `Is ${params.listingTitle} still available?`,
    html: buildSellerEmailHtml({
      sellerName: params.sellerName,
      heading: `Is ${params.listingTitle} still available?`,
      body: `Let buyers know whether ${params.listingTitle} is sold, reserved or still available.`,
      ctaLabel: "Update listing",
    }),
  });
}

export async function sendListingExpiredEmail(params: {
  to: string;
  sellerName: string;
  listingTitle: string;
}) {
  await sendEmailNotification({
    to: params.to,
    subject: `${params.listingTitle} was hidden from the marketplace`,
    html: buildSellerEmailHtml({
      sellerName: params.sellerName,
      heading: `${params.listingTitle} was hidden`,
      body: `We hid ${params.listingTitle} because it hasn't been confirmed as available recently. Still selling it? Renew it in one tap.`,
      ctaLabel: "Renew listing",
    }),
  });
}
