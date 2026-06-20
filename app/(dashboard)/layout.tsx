import { Sidebar } from '@/components/Sidebar';
import { DemoBanner } from '@/components/DemoBanner';
import { PageMotion } from '@/components/motion/PageMotion';
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
        <header className="sticky top-0 z-30 flex h-12 items-center gap-1 border-b bg-background/85 px-4 backdrop-blur-xl">
          <SidebarTrigger className="-me-0.5" />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">Career-Ops</p>
            <p className="truncate text-xs text-muted-foreground md:hidden">مسار البحث عن وظيفة بالذكاء الاصطناعي</p>
          </div>
        </header>
        <main className="flex-1">
          <PageMotion>{children}</PageMotion>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
