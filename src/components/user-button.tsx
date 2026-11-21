"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LuHistory, LuLayoutDashboard, LuLoaderCircle, LuLogIn, LuLogOut, LuShield } from "react-icons/lu";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/toast";
import { useAuth } from "./auth-context";
import { authClient } from "@/lib/auth-client";

function getInitials(name?: string | null) {
  if (!name) return "U";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function UserButton() {
  const router = useRouter();
  const { user, isAuthenticated, isAdmin, isLoading } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleSignOut() {
    setIsSigningOut(true);
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push("/");
            router.refresh();
          },
        },
      });
    } catch {
      toast.add({
        type: "error",
        title: "Gagal keluar dari akun",
        description: "Silakan coba beberapa saat lagi.",
      });
      setIsSigningOut(false);
    }
  }

  // Skeleton saat sesi dicek di client (ukurannya disamakan dengan tombol Masuk agar tidak layout shift)
  if (isLoading) {
    return <div className="h-8 w-22 animate-pulse rounded-md bg-muted" />;
  }

  // Belum login -> tampilkan tombol Masuk
  if (!isAuthenticated || !user) {
    return (
      <Button
        size="sm"
        className="gap-2 px-4 font-medium shadow-xs"
        nativeButton={false}
        render={
          <Link href="/login">
            <LuLogIn className="h-4 w-4" />
            <span>Masuk</span>
          </Link>
        }
      />
    );
  }

  // Sudah login -> tampilkan Avatar & DropdownMenu
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            className="relative h-9 gap-2.5 rounded-full px-1.5 pr-2.5 hover:bg-muted/70"
          >
            <Avatar className="h-7 w-7 border border-border">
              <AvatarImage
                src={user.image ?? undefined}
                alt={user.name}
              />
              <AvatarFallback className="text-xs font-semibold">{getInitials(user.name)}</AvatarFallback>
            </Avatar>
            <span className="hidden max-w-28 truncate text-sm font-medium sm:inline-block">{user.name}</span>
          </Button>
        }
      />

      <DropdownMenuContent
        align="end"
        className="w-60"
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-sm font-semibold leading-none text-foreground">{user.name}</p>
              </div>
              <p className="truncate text-xs leading-none text-muted-foreground">{user.email}</p>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          {isAdmin && (
            <DropdownMenuItem
              render={
                <Link
                  href="/dashboard"
                  className="cursor-pointer"
                >
                  <LuLayoutDashboard className="mr-2 h-4 w-4" />
                  <span>Dashboard Admin</span>
                </Link>
              }
            />
          )}

          <DropdownMenuItem
            render={
              <Link
                href="/riwayat"
                className="cursor-pointer"
              >
                <LuHistory className="mr-2 h-4 w-4" />
                <span>Riwayat Pemeriksaan</span>
              </Link>
            }
          />
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          disabled={isSigningOut}
          onClick={handleSignOut}
          className="cursor-pointer text-red-600 focus:bg-red-500/10 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400"
        >
          {isSigningOut ? <LuLoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <LuLogOut className="mr-2 h-4 w-4" />}
          <span>{isSigningOut ? "Keluar..." : "Keluar"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
