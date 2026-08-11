"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { AuthCard } from "@/features/auth/auth-card";
import { resetPassword } from "@/features/auth/auth-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/forms/form-field";

const schema = z
  .object({
    password: z.string().min(8, "Use at least 8 characters."),
    password_confirmation: z.string().min(8, "Confirm your password."),
  })
  .refine((values) => values.password === values.password_confirmation, {
    path: ["password_confirmation"],
    message: "Passwords do not match.",
  });

function ResetPasswordForm() {
  const [showPassword, setShowPassword] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email") || "";
  const token = searchParams.get("token") || "";
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { password: "", password_confirmation: "" },
  });

  const mutation = useMutation({
    mutationFn: resetPassword,
    onSuccess: () => {
      toast.success("Password reset successfully.");
      router.replace("/login");
    },
    onError: () => {
      form.setError("root", { message: "The reset link is invalid or expired." });
    },
  });

  return (
    <AuthCard title="Create new password" description="Choose a secure password for your staff account.">
      <form className="space-y-4" onSubmit={form.handleSubmit((values) => mutation.mutate({ ...values, email, token }))}>
        {form.formState.errors.root ? <div className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">{form.formState.errors.root.message}</div> : null}
        {(!email || !token) ? <div className="rounded-lg border border-amber-100 bg-amber-50 px-3 py-2 text-sm text-amber-800">Open this page from the reset link sent to your email.</div> : null}
        <FormField label="New password" error={form.formState.errors.password?.message}>
          <div className="relative">
            <Input type={showPassword ? "text" : "password"} autoComplete="new-password" className="pr-11" {...form.register("password")} />
            <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" onClick={() => setShowPassword((value) => !value)}>
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </FormField>
        <FormField label="Confirm password" error={form.formState.errors.password_confirmation?.message}>
          <Input type={showPassword ? "text" : "password"} autoComplete="new-password" {...form.register("password_confirmation")} />
        </FormField>
        <Button className="w-full" type="submit" disabled={mutation.isPending || !email || !token}>
          {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
          Reset password
        </Button>
        <Link className="block text-center text-sm font-medium text-slate-600 hover:text-slate-950" href="/login">
          Back to login
        </Link>
      </form>
    </AuthCard>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
