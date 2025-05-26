
"use client";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { Hall } from "@/lib/types";
import { Users, MapPin, ArrowRight, Sparkles } from "lucide-react"; 
import { Badge } from "@/components/ui/badge"; 
import { useAuth } from "@/hooks/useAuth"; // Import useAuth

interface HallCardProps {
  hall: Hall;
}

export default function HallCard({ hall }: HallCardProps) {
  const { user } = useAuth(); // Get current user
  // Ensure the placeholder URL matches the component's width and height if hall.image is not present
  const imageWidth = 600;
  const imageHeight = 400;
  const placeholderImageSrc = `https://placehold.co/${imageWidth}x${imageHeight}.png`;

  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
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
      {user && user.role !== 'admin' && (
        <CardFooter className="p-6 pt-0">
          <Button asChild className="w-full">
            <Link href={`/dashboard/book/${hall.id}`}>
              Book Now <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
