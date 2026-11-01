"use client";

import { Printer } from "@phosphor-icons/react/dist/ssr";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Button } from "@/components/ui/button";
import { cancelSale } from "@/lib/actions/orders";

export function SaleActions({ id, canCancel }: { id: number; canCancel: boolean }) {
  const [pending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);
  return (
    <div className="space-y-2 print:hidden">
      <Button className="h-14 w-full rounded-xl text-base font-semibold" onClick={() => window.print()}>
        <Printer className="size-6" aria-hidden /> Print receipt
      </Button>
      {canCancel && (
        <Button
          variant="ghost"
          disabled={pending}
          className="h-12 w-full rounded-xl text-base text-destructive hover:text-destructive"
          onClick={() => setConfirming(true)}
        >
          Cancel this sale
        </Button>
      )}
      <ConfirmDialog
        open={confirming}
        onOpenChange={setConfirming}
        title="Cancel this sale?"
        description="It will no longer count in today's total. This cannot be undone."
        confirmLabel="Yes, cancel sale"
        onConfirm={() =>
          startTransition(async () => {
            const result = await cancelSale(id);
            if (!result.ok) toast.error(result.error);
          })
        }
      />
    </div>
  );
}
