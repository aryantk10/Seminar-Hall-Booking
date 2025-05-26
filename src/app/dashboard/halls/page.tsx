
"use client"; 

import { useState, useMemo, useEffect } from "react";
import HallCard from "@/components/hall/HallCard";
import { halls as defaultHallsData } from "@/lib/data";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import type { Hall } from "@/lib/types";

const HALL_CONFIG_STORAGE_KEY = "hallHubConfiguredHalls";

export default function HallsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentHallsData, setCurrentHallsData] = useState<Hall[]>(defaultHallsData);

  useEffect(() => {
    const storedHallsString = localStorage.getItem(HALL_CONFIG_STORAGE_KEY);
    if (storedHallsString) {
      try {
        setCurrentHallsData(JSON.parse(storedHallsString));
      } catch (error) {
        console.error("Failed to parse configured halls from localStorage", error);
        // Fallback to default and (re)store it
        localStorage.setItem(HALL_CONFIG_STORAGE_KEY, JSON.stringify(defaultHallsData));
        setCurrentHallsData(defaultHallsData);
      }
    } else {
      // If nothing in localStorage, use default and store it
      localStorage.setItem(HALL_CONFIG_STORAGE_KEY, JSON.stringify(defaultHallsData));
      setCurrentHallsData(defaultHallsData);
    }
  }, []); // Load once on mount


  const filteredHalls = useMemo(() => {
    if (!searchTerm) {
      return currentHallsData;
    }
    return currentHallsData.filter(hall =>
      hall.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hall.block.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (hall.amenities && hall.amenities.some(amenity => amenity.toLowerCase().includes(searchTerm.toLowerCase())))
    );
  }, [searchTerm, currentHallsData]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Seminar Halls</h1>
          <p className="text-muted-foreground">Browse and select a hall for your event. Search by name, block, or amenities.</p>
        </div>
        <div className="relative w-full md:w-1/3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search halls by name, block, amenities..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      {filteredHalls.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHalls.map((hall) => (
            <HallCard key={hall.id} hall={hall} />
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-center py-10">
          No halls found matching your search criteria.
        </p>
      )}
    </div>
  );
}
