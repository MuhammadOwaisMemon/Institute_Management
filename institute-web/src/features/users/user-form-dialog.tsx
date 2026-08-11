"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Save } from "lucide-react";
import { ReactNode, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { FormField, FieldHint } from "@/components/forms/form-field";
import { createUser, updateUser, type ManagedUser, type UserPayload } from "./users-api";

const schema = z
  .object({
    name: z.string().min(2, "Name is required.").max(150),
    email: z.string().email("Use a valid email.").max(150),
    phone: z.string().max(30).regex(/^[0-9+\-\s()]*$/, "Use a valid phone number.").nullable(),
    role: z.enum(["admin", "receptionist", "teacher"]),
    status: z.enum(["active", "inactive"]),
    password: z.string().optional(),
    password_confirmation: z.string().optional(),
  })
  .refine((values) => !values.password || values.password.length >= 8, {
    path: ["password"],
    message: "Use at least 8 characters.",
  })
  .refine((values) => values.password === values.password_confirmation, {
    path: ["password_confirmation"],
    message: "Passwords do not match.",
  });

function emptyToNull(value: string | null | undefined) {
  return value && value.trim() !== "" ? value.trim() : null;
}

export function UserFormDialog({ user, children }: { user?: ManagedUser; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      phone: null,
      role: "receptionist",
      status: "active",
      password: "",
      password_confirmation: "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: user?.name ?? "",
        email: user?.email ?? "",
        phone: user?.phone ?? null,
        role: user?.role ?? "receptionist",
        status: user?.status ?? "active",
        password: "",
        password_confirmation: "",
      });
    }
  }, [form, open, user]);

  const mutation = useMutation({
    mutationFn: (payload: UserPayload) => (user ? updateUser(user.id, payload) : createUser(payload)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success(user ? "User updated." : "User added.");
      setOpen(false);
    },
    onError: () => toast.error("Could not save user."),
  });

  function onSubmit(values: z.infer<typeof schema>) {
    if (!user && !values.password) {
      form.setError("password", { message: "Password is required." });
      return;
    }

    const payload: UserPayload = {
      name: values.name.trim(),
      email: values.email.trim(),
      phone: emptyToNull(values.phone),
      role: values.role,
      status: values.status,
    };

    if (values.password) {
      payload.password = values.password;
      payload.password_confirmation = values.password_confirmation;
    }

    mutation.mutate(payload);
  }

  const errors = form.formState.errors;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogTitle className="text-lg font-semibold text-slate-950">{user ? "Edit user" : "Add user"}</DialogTitle>
        <form className="mt-5 grid gap-4 md:grid-cols-2" onSubmit={form.handleSubmit(onSubmit)}>
          <FormField label="Name" error={errors.name?.message}>
            <Input {...form.register("name")} />
          </FormField>
          <FormField label="Email" error={errors.email?.message}>
            <Input type="email" {...form.register("email")} />
          </FormField>
          <FormField label="Phone" error={errors.phone?.message}>
            <Input {...form.register("phone")} />
          </FormField>
          <FormField label="Role" error={errors.role?.message}>
            <select className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm shadow-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100" {...form.register("role")}>
              <option value="admin">Admin</option>
              <option value="receptionist">Receptionist</option>
              <option value="teacher">Teacher</option>
            </select>
          </FormField>
          <FormField label="Status" error={errors.status?.message}>
            <select className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm shadow-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100" {...form.register("status")}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </FormField>
          <div />
          <FormField label={user ? "New password" : "Password"} error={errors.password?.message}>
            <Input type="password" autoComplete="new-password" {...form.register("password")} />
            {user ? <FieldHint>Leave blank to keep the current password.</FieldHint> : null}
          </FormField>
          <FormField label="Confirm password" error={errors.password_confirmation?.message}>
            <Input type="password" autoComplete="new-password" {...form.register("password_confirmation")} />
          </FormField>
          <div className="flex justify-end md:col-span-2">
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save user
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
