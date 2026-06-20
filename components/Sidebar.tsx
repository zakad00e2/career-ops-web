'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
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
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar';
import { prefersReducedMotion } from '@/lib/gsap/motion';

gsap.registerPlugin(useGSAP);

const primaryNav = [
  { href: '/', label: 'لوحة التحكم', icon: LayoutDashboard },
  { href: '/applications', label: 'الطلبات', icon: Briefcase },
  { href: '/pipeline', label: 'قائمة الانتظار', icon: GitBranch },
  { href: '/reports', label: 'التقارير', icon: FileText },
];

const toolNav = [
  { href: '/settings', label: 'الإعدادات', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const contentRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion() || !contentRef.current) return;

      const items = contentRef.current.querySelectorAll('[data-sidebar="menu-item"]');
      gsap.from(items, {
        opacity: 0,
        x: 16,
        duration: 0.45,
        stagger: 0.06,
        ease: 'power2.out',
        clearProps: 'opacity,transform',
      });
    },
    { scope: contentRef },
  );

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

      <SidebarContent ref={contentRef}>
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
              {primaryNav.map(({ href, label, icon: Icon }) => {
                const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);

                return (
                  <SidebarMenuItem key={href}>
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
