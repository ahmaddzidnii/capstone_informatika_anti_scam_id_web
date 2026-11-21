"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LuFileText, LuHouse, LuLogOut } from "react-icons/lu";
import { Logo } from "@/components/logo";
import { Badge } from "@/components/ui/badge";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const NAV_ITEMS = [
  {
    title: "Dasbor",
    href: "/dashboard",
    icon: LuHouse,
  },
  {
    title: "Moderasi Laporan",
    href: "/moderasi-laporan",
    icon: LuFileText,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar className="border-border border-r">
      {/* Header Brand + Badge Admin */}
      <SidebarHeader className="h-16 justify-center border-border border-b px-4">
        <div className="flex items-center justify-between gap-2">
          <Link href="/dashboard" aria-label="AntiScamID Admin">
            <Logo size="sm" />
          </Link>
          <Badge variant="secondary" className="font-semibold text-[11px]">
            Admin
          </Badge>
        </div>
      </SidebarHeader>

      {/* Menu Navigasi */}
      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.href === "/admin"
                    ? pathname === "/admin"
                    : pathname.startsWith(item.href);

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      isActive={isActive}
                      className="h-10 gap-3 px-3 font-medium"
                      render={
                        <Link href={item.href}>
                          <Icon className="h-4 w-4 shrink-0" />
                          <span>{item.title}</span>
                        </Link>
                      }
                    />
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer Keluar */}
      <SidebarFooter className="border-border border-t p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="h-10 gap-3 px-3 font-medium text-muted-foreground hover:text-destructive"
              render={
                <Link href="/login">
                  <LuLogOut className="h-4 w-4 shrink-0" />
                  <span>Keluar</span>
                </Link>
              }
            />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
