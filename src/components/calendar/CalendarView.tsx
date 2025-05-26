
"use client";

import { useState, useEffect, useMemo } from "react"; // Added useMemo
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { Booking, Hall } from "@/lib/types";
import { halls as allHallsData } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { format,isSameDay } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, HelpCircle, XCircle, Building } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
// Dummy Select component imports (remove if shadcn Select is fully integrated and working)
import { Select as ShadcnSelect, SelectContent as ShadcnSelectContent, SelectItem as ShadcnSelectItem, SelectTrigger as ShadcnSelectTrigger, SelectValue as ShadcnSelectValue } from "@/components/ui/select";


interface CalendarViewProps {
  initialBookings?: Booking[];
  showHallFilter?: boolean;
}

export default function CalendarView({ initialBookings = [], showHallFilter = false }: CalendarViewProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedHallId, setSelectedHallId] = useState<string | "all">("all");
  const [allHalls, setAllHalls] = useState<Hall[]>(allHallsData);

  // Create a stable string representation of initialBookings for the useEffect dependency
  // This prevents loops when initialBookings is the default empty array (which is a new reference on each render)
  const initialBookingsDependency = useMemo(() => JSON.stringify(initialBookings), [initialBookings]);

  useEffect(() => {
    // Parse the stable string back to an array for use in the effect logic
    const currentInitialBookings = JSON.parse(initialBookingsDependency) as Booking[];
    
    const storedBookings = JSON.parse(localStorage.getItem("hallHubBookings") || "[]") as Booking[];
    
    // If currentInitialBookings (derived from the prop) has content, use it; otherwise, use storedBookings.
    const dataToProcess = currentInitialBookings.length > 0 ? currentInitialBookings : storedBookings;
    
    setBookings(dataToProcess.map(b => ({ ...b, date: new Date(b.date) })));
  }, [initialBookingsDependency]); // Depend on the stable stringified version

  const bookingsForSelectedDate = useMemo(() => {
    if (!date) return [];
    return bookings
      .filter(b => isSameDay(b.date, date))
      .filter(b => selectedHallId === "all" || b.hallId === selectedHallId)
      .sort((a, b) => parseInt(a.startTime.replace(":", "")) - parseInt(b.startTime.replace(":", "")));
  }, [date, bookings, selectedHallId]);

  const bookedDays = useMemo(() => {
    return bookings
    .filter(b => b.status === 'approved') // Only consider approved bookings for highlighting
    .filter(b => selectedHallId === "all" || b.hallId === selectedHallId)
    .map(b => new Date(b.date));
  }, [bookings, selectedHallId]);

  const getStatusBadge = (status: Booking['status']) => {
    switch (status) {
      case 'approved': return <Badge variant="default" className="bg-green-500 hover:bg-green-600 text-white"><CheckCircle className="mr-1 h-3 w-3" />Approved</Badge>;
      case 'pending': return <Badge variant="secondary" className="bg-yellow-400 hover:bg-yellow-500 text-black"><Clock className="mr-1 h-3 w-3" />Pending</Badge>;
      case 'rejected': return <Badge variant="destructive"><XCircle className="mr-1 h-3 w-3" />Rejected</Badge>;
      default: return <Badge variant="outline"><HelpCircle className="mr-1 h-3 w-3" />Unknown</Badge>;
    }
  };
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2 shadow-lg">
        <CardHeader>
          <CardTitle>Booking Calendar</CardTitle>
          <CardDescription>Select a date to view bookings. Days with approved bookings are highlighted.</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border p-4"
            modifiers={{ booked: bookedDays }}
            modifiersStyles={{ booked: { border: "2px solid hsl(var(--primary))", borderRadius: "var(--radius)" } }}
            disabled={(d) => d < new Date(new Date().setDate(new Date().getDate()-1))} // Allow today
          />
        </CardContent>
      </Card>

      <Card className="lg:col-span-1 shadow-lg">
        <CardHeader>
          <CardTitle>
            Bookings for {date ? format(date, "PPP") : "selected date"}
          </CardTitle>
          {showHallFilter && (
             <div className="pt-2">
                <label htmlFor="hallFilter" className="text-sm font-medium text-muted-foreground mr-2">Filter by Hall:</label>
                <ShadcnSelect value={selectedHallId} onValueChange={setSelectedHallId}>
                    <ShadcnSelectTrigger id="hallFilter" className="w-full md:w-[200px]">
                        <ShadcnSelectValue placeholder="All Halls" />
                    </ShadcnSelectTrigger>
                    <ShadcnSelectContent>
                        <ShadcnSelectItem value="all">All Halls</ShadcnSelectItem>
                        {allHalls.map(hall => (
                            <ShadcnSelectItem key={hall.id} value={hall.id}>{hall.name}</ShadcnSelectItem>
                        ))}
                    </ShadcnSelectContent>
                </ShadcnSelect>
             </div>
          )}
        </CardHeader>
        <CardContent>
          {bookingsForSelectedDate.length > 0 ? (
            <ScrollArea className="h-[300px] md:h-[400px]">
              <ul className="space-y-4">
                {bookingsForSelectedDate.map((booking) => (
                  <li key={booking.id} className="p-4 rounded-md border bg-card hover:bg-muted/50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-sm text-foreground">{booking.hallName || allHalls.find(h=>h.id === booking.hallId)?.name}</h4>
                        <p className="text-xs text-muted-foreground">
                          {booking.startTime} - {booking.endTime}
                        </p>
                      </div>
                      {getStatusBadge(booking.status)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">By: {booking.userName || 'N/A'}</p>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="link" size="sm" className="px-0 h-auto text-xs mt-1">View Purpose</Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-60 text-xs p-3" side="bottom" align="start">
                        <p className="font-semibold mb-1">Purpose:</p>
                        {booking.purpose}
                      </PopoverContent>
                    </Popover>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-10">
              No bookings for this date{selectedHallId !== "all" && ` in ${allHalls.find(h=>h.id === selectedHallId)?.name || 'selected hall'}`}.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Note: Removed dummy Select components as Shadcn/ui ones are imported.
// If Shadcn Select was not the issue, these dummy components were not the cause of the loop.
// The primary fix is the useMemo and useEffect dependency change.
