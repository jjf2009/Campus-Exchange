import { ProfileForm } from "@/components/ProfileForm";
import { requireCompleteProfile } from "@/lib/auth";
import { formatFullDate } from "@/utils/formatDate";

export const metadata = {
  title: "My Profile — GEC Exchange",
};

export default async function ProfilePage() {
  const user = await requireCompleteProfile();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight">Your profile</h2>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Joined GEC Exchange on {formatFullDate(user.createdAt)}. You can update
          your details anytime below.
        </p>
      </div>

      {/* Form container */}
      <div className="rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
        <ProfileForm user={user} redirectTo="/dashboard/profile" />
      </div>
    </div>
  );
}
