"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { FormField } from "@/components/admin/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { saveSettings } from "@/lib/actions/admin";
import { settingsSchema, type SettingsInput } from "@/lib/schemas";
import type { Settings } from "@/lib/types";

const SWITCHES = [
  { name: "cashEnabled", label: "Cash" },
  { name: "cardEnabled", label: "Card" },
  { name: "transferEnabled", label: "Transfer" },
  { name: "pettyCashEnabled", label: "Petty cash for giving change" },
] as const;

export function SettingsForm({ settings }: { settings: Settings }) {
  const [pending, startTransition] = useTransition();
  const { register, handleSubmit, control, formState } = useForm<SettingsInput>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      storeName: settings.store_name,
      currency: settings.currency,
      taxRate: settings.tax_rate,
      receiptFooter: settings.receipt_footer,
      cashEnabled: Boolean(settings.cash_enabled),
      cardEnabled: Boolean(settings.card_enabled),
      transferEnabled: Boolean(settings.transfer_enabled),
      pettyCashEnabled: Boolean(settings.petty_cash_enabled),
      pettyCashDefault: settings.petty_cash_default / 100,
    },
  });

  const onSubmit = handleSubmit((values) =>
    startTransition(async () => {
      const result = await saveSettings(values);
      if (result.ok) toast.success("Settings saved");
      else toast.error(result.error);
    }),
  );

  const { errors } = formState;
  const card = "space-y-4 rounded-2xl border bg-card p-4 sm:p-5";
  return (
    <main className="h-full overflow-y-auto p-3 sm:p-4 lg:p-6">
      <form onSubmit={onSubmit} className="mx-auto max-w-5xl space-y-3 lg:space-y-4">
        <h1 className="text-2xl font-semibold">Settings</h1>
        <div className="grid items-start gap-3 lg:grid-cols-2 lg:gap-4">
          <fieldset className={card}>
            <legend className="sr-only">Payments and petty cash</legend>
            <h2 className="text-lg font-semibold">Payments and petty cash</h2>
            <div className="divide-y">
              {SWITCHES.map((item) => (
                <Controller
                  key={item.name}
                  control={control}
                  name={item.name}
                  render={({ field }) => (
                    <div className="flex min-h-14 items-center justify-between gap-3">
                      <Label htmlFor={item.name} className="text-base">
                        {item.label}
                      </Label>
                      <Switch id={item.name} checked={field.value} onCheckedChange={field.onChange} />
                    </div>
                  )}
                />
              ))}
            </div>
            {errors.cashEnabled && (
              <p role="alert" className="text-sm font-medium text-destructive">
                {errors.cashEnabled.message}
              </p>
            )}
            <FormField label="Default petty cash, used on days you don't set it" htmlFor="petty-default" error={errors.pettyCashDefault?.message}>
              <Input
                id="petty-default"
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                className="h-12 text-base"
                {...register("pettyCashDefault", { valueAsNumber: true })}
              />
            </FormField>
          </fieldset>

          <fieldset className={card}>
            <legend className="sr-only">Shop details</legend>
            <h2 className="text-lg font-semibold">Shop details</h2>
            <FormField label="Store name" htmlFor="store-name" error={errors.storeName?.message}>
              <Input id="store-name" className="h-12 text-base" {...register("storeName")} />
            </FormField>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Currency" htmlFor="currency" error={errors.currency?.message}>
                <Input id="currency" className="h-12 text-base" {...register("currency")} />
              </FormField>
              <FormField label="Tax rate (%)" htmlFor="tax-rate" error={errors.taxRate?.message}>
                <Input
                  id="tax-rate"
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min="0"
                  max="100"
                  className="h-12 text-base"
                  {...register("taxRate", { valueAsNumber: true })}
                />
              </FormField>
            </div>
            <FormField label="Receipt footer" htmlFor="receipt-footer" error={errors.receiptFooter?.message}>
              <Input id="receipt-footer" className="h-12 text-base" {...register("receiptFooter")} />
            </FormField>
          </fieldset>
        </div>
        <Button type="submit" disabled={pending} className="h-14 w-full rounded-xl text-lg font-semibold lg:ml-auto lg:block lg:w-64">
          {pending ? "Saving…" : "Save settings"}
        </Button>
      </form>
    </main>
  );
}
