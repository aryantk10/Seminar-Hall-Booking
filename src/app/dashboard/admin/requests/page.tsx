"use client";
import { useEffect, useState } from "react";
import type { Booking } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import AdminBookingControls from "@/components/admin/AdminBookingControls";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { CheckCircle, Clock, XCircle, HelpCircle, Trash2, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { bookings as bookingsAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { getBookingTime } from "@/lib/time-utils";

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

export default function AdminRequestsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<string[]>([]);

  useEffect(() => {
    const fetchAllBookings = async () => {
      if (!authLoading && (!user || user.role !== 'admin')) {
        router.push("/dashboard"); // Redirect if not admin
        return;
      }

      if (user && user.role === 'admin') {
        try {
          // Fetch all bookings from API instead of localStorage
          const response = await bookingsAPI.getAll();
          const apiBookings = (response.data as BookingApiResponse[]).map((booking: BookingApiResponse) => ({
            id: booking._id,
            hallId: booking.hall?._id || booking.hallId || '',
            hallName: booking.hall?.name || 'Unknown Hall',
            userId: booking.user?._id || booking.userId || '',
            userName: booking.user?.name || 'Unknown User',
            date: new Date(booking.startTime || booking.date || new Date()),
            startTime: getBookingTime(booking.startTime),
            endTime: getBookingTime(booking.endTime),
            purpose: booking.purpose,
            status: booking.status as 'pending' | 'approved' | 'rejected' | 'cancelled',
            requestedAt: new Date(booking.createdAt || booking.requestedAt || new Date()),
          }));

          setBookings(apiBookings.sort((a, b) => {
            if (a.status === 'pending' && b.status !== 'pending') return -1;
            if (a.status !== 'pending' && b.status === 'pending') return 1;
            return new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime();
          }));

          // For now, keep notifications from localStorage (can be migrated later)
          const storedNotifications = JSON.parse(localStorage.getItem("adminNotifications") || "[]") as string[];
          setNotifications(storedNotifications);
        } catch (error) {
          console.error('Failed to fetch bookings:', error);
          toast({
            title: "Error",
            description: "Failed to load booking requests. Please try again.",
            variant: "destructive",
          });
        }
      }
      setLoading(false);
    };

    fetchAllBookings();
  }, [user, authLoading, router, toast]);

  const updateBookingStatus = async (bookingId: string, newStatus: 'approved' | 'rejected' | 'cancelled') => {
    try {
      // Make API call to update booking status
      if (newStatus === 'approved') {
        await bookingsAPI.approve(bookingId);
      } else if (newStatus === 'rejected') {
        await bookingsAPI.reject(bookingId);
      } else if (newStatus === 'cancelled') {
        await bookingsAPI.delete(bookingId);
      }

      // Update local state
      const updatedBookings = bookings.map(b =>
        b.id === bookingId ? { ...b, status: newStatus } : b
      );
      setBookings(updatedBookings);

      // If admin cancels a booking, notify the faculty (keep localStorage for now)
      if (newStatus === 'cancelled') {
        const booking = bookings.find(b => b.id === bookingId);
        if (booking) {
          const facultyNotification = {
            userId: booking.userId,
            message: `Your booking for ${booking.hallName} on ${format(new Date(booking.date), "PPP")} has been cancelled by admin.`,
            timestamp: new Date(),
          };
          const userNotifications = JSON.parse(localStorage.getItem("userNotifications") || "[]");
          localStorage.setItem("userNotifications", JSON.stringify([...userNotifications, facultyNotification]));
        }
      }

      toast({
        title: "Booking Updated",
        description: `Booking has been ${newStatus}.`,
      });
    } catch (error) {
      console.error('Failed to update booking:', error);
      toast({
        title: "Error",
        description: "Failed to update booking status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: Booking['status']) => {
    switch (status) {
      case 'approved': return <Badge variant="default"><CheckCircle className="mr-1 h-3 w-3" />Approved</Badge>;
      case 'pending': return <Badge variant="secondary"><Clock className="mr-1 h-3 w-3" />Pending</Badge>;
      case 'rejected': return <Badge variant="destructive"><XCircle className="mr-1 h-3 w-3" />Rejected</Badge>;
      case 'cancelled': return <Badge variant="outline"><Trash2 className="mr-1 h-3 w-3" />Cancelled</Badge>;
      default: return <Badge variant="outline"><HelpCircle className="mr-1 h-3 w-3" />Unknown</Badge>;
    }
  };

  const clearNotifications = () => {
    setNotifications([]);
    localStorage.setItem("adminNotifications", "[]");
  };

  if (loading || authLoading) {
    return <p>Loading booking requests...</p>;
  }
  if (!user || user.role !== 'admin') {
    return <p>Access Denied.</p>;
  }

  const pendingBookings = bookings.filter(b => b.status === 'pending');
  const processedBookings = bookings.filter(b => b.status !== 'pending');

  return (
    <div className="space-y-8">
      {notifications.length > 0 && (
        <Card className="bg-muted">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              <Bell className="inline-block w-4 h-4 mr-2" />
              Notifications
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={clearNotifications}>
              Clear All
            </Button>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {notifications.map((notification, index) => (
                <li key={index} className="text-sm">{notification}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Pending Booking Requests</CardTitle>
          <CardDescription>Review and manage new seminar hall booking requests.</CardDescription>
        </CardHeader>
        <CardContent>
          {pendingBookings.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No pending booking requests.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Faculty Name</TableHead>
                  <TableHead>Hall Name</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Purpose</TableHead>
                  <TableHead>Requested At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingBookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-medium">{booking.userName}</TableCell>
                    <TableCell>{booking.hallName}</TableCell>
                    <TableCell>{format(new Date(booking.date), "PPP")} <br/> {booking.startTime} - {booking.endTime}</TableCell>
                    <TableCell className="max-w-[250px] truncate" title={booking.purpose}>{booking.purpose}</TableCell>
                    <TableCell>{format(new Date(booking.requestedAt), "PPp")}</TableCell>
                    <TableCell className="text-right">
                      <AdminBookingControls 
                        booking={booking} 
                        allBookings={bookings}
                        onUpdateBookingStatus={updateBookingStatus} 
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Processed Booking Requests</CardTitle>
          <CardDescription>History of approved, rejected, and cancelled requests.</CardDescription>
        </CardHeader>
        <CardContent>
           {processedBookings.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No processed booking requests yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Faculty Name</TableHead>
                  <TableHead>Hall Name</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Purpose</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {processedBookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-medium">{booking.userName}</TableCell>
                    <TableCell>{booking.hallName}</TableCell>
                    <TableCell>{format(new Date(booking.date), "PPP")} <br/> {booking.startTime} - {booking.endTime}</TableCell>
                    <TableCell className="max-w-[250px] truncate" title={booking.purpose}>{booking.purpose}</TableCell>
                    <TableCell>{getStatusBadge(booking.status)}</TableCell>
                    <TableCell className="text-right">
                      <AdminBookingControls 
                        booking={booking} 
                        allBookings={bookings}
                        onUpdateBookingStatus={updateBookingStatus} 
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
