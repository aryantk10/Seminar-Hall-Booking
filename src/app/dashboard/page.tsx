"use client";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Building2, CalendarDays, ClipboardList, UserCheck } from "lucide-react";
import Image from "next/image";

export default function DashboardPage() {
  const { user } = useAuth();

  if (!user) return null; // Or a loading spinner

  const welcomeMessage = `Welcome back, ${user.name}!`;
  const roleDescription = user.role === 'faculty' 
    ? "Manage your seminar hall bookings and explore available halls."
    : "Oversee and manage all seminar hall booking requests. Ensure smooth operations and scheduling.";

  const facultyActions = [
    { title: "View Seminar Halls", description: "Explore available halls and their details.", href: "/dashboard/halls", icon: Building2 },
    { title: "Check Calendar", description: "View current bookings and hall availability.", href: "/dashboard/calendar", icon: CalendarDays },
    { title: "My Bookings", description: "Manage your existing booking requests.", href: "/dashboard/my-bookings", icon: UserCheck },
  ];

  const adminActions = [
    { title: "Manage Booking Requests", description: "Approve or reject pending bookings.", href: "/dashboard/admin/requests", icon: ClipboardList },
    { title: "View Booking Calendar", description: "Oversee all scheduled events and hall usage.", href: "/dashboard/calendar", icon: CalendarDays },
  ];

  const actions = user.role === 'faculty' ? facultyActions : adminActions;

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">{welcomeMessage}</CardTitle>
          <CardDescription className="text-lg text-muted-foreground">{roleDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-6">
            Use the navigation on the left or the quick links below to get started.
          </p>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {actions.map((action) => (
              <Link href={action.href} key={action.title} legacyBehavior>
                <a className="block">
                  <Card className="h-full hover:shadow-md transition-shadow cursor-pointer hover:border-primary">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-lg font-medium">{action.title}</CardTitle>
                      <action.icon className="h-6 w-6 text-primary" />
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{action.description}</p>
                       <Button variant="link" className="px-0 mt-2 text-primary">
                        Go to {action.title.split(" ")[0]} <ArrowRight className="ml-1 h-4 w-4" />
                       </Button>
                    </CardContent>
                  </Card>
                </a>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {user.role === 'faculty' && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Featured Hall</CardTitle>
            <CardDescription>Check out one of our premier seminar halls.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row gap-6 items-center">
            <Image 
              src="https://placehold.co/300x200.png" 
              alt="Featured Hall" 
              data-ai-hint="modern lecture"
              width={300} 
              height={200} 
              className="rounded-lg object-cover shadow-md"
            />
            <div>
              <h3 className="text-xl font-semibold">APEX Auditorium</h3>
              <p className="text-muted-foreground mt-1 mb-3">Located in the APEX Block, this auditorium is perfect for large conferences and events, seating up to 500 guests.</p>
              <Button asChild>
                <Link href="/dashboard/book/apex">Book APEX Auditorium</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
