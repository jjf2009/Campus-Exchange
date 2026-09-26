import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/ProfileForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getCurrentUser, isProfileComplete } from "@/lib/auth";

export const metadata = {
  title: "Complete Profile",
};

export default async function ProfileSetupPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (isProfileComplete(user)) redirect("/marketplace");

  return (
    <div className="flex min-h-screen items-center justify-center bg-grid px-4 py-10">
      <Card className="w-full max-w-lg shadow-brutal-lg">
        <CardHeader>
          <CardTitle className="font-display text-3xl font-extrabold">
            One last thing ✌️
          </CardTitle>
          <CardDescription>
            Tell other GEC students a bit about you. Your WhatsApp number is
            shown only to signed-in GEC students who want to buy your items.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm user={user} redirectTo="/marketplace" />
        </CardContent>
      </Card>
    </div>
  );
}
