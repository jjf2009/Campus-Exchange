import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-muted-foreground">
        That page or listing could not be found.
      </p>
      <Button render={<Link href="/" />} nativeButton={false}>
              Back to marketplace
            </Button>
    </div>
  );
}
