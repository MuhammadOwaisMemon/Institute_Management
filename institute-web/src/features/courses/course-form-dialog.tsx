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
import { createCourse, updateCourse, type Course, type CoursePayload } from "./courses-api";

const schema = z.object({
  name: z.string().min(2, "Course name is required.").max(150),
  code: z.union([z.string().max(50), z.literal("")]).transform((value) => (value === "" ? null : value)),
  description: z.union([z.string().max(1000), z.literal("")]).transform((value) => (value === "" ? null : value)),
  duration_value: z.coerce.number().int().min(1).max(999).nullable().or(z.literal("").transform(() => null)),
  duration_unit: z.union([z.enum(["days", "weeks", "months"]), z.literal("")]).transform((value) => (value === "" ? null : value)),
  standard_fee: z.coerce.number().min(0, "Standard fee is required."),
  admission_fee: z.coerce.number().min(0),
  status: z.enum(["active", "inactive"]),
});

type CourseFormInput = z.input<typeof schema>;
type CourseFormValues = z.output<typeof schema>;

export function CourseFormDialog({ course, children }: { course?: Course; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const form = useForm<CourseFormInput, unknown, CourseFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      code: "",
      description: "",
      duration_value: "",
      duration_unit: "",
      standard_fee: 0,
      admission_fee: 0,
      status: "active",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: course?.name ?? "",
        code: course?.code ?? "",
        description: course?.description ?? "",
        duration_value: course?.duration_value ?? "",
        duration_unit: course?.duration_unit ?? "",
        standard_fee: Number(course?.standard_fee ?? 0),
        admission_fee: Number(course?.admission_fee ?? 0),
        status: course?.status ?? "active",
      });
    }
  }, [course, form, open]);

  const mutation = useMutation({
    mutationFn: (payload: CoursePayload) => (course ? updateCourse(course.id, payload) : createCourse(payload)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      if (course) {
        queryClient.invalidateQueries({ queryKey: ["course", course.id] });
      }
      toast.success(course ? "Course updated." : "Course created.");
      setOpen(false);
    },
    onError: () => toast.error("Could not save course."),
  });

  function onSubmit(values: CourseFormValues) {
    mutation.mutate({
      name: values.name.trim(),
      code: values.code,
      description: values.description,
      duration_value: values.duration_value,
      duration_unit: values.duration_unit,
      standard_fee: values.standard_fee,
      admission_fee: values.admission_fee,
      status: values.status,
    });
  }

  const errors = form.formState.errors;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogTitle className="text-lg font-semibold text-slate-950">{course ? "Edit course" : "Create course"}</DialogTitle>
        <form className="mt-5 grid gap-4 md:grid-cols-2" onSubmit={form.handleSubmit(onSubmit)}>
          <FormField label="Course name" error={errors.name?.message}>
            <Input {...form.register("name")} />
          </FormField>
          <FormField label="Code" error={errors.code?.message}>
            <Input {...form.register("code")} />
          </FormField>
          <FormField label="Duration value" error={errors.duration_value?.message}>
            <Input type="number" min="1" {...form.register("duration_value")} />
          </FormField>
          <FormField label="Duration unit" error={errors.duration_unit?.message}>
            <select className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm shadow-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100" {...form.register("duration_unit")}>
              <option value="">Not set</option>
              <option value="days">Days</option>
              <option value="weeks">Weeks</option>
              <option value="months">Months</option>
            </select>
          </FormField>
          <FormField label="Standard fee" error={errors.standard_fee?.message}>
            <Input type="number" min="0" step="0.01" {...form.register("standard_fee")} />
          </FormField>
          <FormField label="Admission fee" error={errors.admission_fee?.message}>
            <Input type="number" min="0" step="0.01" {...form.register("admission_fee")} />
          </FormField>
          <FormField label="Status" error={errors.status?.message}>
            <select className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm shadow-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100" {...form.register("status")}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </FormField>
          <FormField label="Description" error={errors.description?.message} className="md:col-span-2">
            <textarea className="min-h-24 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100" {...form.register("description")} />
          </FormField>
          <div className="flex justify-end md:col-span-2">
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save course
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
