
"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import HallCard from "@/components/hall/HallCard";
import { halls as defaultHallsData, allPossibleAmenities } from "@/lib/data";
import { halls as hallsAPI } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Search, ListFilter, Settings } from "lucide-react";
import Link from "next/link";
import type { Hall } from "@/lib/types";

const HALL_CONFIG_STORAGE_KEY = "hallHubConfiguredHalls";

interface DatabaseHall {
  _id: string;
  name: string;
  capacity: number;
  location: string;
  facilities: string[];
  description?: string;
  images?: string[];
  isAvailable: boolean;
}

export default function HallsPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [currentHallsData, setCurrentHallsData] = useState<Hall[]>(defaultHallsData);
  const [loading, setLoading] = useState(true);
  const [useRealData, setUseRealData] = useState(false);

  // Convert database hall to frontend hall format
  const convertDatabaseHall = (dbHall: DatabaseHall): Hall => ({
    id: dbHall._id,
    name: dbHall.name,
    block: dbHall.location,
    capacity: dbHall.capacity,
    image: dbHall.images?.[0] || '/images/halls/default-hall.jpg',
    dataAiHint: dbHall.capacity > 500 ? 'large auditorium' : 'seminar hall',
    amenities: dbHall.facilities || []
  });

  // Fetch real halls from database
  const fetchRealHalls = useCallback(async () => {
    try {
      setLoading(true);
      console.log('🏢 Fetching real halls from database...');
      const response = await hallsAPI.getAll();
      const dbHalls = response.data as DatabaseHall[];
      const convertedHalls = dbHalls.map(convertDatabaseHall);
      setCurrentHallsData(convertedHalls);
      setUseRealData(true);
      console.log(`✅ Loaded ${convertedHalls.length} real halls from database`);
    } catch (error) {
      console.error('❌ Error fetching real halls:', error);
      console.log('📋 Falling back to mock data');
      setCurrentHallsData(defaultHallsData);
      setUseRealData(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Try to fetch real halls first, fallback to localStorage/mock data
    fetchRealHalls();
  }, [fetchRealHalls]);

  useEffect(() => {
    // Only use localStorage for mock data fallback
    if (!useRealData) {
      const storedHallsString = localStorage.getItem(HALL_CONFIG_STORAGE_KEY);
      if (storedHallsString) {
        try {
          setCurrentHallsData(JSON.parse(storedHallsString));
        } catch (error) {
          console.error("Failed to parse configured halls from localStorage", error);
          localStorage.setItem(HALL_CONFIG_STORAGE_KEY, JSON.stringify(defaultHallsData));
          setCurrentHallsData(defaultHallsData);
        }
      } else {
        localStorage.setItem(HALL_CONFIG_STORAGE_KEY, JSON.stringify(defaultHallsData));
        setCurrentHallsData(defaultHallsData);
      }
    }
  }, [useRealData]);


  const filteredHalls = useMemo(() => {
    let hallsToFilter = currentHallsData;

    // Apply search term filter
    if (searchTerm) {
      hallsToFilter = hallsToFilter.filter(hall =>
        hall.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hall.block.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (hall.amenities && hall.amenities.some(amenity => amenity.toLowerCase().includes(searchTerm.toLowerCase())))
      );
    }

    // Apply amenity filter (hall must have ALL selected amenities)
    if (selectedAmenities.length > 0) {
      hallsToFilter = hallsToFilter.filter(hall =>
        selectedAmenities.every(sa => hall.amenities?.includes(sa))
      );
    }

    return hallsToFilter;
  }, [searchTerm, currentHallsData, selectedAmenities]);

  const handleAmenitySelection = (amenity: string, checked: boolean) => {
    setSelectedAmenities(prev =>
      checked
        ? [...prev, amenity]
        : prev.filter(a => a !== amenity)
    );
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading halls...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Seminar Halls</h1>
          <p className="text-muted-foreground">
            Browse and select a hall for your event. Search or filter by amenities.
            {useRealData ? (
              <span className="text-green-600 font-medium"> (Live data from database)</span>
            ) : (
              <span className="text-orange-600 font-medium"> (Using fallback data)</span>
            )}
          </p>
        </div>
        <div className="flex w-full flex-col sm:flex-row md:w-auto gap-2 items-center">
          {user?.role === 'admin' && (
            <Link href="/dashboard/admin/halls">
              <Button variant="outline" className="w-full sm:w-auto">
                <Settings className="mr-2 h-4 w-4" />
                Manage Halls
              </Button>
            </Link>
          )}
          <div className="relative flex-grow w-full sm:w-auto md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search halls..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto">
                <ListFilter className="mr-2 h-4 w-4" />
                Filter Amenities
                {selectedAmenities.length > 0 && ` (${selectedAmenities.length})`}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64" align="end">
              <DropdownMenuLabel>Filter by Amenities</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-72 overflow-y-auto"> {/* Scrollable area for amenities */}
                {allPossibleAmenities.sort().map(amenity => (
                  <DropdownMenuCheckboxItem
                    key={amenity}
                    checked={selectedAmenities.includes(amenity)}
                    onCheckedChange={(checked) => handleAmenitySelection(amenity, Boolean(checked))}
                  >
                    {amenity}
                  </DropdownMenuCheckboxItem>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
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
          No halls found matching your criteria. Try adjusting your search or filters.
        </p>
      )}
    </div>
  );
}
