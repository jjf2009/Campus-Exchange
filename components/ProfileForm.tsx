"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { updateProfile } from "@/actions/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BRANCHES, YEARS } from "@/lib/constants";
import type { DbUser } from "@/db/schema";

interface ProfileFormProps {
  user: DbUser;
  redirectTo?: string;
}

export function ProfileForm({ user, redirectTo = "/marketplace" }: ProfileFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [branch, setBranch] = useState(user.branch ?? "");
  const [year, setYear] = useState(user.year ?? "");

  function handleSubmit(formData: FormData) {
    formData.set("branch", branch);
    formData.set("year", year);


    startTransition(async () => {
      const result = await updateProfile(formData);
      if (result.success) {
        toast.success("Profile saved!");
        router.push(redirectTo);
        router.refresh();
      } else {
        toast.error(result.error ?? "Failed to save profile");
      }
    });
  }

  return (
    <form action={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label>Name</Label>
        <Input value={user.name} disabled />
      </div>

      <div className="space-y-2">
        <Label>Email</Label>
        <Input value={user.email} disabled />
      </div>

      <div className="space-y-2">
        <Label>Branch</Label>
        <Select
          value={branch || null}
          onValueChange={(value) => setBranch(value ?? "")}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select your branch" />
          </SelectTrigger>
          <SelectContent>
            {BRANCHES.map((b) => (
              <SelectItem key={b} value={b}>
                {b}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Year</Label>
        <Select
          value={year || null}
          onValueChange={(value) => setYear(value ?? "")}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select your year" />
          </SelectTrigger>
          <SelectContent>
            {YEARS.map((y) => (
              <SelectItem key={y} value={y}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">WhatsApp Number</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          required
          defaultValue={user.phone ?? ""}
          placeholder="+91 98765 43210"
        />
        <p className="text-xs text-muted-foreground">
          Only shared with a buyer after you accept their request.
        </p>
      </div>

      <Button
        type="submit"
        className="w-full"
        size="lg"
        disabled={isPending || !branch || !year}
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving…
          </>
        ) : (
          "Save Profile"
        )}
      </Button>
    </form>
  );
}
