"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login } from "@/lib/actions/auth";

export function LoginForm() {
  const [error, action, pending] = useActionState(login, null);
  return (
    <form action={action} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="username">Username</Label>
        <Input id="username" name="username" autoComplete="username" autoCapitalize="none" required autoFocus className="h-12" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" autoComplete="current-password" required className="h-12" />
      </div>
      {error && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {error}
        </p>
      )}
      <Button type="submit" disabled={pending} className="h-14 w-full rounded-xl text-lg font-semibold">
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
