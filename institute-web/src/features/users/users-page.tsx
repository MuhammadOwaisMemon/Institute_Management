"use client";

import { useQuery } from "@tanstack/react-query";
import { Edit, Plus, ShieldAlert, Users } from "lucide-react";
import { useState } from "react";
import { DataTable, type Column } from "@/components/data/data-table";
import { SearchInput } from "@/components/data/search-input";
import { StatusBadge } from "@/components/data/status-badge";
import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorState } from "@/components/feedback/error-state";
import { LoadingSkeleton } from "@/components/feedback/loading-skeleton";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/auth-provider";
import { getUsers, type ManagedUser } from "./users-api";
import { UserFormDialog } from "./user-form-dialog";

export function UsersPage() {
  const [search, setSearch] = useState("");
  const auth = useAuth();
  const usersQuery = useQuery({
    queryKey: ["users", search],
    queryFn: () => getUsers(search),
    enabled: auth.data?.role === "admin",
  });

  if (auth.data && auth.data.role !== "admin") {
    return <ErrorState title="Access restricted" description="Only admins can manage staff users." />;
  }

  const columns: Column<ManagedUser>[] = [
    { key: "name", header: "Name" },
    { key: "email", header: "Email" },
    { key: "phone", header: "Phone", render: (row) => row.phone || "Not set" },
    { key: "role", header: "Role", render: (row) => <span className="capitalize">{row.role}</span> },
    { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status === "active" ? "active" : "inactive"} label={row.status} /> },
    {
      key: "actions",
      header: "",
      render: (row) => (
        <div className="flex justify-end">
          <UserFormDialog user={row}>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4" />
              Edit
            </Button>
          </UserFormDialog>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Users"
        description="Manage staff access, roles, and account status."
        actions={
          <UserFormDialog>
            <Button>
              <Plus className="h-4 w-4" />
              Add user
            </Button>
          </UserFormDialog>
        }
      />

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <SearchInput value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search users" />
          <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
            <ShieldAlert className="h-4 w-4" />
            Admin-only
          </div>
        </div>

        {usersQuery.isLoading ? <LoadingSkeleton className="h-64" /> : null}
        {usersQuery.isError ? <ErrorState title="Users could not load" description="Please check your access and try again." onRetry={() => usersQuery.refetch()} /> : null}
        {usersQuery.data && usersQuery.data.users.length > 0 ? <DataTable columns={columns} data={usersQuery.data.users} /> : null}
        {usersQuery.data && usersQuery.data.users.length === 0 ? <EmptyState icon={Users} title="No users found" description="Add staff users when you are ready to assign access." /> : null}
      </section>
    </>
  );
}
