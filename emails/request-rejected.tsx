import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from "@react-email/components";

interface RequestRejectedEmailProps {
  buyerName: string;
  listingTitle: string;
}

export function RequestRejectedEmail({
  buyerName,
  listingTitle,
}: RequestRejectedEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Update on your request for {listingTitle}</Preview>
      <Body style={{ fontFamily: "sans-serif", background: "#f8fafc" }}>
        <Container
          style={{
            background: "#fff",
            padding: "24px",
            borderRadius: "12px",
            margin: "24px auto",
          }}
        >
          <Heading as="h2">Hi {buyerName},</Heading>
          <Text>
            Unfortunately, your request for <strong>{listingTitle}</strong> was
            not accepted.
          </Text>
          <Text>
            Keep browsing the marketplace — more items are listed every day.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default RequestRejectedEmail;
