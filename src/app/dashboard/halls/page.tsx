import HallCard from "@/components/hall/HallCard";
import { halls } from "@/lib/data";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
// This page will be client component to handle search if implemented. For now, static.

export default function HallsPage() {
  // In a real app, halls data might be fetched.
  // Add search/filter functionality later if needed.

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Seminar Halls</h1>
          <p className="text-muted-foreground">Browse and select a hall for your event.</p>
        </div>
        {/* <div className="relative w-full md:w-1/3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input placeholder="Search halls..." className="pl-10" />
        </div> */}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {halls.map((hall) => (
          <HallCard key={hall.id} hall={hall} />
        ))}
      </div>
    </div>
  );
}
