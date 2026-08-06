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
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-10">
      <Card className="w-full max-w-lg shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl">Complete your profile</CardTitle>
          <CardDescription>
            Tell other GEC students a bit about you. Your WhatsApp number is
            only revealed after you accept a buyer.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm user={user} redirectTo="/marketplace" />
        </CardContent>
      </Card>
    </div>
  );
}
