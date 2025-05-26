"use client";
import CalendarView from "@/components/calendar/CalendarView";
import { useAuth } from "@/hooks/useAuth";

export default function CalendarPage() {
  const { user } = useAuth();
  // In a real app, fetch bookings based on user role or globally
  // For now, CalendarView fetches from localStorage

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Booking Calendar</h1>
        <p className="text-muted-foreground">
          Visualize all hall bookings. {user?.role === 'admin' ? 'Filter by hall to manage specific schedules.' : 'Check availability before making a request.'}
        </p>
      </div>
      <CalendarView showHallFilter={user?.role === 'admin'} />
    </div>
  );
}
