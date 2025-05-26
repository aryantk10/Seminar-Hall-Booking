"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  CalendarDays,
  ClipboardList,
  LogOut,
  Settings,
  BookMarked,
  UserCircle, 
  BarChart3, 
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface NavItem {
  href: string;
  icon: React.ElementType;
  label: string;
  roles: ('faculty' | 'admin')[];
  tooltip?: string;
}

const navItems: NavItem[] = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard", roles: ['faculty', 'admin'], tooltip: "Dashboard Overview" },
  { href: "/dashboard/profile", icon: UserCircle, label: "My Profile", roles: ['faculty', 'admin'], tooltip: "View Your Profile" },
  { href: "/dashboard/halls", icon: Building2, label: "Seminar Halls", roles: ['faculty'], tooltip: "View Halls" },
  { href: "/dashboard/my-bookings", icon: BookMarked, label: "My Bookings", roles: ['faculty'], tooltip: "Your Bookings" },
  { href: "/dashboard/calendar", icon: CalendarDays, label: "Calendar", roles: ['faculty', 'admin'], tooltip: "Booking Calendar" },
  { href: "/dashboard/admin/requests", icon: ClipboardList, label: "Booking Requests", roles: ['admin'], tooltip: "Manage Requests" },
  { href: "/dashboard/admin/reports", icon: BarChart3, label: "Reports", roles: ['admin'], tooltip: "View Reports" }, 
];

export default function SidebarNav() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const getInitials = (name: string = "") => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
  }

  if (!user) return null;

  return (
    <Sidebar collapsible="icon" variant="sidebar" side="left">
        <SidebarHeader className="p-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 group-data-[collapsible=icon]:hidden">
              <Avatar className="h-8 w-8">
                 <AvatarImage src={`https://avatar.vercel.sh/${user.email}.png`} alt={user.name} />
                 <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-sidebar-foreground">{user.name}</span>
                <span className="text-xs text-sidebar-foreground/70">{user.role}</span>
              </div>
            </div>
            <SidebarTrigger className="hidden md:flex group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:mx-auto" />
          </div>
        </SidebarHeader>
        <SidebarSeparator />
        <SidebarContent className="p-2">
          <SidebarMenu>
            {navItems.filter(item => item.roles.includes(user.role)).map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))}
                  tooltip={item.tooltip || item.label}
                >
                  <Link href={item.href}>
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarSeparator />
        <SidebarFooter className="p-2">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Settings (Coming Soon)" disabled>
                <Settings className="h-5 w-5" />
                <span>Settings</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={logout} tooltip="Log Out">
                <LogOut className="h-5 w-5" />
                <span>Log Out</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
    </Sidebar>
  );
}
