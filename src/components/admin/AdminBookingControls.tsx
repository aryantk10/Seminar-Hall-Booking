
"use client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { Booking } from "@/lib/types";
import { Check, Loader2, X } from "lucide-react";
import { useState, useMemo } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { checkPendingConflictWithApproved } from "@/lib/bookingUtils";

interface AdminBookingControlsProps {
  booking: Booking;
  allBookings: Booking[]; // All bookings to check against for conflicts
  onUpdateBookingStatus: (bookingId: string, newStatus: 'approved' | 'rejected') => void;
}

export default function AdminBookingControls({ booking, allBookings, onUpdateBookingStatus }: AdminBookingControlsProps) {
  const [isLoadingApprove, setIsLoadingApprove] = useState(false);
  const [isLoadingReject, setIsLoadingReject] = useState(false);
  const { toast } = useToast();

  const isConflictingWithApproved = useMemo(() => {
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
    // Simulate API call
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
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    onUpdateBookingStatus(booking.id, 'rejected');
    toast({
      title: "Booking Rejected",
      description: `Booking for ${booking.hallName} by ${booking.userName} has been rejected.`,
      variant: "destructive"
    });
    setIsLoadingReject(false);
  };

  if (booking.status !== 'pending') {
    return null; // No controls if not pending
  }

  const approveButtonDisabled = isLoadingApprove || isLoadingReject || isConflictingWithApproved;

  const approveButton = (
    <Button 
      size="sm" 
      variant="default" 
      className="bg-green-500 hover:bg-green-600 text-white"
      onClick={handleApprove}
      disabled={approveButtonDisabled}
    >
      {isLoadingApprove ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Check className="mr-1 h-4 w-4" />}
      Approve
    </Button>
  );

  return (
    <div className="flex gap-2">
      {isConflictingWithApproved ? (
        <Tooltip>
          <TooltipTrigger asChild>
            {/* Wrap button in a span for Tooltip to work when button is disabled */}
            <span tabIndex={0}>{approveButton}</span>
          </TooltipTrigger>
          <TooltipContent>
            <p>Conflicts with an approved booking for the same hall and time.</p>
          </TooltipContent>
        </Tooltip>
      ) : (
        approveButton
      )}
      <Button 
        size="sm" 
        variant="destructive"
        onClick={handleReject}
        disabled={isLoadingApprove || isLoadingReject}
      >
         {isLoadingReject ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <X className="mr-1 h-4 w-4" />}
        Reject
      </Button>
    </div>
  );
}
