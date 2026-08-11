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
import { createStudent, updateStudent, type Student, type StudentPayload } from "./students-api";

const emptyNull = (max: number) => z.union([z.string().max(max), z.literal("")]).transform((v) => (v === "" ? null : v));
const schema = z.object({
  first_name: z.string().min(2, "First name is required.").max(100),
  last_name: emptyNull(100),
  father_guardian_name: emptyNull(150),
  gender: z.union([z.enum(["male", "female", "other"]), z.literal("")]).transform((v) => (v === "" ? null : v)),
  date_of_birth: z.union([z.string(), z.literal("")]).transform((v) => (v === "" ? null : v)),
  cnic_bform: emptyNull(20),
  phone: z.string().min(1, "Phone is required.").max(30),
  alternate_phone: emptyNull(30),
  guardian_phone: emptyNull(30),
  email: z.union([z.string().email().max(150), z.literal("")]).transform((v) => (v === "" ? null : v)),
  address: emptyNull(500),
  city: emptyNull(100),
  joining_date: z.string().min(1, "Joining date is required."),
  status: z.enum(["active", "completed", "dropped", "inactive"]),
  notes: emptyNull(1000),
});
type InputValues = z.input<typeof schema>;
type Values = z.output<typeof schema>;

export function StudentFormDialog({ student, children }: { student?: Student; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const form = useForm<InputValues, unknown, Values>({
    resolver: zodResolver(schema),
    defaultValues: { first_name: "", last_name: "", father_guardian_name: "", gender: "", date_of_birth: "", cnic_bform: "", phone: "", alternate_phone: "", guardian_phone: "", email: "", address: "", city: "", joining_date: new Date().toISOString().slice(0, 10), status: "active", notes: "" },
  });
  useEffect(() => {
    if (open) form.reset({ first_name: student?.first_name ?? "", last_name: student?.last_name ?? "", father_guardian_name: student?.father_guardian_name ?? "", gender: student?.gender ?? "", date_of_birth: student?.date_of_birth ?? "", cnic_bform: student?.cnic_bform ?? "", phone: student?.phone ?? "", alternate_phone: student?.alternate_phone ?? "", guardian_phone: student?.guardian_phone ?? "", email: student?.email ?? "", address: student?.address ?? "", city: student?.city ?? "", joining_date: student?.joining_date ?? new Date().toISOString().slice(0, 10), status: student?.status ?? "active", notes: student?.notes ?? "" });
  }, [form, open, student]);
  const mutation = useMutation({
    mutationFn: (payload: StudentPayload) => (student ? updateStudent(student.id, payload) : createStudent(payload)),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["students"] }); if (student) queryClient.invalidateQueries({ queryKey: ["student", student.id] }); toast.success(student ? "Student updated." : "Student added."); setOpen(false); },
    onError: () => toast.error("Could not save student."),
  });
  const errors = form.formState.errors;
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-5xl">
        <DialogTitle className="text-lg font-semibold text-slate-950">{student ? "Edit student" : "Add student"}</DialogTitle>
        <form className="mt-5 space-y-6" onSubmit={form.handleSubmit((v) => mutation.mutate(v))}>
          {[
            ["Personal Information", ["first_name", "last_name", "gender", "date_of_birth", "cnic_bform", "joining_date", "status"]],
            ["Contact Information", ["phone", "alternate_phone", "email", "city", "address"]],
            ["Guardian Information", ["father_guardian_name", "guardian_phone"]],
            ["Additional Information", ["notes"]],
          ].map(([title, fields]) => (
            <section key={title as string} className="rounded-xl border border-slate-200 p-4">
              <h3 className="text-sm font-semibold text-slate-950">{title as string}</h3>
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                {(fields as string[]).map((field) => field === "gender" || field === "status" ? (
                  <FormField key={field} label={field.replaceAll("_", " ")} error={(errors as Record<string, { message?: string }>)[field]?.message}>
                    <select className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm shadow-sm" {...form.register(field as keyof InputValues)}>
                      {field === "gender" ? <><option value="">Not set</option><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option></> : <><option value="active">Active</option><option value="completed">Completed</option><option value="dropped">Dropped</option><option value="inactive">Inactive</option></>}
                    </select>
                  </FormField>
                ) : field === "address" || field === "notes" ? (
                  <FormField key={field} label={field.replaceAll("_", " ")} error={(errors as Record<string, { message?: string }>)[field]?.message} className="md:col-span-3"><textarea className="min-h-20 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm" {...form.register(field as keyof InputValues)} /></FormField>
                ) : (
                  <FormField key={field} label={field.replaceAll("_", " ")} error={(errors as Record<string, { message?: string }>)[field]?.message}><Input type={field.includes("date") ? "date" : field === "email" ? "email" : "text"} {...form.register(field as keyof InputValues)} /></FormField>
                ))}
              </div>
            </section>
          ))}
          <div className="flex justify-end"><Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save student</Button></div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
