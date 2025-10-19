import { AppSidebar } from '@/components/app-sidebar';
import { DashboardHeader } from '@/components/dashboard-header';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AgentProvider } from '@/contexts/agent-context';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AgentProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <DashboardHeader />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </AgentProvider>
  );
}
