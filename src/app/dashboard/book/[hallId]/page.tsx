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
import { bookings as bookingsAPI, halls as hallsAPI } from "@/lib/api";
import { getBookingTime } from "@/lib/time-utils";

interface PageRouteParams {
  hallId: string;
}

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
  };
  userId?: string;
  startTime: string;
  endTime: string;
  date?: string;
  purpose: string;
  status: "pending" | "approved" | "rejected" | "cancelled";
  createdAt: string;
  requestedAt?: string;
}

interface ApiResponse<T> {
  data: T;
}

interface ApiError {
  response?: {
    status?: number;
    data?: {
      message?: string;
    };
  };
  message?: string;
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
      try {
        if (!hallId) {
          console.error('No hallId provided');
          toast({
            title: "Error",
            description: "No hall ID provided. Please try again.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        // First try to fetch the hall directly from the API
        const hallResponse = await hallsAPI.getById(hallId);
        if (!hallResponse?.data) {
          throw new Error('Hall not found');
        }
        const fetchedHall = hallResponse.data;
        setHall(fetchedHall);

        // Try to fetch approved bookings for conflict checking, fallback to user bookings
        try {
          console.log('🚀 Trying to fetch approved bookings for conflict checking...');
          const response = await bookingsAPI.getApproved();
          const bookingsData = response.data as BookingApiResponse[];
          console.log('✅ Successfully fetched approved bookings:', bookingsData.length);

          const apiBookings = bookingsData.map((booking: BookingApiResponse) => ({
            id: booking._id,
            hallId: booking.hall?._id || booking.hallId || '',
            hallName: booking.hall?.name || 'Unknown Hall',
            userId: booking.user?._id || booking.userId || '',
            userName: booking.user?.name || 'Unknown User',
            date: new Date(booking.startTime || booking.date || new Date()),
            startTime: getBookingTime(booking.startTime),
            endTime: getBookingTime(booking.endTime),
            purpose: booking.purpose,
            status: booking.status,
            requestedAt: new Date(booking.createdAt || booking.requestedAt || new Date()),
          }));

          setBookings(apiBookings);
        } catch (error: unknown) {
          const apiError = error as ApiError;
          console.log('❌ Approved bookings endpoint failed:', apiError.response?.status);
          console.log('🔄 Falling back to user bookings for conflict checking...');
          const response = await bookingsAPI.getMyBookings();
          const bookingsData = response.data as BookingApiResponse[];
          console.log('✅ Successfully fetched user bookings:', bookingsData.length);

          const apiBookings = bookingsData.map((booking: BookingApiResponse) => ({
            id: booking._id,
            hallId: booking.hall?._id || booking.hallId || '',
            hallName: booking.hall?.name || 'Unknown Hall',
            userId: booking.user?._id || booking.userId || '',
            userName: booking.user?.name || 'Unknown User',
            date: new Date(booking.startTime || booking.date || new Date()),
            startTime: getBookingTime(booking.startTime),
            endTime: getBookingTime(booking.endTime),
            purpose: booking.purpose,
            status: booking.status,
            requestedAt: new Date(booking.createdAt || booking.requestedAt || new Date()),
          }));

          setBookings(apiBookings);
        }
      } catch (error) {
        console.error('Failed to fetch hall or bookings:', error);
        toast({
          title: "Error",
          description: "Failed to load hall details or bookings. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
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

  if (!hallId) {
    return <div className="text-center py-10"><p>No hall ID provided.</p> <Link href="/dashboard/halls" className="text-primary hover:underline">Go back to halls list</Link></div>;
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
