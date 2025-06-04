"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { halls } from "@/lib/api";

export default function MigratePage() {
  const { toast } = useToast();

  const handleMigrate = async () => {
    try {
      const response = await halls.migrateHallsFrontendIds();
      toast({
        title: "Migration Successful",
        description: `Successfully migrated halls: ${response.data.updatedCount} updated out of ${response.data.totalHalls} total halls.`,
      });
    } catch (error: any) {
      toast({
        title: "Migration Failed",
        description: error.response?.data?.message || "Failed to migrate halls",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Migrate Halls</h1>
      <p className="mb-4">This will add frontendId to all halls that don't have one.</p>
      <Button onClick={handleMigrate}>Run Migration</Button>
    </div>
  );
} 