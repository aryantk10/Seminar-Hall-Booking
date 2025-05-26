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
import { CheckCircle, Clock, XCircle, HelpCircle } from "lucide-react";

export default function AdminRequestsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.push("/dashboard"); // Redirect if not admin
      return;
    }
    if (user && user.role === 'admin') {
      const allBookings = JSON.parse(localStorage.getItem("hallHubBookings") || "[]") as Booking[];
      setBookings(
        allBookings
        .map(b => ({ ...b, date: new Date(b.date) })) // Ensure date is Date object
        .sort((a, b) => {
          if (a.status === 'pending' && b.status !== 'pending') return -1;
          if (a.status !== 'pending' && b.status === 'pending') return 1;
          return new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime();
        })
      );
    }
    setLoading(false);
  }, [user, authLoading, router]);

  const updateBookingStatus = (bookingId: string, newStatus: 'approved' | 'rejected') => {
    const updatedBookings = bookings.map(b => 
      b.id === bookingId ? { ...b, status: newStatus } : b
    );
    setBookings(updatedBookings);
    localStorage.setItem("hallHubBookings", JSON.stringify(updatedBookings));
  };

  const getStatusBadge = (status: Booking['status']) => {
    switch (status) {
      case 'approved': return <Badge variant="default" className="bg-green-500 hover:bg-green-600 text-white"><CheckCircle className="mr-1 h-3 w-3" />Approved</Badge>;
      case 'pending': return <Badge variant="secondary" className="bg-yellow-400 hover:bg-yellow-500 text-black"><Clock className="mr-1 h-3 w-3" />Pending</Badge>;
      case 'rejected': return <Badge variant="destructive"><XCircle className="mr-1 h-3 w-3" />Rejected</Badge>;
      default: return <Badge variant="outline"><HelpCircle className="mr-1 h-3 w-3" />Unknown</Badge>;
    }
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
                      <AdminBookingControls booking={booking} onUpdateBookingStatus={updateBookingStatus} />
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
          <CardDescription>History of approved and rejected requests.</CardDescription>
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
