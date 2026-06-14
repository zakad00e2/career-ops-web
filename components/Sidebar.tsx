'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Briefcase,
  ChevronUp,
  CircleHelp,
  Database,
  FileText,
  GitBranch,
  LayoutDashboard,
  PlusCircle,
  Radar,
  Search,
  Settings,
  Sparkles,
  Zap,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sidebar as SidebarPrimitive,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from '@/components/ui/sidebar';

const primaryNav = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/applications', label: 'Applications', icon: Briefcase, badge: '10' },
  { href: '/pipeline', label: 'Pipeline', icon: GitBranch, badge: '3' },
  { href: '/reports', label: 'Reports', icon: FileText },
];

const toolNav = [
  { href: '/evaluate', label: 'Evaluate', icon: Zap },
  { href: '/settings', label: 'Settings', icon: Settings },
  { href: '#', label: 'Search', icon: Search },
  { href: '#', label: 'Help', icon: CircleHelp },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <SidebarPrimitive collapsible="offcanvas" variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              render={<Link href="/" />}
              size="lg"
              tooltip="Career-Ops"
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <Radar />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">Career-Ops</span>
                <span className="truncate text-xs text-sidebar-foreground/70">AI pipeline</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent className="flex flex-col gap-2">
            <SidebarMenu>
              <SidebarMenuItem className="flex items-center gap-2">
                <SidebarMenuButton
                  render={<Link href="/evaluate" />}
                  tooltip="Quick evaluate"
                  className="min-w-8 bg-primary text-primary-foreground duration-200 ease-linear hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground"
                >
                  <PlusCircle />
                  <span>Quick evaluate</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {primaryNav.map(({ href, label, icon: Icon, badge }) => {
                const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);

                return (
                  <SidebarMenuItem key={href}>
                    <SidebarMenuButton render={<Link href={href} />} isActive={isActive} tooltip={label}>
                      <Icon />
                      <span>{label}</span>
                    </SidebarMenuButton>
                    {badge && <SidebarMenuBadge>{badge}</SidebarMenuBadge>}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarGroupLabel>Tools</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {toolNav.map(({ href, label, icon: Icon }) => {
                const isActive = href !== '#' && pathname.startsWith(href);
                const content = (
                  <>
                    <Icon />
                    <span>{label}</span>
                  </>
                );

                return (
                  <SidebarMenuItem key={label}>
                    {href === '#' ? (
                      <SidebarMenuButton isActive={isActive} tooltip={label}>
                        {content}
                      </SidebarMenuButton>
                    ) : (
                      <SidebarMenuButton render={<Link href={href} />} isActive={isActive} tooltip={label}>
                        {content}
                      </SidebarMenuButton>
                    )}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarSeparator />

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <SidebarMenuButton
                    size="lg"
                    className="aria-expanded:bg-sidebar-accent aria-expanded:text-sidebar-accent-foreground"
                  />
                }
              >
                <Avatar className="size-8 rounded-lg">
                  <AvatarFallback className="rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">CO</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Demo workspace</span>
                  <span className="truncate text-xs text-sidebar-foreground/70">career-ops v1.8.1</span>
                </div>
                <ChevronUp />
              </DropdownMenuTrigger>
              <DropdownMenuContent side="right" align="end" sideOffset={8} className="min-w-56">
                <DropdownMenuLabel>Workspace</DropdownMenuLabel>
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <Database />
                    Data sources
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Sparkles />
                    Demo mode
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Settings />
                  Settings
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
        <div className="px-2 group-data-[collapsible=icon]:hidden">
          <Badge variant="secondary" className="w-full justify-center gap-1">
            <Sparkles />
            Live demo
          </Badge>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </SidebarPrimitive>
  );
}
