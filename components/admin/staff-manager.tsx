"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Key, Trash, UserPlus } from "@phosphor-icons/react/dist/ssr";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { FormField } from "@/components/admin/form-field";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { addCashier, removeCashier, resetPassword } from "@/lib/actions/admin";
import { cashierSchema, passwordSchema, type CashierInput, type PasswordInput } from "@/lib/schemas";
import type { StaffMember } from "@/lib/types";

function AddCashierForm({ onDone }: { onDone: () => void }) {
  const [pending, startTransition] = useTransition();
  const { register, handleSubmit, formState } = useForm<CashierInput>({
    resolver: zodResolver(cashierSchema),
    defaultValues: { fullName: "", username: "", password: "" },
  });
  const { errors } = formState;
  return (
    <form
      className="space-y-4"
      onSubmit={handleSubmit((values) =>
        startTransition(async () => {
          const result = await addCashier(values);
          if (!result.ok) {
            toast.error(result.error);
            return;
          }
          toast.success(`${values.fullName} can now sign in`);
          onDone();
        }),
      )}
    >
      <FormField label="Name" htmlFor="staff-name" error={errors.fullName?.message}>
        <Input id="staff-name" className="h-12" {...register("fullName")} />
      </FormField>
      <FormField label="Username" htmlFor="staff-username" error={errors.username?.message}>
        <Input id="staff-username" autoCapitalize="none" autoComplete="off" className="h-12" {...register("username")} />
      </FormField>
      <FormField label="Password" htmlFor="staff-password" error={errors.password?.message}>
        <Input id="staff-password" autoComplete="off" className="h-12" {...register("password")} />
      </FormField>
      <Button type="submit" disabled={pending} className="h-14 w-full rounded-xl text-lg font-semibold">
        {pending ? "Adding…" : "Add cashier"}
      </Button>
    </form>
  );
}

function PasswordForm({ member, onDone }: { member: StaffMember; onDone: () => void }) {
  const [pending, startTransition] = useTransition();
  const { register, handleSubmit, formState } = useForm<PasswordInput>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { password: "" },
  });
  return (
    <form
      className="space-y-4"
      onSubmit={handleSubmit((values) =>
        startTransition(async () => {
          const result = await resetPassword(member.id, values);
          if (!result.ok) {
            toast.error(result.error);
            return;
          }
          toast.success("Password changed");
          onDone();
        }),
      )}
    >
      <FormField label="New password" htmlFor="new-password" error={formState.errors.password?.message}>
        <Input id="new-password" autoComplete="off" className="h-12" {...register("password")} />
      </FormField>
      <Button type="submit" disabled={pending} className="h-14 w-full rounded-xl text-lg font-semibold">
        Save password
      </Button>
    </form>
  );
}

export function StaffManager({ staff }: { staff: StaffMember[] }) {
  const [adding, setAdding] = useState(false);
  const [changing, setChanging] = useState<StaffMember | null>(null);
  const [removing, setRemoving] = useState<StaffMember | null>(null);
  const [, startTransition] = useTransition();

  return (
    <main className="h-full overflow-y-auto p-3 sm:p-4 lg:p-6">
      <h1 className="mb-3 text-2xl font-semibold">Staff</h1>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="flex min-h-40 flex-col items-center justify-center gap-1 rounded-2xl border border-dashed border-input text-lg font-semibold text-muted-foreground transition duration-150 hover:bg-card active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <UserPlus className="size-8" aria-hidden />
          Add cashier
        </button>
        {staff.map((member) => (
          <div key={member.id} className="flex min-h-40 flex-col rounded-2xl border bg-card p-3">
            <div className="flex flex-1 items-center gap-3">
              <span aria-hidden className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-tint text-xl font-semibold text-primary">
                {member.full_name[0]?.toUpperCase()}
              </span>
              <div className="min-w-0">
                <p className="truncate text-lg font-semibold">{member.full_name}</p>
                <p className="truncate text-muted-foreground">{member.username}</p>
                <p className="text-sm font-semibold text-primary capitalize">{member.role}</p>
              </div>
            </div>
            <div className="mt-3 grid auto-cols-fr grid-flow-col gap-2">
              <Button variant="secondary" className="h-12 rounded-xl font-semibold" onClick={() => setChanging(member)}>
                <Key className="size-5" aria-hidden /> Password
              </Button>
              {member.role === "cashier" && (
                <Button
                  variant="secondary"
                  className="h-12 rounded-xl font-semibold text-destructive hover:text-destructive"
                  onClick={() => setRemoving(member)}
                >
                  <Trash className="size-5" aria-hidden /> Remove
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      <Dialog open={adding} onOpenChange={setAdding}>
        <DialogContent className="rounded-2xl sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Add cashier</DialogTitle>
            <DialogDescription>They sign in with this username and password.</DialogDescription>
          </DialogHeader>
          <AddCashierForm onDone={() => setAdding(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={changing !== null} onOpenChange={(open) => !open && setChanging(null)}>
        <DialogContent className="rounded-2xl sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Change password</DialogTitle>
            <DialogDescription>For {changing?.full_name}. They will need to sign in again.</DialogDescription>
          </DialogHeader>
          {changing && <PasswordForm member={changing} onDone={() => setChanging(null)} />}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={removing !== null}
        onOpenChange={(open) => !open && setRemoving(null)}
        title={`Remove ${removing?.full_name ?? "cashier"}?`}
        description="They can no longer sign in. Their past sales stay in reports."
        confirmLabel="Remove"
        onConfirm={() => {
          if (removing) startTransition(async () => void (await removeCashier(removing.id)));
        }}
      />
    </main>
  );
}
