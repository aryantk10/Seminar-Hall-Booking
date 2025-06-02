
"use client";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { Hall } from "@/lib/types";
import { Users, MapPin, ArrowRight, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";

interface HallCardProps {
  hall: Hall;
}

export default function HallCard({ hall }: HallCardProps) {
  const { user } = useAuth();
  const imageWidth = 600;
  const imageHeight = 400;
  const placeholderImageSrc = `https://placehold.co/${imageWidth}x${imageHeight}.png`;

  // Map hall names to frontend IDs for booking system compatibility
  const getBookingId = (hallName: string): string => {
    const nameToIdMap: { [key: string]: string } = {
      'APEX Auditorium': 'apex-auditorium',
      'ESB Seminar Hall - I': 'esb-hall-1',
      'ESB Seminar Hall - II': 'esb-hall-2',
      'ESB Seminar Hall - III': 'esb-hall-3',
      'DES Seminar Hall - I': 'des-hall-1',
      'DES Seminar Hall - II': 'des-hall-2',
      'LHC Seminar Hall - I': 'lhc-hall-1',
      'LHC Seminar Hall - II': 'lhc-hall-2'
    };

    return nameToIdMap[hallName] || hall.id;
  };

  const bookingId = getBookingId(hall.name);

  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
      {/* This Link wraps the visual content that should navigate for everyone */}
      <Link
        href={`/dashboard/book/${bookingId}`}
        className="block flex-grow flex flex-col focus:outline-none focus:ring-2 focus:ring-primary rounded-t-lg"
        aria-label={`View details for ${hall.name}`}
      >
        <CardHeader className="p-0 relative">
          <Image
            src={hall.image || placeholderImageSrc}
            alt={hall.name}
            data-ai-hint={hall.dataAiHint || "seminar hall"}
            width={imageWidth}
            height={imageHeight}
            className="aspect-video w-full object-cover"
          />
          {hall.amenities && hall.amenities.length > 0 && (
            <div className="absolute bottom-2 left-2 flex flex-wrap gap-1 p-1">
              {hall.amenities.slice(0, 2).map(amenity => (
                <Badge key={amenity} variant="secondary" className="text-xs backdrop-blur-sm bg-black/40 hover:bg-black/60 text-white border-transparent shadow-md">
                  {amenity}
                </Badge>
              ))}
              {hall.amenities.length > 2 && (
                <Badge variant="secondary" className="text-xs backdrop-blur-sm bg-black/40 hover:bg-black/60 text-white border-transparent shadow-md">
                  +{hall.amenities.length - 2} more
                </Badge>
              )}
            </div>
          )}
        </CardHeader>
        <CardContent className="p-6 flex-grow">
          <CardTitle className="text-xl font-semibold mb-1">{hall.name}</CardTitle>
          <CardDescription className="text-muted-foreground mb-3 flex items-center">
            <MapPin className="mr-2 h-4 w-4" /> {hall.block}
          </CardDescription>
          <div className="flex items-center justify-between text-sm mb-3">
            {hall.capacity && (
              <div className="text-foreground flex items-center">
                <Users className="mr-2 h-4 w-4 text-primary" /> Capacity: {hall.capacity}
              </div>
            )}
          </div>
          {hall.amenities && hall.amenities.length > 0 && (
             <div className="mt-2">
               <h4 className="text-xs font-semibold text-muted-foreground mb-1 flex items-center"><Sparkles className="mr-1 h-3 w-3 text-primary"/> Key Amenities:</h4>
               <p className="text-xs text-muted-foreground">
                 {hall.amenities.slice(0, 3).join(', ')}
                 {hall.amenities.length > 3 ? `, +${hall.amenities.length - 3} more` : ''}
               </p>
             </div>
           )}
        </CardContent>
      </Link>
      {/* This CardFooter is separate and only for faculty */}
      {user && user.role !== 'admin' && (
        <CardFooter className="p-6 pt-0 border-t">
          <Button asChild className="w-full">
            <Link href={`/dashboard/book/${bookingId}`}>
              Book Now <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
