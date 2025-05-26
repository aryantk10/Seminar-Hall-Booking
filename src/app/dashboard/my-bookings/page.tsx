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
import { CheckCircle, Clock, XCircle, Trash2, HelpCircle, ExternalLink } from "lucide-react";
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

  useEffect(() => {
    if (user) {
      const allBookings = JSON.parse(localStorage.getItem("hallHubBookings") || "[]") as Booking[];
      const userBookings = allBookings
        .filter(b => b.userId === user.id)
        .map(b => ({ ...b, date: new Date(b.date) })) // Ensure date is Date object
        .sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());
      setBookings(userBookings);
    }
    setLoading(false);
  }, [user]);

  const cancelBooking = (bookingId: string) => {
    const updatedBookings = bookings.filter(b => b.id !== bookingId);
    const allBookingsStorage = JSON.parse(localStorage.getItem("hallHubBookings") || "[]") as Booking[];
    const updatedAllBookingsStorage = allBookingsStorage.filter(b => b.id !== bookingId);
    
    localStorage.setItem("hallHubBookings", JSON.stringify(updatedAllBookingsStorage));
    setBookings(updatedBookings);
    toast({
      title: "Booking Cancelled",
      description: "Your booking request has been cancelled.",
    });
  };
  
  const getStatusBadge = (status: Booking['status']) => {
    switch (status) {
      case 'approved': return <Badge variant="default" className="bg-green-500 hover:bg-green-600 text-white"><CheckCircle className="mr-1 h-3 w-3" />Approved</Badge>;
      case 'pending': return <Badge variant="secondary" className="bg-yellow-400 hover:bg-yellow-500 text-black"><Clock className="mr-1 h-3 w-3" />Pending</Badge>;
      case 'rejected': return <Badge variant="destructive"><XCircle className="mr-1 h-3 w-3" />Rejected</Badge>;
      default: return <Badge variant="outline"><HelpCircle className="mr-1 h-3 w-3" />Unknown</Badge>;
    }
  };

  if (loading) {
    return <p>Loading your bookings...</p>;
  }

  return (
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
                    {booking.status === 'pending' && (
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
                              This action cannot be undone. This will permanently cancel your booking request for {booking.hallName} on {format(new Date(booking.date), "PPP")}.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Keep Request</AlertDialogCancel>
                            <AlertDialogAction onClick={() => cancelBooking(booking.id)} className={buttonVariants({variant: "destructive"})}>
                              Yes, Cancel Booking
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                    {booking.status !== 'pending' && (
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
  );
}

// Minimal buttonVariants for AlertDialogAction styling
const buttonVariants = ({variant}: {variant: string}) => {
  if (variant === "destructive") return "bg-destructive text-destructive-foreground hover:bg-destructive/90";
  return "";
}
