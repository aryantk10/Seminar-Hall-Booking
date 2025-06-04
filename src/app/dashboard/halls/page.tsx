"use client";

import { useState, useMemo, useEffect } from "react";
import HallCard from "@/components/hall/HallCard";
import { halls as hallsAPI } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Search, ListFilter, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import type { Hall } from "@/lib/types";
import { allPossibleAmenities } from "@/lib/data";

interface DatabaseHall {
  _id: string;
  frontendId?: string;
  name: string;
  capacity: number;
  location: string;
  facilities: string[];
  description?: string;
  images?: string[];
  isAvailable: boolean;
}

export default function HallsPage() {
  const [halls, setHalls] = useState<Hall[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchHalls = async () => {
      try {
        const response = await hallsAPI.getAll();
        const fetchedHalls = (response.data as DatabaseHall[]).map(hall => ({
          id: hall.frontendId || hall._id,
          name: hall.name,
          capacity: hall.capacity,
          block: hall.location,
          amenities: hall.facilities || [],
          image: hall.images?.[0] || '/images/halls/default-hall.jpg',
          isAvailable: hall.isAvailable
        }));
        setHalls(fetchedHalls);
        } catch (error) {
        console.error('Failed to fetch halls:', error);
        toast({
          title: 'Error',
          description: 'Failed to load halls. Please try again later.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchHalls();
  }, [toast]);

  const filteredHalls = useMemo(() => {
    let hallsToFilter = halls;

    // Apply search term filter
    if (searchQuery) {
      hallsToFilter = hallsToFilter.filter(hall =>
        hall.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hall.block.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (hall.amenities && hall.amenities.some(amenity => amenity.toLowerCase().includes(searchQuery.toLowerCase())))
      );
    }

    // Apply amenities filter
    if (selectedAmenities.length > 0) {
      hallsToFilter = hallsToFilter.filter(hall =>
        selectedAmenities.every(amenity => hall.amenities?.includes(amenity))
      );
    }

    return hallsToFilter;
  }, [searchQuery, halls, selectedAmenities]);

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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
