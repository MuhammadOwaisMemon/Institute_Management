"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Save } from "lucide-react";
import { ReactNode, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { FormField } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { getCourses } from "@/features/courses/courses-api";
import { getTeachers } from "@/features/teachers/teachers-api";
import { createBatch, updateBatch, type Batch, type BatchPayload, type Weekday } from "./batches-api";

const weekdays: { label: string; value: Weekday }[] = [
  { label: "Monday", value: "monday" },
  { label: "Tuesday", value: "tuesday" },
  { label: "Wednesday", value: "wednesday" },
  { label: "Thursday", value: "thursday" },
  { label: "Friday", value: "friday" },
  { label: "Saturday", value: "saturday" },
  { label: "Sunday", value: "sunday" },
];

const schema = z.object({
  course_id: z.coerce.number().min(1, "Course is required."),
  teacher_id: z.coerce.number().nullable().or(z.literal("").transform(() => null)),
  name: z.string().min(2, "Batch name is required.").max(150),
  batch_code: z.union([z.string().max(50), z.literal("")]).transform((value) => (value === "" ? null : value)),
  start_date: z.string().min(1, "Start date is required."),
  expected_end_date: z.union([z.string(), z.literal("")]).transform((value) => (value === "" ? null : value)),
  start_time: z.string().min(1, "Start time is required."),
  end_time: z.string().min(1, "End time is required."),
  capacity: z.coerce.number().int().min(1).max(10000).nullable().or(z.literal("").transform(() => null)),
  room: z.union([z.string().max(100), z.literal("")]).transform((value) => (value === "" ? null : value)),
  weekdays: z.array(z.enum(["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"])).min(1, "Select at least one weekday."),
  status: z.enum(["upcoming", "active", "completed", "cancelled"]),
  notes: z.union([z.string().max(1000), z.literal("")]).transform((value) => (value === "" ? null : value)),
});

type BatchFormInput = z.input<typeof schema>;
type BatchFormValues = z.output<typeof schema>;

export function BatchFormDialog({ batch, children }: { batch?: Batch; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const coursesQuery = useQuery({ queryKey: ["courses", "active-options"], queryFn: () => getCourses({ status: "active" }), enabled: open });
  const teachersQuery = useQuery({ queryKey: ["teachers", "active-options"], queryFn: () => getTeachers({ status: "active" }), enabled: open });
  const form = useForm<BatchFormInput, unknown, BatchFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      course_id: 0,
      teacher_id: "",
      name: "",
      batch_code: "",
      start_date: "",
      expected_end_date: "",
      start_time: "",
      end_time: "",
      capacity: "",
      room: "",
      weekdays: [],
      status: "upcoming",
      notes: "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        course_id: batch?.course_id ?? 0,
        teacher_id: batch?.teacher_id ?? "",
        name: batch?.name ?? "",
        batch_code: batch?.batch_code ?? "",
        start_date: batch?.start_date ?? "",
        expected_end_date: batch?.expected_end_date ?? "",
        start_time: batch?.start_time ?? "",
        end_time: batch?.end_time ?? "",
        capacity: batch?.capacity ?? "",
        room: batch?.room ?? "",
        weekdays: batch?.weekdays ?? [],
        status: batch?.status ?? "upcoming",
        notes: batch?.notes ?? "",
      });
    }
  }, [batch, form, open]);

  const mutation = useMutation({
    mutationFn: (payload: BatchPayload) => (batch ? updateBatch(batch.id, payload) : createBatch(payload)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["batches"] });
      if (batch) {
        queryClient.invalidateQueries({ queryKey: ["batch", batch.id] });
      }
      toast.success(batch ? "Batch updated." : "Batch created.");
      setOpen(false);
    },
    onError: () => toast.error("Could not save batch."),
  });

  function onSubmit(values: BatchFormValues) {
    if (values.expected_end_date && values.expected_end_date < values.start_date) {
      form.setError("expected_end_date", { message: "End date must be after start date." });
      return;
    }

    if (values.end_time <= values.start_time) {
      form.setError("end_time", { message: "End time must be after start time." });
      return;
    }

    mutation.mutate(values);
  }

  const errors = form.formState.errors;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogTitle className="text-lg font-semibold text-slate-950">{batch ? "Edit batch" : "Create batch"}</DialogTitle>
        <form className="mt-5 grid gap-4 md:grid-cols-2" onSubmit={form.handleSubmit(onSubmit)}>
          <FormField label="Course" error={errors.course_id?.message}>
            <select className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm shadow-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100" {...form.register("course_id")}>
              <option value={0}>Select course</option>
              {coursesQuery.data?.data.map((course) => <option key={course.id} value={course.id}>{course.name}</option>)}
            </select>
          </FormField>
          <FormField label="Teacher" error={errors.teacher_id?.message}>
            <select className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm shadow-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100" {...form.register("teacher_id")}>
              <option value="">Not assigned</option>
              {teachersQuery.data?.data.map((teacher) => <option key={teacher.id} value={teacher.id}>{teacher.full_name}</option>)}
            </select>
          </FormField>
          <FormField label="Batch name" error={errors.name?.message}><Input {...form.register("name")} /></FormField>
          <FormField label="Batch code" error={errors.batch_code?.message}><Input {...form.register("batch_code")} /></FormField>
          <FormField label="Start date" error={errors.start_date?.message}><Input type="date" {...form.register("start_date")} /></FormField>
          <FormField label="Expected end date" error={errors.expected_end_date?.message}><Input type="date" {...form.register("expected_end_date")} /></FormField>
          <FormField label="Start time" error={errors.start_time?.message}><Input type="time" {...form.register("start_time")} /></FormField>
          <FormField label="End time" error={errors.end_time?.message}><Input type="time" {...form.register("end_time")} /></FormField>
          <FormField label="Capacity" error={errors.capacity?.message}><Input type="number" min="1" {...form.register("capacity")} /></FormField>
          <FormField label="Room" error={errors.room?.message}><Input {...form.register("room")} /></FormField>
          <FormField label="Status" error={errors.status?.message}>
            <select className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm shadow-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100" {...form.register("status")}>
              <option value="upcoming">Upcoming</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </FormField>
          <FormField label="Weekdays" error={errors.weekdays?.message} className="md:col-span-2">
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {weekdays.map((day) => (
                <label key={day.value} className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700">
                  <input type="checkbox" value={day.value} {...form.register("weekdays")} />
                  {day.label}
                </label>
              ))}
            </div>
          </FormField>
          <FormField label="Notes" error={errors.notes?.message} className="md:col-span-2">
            <textarea className="min-h-24 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100" {...form.register("notes")} />
          </FormField>
          <div className="flex justify-end md:col-span-2">
            <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save batch</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
