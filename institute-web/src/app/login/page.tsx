"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff, Loader2, LogIn } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { AuthCard } from "@/features/auth/auth-card";
import { login } from "@/features/auth/auth-api";
import { setAuthUser } from "@/features/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/forms/form-field";

const schema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: (user) => {
      setAuthUser(queryClient, user);
      toast.success("Welcome back.");
      router.replace(searchParams.get("next") || "/");
    },
    onError: () => {
      form.setError("root", { message: "Invalid email or password." });
    },
  });

  return (
    <AuthCard title="Sign in" description="Access your institute dashboard securely.">
      <form className="space-y-4" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
        {form.formState.errors.root ? <div className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">{form.formState.errors.root.message}</div> : null}
        <FormField label="Email" error={form.formState.errors.email?.message}>
          <Input type="email" autoComplete="email" {...form.register("email")} />
        </FormField>
        <FormField label="Password" error={form.formState.errors.password?.message}>
          <div className="relative">
            <Input type={showPassword ? "text" : "password"} autoComplete="current-password" className="pr-11" {...form.register("password")} />
            <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" onClick={() => setShowPassword((value) => !value)}>
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </FormField>
        <div className="flex justify-end">
          <Link className="text-sm font-medium text-slate-700 hover:text-slate-950" href="/forgot-password">
            Forgot password?
          </Link>
        </div>
        <Button className="w-full" type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
          Sign in
        </Button>
      </form>
    </AuthCard>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
