
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
import { CheckCircle, Clock, HelpCircle, XCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select as ShadcnSelect, SelectContent as ShadcnSelectContent, SelectItem as ShadcnSelectItem, SelectTrigger as ShadcnSelectTrigger, SelectValue as ShadcnSelectValue } from "@/components/ui/select";
import { bookings as bookingsAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const HALL_CONFIG_STORAGE_KEY = "hallHubConfiguredHalls";

interface BookingApiResponse {
  _id: string;
  hall?: {
    _id: string;
    name: string;
  };
  hallId?: string;
  user?: {
    _id: string;
    name: string;
  };
  userId?: string;
  startTime: string;
  endTime: string;
  date?: string;
  purpose: string;
  status: string;
  createdAt: string;
  requestedAt?: string;
}

interface ApiError {
  response?: {
    status?: number;
    data?: {
      message?: string;
    };
  };
  message?: string;
}

interface CalendarViewProps {
  initialBookings?: Booking[];
  showHallFilter?: boolean;
}

export default function CalendarView({ initialBookings = [], showHallFilter = false }: CalendarViewProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedHallId, setSelectedHallId] = useState<string | "all">("all");
  const [allHalls, setAllHalls] = useState<Hall[]>(defaultHallsData);
  const { toast } = useToast();

  const initialBookingsDependency = useMemo(() => JSON.stringify(initialBookings), [initialBookings]);

  useEffect(() => {
    const fetchBookingsAndHalls = async () => {
      // Load configured halls (keep localStorage for hall configuration)
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

      // Fetch bookings from API instead of localStorage
      try {
        const currentInitialBookings = JSON.parse(initialBookingsDependency) as Booking[];

        if (currentInitialBookings.length > 0) {
          // Use provided initial bookings
          setBookings(currentInitialBookings.map(b => ({ ...b, date: new Date(b.date) })));
        } else {
          // Try to fetch approved bookings, fallback to user's own bookings if endpoint doesn't exist
          let response;
          try {
            console.log('🚀 Trying to fetch approved bookings...');
            response = await bookingsAPI.getApproved();
            console.log('✅ Successfully fetched approved bookings:', response.data?.length || 0);
          } catch (error: unknown) {
            const apiError = error as ApiError;
            console.log('❌ Approved bookings endpoint failed:', apiError.response?.status);
            console.log('🔄 Falling back to user bookings...');
            try {
              response = await bookingsAPI.getMyBookings();
              console.log('✅ Successfully fetched user bookings:', response.data?.length || 0);
            } catch (fallbackError) {
              console.error('❌ Both endpoints failed:', fallbackError);
              setBookings([]);
              return;
            }
          }

          const apiBookings = response.data.map((booking: BookingApiResponse) => ({
            id: booking._id,
            hallId: booking.hall?._id || booking.hallId,
            hallName: booking.hall?.name || 'Unknown Hall',
            userId: booking.user?._id || booking.userId,
            userName: booking.user?.name || 'Unknown User',
            date: new Date(booking.startTime || booking.date || new Date()),
            startTime: new Date(booking.startTime).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            }),
            endTime: new Date(booking.endTime).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            }),
            purpose: booking.purpose,
            status: booking.status,
            requestedAt: new Date(booking.createdAt || booking.requestedAt || new Date()),
          }));

          setBookings(apiBookings);
        }
      } catch (error) {
        console.error('Failed to fetch bookings for calendar:', error);
        toast({
          title: "Error",
          description: "Failed to load bookings for calendar. Please try again.",
          variant: "destructive",
        });
      }
    };

    fetchBookingsAndHalls();
  }, [initialBookingsDependency, toast]);

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

