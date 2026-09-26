import { APP_NAME } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-center text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:text-left">
        <p>
          © {new Date().getFullYear()} {APP_NAME}. For GEC students only.
        </p>
        <p>No payments online — chat on WhatsApp and meet on campus.</p>
      </div>
    </footer>
  );
}
