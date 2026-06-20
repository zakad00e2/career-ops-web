import { Sidebar } from '@/components/Sidebar';
import { DemoBanner } from '@/components/DemoBanner';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { isDemoMode } from '@/lib/db/config';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <Sidebar />
      <SidebarInset className="min-h-svh bg-background">
        {isDemoMode() && <DemoBanner />}
        <header className="sticky top-0 z-30 flex h-12 items-center gap-2 border-b bg-background/85 px-4 backdrop-blur-xl">
          <SidebarTrigger />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">Career-Ops</p>
            <p className="truncate text-xs text-muted-foreground md:hidden">مسار البحث عن وظيفة بالذكاء الاصطناعي</p>
          </div>
        </header>
        <main className="flex-1">
          <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            {children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
