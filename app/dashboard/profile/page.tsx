import { ProfileForm } from "@/components/ProfileForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireCompleteProfile } from "@/lib/auth";
import { formatFullDate } from "@/utils/formatDate";

export const metadata = {
  title: "Profile",
};

export default async function ProfilePage() {
  const user = await requireCompleteProfile();

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Your profile</CardTitle>
          <CardDescription>
            Joined {formatFullDate(user.createdAt)}. Update branch, year, or
            WhatsApp number anytime.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm user={user} redirectTo="/dashboard/profile" />
        </CardContent>
      </Card>
    </div>
  );
}
