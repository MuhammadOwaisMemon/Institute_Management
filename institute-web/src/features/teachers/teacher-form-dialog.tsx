"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Save } from "lucide-react";
import { ReactNode, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { FormField } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { createTeacher, updateTeacher, type Teacher, type TeacherPayload } from "./teachers-api";

const schema = z.object({
  user_id: z.number().nullable(),
  employee_code: z.union([z.string().max(50), z.literal("")]).transform((value) => (value === "" ? null : value)),
  first_name: z.string().min(2, "First name is required.").max(100),
  last_name: z.union([z.string().max(100), z.literal("")]).transform((value) => (value === "" ? null : value)),
  gender: z.union([z.enum(["male", "female", "other"]), z.literal("")]).transform((value) => (value === "" ? null : value)),
  phone: z.string().min(1, "Phone is required.").max(30).regex(/^[0-9+\-\s()]+$/, "Use a valid phone number."),
  email: z.union([z.string().email("Use a valid email.").max(150), z.literal("")]).transform((value) => (value === "" ? null : value)),
  cnic: z.union([z.string().max(20).regex(/^[0-9\-\s]*$/, "Use a valid CNIC."), z.literal("")]).transform((value) => (value === "" ? null : value)),
  address: z.union([z.string().max(500), z.literal("")]).transform((value) => (value === "" ? null : value)),
  joining_date: z.union([z.string(), z.literal("")]).transform((value) => (value === "" ? null : value)),
  status: z.enum(["active", "inactive"]),
  notes: z.union([z.string().max(1000), z.literal("")]).transform((value) => (value === "" ? null : value)),
});

function clean(value: string | null | undefined) {
  return value && value.trim() !== "" ? value.trim() : null;
}

type TeacherFormInput = z.input<typeof schema>;
type TeacherFormValues = z.output<typeof schema>;

export function TeacherFormDialog({ teacher, children }: { teacher?: Teacher; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const form = useForm<TeacherFormInput, unknown, TeacherFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      user_id: null,
      employee_code: "",
      first_name: "",
      last_name: "",
      gender: "",
      phone: "",
      email: "",
      cnic: "",
      address: "",
      joining_date: "",
      status: "active",
      notes: "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        user_id: teacher?.user_id ?? null,
        employee_code: teacher?.employee_code ?? "",
        first_name: teacher?.first_name ?? "",
        last_name: teacher?.last_name ?? "",
        gender: teacher?.gender ?? "",
        phone: teacher?.phone ?? "",
        email: teacher?.email ?? "",
        cnic: teacher?.cnic ?? "",
        address: teacher?.address ?? "",
        joining_date: teacher?.joining_date ?? "",
        status: teacher?.status ?? "active",
        notes: teacher?.notes ?? "",
      });
    }
  }, [form, open, teacher]);

  const mutation = useMutation({
    mutationFn: (payload: TeacherPayload) => (teacher ? updateTeacher(teacher.id, payload) : createTeacher(payload)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
      if (teacher) {
        queryClient.invalidateQueries({ queryKey: ["teacher", teacher.id] });
      }
      toast.success(teacher ? "Teacher updated." : "Teacher added.");
      setOpen(false);
    },
    onError: () => toast.error("Could not save teacher."),
  });

  function onSubmit(values: TeacherFormValues) {
    mutation.mutate({
      user_id: values.user_id,
      employee_code: clean(values.employee_code),
      first_name: values.first_name.trim(),
      last_name: clean(values.last_name),
      gender: values.gender,
      phone: values.phone.trim(),
      email: clean(values.email),
      cnic: clean(values.cnic),
      address: clean(values.address),
      joining_date: clean(values.joining_date),
      status: values.status,
      notes: clean(values.notes),
    });
  }

  const errors = form.formState.errors;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogTitle className="text-lg font-semibold text-slate-950">{teacher ? "Edit teacher" : "Add teacher"}</DialogTitle>
        <form className="mt-5 grid gap-4 md:grid-cols-2" onSubmit={form.handleSubmit(onSubmit)}>
          <FormField label="Employee code" error={errors.employee_code?.message}>
            <Input {...form.register("employee_code")} />
          </FormField>
          <FormField label="Status" error={errors.status?.message}>
            <select className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm shadow-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100" {...form.register("status")}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </FormField>
          <FormField label="First name" error={errors.first_name?.message}>
            <Input {...form.register("first_name")} />
          </FormField>
          <FormField label="Last name" error={errors.last_name?.message}>
            <Input {...form.register("last_name")} />
          </FormField>
          <FormField label="Gender" error={errors.gender?.message}>
            <select className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm shadow-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100" {...form.register("gender")}>
              <option value="">Not set</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </FormField>
          <FormField label="Joining date" error={errors.joining_date?.message}>
            <Input type="date" {...form.register("joining_date")} />
          </FormField>
          <FormField label="Phone" error={errors.phone?.message}>
            <Input {...form.register("phone")} />
          </FormField>
          <FormField label="Email" error={errors.email?.message}>
            <Input type="email" {...form.register("email")} />
          </FormField>
          <FormField label="CNIC" error={errors.cnic?.message}>
            <Input {...form.register("cnic")} />
          </FormField>
          <FormField label="Address" error={errors.address?.message}>
            <Input {...form.register("address")} />
          </FormField>
          <FormField label="Notes" error={errors.notes?.message} className="md:col-span-2">
            <textarea className="min-h-24 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100" {...form.register("notes")} />
          </FormField>
          <div className="flex justify-end md:col-span-2">
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save teacher
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
