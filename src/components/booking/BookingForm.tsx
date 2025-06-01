
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
// Input component available if needed
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { CalendarIcon, Clock, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import type { Hall, Booking } from "@/lib/types";
import { timeSlots } from "@/lib/data";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { isBookingConflict } from "@/lib/bookingUtils"; // Import the utility
import { bookings as bookingsAPI } from "@/lib/api"; // Import API functions
import Link from "next/link";

const bookingFormSchema = z.object({
  date: z.date({ required_error: "A date is required." }),
  startTime: z.string({ required_error: "Start time is required." }),
  endTime: z.string({ required_error: "End time is required." }),
  purpose: z.string().min(10, { message: "Purpose must be at least 10 characters." }).max(500, { message: "Purpose cannot exceed 500 characters." }),
}).refine(data => {
  if (data.startTime && data.endTime) {
    return data.startTime < data.endTime;
  }
  return true;
}, {
  message: "End time must be after start time.",
  path: ["endTime"],
});

interface BookingFormProps {
  hall: Hall;
  existingBookings?: Booking[]; 
}

export default function BookingForm({ hall, existingBookings = [] }: BookingFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [availableEndTimes, setAvailableEndTimes] = useState<string[]>(timeSlots);
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof bookingFormSchema>>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      purpose: "",
    },
  });

  const selectedStartTime = form.watch("startTime");

  useEffect(() => {
    if (selectedStartTime) {
      const startIndex = timeSlots.indexOf(selectedStartTime);
      setAvailableEndTimes(timeSlots.slice(startIndex + 1));
    } else {
      setAvailableEndTimes(timeSlots);
    }
    form.setValue("endTime", ""); 
  }, [selectedStartTime, form]);

  const isSlotBooked = (selectedDate: Date, selectedStartTime: string, selectedEndTime: string): boolean => {
    const newBookingDetails = {
      hallId: hall.id,
      date: selectedDate,
      startTime: selectedStartTime,
      endTime: selectedEndTime,
    };

    return existingBookings.some(existingBooking => {
      if (existingBooking.status === 'approved') {
        // Ensure existingBooking.date is treated as a Date object for comparison
        const existingBookingForCheck = {
          ...existingBooking,
          date: new Date(existingBooking.date), 
        };
        return isBookingConflict(newBookingDetails, existingBookingForCheck);
      }
      return false;
    });
  };

  async function onSubmit(values: z.infer<typeof bookingFormSchema>) {
    console.log('🎯 FORM SUBMITTED - Starting booking process...');
    console.log('📝 Form values:', values);
    console.log('👤 User check:', !!user);
    console.log('🏢 Hall check:', !!hall);

    if (!user) {
      console.log('❌ VALIDATION FAILED - User not logged in');
      toast({ title: "Error", description: "You must be logged in to book.", variant: "destructive" });
      return;
    }

    console.log('✅ USER VALIDATION PASSED');
    setIsLoading(true);

    console.log('🔍 CHECKING SLOT CONFLICTS...');
    const hasConflict = isSlotBooked(values.date, values.startTime, values.endTime);
    console.log('⚡ Conflict check result:', hasConflict);

    if (hasConflict) {
      console.log('❌ BOOKING CONFLICT DETECTED');
      toast({
        title: "Booking Conflict",
        description: "The selected time slot is already booked or overlaps with an existing approved booking. Please choose another time.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    console.log('✅ NO CONFLICTS - Proceeding to API call...');

    try {
      // Create booking data for API
      const bookingData = {
        hallId: hall.id,
        startDate: values.date.toISOString(),
        endDate: values.date.toISOString(), // Same day
        purpose: values.purpose,
        attendees: 1, // Default value
        requirements: `Time: ${values.startTime} - ${values.endTime}`,
      };

      // Make API call to create booking
      console.log('🔐 Auth check - User:', user);
      console.log('🔐 Auth check - Token:', localStorage.getItem('token') ? 'EXISTS' : 'MISSING');
      console.log('🎯 Booking data:', bookingData);

      const response = await bookingsAPI.create(bookingData);

      toast({
        title: "Booking Request Submitted Successfully!",
        description: `Your request for ${hall.name} on ${format(values.date, "PPP")} from ${values.startTime} to ${values.endTime} has been submitted to the production database.`,
      });

      router.push("/dashboard/my-bookings");
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string }; status?: number } };
      console.error('Booking creation error:', error);

      toast({
        title: "Booking Failed",
        description: apiError.response?.data?.message || "Failed to create booking. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  // Quick auth check
  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-4">You need to be logged in to make a booking.</p>
        <Button asChild>
          <Link href="/login/faculty">Login to Continue</Link>
        </Button>
      </div>
    );
  }

  return (
    <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date(new Date().setHours(0,0,0,0)) } 
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="startTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Time</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <Clock className="mr-2 h-4 w-4 opacity-50 inline-block" />
                        <SelectValue placeholder="Select start time" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {timeSlots.map(slot => (
                        <SelectItem key={`start-${slot}`} value={slot}>{slot}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="endTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Time</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={!selectedStartTime}>
                    <FormControl>
                      <SelectTrigger>
                        <Clock className="mr-2 h-4 w-4 opacity-50 inline-block" />
                        <SelectValue placeholder="Select end time" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableEndTimes.map(slot => (
                        <SelectItem key={`end-${slot}`} value={slot}>{slot}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        
        <FormField
          control={form.control}
          name="purpose"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Purpose of Booking</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="e.g., Departmental meeting, Guest lecture on AI..."
                  className="resize-none"
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Briefly describe the event or reason for booking.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          size="lg"
          className="w-full md:w-auto"
          disabled={isLoading}
          onClick={() => {
            console.log('🖱️ SUBMIT BUTTON CLICKED');
            console.log('🔒 Button disabled:', isLoading);
            console.log('📝 Current form values:', form.getValues());
          }}
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Submit Booking Request
        </Button>
      </form>
    </Form>
  );
}
