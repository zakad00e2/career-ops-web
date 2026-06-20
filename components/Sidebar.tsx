'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Briefcase,
  FileText,
  GitBranch,
  LayoutDashboard,
  PlusCircle,
  Radar,
  Settings,
} from 'lucide-react';
import {
  Sidebar as SidebarPrimitive,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar';

const primaryNav = [
  { href: '/', label: 'لوحة التحكم', icon: LayoutDashboard },
  { href: '/applications', label: 'الطلبات', icon: Briefcase, badge: '10' },
  { href: '/pipeline', label: 'قائمة الانتظار', icon: GitBranch, badge: '3' },
  { href: '/reports', label: 'التقارير', icon: FileText },
];

const toolNav = [
  { href: '/settings', label: 'الإعدادات', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <SidebarPrimitive collapsible="offcanvas" variant="inset" side="right">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              render={<Link href="/" />}
              size="lg"
              tooltip="Career-Ops"
              className="gap-1 data-[slot=sidebar-menu-button]:p-1.5! [&_svg]:size-7!"
            >
              <div className="flex aspect-square size-8 shrink-0 items-center justify-center">
                <Radar className="text-violet-600" />
              </div>
              <div className="grid flex-1 text-start text-sm leading-tight">
                <span className="truncate font-medium">Career-Ops</span>
                <span className="truncate text-xs text-sidebar-foreground/70">مسار الذكاء الاصطناعي</span>
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
                  tooltip="تقييم سريع"
                  className="btn-evaluate min-w-8 rounded-[10px]! border-0 shadow-none hover:bg-transparent active:bg-transparent data-active:bg-transparent data-active:text-white"
                >
                  <PlusCircle />
                  <span>تقييم سريع</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>مساحة العمل</SidebarGroupLabel>
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
          <SidebarGroupLabel>الأدوات</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {toolNav.map(({ href, label, icon: Icon }) => {
                const isActive = pathname.startsWith(href);

                return (
                  <SidebarMenuItem key={label}>
                    <SidebarMenuButton render={<Link href={href} />} isActive={isActive} tooltip={label}>
                      <Icon />
                      <span>{label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarRail />
    </SidebarPrimitive>
  );
}
