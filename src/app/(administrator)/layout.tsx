import { LuSearch, LuUser } from "react-icons/lu";
import { AdminSidebar } from "@/components/admin-sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AdminSidebar />

      <SidebarInset className="flex min-h-screen flex-col bg-background">
        {/* Top Navbar Admin */}
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-4 border-b border-border bg-background/90 px-4 backdrop-blur-xs sm:px-6">
          <div className="flex flex-1 items-center gap-3">
            <SidebarTrigger className="-ml-1" />

            <div className="relative w-full max-w-md">
              <LuSearch className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Cari di dasbor..."
                className="h-9 w-full bg-muted/40 pl-9 text-sm"
              />
            </div>
          </div>

          {/* Akses / Profil Admin */}
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold leading-none text-foreground">Admin</p>
              <p className="mt-1 text-xs text-muted-foreground">(Administrator)</p>
            </div>
            <Avatar className="h-9 w-9 border border-border">
              <AvatarFallback className="bg-muted text-foreground">
                <LuUser className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Konten Utama */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
