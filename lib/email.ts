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

function buildAcceptedEmailHtml(params: {
  buyerName: string;
  listingTitle: string;
  sellerName: string;
  sellerPhone: string;
}) {
  return buildEmailShell(
    `Request accepted: ${params.listingTitle}`,
    `Your request for ${params.listingTitle} was accepted`,
    `
      <div style="max-width:600px;margin:24px auto;padding:24px;background:#fff;border-radius:12px;">
        <h2 style="margin:0 0 16px;font-size:24px;line-height:1.2;">Great news, ${escapeHtml(params.buyerName)}!</h2>
        <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">Your request for <strong>${escapeHtml(params.listingTitle)}</strong> was accepted.</p>
        <p style="margin:0 0 8px;font-size:16px;line-height:1.6;">Contact the seller on WhatsApp:</p>
        <p style="margin:0 0 16px;font-size:16px;line-height:1.6;"><strong>${escapeHtml(params.sellerName)}</strong> - ${escapeHtml(params.sellerPhone)}</p>
        <p style="margin:0;font-size:14px;line-height:1.6;color:#475569;">Coordinate pickup and payment offline. Campus Exchange does not handle payments.</p>
      </div>
    `
  );
}

function buildRejectedEmailHtml(params: {
  buyerName: string;
  listingTitle: string;
}) {
  return buildEmailShell(
    `Request update: ${params.listingTitle}`,
    `Update on your request for ${params.listingTitle}`,
    `
      <div style="max-width:600px;margin:24px auto;padding:24px;background:#fff;border-radius:12px;">
        <h2 style="margin:0 0 16px;font-size:24px;line-height:1.2;">Hi ${escapeHtml(params.buyerName)},</h2>
        <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">Unfortunately, your request for <strong>${escapeHtml(params.listingTitle)}</strong> was not accepted.</p>
        <p style="margin:0;font-size:16px;line-height:1.6;">Keep browsing the marketplace - more items are listed every day.</p>
      </div>
    `
  );
}

export async function sendRequestAcceptedEmail(params: {
  to: string;
  buyerName: string;
  listingTitle: string;
  sellerName: string;
  sellerPhone: string;
}) {
  await sendEmailNotification({
    to: params.to,
    subject: `Request accepted: ${params.listingTitle}`,
    html: buildAcceptedEmailHtml(params),
  });
}

export async function sendRequestRejectedEmail(params: {
  to: string;
  buyerName: string;
  listingTitle: string;
}) {
  await sendEmailNotification({
    to: params.to,
    subject: `Request update: ${params.listingTitle}`,
    html: buildRejectedEmailHtml(params),
  });
}
