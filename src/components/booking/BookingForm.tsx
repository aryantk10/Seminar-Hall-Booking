
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

  function onSubmit(values: z.infer<typeof bookingFormSchema>) {
    if (!user) {
      toast({ title: "Error", description: "You must be logged in to book.", variant: "destructive" });
      return;
    }
    setIsLoading(true);

    if (isSlotBooked(values.date, values.startTime, values.endTime)) {
      toast({
        title: "Booking Conflict",
        description: "The selected time slot is already booked or overlaps with an existing approved booking. Please choose another time.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    setTimeout(() => {
      const newBooking: Booking = {
        id: `booking-${Math.random().toString(36).substring(7)}`,
        hallId: hall.id,
        hallName: hall.name,
        userId: user.id,
        userName: user.name,
        date: values.date,
        startTime: values.startTime,
        endTime: values.endTime,
        purpose: values.purpose,
        status: "pending",
        requestedAt: new Date(),
      };

      const currentBookings = JSON.parse(localStorage.getItem("hallHubBookings") || "[]") as Booking[];
      localStorage.setItem("hallHubBookings", JSON.stringify([...currentBookings, newBooking]));
      
      toast({
        title: "Booking Request Submitted",
        description: `Your request for ${hall.name} on ${format(values.date, "PPP")} from ${values.startTime} to ${values.endTime} has been submitted for approval.`,
      });
      router.push("/dashboard/my-bookings"); 
      setIsLoading(false);
    }, 1500);
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
        <Button type="submit" size="lg" className="w-full md:w-auto" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Submit Booking Request
        </Button>
      </form>
    </Form>
  );
}
