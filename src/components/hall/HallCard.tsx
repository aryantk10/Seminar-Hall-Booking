"use client";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { Hall } from "@/lib/types";
import { Users, MapPin, ArrowRight } from "lucide-react";

interface HallCardProps {
  hall: Hall;
}

export default function HallCard({ hall }: HallCardProps) {
  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
      <CardHeader className="p-0">
        <Image
          src={hall.image || "https://placehold.co/600x400.png"}
          alt={hall.name}
          data-ai-hint={hall.dataAiHint || "lecture hall"}
          width={600}
          height={400}
          className="aspect-video w-full object-cover"
        />
      </CardHeader>
      <CardContent className="p-6 flex-grow">
        <CardTitle className="text-xl font-semibold mb-1">{hall.name}</CardTitle>
        <CardDescription className="text-muted-foreground mb-3 flex items-center">
          <MapPin className="mr-2 h-4 w-4" /> {hall.block}
        </CardDescription>
        {hall.capacity && (
          <div className="text-sm text-foreground flex items-center">
            <Users className="mr-2 h-4 w-4 text-primary" /> Capacity: {hall.capacity}
          </div>
        )}
      </CardContent>
      <CardFooter className="p-6 pt-0">
        <Button asChild className="w-full">
          <Link href={`/dashboard/book/${hall.id}`}>
            Book Now <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
