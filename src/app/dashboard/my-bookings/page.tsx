"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import type { Booking } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, Clock, XCircle, Trash2, HelpCircle, ExternalLink, Bell } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Link from "next/link";

export default function MyBookingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Array<{ message: string; timestamp: Date }>>([]);

  useEffect(() => {
    if (user) {
      const allBookings = JSON.parse(localStorage.getItem("hallHubBookings") || "[]") as Booking[];
      const userBookings = allBookings
        .filter(b => b.userId === user.id)
        .map(b => ({ ...b, date: new Date(b.date) }))
        .sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());
      setBookings(userBookings);

      // Check for notifications
      const allNotifications = JSON.parse(localStorage.getItem("userNotifications") || "[]");
      const userNotifications = allNotifications
        .filter((n: any) => n.userId === user.id)
        .map((n: any) => ({ ...n, timestamp: new Date(n.timestamp) }))
        .sort((a: any, b: any) => b.timestamp.getTime() - a.timestamp.getTime());
      setNotifications(userNotifications);
    }
    setLoading(false);
  }, [user]);

  const cancelBooking = (bookingId: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    const updatedBookings = bookings.filter(b => b.id !== bookingId);
    const allBookingsStorage = JSON.parse(localStorage.getItem("hallHubBookings") || "[]") as Booking[];
    const updatedAllBookingsStorage = allBookingsStorage.map(b => 
      b.id === bookingId ? { ...b, status: 'cancelled' } : b
    );
    
    localStorage.setItem("hallHubBookings", JSON.stringify(updatedAllBookingsStorage));
    setBookings(updatedBookings);

    // Notify admin about the cancellation
    if (booking) {
      const adminNotification = `Faculty ${user?.name} has cancelled their booking for ${booking.hallName} on ${format(new Date(booking.date), "PPP")}.`;
      const adminNotifications = JSON.parse(localStorage.getItem("adminNotifications") || "[]");
      localStorage.setItem("adminNotifications", JSON.stringify([...adminNotifications, adminNotification]));
    }

    toast({
      title: "Booking Cancelled",
      description: "Your booking has been cancelled.",
    });
  };

  const clearNotifications = () => {
    const allNotifications = JSON.parse(localStorage.getItem("userNotifications") || "[]");
    const otherUsersNotifications = allNotifications.filter((n: any) => n.userId !== user?.id);
    localStorage.setItem("userNotifications", JSON.stringify(otherUsersNotifications));
    setNotifications([]);
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

  if (loading) {
    return <p>Loading your bookings...</p>;
  }

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
                <li key={index} className="text-sm">
                  {notification.message}
                  <span className="block text-xs text-muted-foreground">
                    {format(new Date(notification.timestamp), "PPp")}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">My Booking Requests</CardTitle>
          <CardDescription>View and manage your seminar hall booking requests.</CardDescription>
        </CardHeader>
        <CardContent>
          {bookings.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground mb-4">You haven&apos;t made any booking requests yet.</p>
              <Button asChild>
                <Link href="/dashboard/halls">Book a Hall <ExternalLink className="ml-2 h-4 w-4" /></Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Hall Name</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Purpose</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Requested At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-medium">{booking.hallName || 'N/A'}</TableCell>
                    <TableCell>{format(new Date(booking.date), "PPP")}</TableCell>
                    <TableCell>{booking.startTime} - {booking.endTime}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{booking.purpose}</TableCell>
                    <TableCell>{getStatusBadge(booking.status)}</TableCell>
                    <TableCell>{format(new Date(booking.requestedAt), "PPp")}</TableCell>
                    <TableCell className="text-right">
                      {(booking.status === 'pending' || booking.status === 'approved') && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              <Trash2 className="mr-1 h-4 w-4" /> Cancel
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently cancel your booking {booking.status === 'approved' ? '' : 'request'} for {booking.hallName} on {format(new Date(booking.date), "PPP")}.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Keep {booking.status === 'approved' ? 'Booking' : 'Request'}</AlertDialogCancel>
                              <AlertDialogAction onClick={() => cancelBooking(booking.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                Yes, Cancel {booking.status === 'approved' ? 'Booking' : 'Request'}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                      {booking.status !== 'pending' && booking.status !== 'approved' && (
                        <span className="text-xs text-muted-foreground">No actions</span>
                      )}
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
