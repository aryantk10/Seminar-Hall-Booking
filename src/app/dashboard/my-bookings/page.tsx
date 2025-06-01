"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import type { Booking } from "@/lib/types";
import { bookings as bookingsAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
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
    email: string;
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
  message?: string;
  response?: {
    status?: number;
    data?: {
      message?: string;
    };
  };
}

export default function MyBookingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Array<{ message: string; timestamp: Date }>>([]);

  useEffect(() => {
    const fetchMyBookings = async () => {
      if (user) {
        try {
          // NUCLEAR OPTION: Clear ALL possible localStorage booking keys
          const keysToRemove = [
            "hallHubBookings",
            "bookings",
            "userBookings",
            "myBookings",
            "allBookings",
            "testBookings"
          ];
          keysToRemove.forEach(key => {
            localStorage.removeItem(key);
            console.log(`🔥 CLEARED localStorage ${key}`);
          });

          // Also check what's actually in localStorage
          console.log('📋 Current localStorage keys:', Object.keys(localStorage));
          console.log('📋 Current localStorage content:', localStorage);

          // Fetch bookings from API instead of localStorage
          console.log('🚀 Making API call to getMyBookings...');
          console.log('🌐 API URL being called:', `${process.env.NEXT_PUBLIC_API_URL}/bookings/my`);
          console.log('👤 Current user:', user);
          console.log('🔑 Auth token exists:', !!localStorage.getItem('token'));

          // FORCE SYNC: Get user bookings and manually fetch from API
          console.log('🔍 FORCING SYNC: Fetching user bookings...');
          console.log('🌐 API URL:', `${process.env.NEXT_PUBLIC_API_URL}/bookings/my`);

          // Try direct API call with timeout
          let response;
          try {
            console.log('⏰ Starting API call with 10 second timeout...');
            const timeoutPromise = new Promise((_, reject) =>
              setTimeout(() => reject(new Error('API call timeout')), 10000)
            );

            response = await Promise.race([
              bookingsAPI.getMyBookings(),
              timeoutPromise
            ]);
            console.log('✅ SUCCESS: getMyBookings worked');
          } catch (error: unknown) {
            const apiError = error as ApiError;
            console.log('❌ getMyBookings failed:', apiError.message);
            console.log('🔧 Trying direct fetch...');

            const token = localStorage.getItem('token');
            const directResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bookings/my`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              signal: AbortSignal.timeout(10000)
            });

            if (!directResponse.ok) {
              throw new Error(`HTTP ${directResponse.status}: ${directResponse.statusText}`);
            }

            const data = await directResponse.json();
            response = { data };
            console.log('🔧 Direct fetch result:', data);
          }

          console.log('📊 USER BOOKINGS FROM API:', response.data);
          console.log('📡 API Response:', response);
          console.log('📡 API Response Data:', response.data);
          console.log('📡 Number of bookings returned:', response.data?.length || 0);

          if (response.data && response.data.length > 0) {
            console.log('📡 First booking details:', response.data[0]);
            console.log('📡 First booking hall:', response.data[0].hall);
            console.log('📡 First booking user:', response.data[0].user);

            // Check all users in the bookings
            const allUsers = response.data.map((booking: BookingApiResponse) => ({
              bookingId: booking._id,
              userId: booking.user?._id,
              userEmail: booking.user?.email,
              userName: booking.user?.name,
              hallName: booking.hall?.name,
              purpose: booking.purpose
            }));
            console.log('👥 ALL USERS IN BOOKINGS:', allUsers);

            // Check if current user matches any booking users
            const currentUserEmail = user?.email;
            const matchingBookings = allUsers.filter(b => b.userEmail === currentUserEmail);
            console.log(`🔍 Current user email: ${currentUserEmail}`);
            console.log(`🔍 Matching bookings for current user:`, matchingBookings);
          }
          // SMART FILTER: Remove corrupted data but keep real bookings
          console.log('🔥 SMART FILTERING: Removing only corrupted data');
          const validBookings = response.data.filter((booking: BookingApiResponse) => {
            // Only filter out bookings with null users or Test Hall
            const hasValidUser = booking.user && booking.user._id;
            const hasValidHall = booking.hall && booking.hall.name && booking.hall.name !== 'Test Hall';
            const isValid = hasValidUser && hasValidHall;

            if (!isValid) {
              console.log('🚫 Filtering corrupted booking:', {
                id: booking._id,
                user: booking.user,
                hall: booking.hall,
                reason: !hasValidUser ? 'No valid user' : 'Invalid hall'
              });

              // Try to delete corrupted booking
              if (booking._id) {
                console.log('🗑️ Attempting to delete corrupted booking:', booking._id);
                bookingsAPI.delete(booking._id).then(() => {
                  console.log('✅ Successfully deleted corrupted booking');
                }).catch((error) => {
                  console.log('❌ Failed to delete corrupted booking:', error);
                });
              }
            }

            return isValid;
          });

          console.log(`📊 Total bookings: ${response.data.length}`);
          console.log(`📊 Valid bookings after filtering: ${validBookings.length}`);

          // TEMPORARY: Show ALL bookings to debug sync issue
          const apiBookings = validBookings.map((booking: BookingApiResponse) => ({
            id: booking._id,
            hallId: booking.hall?._id || booking.hallId || 'no-hall-id',
            hallName: booking.hall?.name || 'Unknown Hall',
            userId: booking.user?._id || booking.userId || 'no-user-id',
            userName: booking.user?.name || user?.name || 'Unknown User',
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

          console.log('📊 Processed bookings:', apiBookings);
          setBookings(apiBookings.sort((a, b) =>
            new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()
          ));
          console.log('✅ Bookings set in state');

          // For now, keep notifications from localStorage (can be migrated later)
          const allNotifications = JSON.parse(localStorage.getItem("userNotifications") || "[]");
          interface Notification {
            userId: string;
            message: string;
            timestamp: string | Date;
          }

          const userNotifications = allNotifications
            .filter((n: Notification) => n.userId === user.id)
            .map((n: Notification) => ({ ...n, timestamp: new Date(n.timestamp) }))
            .sort((a: Notification, b: Notification) =>
              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
            );
          setNotifications(userNotifications);
        } catch (error) {
          console.error('❌ API CALL FAILED:', error);
          console.log('🔄 FALLING BACK TO EMPTY ARRAY - NO LOCALSTORAGE FALLBACK');
          setBookings([]); // Set empty array instead of localStorage fallback
          toast({
            title: "Error",
            description: "Failed to load your bookings. Please try again.",
            variant: "destructive",
          });
        }
      }
      setLoading(false);
    };

    fetchMyBookings();
  }, [user, toast]);

  const cancelBooking = async (bookingId: string) => {
    try {
      const booking = bookings.find(b => b.id === bookingId);

      // Make API call to cancel booking
      await bookingsAPI.delete(bookingId);

      // Update local state
      const updatedBookings = bookings.filter(b => b.id !== bookingId);
      setBookings(updatedBookings);

      // Notify admin about the cancellation (keep localStorage for now)
      if (booking) {
        const adminNotification = `Faculty ${user?.name} has cancelled their booking for ${booking.hallName} on ${format(new Date(booking.date), "PPP")}.`;
        const adminNotifications = JSON.parse(localStorage.getItem("adminNotifications") || "[]");
        localStorage.setItem("adminNotifications", JSON.stringify([...adminNotifications, adminNotification]));
      }

      toast({
        title: "Booking Cancelled",
        description: "Your booking has been cancelled successfully.",
      });
    } catch (error) {
      console.error('Failed to cancel booking:', error);
      toast({
        title: "Error",
        description: "Failed to cancel booking. Please try again.",
        variant: "destructive",
      });
    }
  };

  const clearNotifications = () => {
    const allNotifications = JSON.parse(localStorage.getItem("userNotifications") || "[]");
    const otherUsersNotifications = allNotifications.filter((n: { userId: string }) => n.userId !== user?.id);
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
