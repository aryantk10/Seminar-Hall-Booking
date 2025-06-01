'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { halls as hallsAPI } from '@/lib/api';
import { Plus, Edit, Trash2, Users, MapPin, Building } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { HallForm } from '@/components/admin/HallForm';
import { DeleteHallDialog } from '@/components/admin/DeleteHallDialog';

interface Hall {
  _id: string;
  id: string;
  name: string;
  capacity: number;
  location: string;
  amenities: string[];
  description: string;
  image: string;
  block: string;
  type: string;
}

export default function AdminHallsPage() {
  const [halls, setHalls] = useState<Hall[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHall, setSelectedHall] = useState<Hall | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchHalls();
  }, []);

  const fetchHalls = async () => {
    try {
      setLoading(true);
      console.log('🏢 Fetching halls for admin management...');
      const response = await hallsAPI.getAll();
      const hallsData = response.data as Hall[];
      setHalls(hallsData);
      console.log(`✅ Loaded ${hallsData.length} halls`);
    } catch (error: any) {
      console.error('❌ Error fetching halls:', error);
      toast({
        title: "Error",
        description: "Failed to load halls. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateHall = async (hallData: any) => {
    try {
      console.log('🏗️ Creating new hall:', hallData);
      const response = await hallsAPI.create(hallData);
      console.log('✅ Hall created successfully:', response.data);
      
      toast({
        title: "Success",
        description: `Hall "${hallData.name}" created successfully!`,
      });
      
      setIsCreateDialogOpen(false);
      fetchHalls(); // Refresh the list
    } catch (error: any) {
      console.error('❌ Error creating hall:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create hall. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateHall = async (hallData: any) => {
    if (!selectedHall) return;
    
    try {
      console.log('📝 Updating hall:', selectedHall._id, hallData);
      const response = await hallsAPI.update(selectedHall._id, hallData);
      console.log('✅ Hall updated successfully:', response.data);
      
      toast({
        title: "Success",
        description: `Hall "${hallData.name}" updated successfully!`,
      });
      
      setIsEditDialogOpen(false);
      setSelectedHall(null);
      fetchHalls(); // Refresh the list
    } catch (error: any) {
      console.error('❌ Error updating hall:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update hall. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteHall = async () => {
    if (!selectedHall) return;
    
    try {
      console.log('🗑️ Deleting hall:', selectedHall._id);
      const response = await hallsAPI.delete(selectedHall._id);
      console.log('✅ Hall deleted successfully:', response.data);
      
      toast({
        title: "Success",
        description: `Hall "${selectedHall.name}" deleted successfully!`,
      });
      
      setIsDeleteDialogOpen(false);
      setSelectedHall(null);
      fetchHalls(); // Refresh the list
    } catch (error: any) {
      console.error('❌ Error deleting hall:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete hall. Please try again.",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (hall: Hall) => {
    setSelectedHall(hall);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (hall: Hall) => {
    setSelectedHall(hall);
    setIsDeleteDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
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
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Hall Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage seminar halls, auditoriums, and meeting rooms
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add New Hall
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Hall</DialogTitle>
              <DialogDescription>
                Add a new seminar hall, auditorium, or meeting room to the system.
              </DialogDescription>
            </DialogHeader>
            <HallForm onSubmit={handleCreateHall} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {halls.map((hall) => (
          <Card key={hall._id} className="overflow-hidden">
            <div className="aspect-video relative bg-muted">
              <img
                src={hall.image}
                alt={hall.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/images/halls/default-hall.jpg';
                }}
              />
              <div className="absolute top-2 right-2">
                <Badge variant="secondary">{hall.type}</Badge>
              </div>
            </div>
            
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{hall.name}</span>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditDialog(hall)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openDeleteDialog(hall)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
              <CardDescription>{hall.description}</CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>Capacity: {hall.capacity}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{hall.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span>{hall.block}</span>
                </div>
                
                {hall.amenities && hall.amenities.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {hall.amenities.slice(0, 3).map((amenity, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {amenity}
                      </Badge>
                    ))}
                    {hall.amenities.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{hall.amenities.length - 3} more
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {halls.length === 0 && (
        <div className="text-center py-12">
          <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No halls found</h3>
          <p className="text-muted-foreground mb-4">
            Get started by creating your first hall.
          </p>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add New Hall
          </Button>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Hall</DialogTitle>
            <DialogDescription>
              Update the hall information and settings.
            </DialogDescription>
          </DialogHeader>
          {selectedHall && (
            <HallForm 
              initialData={selectedHall} 
              onSubmit={handleUpdateHall} 
              isEditing={true}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <DeleteHallDialog
        hall={selectedHall}
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteHall}
      />
    </div>
  );
}
