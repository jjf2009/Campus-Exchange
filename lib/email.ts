import { Resend } from "resend";
import { APP_NAME } from "@/lib/constants";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

export async function sendRequestAcceptedEmail(params: {
  to: string;
  buyerName: string;
  listingTitle: string;
  sellerName: string;
  sellerPhone: string;
}) {
  const resend = getResend();
  if (!resend) return;

  try {
    await resend.emails.send({
      from: `${APP_NAME} <onboarding@resend.dev>`,
      to: params.to,
      subject: `Request accepted: ${params.listingTitle}`,
      html: `
        <h2>Great news, ${params.buyerName}!</h2>
        <p>Your request for <strong>${params.listingTitle}</strong> was accepted.</p>
        <p>Contact the seller on WhatsApp:</p>
        <p><strong>${params.sellerName}</strong> — ${params.sellerPhone}</p>
        <p>Coordinate pickup and payment offline. ${APP_NAME} does not handle payments.</p>
      `,
    });
  } catch (error) {
    console.error("Failed to send accepted email:", error);
  }
}

export async function sendRequestRejectedEmail(params: {
  to: string;
  buyerName: string;
  listingTitle: string;
}) {
  const resend = getResend();
  if (!resend) return;

  try {
    await resend.emails.send({
      from: `${APP_NAME} <onboarding@resend.dev>`,
      to: params.to,
      subject: `Request update: ${params.listingTitle}`,
      html: `
        <h2>Hi ${params.buyerName},</h2>
        <p>Unfortunately, your request for <strong>${params.listingTitle}</strong> was not accepted.</p>
        <p>Keep browsing the marketplace — more items are listed every day.</p>
      `,
    });
  } catch (error) {
    console.error("Failed to send rejected email:", error);
  }
}
