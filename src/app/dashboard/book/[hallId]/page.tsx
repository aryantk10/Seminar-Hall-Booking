
"use client";
import BookingForm from "@/components/booking/BookingForm";
import { halls as defaultAllHalls, allPossibleAmenities } from "@/lib/data";
import type { Hall, Booking } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowLeft, Users, MapPin, Sparkles, CheckSquare, XCircle, Info } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, use } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { bookings as bookingsAPI } from "@/lib/api";

interface PageRouteParams {
  hallId: string;
}

const HALL_CONFIG_STORAGE_KEY = "hallHubConfiguredHalls";

export default function BookHallPage({ params: paramsPromise }: { params: Promise<PageRouteParams> }) {
  const params = use(paramsPromise); 
  const { hallId } = params; 
  const { user } = useAuth();
  const { toast } = useToast();

  const [hall, setHall] = useState<Hall | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  // This state will hold all halls, sourced from localStorage or default data
  const [configuredHallsData, setConfiguredHallsData] = useState<Hall[]>(defaultAllHalls);


  useEffect(() => {
    const fetchHallAndBookings = async () => {
      // Load configured halls (keep localStorage for hall configuration)
      let currentHalls: Hall[];
      const storedHallsString = localStorage.getItem(HALL_CONFIG_STORAGE_KEY);
      if (storedHallsString) {
        currentHalls = JSON.parse(storedHallsString) as Hall[];
      } else {
        currentHalls = defaultAllHalls;
        localStorage.setItem(HALL_CONFIG_STORAGE_KEY, JSON.stringify(defaultAllHalls));
      }
      setConfiguredHallsData(currentHalls);

      const foundHall = currentHalls.find((h) => h.id === hallId);
      if (foundHall) {
        setHall(foundHall);
      }

      // Try to fetch approved bookings for conflict checking, fallback to user bookings
      try {
        let response;
        try {
          console.log('🚀 Trying to fetch approved bookings for conflict checking...');
          response = await bookingsAPI.getApproved();
          console.log('✅ Successfully fetched approved bookings:', response.data?.length || 0);
        } catch (error: any) {
          console.log('❌ Approved bookings endpoint failed:', error.response?.status);
          console.log('🔄 Falling back to user bookings for conflict checking...');
          response = await bookingsAPI.getMyBookings();
          console.log('✅ Successfully fetched user bookings:', response.data?.length || 0);
        }

        const apiBookings = response.data.map((booking: any) => ({
          id: booking._id,
          hallId: booking.hall?._id || booking.hallId,
          hallName: booking.hall?.name || 'Unknown Hall',
          userId: booking.user?._id || booking.userId,
          userName: booking.user?.name || 'Unknown User',
          date: new Date(booking.startTime || booking.date),
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
          requestedAt: new Date(booking.createdAt || booking.requestedAt),
        }));

        setBookings(apiBookings);
      } catch (error) {
        console.error('Failed to fetch bookings for hall:', error);
        toast({
          title: "Error",
          description: "Failed to load existing bookings. Please try again.",
          variant: "destructive",
        });
      }

      setLoading(false);
    };

    fetchHallAndBookings();
  }, [hallId, toast]);

  const handleAmenityToggle = (amenityName: string) => {
    if (!user || user.role !== 'admin' || !hall) return;

    const currentAmenities = hall.amenities || [];
    const updatedAmenities = currentAmenities.includes(amenityName)
      ? currentAmenities.filter(a => a !== amenityName)
      : [...currentAmenities, amenityName];

    const updatedHall = { ...hall, amenities: updatedAmenities };
    setHall(updatedHall); // Update local hall state for immediate UI feedback

    // Update the list of all halls and save to localStorage
    const updatedListOfAllHalls = configuredHallsData.map(h =>
      h.id === hall.id ? updatedHall : h
    );
    setConfiguredHallsData(updatedListOfAllHalls); // Update state holding all halls
    localStorage.setItem(HALL_CONFIG_STORAGE_KEY, JSON.stringify(updatedListOfAllHalls));

    toast({
      title: "Amenity Updated",
      description: `${amenityName} has been ${updatedAmenities.includes(amenityName) ? 'enabled' : 'disabled'} for ${hall.name}.`,
    });
  };


  if (loading) {
    return <div className="flex items-center justify-center h-full"><p>Loading hall details...</p></div>;
  }

  if (!hall) {
    return <div className="text-center py-10"><p>Hall not found.</p> <Link href="/dashboard/halls" className="text-primary hover:underline">Go back to halls list</Link></div>;
  }

  const imageWidth = 600;
  const imageHeight = 400;
  const placeholderImageSrc = `https://placehold.co/${imageWidth}x${imageHeight}.png`;

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
              src={hall.image || placeholderImageSrc}
              alt={hall.name}
              data-ai-hint={hall.dataAiHint || "seminar hall"}
              width={imageWidth}
              height={imageHeight}
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
              {allPossibleAmenities.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold flex items-center mb-2 text-foreground">
                    <Sparkles className="mr-2 h-5 w-5 text-primary" /> Amenities
                    {user?.role === 'admin' && <span className="text-xs text-muted-foreground ml-2">(Click to toggle availability)</span>}
                  </h3>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                    {allPossibleAmenities.map(masterAmenity => {
                      const isAvailable = hall.amenities && hall.amenities.includes(masterAmenity);
                      const isAdmin = user && user.role === 'admin';
                      const itemClass = cn(
                        "flex items-center text-sm py-1",
                        isAvailable ? 'text-foreground' : 'text-muted-foreground opacity-60',
                        isAdmin && 'cursor-pointer hover:bg-muted/30 rounded px-2 -mx-2'
                      );
                      return (
                        <li 
                          key={masterAmenity} 
                          className={itemClass}
                          onClick={isAdmin ? () => handleAmenityToggle(masterAmenity) : undefined}
                          title={isAdmin ? `Click to toggle ${masterAmenity}` : masterAmenity}
                          role={isAdmin ? "button" : undefined}
                          tabIndex={isAdmin ? 0 : undefined}
                          onKeyDown={isAdmin ? (e) => { if (e.key === 'Enter' || e.key === ' ') handleAmenityToggle(masterAmenity); } : undefined}
                        >
                          {isAvailable ? (
                            <CheckSquare className="mr-2 h-4 w-4 text-green-500 flex-shrink-0" />
                          ) : (
                            <XCircle className="mr-2 h-4 w-4 text-red-500 flex-shrink-0" />
                          )}
                          {masterAmenity}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              {user && user.role === 'admin' ? (
                <Alert variant="default" className="bg-primary/10 border-primary/30">
                  <Info className="h-5 w-5 text-primary" />
                  <AlertTitle className="text-primary">Admin View</AlertTitle>
                  <AlertDescription>
                    As an administrator, you can manage hall amenities above. Booking functionality is available for faculty members.
                  </AlertDescription>
                </Alert>
              ) : (
                <>
                  <p className="mb-6 text-muted-foreground">
                    Please fill out the form below to request a booking for this hall.
                    Ensure all details are accurate. Your request will be sent for admin approval.
                  </p>
                  <BookingForm hall={hall} existingBookings={bookings} />
                </>
              )}
            </CardContent>
          </div>
        </div>
      </Card>
    </div>
  );
}
