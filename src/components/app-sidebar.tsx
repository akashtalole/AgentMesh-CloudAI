"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Album,
  BarChart4,
  BotMessageSquare,
  Building2,
  Cpu,
  Home,
  PanelsTopLeft,
  Plug,
  Settings,
  ShieldCheck,
  Users,
  Workflow,
  LogOut,
  Server,
  Wrench,
} from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarMenuBadge,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AgentMeshLogo } from "@/components/icons";
import { Separator } from "./ui/separator";
import { useAuth } from "./auth-provider";
import { signOut } from "@/services/auth";
import { useRouter } from "next/navigation";

const menuItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: Home,
  },
  {
    href: "/agents",
    label: "Agent Builder",
    icon: BotMessageSquare,
  },
  {
    href: "/workflows",
    label: "Workflows",
    icon: Workflow,
  },
  {
    href: "/tools",
    label: "Tools",
    icon: Wrench,
  },
  {
    href: "/organization",
    label: "Organization",
    icon: Users,
  },
  {
    href: "/integrations",
    label: "Integrations",
    icon: Plug,
  },
  {
    href: "/mcp",
    label: "MCP Configuration",
    icon: Server,
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { state } = useSidebar();
  const { user, profile } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader className="h-14 items-center justify-center p-2">
        <Link href="/dashboard" className="flex items-center gap-2">
          <AgentMeshLogo className="w-8 h-8 text-sidebar-primary" />
          <span className={cn(
            "font-semibold text-lg text-sidebar-foreground",
            state === "collapsed" && "hidden"
          )}>
            AgentMesh
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="flex-1 p-2">
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith(item.href)}
                tooltip={{ children: item.label }}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-2">
        <Separator className="mb-2 bg-sidebar-border" />
        <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogout} tooltip={{ children: "Logout" }}>
                    <LogOut />
                    <span>Logout</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
        <div className="flex items-center gap-3 p-2 rounded-lg">
          <Avatar className="h-9 w-9">
            <AvatarImage src={profile?.avatar} alt="User" />
            <AvatarFallback>{user?.email?.charAt(0).toUpperCase() || 'A'}</AvatarFallback>
          </Avatar>
          <div className={cn("flex flex-col", state === "collapsed" && "hidden")}>
            <span className="text-sm font-medium text-sidebar-foreground truncate">
              {profile?.name || user?.email || 'Not signed in'}
            </span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
