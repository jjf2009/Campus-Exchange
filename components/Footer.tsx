import { LogoMark } from "@/components/brand";
import { APP_NAME } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="border-t-2 border-ink bg-ink text-paper">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <LogoMark />
          <div>
            <p className="font-display text-lg font-extrabold">{APP_NAME}</p>
            <p className="text-sm text-paper/70">
              Made by GEC students, for GEC students.
            </p>
          </div>
        </div>
        <p className="font-display text-sm font-bold uppercase tracking-wide text-lime">
          No payments online · Chat on WhatsApp · Meet on campus
        </p>
      </div>
    </footer>
  );
}
