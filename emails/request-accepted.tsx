import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from "@react-email/components";

interface RequestAcceptedEmailProps {
  buyerName: string;
  listingTitle: string;
  sellerName: string;
  sellerPhone: string;
}

export function RequestAcceptedEmail({
  buyerName,
  listingTitle,
  sellerName,
  sellerPhone,
}: RequestAcceptedEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your request for {listingTitle} was accepted</Preview>
      <Body style={{ fontFamily: "sans-serif", background: "#f8fafc" }}>
        <Container
          style={{
            background: "#fff",
            padding: "24px",
            borderRadius: "12px",
            margin: "24px auto",
          }}
        >
          <Heading as="h2">Great news, {buyerName}!</Heading>
          <Text>
            Your request for <strong>{listingTitle}</strong> was accepted.
          </Text>
          <Text>Contact the seller on WhatsApp:</Text>
          <Text>
            <strong>{sellerName}</strong> — {sellerPhone}
          </Text>
          <Text>
            Coordinate pickup and payment offline. GEC Exchange does not handle
            payments.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default RequestAcceptedEmail;
