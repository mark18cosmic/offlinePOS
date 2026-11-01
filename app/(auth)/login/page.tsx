import { redirect } from "next/navigation";
import { LoginForm } from "@/components/login-form";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme";
import { getUser } from "@/lib/auth";
import { getSettings } from "@/lib/data";

export const metadata = { title: "Sign in" };

export default async function LoginPage() {
  if (await getUser()) redirect("/");
  return (
    <main className="relative flex min-h-dvh items-center justify-center p-4">
      <ThemeToggle className="absolute top-4 right-4 size-11 border bg-card" />
      <div className="w-full max-w-sm rounded-2xl border bg-card p-6">
        <Logo />
        <h1 className="mt-4 text-2xl font-semibold">{getSettings().store_name}</h1>
        <p className="mb-5 text-muted-foreground">Sign in to start selling.</p>
        <LoginForm />
      </div>
    </main>
  );
}
