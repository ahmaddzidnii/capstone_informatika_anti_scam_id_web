"use client";

import { useState } from "react";
import { LuLoaderCircle } from "react-icons/lu";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { authClient } from "@/lib/auth-client";

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

interface LoginActionProps {
  callbackURL: string;
}

export function LoginAction({ callbackURL }: LoginActionProps) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleGoogleLogin() {
    setIsLoading(true);

    try {
      const result = await authClient.signIn.social({
        provider: "google",
        callbackURL,
      });

      if (result.error) {
        toast.add({
          type: "error",
          title: "Autentikasi gagal",
          description: result.error.message || "Silakan coba beberapa saat lagi.",
        });
        setIsLoading(false);
      }
    } catch {
      toast.add({
        type: "error",
        title: "Terjadi kesalahan saat masuk",
      });
      setIsLoading(false);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      className="h-11 w-full gap-3 font-medium"
      onClick={handleGoogleLogin}
      disabled={isLoading}
    >
      {isLoading ? <LuLoaderCircle className="h-4 w-4 animate-spin" /> : <GoogleIcon className="h-4 w-4 shrink-0" />}
      <span>{isLoading ? "Memproses..." : "Lanjutkan dengan Google"}</span>
    </Button>
  );
}
