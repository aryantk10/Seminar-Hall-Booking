
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
  { href: "/dashboard/halls", icon: Building2, label: "Seminar Halls", roles: ['faculty', 'admin'], tooltip: "View Halls" },
  { href: "/dashboard/my-bookings", icon: BookMarked, label: "My Bookings", roles: ['faculty'], tooltip: "Your Bookings" },
  { href: "/dashboard/calendar", icon: CalendarDays, label: "Calendar", roles: ['faculty', 'admin'], tooltip: "Booking Calendar" },
  { href: "/dashboard/admin/halls", icon: Settings, label: "Hall Management", roles: ['admin'], tooltip: "Manage Halls (CRUD)" },
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
      <div className="flex h-full flex-col pt-16"> {/* Wrapper to push content below main header */}
        <SidebarHeader className="p-2 flex-shrink-0">
          <div className="flex items-center justify-between">
            <Link href="/dashboard/profile" className="flex items-center gap-2 group-data-[collapsible=icon]:hidden w-full mr-2 cursor-pointer hover:bg-sidebar-accent/50 rounded-md p-1">
              <Avatar className="h-8 w-8">
                 <AvatarImage src={user.avatarDataUrl || `https://avatar.vercel.sh/${user.email}.png`} alt={user.name} />
                 <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-sidebar-foreground">{user.name}</span>
                <span className="text-xs text-sidebar-foreground/70">{user.role}</span>
              </div>
            </Link>
             {/* Icon-only avatar when collapsed */}
            <Link href="/dashboard/profile" className="hidden items-center gap-2 group-data-[collapsible=icon]:flex w-full mr-2 cursor-pointer hover:bg-sidebar-accent/50 rounded-md p-1 justify-center">
               <Avatar className="h-8 w-8">
                 <AvatarImage src={user.avatarDataUrl || `https://avatar.vercel.sh/${user.email}.png`} alt={user.name} />
                 <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
              </Avatar>
            </Link>
            <SidebarTrigger className="hidden md:flex group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:mx-auto" />
          </div>
        </SidebarHeader>
        <SidebarSeparator className="flex-shrink-0" />
        <SidebarContent className="p-2"> {/* Already flex-1 and overflow-auto */}
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
        <SidebarSeparator className="flex-shrink-0" />
        <SidebarFooter className="p-2 flex-shrink-0">
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
      </div>
    </Sidebar>
  );
}
