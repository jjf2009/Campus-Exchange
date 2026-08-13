"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Phone, GraduationCap, Calendar } from "lucide-react";
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
import { isValidPhone, normalizePhone } from "@/lib/validations";
import type { DbUser } from "@/db/schema";

interface ProfileFormProps {
  user: DbUser;
  redirectTo?: string;
}

type FieldErrors = {
  branch?: string;
  year?: string;
  phone?: string;
};

export function ProfileForm({
  user,
  redirectTo = "/",
}: ProfileFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [branch, setBranch] = useState(user.branch ?? "");
  const [year, setYear] = useState(user.year ?? "");
  const [phone, setPhone] = useState(() => normalizePhone(user.phone ?? ""));
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState(false);

  const canSubmit = useMemo(() => {
    return Boolean(branch && year && isValidPhone(phone));
  }, [branch, year, phone]);

  function validate(): FieldErrors {
    const next: FieldErrors = {};
    if (!branch) next.branch = "Please select your branch";
    if (!year) next.year = "Please select your year";
    if (!phone) {
      next.phone = "Please enter your WhatsApp number";
    } else if (!isValidPhone(phone)) {
      next.phone = "Must be exactly 10 digits";
    }
    return next;
  }

  function handlePhoneChange(value: string) {
    const digits = normalizePhone(value).slice(0, 10);
    setPhone(digits);
    if (touched) {
      setErrors((prev) => ({
        ...prev,
        phone:
          digits.length === 10 ? undefined : "Must be exactly 10 digits",
      }));
    }
  }

  function handleSubmit(formData: FormData) {
    setTouched(true);
    const nextErrors = validate();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      toast.error(
        nextErrors.branch ??
          nextErrors.year ??
          nextErrors.phone ??
          "Please fill in all required fields"
      );
      return;
    }

    formData.set("branch", branch);
    formData.set("year", year);
    formData.set("phone", phone);

    startTransition(async () => {
      try {
        const result = await updateProfile(formData);
        if (result.success) {
          toast.success("Profile saved — welcome to GEC Exchange!");
          router.push(redirectTo);
          router.refresh();
        } else {
          toast.error(result.error ?? "Failed to save profile");
        }
      } catch (error) {
        console.error("ProfileForm submit error:", error);
        toast.error("Something went wrong. Please try again.");
      }
    });
  }

  return (
    <form action={handleSubmit} className="space-y-6" noValidate>
      {/* Name + Email — read-only, show with reduced emphasis */}
      <div className="space-y-1 rounded-xl bg-muted/40 px-4 py-3">
        <p className="text-xs text-muted-foreground">Signed in as</p>
        <p className="font-semibold text-foreground">{user.name}</p>
        <p className="text-sm text-muted-foreground">{user.email}</p>
      </div>

      {/* Branch */}
      <div className="space-y-2">
        <Label htmlFor="branch" className="flex items-center gap-1.5 text-sm font-medium">
          <GraduationCap className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          Branch
          <span className="text-destructive" aria-hidden="true">*</span>
        </Label>
        <Select
          value={branch || null}
          onValueChange={(value) => {
            const next = value ?? "";
            setBranch(next);
            setErrors((prev) => ({
              ...prev,
              branch: next ? undefined : "Please select your branch",
            }));
          }}
        >
          <SelectTrigger
            id="branch"
            className="w-full"
            aria-invalid={Boolean(errors.branch)}
          >
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
        {errors.branch ? (
          <p className="text-xs text-destructive" role="alert">
            {errors.branch}
          </p>
        ) : null}
      </div>

      {/* Year */}
      <div className="space-y-2">
        <Label htmlFor="year" className="flex items-center gap-1.5 text-sm font-medium">
          <Calendar className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          Year
          <span className="text-destructive" aria-hidden="true">*</span>
        </Label>
        <Select
          value={year || null}
          onValueChange={(value) => {
            const next = value ?? "";
            setYear(next);
            setErrors((prev) => ({
              ...prev,
              year: next ? undefined : "Please select your year",
            }));
          }}
        >
          <SelectTrigger
            id="year"
            className="w-full"
            aria-invalid={Boolean(errors.year)}
          >
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
        {errors.year ? (
          <p className="text-xs text-destructive" role="alert">
            {errors.year}
          </p>
        ) : null}
      </div>

      {/* WhatsApp number */}
      <div className="space-y-2">
        <Label
          htmlFor="phone"
          className="flex items-center gap-1.5 text-sm font-medium"
        >
          <Phone className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          WhatsApp number
          <span className="text-destructive" aria-hidden="true">*</span>
        </Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground select-none">
            +91
          </span>
          <Input
            id="phone"
            name="phone"
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            required
            maxLength={10}
            pattern="[0-9]{10}"
            value={phone}
            onChange={(e) => handlePhoneChange(e.target.value)}
            onBlur={() => setTouched(true)}
            placeholder="9876543210"
            aria-invalid={Boolean(errors.phone)}
            aria-describedby="phone-help"
            className="pl-11"
          />
          {phone.length > 0 && (
            <span
              className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs tabular-nums ${
                phone.length === 10
                  ? "text-emerald-600"
                  : "text-muted-foreground"
              }`}
              aria-hidden="true"
            >
              {phone.length}/10
            </span>
          )}
        </div>
        <p id="phone-help" className="text-xs text-muted-foreground">
          Only shared with a buyer after you accept their request — never shown
          publicly.
        </p>
        {errors.phone ? (
          <p className="text-xs text-destructive" role="alert">
            {errors.phone}
          </p>
        ) : null}
      </div>

      <Button
        type="submit"
        className="w-full gap-2"
        size="lg"
        disabled={isPending || !canSubmit}
      >
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Saving…
          </>
        ) : (
          "Save and continue →"
        )}
      </Button>
    </form>
  );
}
