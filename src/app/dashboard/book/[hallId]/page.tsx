"use client";
import BookingForm from "@/components/booking/BookingForm";
import { halls as allHalls } from "@/lib/data";
import type { Hall, Booking } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Users, MapPin } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function BookHallPage({ params }: { params: { hallId: string } }) {
  const [hall, setHall] = useState<Hall | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const foundHall = allHalls.find((h) => h.id === params.hallId);
    if (foundHall) {
      setHall(foundHall);
    }
    // Fetch mock bookings from localStorage
    const storedBookings = JSON.parse(localStorage.getItem("hallHubBookings") || "[]") as Booking[];
    setBookings(storedBookings.map(b => ({...b, date: new Date(b.date)}))); // Ensure date is a Date object
    setLoading(false);
  }, [params.hallId]);


  if (loading) {
    return <div className="flex items-center justify-center h-full"><p>Loading hall details...</p></div>;
  }

  if (!hall) {
    return <div className="text-center py-10"><p>Hall not found.</p> <Link href="/dashboard/halls" className="text-primary hover:underline">Go back to halls list</Link></div>;
  }

  return (
    <div className="space-y-8">
      <Link href="/dashboard/halls" className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Halls List
      </Link>

      <Card className="shadow-xl overflow-hidden">
        <div className="md:flex">
          <div className="md:w-1/3">
             <Image
              src={hall.image || "https://placehold.co/600x400.png"}
              alt={hall.name}
              data-ai-hint={hall.dataAiHint || "conference room"}
              width={600}
              height={400}
              className="object-cover w-full h-full"
            />
          </div>
          <div className="md:w-2/3 p-6 md:p-8">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-3xl font-bold tracking-tight">{hall.name}</CardTitle>
              <CardDescription className="text-lg text-muted-foreground flex items-center mt-1">
                <MapPin className="mr-2 h-5 w-5" /> {hall.block}
              </CardDescription>
              {hall.capacity && (
                <div className="text-md text-foreground flex items-center mt-2">
                  <Users className="mr-2 h-5 w-5 text-primary" /> Capacity: {hall.capacity} guests
                </div>
              )}
            </CardHeader>
            <CardContent className="p-0">
              <p className="mb-6 text-muted-foreground">
                Please fill out the form below to request a booking for this hall.
                Ensure all details are accurate. Your request will be sent for admin approval.
              </p>
              <BookingForm hall={hall} existingBookings={bookings} />
            </CardContent>
          </div>
        </div>
      </Card>
    </div>
  );
}
