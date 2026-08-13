import { createClient } from "@/lib/supabase/server";
import { logout } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { SidebarNav } from "./_components/sidebar-nav";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-56 shrink-0 flex-col gap-6 border-r bg-muted/30 p-4">
        <div className="px-2">
          <p className="font-semibold">Traukorp CRM</p>
        </div>
        <SidebarNav />
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-end gap-3 border-b p-4">
          <span className="text-sm text-muted-foreground">{user?.email}</span>
          <form action={logout}>
            <Button type="submit" variant="outline" size="sm">
              Cerrar sesión
            </Button>
          </form>
        </header>
        <main className="flex-1 p-6">
          <div className="mx-auto flex max-w-6xl flex-col gap-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
