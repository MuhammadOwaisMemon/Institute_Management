"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ImageUp, Loader2, Save } from "lucide-react";
import Image from "next/image";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField, FieldHint } from "@/components/forms/form-field";
import { ErrorState } from "@/components/feedback/error-state";
import { LoadingSkeleton } from "@/components/feedback/loading-skeleton";
import { getInstituteProfile, updateInstituteProfile, uploadInstituteLogo, type InstituteProfilePayload } from "./institute-profile-api";

const profileSchema = z.object({
  name: z.string().min(2, "Institute name is required.").max(150),
  short_name: z.string().max(50).nullable(),
  phone: z.string().max(30).regex(/^[0-9+\-\s()]*$/, "Use a valid phone number.").nullable(),
  email: z.string().email("Use a valid email address.").max(150).nullable(),
  address: z.string().max(500).nullable(),
  city: z.string().max(100).nullable(),
  country: z.literal("Pakistan"),
  currency: z.literal("PKR"),
  timezone: z.literal("Asia/Karachi"),
  receipt_footer: z.string().max(500).nullable(),
  status: z.enum(["active", "inactive"]),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

function emptyToNull(value: string) {
  return value.trim() === "" ? null : value.trim();
}

export function InstituteProfileForm() {
  const queryClient = useQueryClient();
  const profileQuery = useQuery({
    queryKey: ["institute-profile"],
    queryFn: getInstituteProfile,
  });

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      short_name: null,
      phone: null,
      email: null,
      address: null,
      city: null,
      country: "Pakistan",
      currency: "PKR",
      timezone: "Asia/Karachi",
      receipt_footer: null,
      status: "active",
    },
  });

  useEffect(() => {
    if (profileQuery.data) {
      form.reset({
        name: profileQuery.data.name,
        short_name: profileQuery.data.short_name,
        phone: profileQuery.data.phone,
        email: profileQuery.data.email,
        address: profileQuery.data.address,
        city: profileQuery.data.city,
        country: profileQuery.data.country as "Pakistan",
        currency: profileQuery.data.currency as "PKR",
        timezone: profileQuery.data.timezone as "Asia/Karachi",
        receipt_footer: profileQuery.data.receipt_footer,
        status: profileQuery.data.status,
      });
    }
  }, [form, profileQuery.data]);

  const updateMutation = useMutation({
    mutationFn: updateInstituteProfile,
    onSuccess: (profile) => {
      queryClient.setQueryData(["institute-profile"], profile);
      toast.success("Institute profile updated.");
    },
  });

  const logoMutation = useMutation({
    mutationFn: uploadInstituteLogo,
    onSuccess: (profile) => {
      queryClient.setQueryData(["institute-profile"], profile);
      toast.success("Logo updated.");
    },
  });

  if (profileQuery.isLoading) {
    return (
      <div className="space-y-5">
        <LoadingSkeleton className="h-40" />
        <LoadingSkeleton className="h-72" />
      </div>
    );
  }

  if (profileQuery.isError) {
    return <ErrorState title="Settings could not load" description="Please check that the API server is running." onRetry={() => profileQuery.refetch()} />;
  }

  function onSubmit(values: ProfileFormValues) {
    const payload: InstituteProfilePayload = {
      name: values.name.trim(),
      short_name: values.short_name ? emptyToNull(values.short_name) : null,
      phone: values.phone ? emptyToNull(values.phone) : null,
      email: values.email ? emptyToNull(values.email) : null,
      address: values.address ? emptyToNull(values.address) : null,
      city: values.city ? emptyToNull(values.city) : null,
      country: "Pakistan",
      currency: "PKR",
      timezone: "Asia/Karachi",
      receipt_footer: values.receipt_footer ? emptyToNull(values.receipt_footer) : null,
      status: values.status,
    };

    updateMutation.mutate(payload);
  }

  function onLogoChange(file?: File) {
    if (!file) {
      return;
    }

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 2 * 1024 * 1024) {
      toast.error("Upload a JPG, PNG, or WEBP logo under 2 MB.");
      return;
    }

    logoMutation.mutate(file);
  }

  const errors = form.formState.errors;
  const profile = profileQuery.data;

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-slate-950">Institute Information</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <FormField label="Institute name" error={errors.name?.message}>
              <Input {...form.register("name")} />
            </FormField>
            <FormField label="Short name" error={errors.short_name?.message}>
              <Input {...form.register("short_name")} />
            </FormField>
            <FormField label="Status" error={errors.status?.message}>
              <select className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm shadow-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100" {...form.register("status")}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </FormField>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-slate-950">Contact Information</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <FormField label="Phone" error={errors.phone?.message}>
              <Input {...form.register("phone")} />
            </FormField>
            <FormField label="Email" error={errors.email?.message}>
              <Input type="email" {...form.register("email")} />
            </FormField>
            <FormField label="City" error={errors.city?.message}>
              <Input {...form.register("city")} />
            </FormField>
            <FormField label="Address" error={errors.address?.message} className="md:col-span-2">
              <textarea className="min-h-24 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100" {...form.register("address")} />
            </FormField>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-slate-950">Localization</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <FormField label="Country">
              <Input value="Pakistan" readOnly />
            </FormField>
            <FormField label="Currency">
              <Input value="PKR" readOnly />
            </FormField>
            <FormField label="Timezone">
              <Input value="Asia/Karachi" readOnly />
            </FormField>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-slate-950">Branding</h2>
          <div className="mt-5">
            <FormField label="Receipt footer" error={errors.receipt_footer?.message}>
              <textarea className="min-h-24 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100" {...form.register("receipt_footer")} />
            </FormField>
          </div>
        </section>

        <div className="flex justify-end">
          <Button type="submit" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save settings
          </Button>
        </div>
      </form>

      <aside className="h-fit rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold text-slate-950">Logo</h2>
        <div className="mt-5 flex items-center gap-4">
          <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
            {profile?.logo_url ? <Image src={profile.logo_url} alt="Institute logo" width={96} height={96} className="h-full w-full object-cover" /> : <ImageUp className="h-8 w-8 text-slate-400" />}
          </div>
          <div>
            <label className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800">
              {logoMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageUp className="h-4 w-4" />}
              Upload logo
              <input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={(event) => onLogoChange(event.target.files?.[0])} />
            </label>
            <FieldHint className="mt-2">JPG, PNG, or WEBP. Max 2 MB.</FieldHint>
          </div>
        </div>
      </aside>
    </div>
  );
}
