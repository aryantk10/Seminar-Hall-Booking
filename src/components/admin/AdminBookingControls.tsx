"use client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { Booking } from "@/lib/types";
import { Check, Loader2, X, Trash2 } from "lucide-react";
import { useState, useMemo } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { checkPendingConflictWithApproved } from "@/lib/bookingUtils";
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

interface AdminBookingControlsProps {
  booking: Booking;
  allBookings: Booking[]; // All bookings to check against for conflicts
  onUpdateBookingStatus: (bookingId: string, newStatus: 'approved' | 'rejected' | 'cancelled') => void;
}

export default function AdminBookingControls({ booking, allBookings, onUpdateBookingStatus }: AdminBookingControlsProps) {
  const [isLoadingApprove, setIsLoadingApprove] = useState(false);
  const [isLoadingReject, setIsLoadingReject] = useState(false);
  const [isLoadingCancel, setIsLoadingCancel] = useState(false);
  const { toast } = useToast();

  const isConflictingWithApproved = useMemo(() => {
    if (booking.status === 'approved') return false;
    return checkPendingConflictWithApproved(booking, allBookings);
  }, [booking, allBookings]);

  const handleApprove = async () => {
    if (isConflictingWithApproved) {
      toast({
        title: "Cannot Approve",
        description: "This booking conflicts with an already approved booking.",
        variant: "destructive",
      });
      return;
    }
    setIsLoadingApprove(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    onUpdateBookingStatus(booking.id, 'approved');
    toast({
      title: "Booking Approved",
      description: `Booking for ${booking.hallName} by ${booking.userName} has been approved.`,
    });
    setIsLoadingApprove(false);
  };

  const handleReject = async () => {
    setIsLoadingReject(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    onUpdateBookingStatus(booking.id, 'rejected');
    toast({
      title: "Booking Rejected",
      description: `Booking for ${booking.hallName} by ${booking.userName} has been rejected.`,
      variant: "destructive"
    });
    setIsLoadingReject(false);
  };

  const handleCancel = async () => {
    setIsLoadingCancel(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    onUpdateBookingStatus(booking.id, 'cancelled');
    toast({
      title: "Booking Cancelled",
      description: `Booking for ${booking.hallName} by ${booking.userName} has been cancelled.`,
      variant: "destructive"
    });
    setIsLoadingCancel(false);
  };

  // For approved bookings, show only the cancel option
  if (booking.status === 'approved') {
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button 
            size="sm" 
            variant="outline"
            className="border-destructive text-destructive hover:bg-destructive/10"
            disabled={isLoadingCancel}
          >
            {isLoadingCancel ? (
              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="mr-1 h-4 w-4" />
            )}
            Cancel Booking
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Approved Booking?</AlertDialogTitle>
            <AlertDialogDescription>
              This will cancel the approved booking for {booking.hallName} by {booking.userName}. 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Booking</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancel} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Yes, Cancel Booking
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  // For pending bookings, show approve/reject options
  if (booking.status === 'pending') {
    return (
      <div className="flex gap-2">
        {isConflictingWithApproved ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <span tabIndex={0}>
                <Button 
                  size="sm" 
                  variant="default"
                  className="bg-green-500 hover:bg-green-600 text-white"
                  onClick={handleApprove}
                  disabled={true}
                >
                  <Check className="mr-1 h-4 w-4" />
                  Approve
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>Conflicts with an approved booking for the same hall and time.</p>
            </TooltipContent>
          </Tooltip>
        ) : (
          <Button 
            size="sm" 
            variant="default"
            className="bg-green-500 hover:bg-green-600 text-white"
            onClick={handleApprove}
            disabled={isLoadingApprove || isLoadingReject}
          >
            {isLoadingApprove ? (
              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
            ) : (
              <Check className="mr-1 h-4 w-4" />
            )}
            Approve
          </Button>
        )}
        <Button 
          size="sm" 
          variant="destructive"
          onClick={handleReject}
          disabled={isLoadingApprove || isLoadingReject}
        >
          {isLoadingReject ? (
            <Loader2 className="mr-1 h-4 w-4 animate-spin" />
          ) : (
            <X className="mr-1 h-4 w-4" />
          )}
          Reject
        </Button>
      </div>
    );
  }

  // For rejected or cancelled bookings, show nothing
  return null;
}
