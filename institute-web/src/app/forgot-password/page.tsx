"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Loader2, Mail } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { AuthCard } from "@/features/auth/auth-card";
import { forgotPassword } from "@/features/auth/auth-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/forms/form-field";

const schema = z.object({
  email: z.string().email("Enter a valid email address."),
});

export default function ForgotPasswordPage() {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  const mutation = useMutation({
    mutationFn: forgotPassword,
    onSuccess: () => toast.success("Check your email for a reset link."),
  });

  return (
    <AuthCard title="Reset password" description="Enter your staff email and we will send a secure reset link.">
      <form className="space-y-4" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
        <FormField label="Email" error={form.formState.errors.email?.message}>
          <Input type="email" autoComplete="email" {...form.register("email")} />
        </FormField>
        <Button className="w-full" type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
          Send reset link
        </Button>
        <Link className="block text-center text-sm font-medium text-slate-600 hover:text-slate-950" href="/login">
          Back to login
        </Link>
      </form>
    </AuthCard>
  );
}
