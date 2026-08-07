import { RequestAcceptedEmail } from "@/emails/request-accepted";
import { RequestRejectedEmail } from "@/emails/request-rejected";
import { sendEmailNotification } from "@/lib/notifications/notification-service";

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
    element: (
      <RequestAcceptedEmail
        buyerName={params.buyerName}
        listingTitle={params.listingTitle}
        sellerName={params.sellerName}
        sellerPhone={params.sellerPhone}
      />
    ),
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
    element: (
      <RequestRejectedEmail
        buyerName={params.buyerName}
        listingTitle={params.listingTitle}
      />
    ),
  });
}
