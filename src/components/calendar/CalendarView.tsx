
"use client";

import { useState, useEffect, useMemo } from "react"; 
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { Booking, Hall } from "@/lib/types";
import { halls as defaultHallsData } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { format,isSameDay } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, HelpCircle, XCircle, Building } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select as ShadcnSelect, SelectContent as ShadcnSelectContent, SelectItem as ShadcnSelectItem, SelectTrigger as ShadcnSelectTrigger, SelectValue as ShadcnSelectValue } from "@/components/ui/select";

const HALL_CONFIG_STORAGE_KEY = "hallHubConfiguredHalls";

interface CalendarViewProps {
  initialBookings?: Booking[];
  showHallFilter?: boolean;
}

export default function CalendarView({ initialBookings = [], showHallFilter = false }: CalendarViewProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedHallId, setSelectedHallId] = useState<string | "all">("all");
  const [allHalls, setAllHalls] = useState<Hall[]>(defaultHallsData);

  const initialBookingsDependency = useMemo(() => JSON.stringify(initialBookings), [initialBookings]);

  useEffect(() => {
    const storedHallsString = localStorage.getItem(HALL_CONFIG_STORAGE_KEY);
    if (storedHallsString) {
      try {
        setAllHalls(JSON.parse(storedHallsString));
      } catch (error) {
        console.error("Failed to parse configured halls from localStorage for CalendarView", error);
        localStorage.setItem(HALL_CONFIG_STORAGE_KEY, JSON.stringify(defaultHallsData));
        setAllHalls(defaultHallsData);
      }
    } else {
      localStorage.setItem(HALL_CONFIG_STORAGE_KEY, JSON.stringify(defaultHallsData));
      setAllHalls(defaultHallsData);
    }

    const currentInitialBookings = JSON.parse(initialBookingsDependency) as Booking[];
    const storedBookings = JSON.parse(localStorage.getItem("hallHubBookings") || "[]") as Booking[];
    const dataToProcess = currentInitialBookings.length > 0 ? currentInitialBookings : storedBookings;
    
    setBookings(dataToProcess.map(b => ({ ...b, date: new Date(b.date) })));
  }, [initialBookingsDependency]); 

  const bookingsForSelectedDate = useMemo(() => {
    if (!date) return [];
    return bookings
      .filter(b => isSameDay(b.date, date))
      .filter(b => selectedHallId === "all" || b.hallId === selectedHallId)
      .sort((a, b) => parseInt(a.startTime.replace(":", "")) - parseInt(b.startTime.replace(":", "")));
  }, [date, bookings, selectedHallId]);

  const bookingsByDay = useMemo(() => {
    const grouped: { [dateStr: string]: Booking[] } = {};
    bookings
        .filter(b => selectedHallId === "all" || b.hallId === selectedHallId)
        .forEach(booking => {
            // Use a specific time like noon to avoid DST issues if just date string is used for new Date()
            const dateStr = format(new Date(booking.date), "yyyy-MM-dd");
            if (!grouped[dateStr]) {
                grouped[dateStr] = [];
            }
            grouped[dateStr].push(booking);
        });
    return grouped;
  }, [bookings, selectedHallId]);

  const approvedDays = useMemo(() => {
      return Object.keys(bookingsByDay)
          .filter(dateStr => bookingsByDay[dateStr].some(b => b.status === 'approved'))
          .map(dateStr => new Date(dateStr + 'T12:00:00')); // Using T12:00:00 to be safe with timezones
  }, [bookingsByDay]);

  const pendingOnlyDays = useMemo(() => {
      return Object.keys(bookingsByDay)
          .filter(dateStr => {
              const dayBookings = bookingsByDay[dateStr];
              return dayBookings.some(b => b.status === 'pending') && !dayBookings.some(b => b.status === 'approved');
          })
          .map(dateStr => new Date(dateStr + 'T12:00:00'));
  }, [bookingsByDay]);

  const rejectedOnlyDays = useMemo(() => {
      return Object.keys(bookingsByDay)
          .filter(dateStr => {
              const dayBookings = bookingsByDay[dateStr];
              return dayBookings.some(b => b.status === 'rejected') &&
                     !dayBookings.some(b => b.status === 'approved') &&
                     !dayBookings.some(b => b.status === 'pending');
          })
          .map(dateStr => new Date(dateStr + 'T12:00:00'));
  }, [bookingsByDay]);


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
          <CardDescription>
            Days are highlighted by their highest-priority booking status:
            <span className="inline-block w-3 h-3 rounded-full mx-1 align-middle" style={{backgroundColor: 'hsl(var(--primary))'}} /> Approved (takes precedence),
            then <span className="inline-block w-3 h-3 rounded-full mx-1 align-middle" style={{backgroundColor: 'hsl(var(--accent))'}} /> Pending,
            then <span className="inline-block w-3 h-3 rounded-full mx-1 align-middle" style={{backgroundColor: 'hsl(var(--muted))'}} /> Rejected.
            Click a day to see all its bookings.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border p-4"
            modifiers={{ 
              approved: approvedDays,
              pending: pendingOnlyDays,
              rejected: rejectedOnlyDays,
            }}
            modifiersStyles={{ 
              approved: { border: "2px solid hsl(var(--primary))", borderRadius: "var(--radius)" },
              pending: { border: "2px solid hsl(var(--accent))", borderRadius: "var(--radius)" },
              rejected: { border: "2px solid hsl(var(--muted))", borderRadius: "var(--radius)", opacity: 0.6 },
            }}
            disabled={(d) => d < new Date(new Date().setDate(new Date().getDate()-1))} 
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

