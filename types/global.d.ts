export {};

declare global {
  // eslint-disable-next-line no-var
  var __E2E_EMAIL_EVENTS__:
    | Array<{
        to: string;
        subject: string;
        html: string;
        createdAt: string;
      }>
    | undefined;
}

