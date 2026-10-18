"use client";

import { useState } from "react";
import { LoaderCircle } from "lucide-react";
import { toast } from "@/components/ui/toast";

import { authClient } from "@/lib/auth-client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
    >
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.73 7.18l7.27 5.64c4.25-3.92 7.5-9.72 7.5-17.29Z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59A14.4 14.4 0 0 1 9.75 24c0-1.59.27-3.13.76-4.59l-7.98-6.19A23.9 23.9 0 0 0 0 24c0 3.87.93 7.52 2.56 10.78l7.97-6.19Z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.9-5.8l-7.27-5.64c-2.02 1.35-4.61 2.14-8.63 2.14-6.26 0-11.57-4.22-13.46-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z"
      />
    </svg>
  );
}

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);

  async function handleGoogleLogin() {
    setIsLoading(true);

    try {
      const result = await authClient.signIn.social({
        provider: "google",
        callbackURL: "/dashboard",
      });

      if (result.error) {
        toast.add({
          type: "error",
          title: "Authentication failed",
        });
        setIsLoading(false);
      }
    } catch {
      toast.add({
        type: "error",
        title: "An unexpected error occurred",
      });
      setIsLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-svh items-center justify-center overflow-hidden bg-background px-4 py-12">
      {/* Subtle background decoration */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(circle at 50% 0%, color-mix(in srgb, var(--primary) 9%, transparent), transparent 55%)",
        }}
      />

      <div className="relative w-full max-w-95">
        <div className="mb-8 flex flex-col items-center gap-4 text-center">
          <div className="flex size-12 items-center justify-center rounded-2xl border bg-card shadow-sm">
            <svg
              viewBox="0 0 24 24"
              className="size-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              aria-hidden="true"
            >
              <path
                d="M12 3 4.5 7v5c0 4.5 3.2 7.5 7.5 9 4.3-1.5 7.5-4.5 7.5-9V7L12 3Z"
                strokeLinejoin="round"
              />
              <path
                d="m9 12 2 2 4-4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
            <p className="text-sm leading-6 text-muted-foreground">Sign in to your account to continue.</p>
          </div>
        </div>

        <Card className="gap-0 overflow-hidden rounded-2xl shadow-sm">
          <CardHeader className="gap-2 px-6 pt-6 pb-5">
            <CardTitle className="text-lg">Sign in</CardTitle>
            <CardDescription>Use your Google account for secure access.</CardDescription>
          </CardHeader>

          <CardContent className="px-6 pb-6">
            <Button
              type="button"
              variant="outline"
              className="h-11 w-full gap-3 rounded-lg text-sm font-medium shadow-xs"
              onClick={handleGoogleLogin}
              disabled={isLoading}
            >
              {isLoading ? <LoaderCircle className="size-4.5 animate-spin" /> : <GoogleIcon className="size-4.5 shrink-0" />}

              {isLoading ? "Redirecting to Google..." : "Continue with Google"}
            </Button>

            <p className="text-center text-xs leading-5 text-muted-foreground mt-2">
              By continuing, you agree to the terms of service and privacy policy.
            </p>
          </CardContent>

          <CardFooter className="justify-center border-t bg-muted/30 px-6 py-4">
            <p className="text-xs text-muted-foreground">Your account is protected with Google sign-in.</p>
          </CardFooter>
        </Card>

        <p className="mt-8 text-center text-xs text-muted-foreground">© {new Date().getFullYear()} Your Application</p>
      </div>
    </main>
  );
}
