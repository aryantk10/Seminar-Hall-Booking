'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { halls as hallsAPI } from '@/lib/api';
import { Plus, Edit, Trash2, Users, MapPin, Building, BarChart3 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { HallForm } from '@/components/admin/HallForm';
import { DeleteHallDialog } from '@/components/admin/DeleteHallDialog';

interface Hall {
  _id: string;
  name: string;
  capacity: number;
  location: string;
  facilities: string[];
  description?: string;
  images?: string[];
  isAvailable: boolean;
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

interface HallFormData {
  name: string;
  capacity: number | string;
  location: string;
  facilities: string[];
  description?: string;
  images?: string[];
}

export default function AdminHallsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [halls, setHalls] = useState<Hall[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHall, setSelectedHall] = useState<Hall | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();

  // Admin access control
  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.push("/dashboard");
      return;
    }
  }, [user, authLoading, router]);

  const fetchHalls = useCallback(async () => {
    if (!user || user.role !== 'admin') return;

    try {
      setLoading(true);
      console.log('🏢 Fetching halls for admin management...');
      const response = await hallsAPI.getAll();
      const hallsData = response.data as Hall[];
      setHalls(hallsData);
      console.log(`✅ Loaded ${hallsData.length} halls`);
    } catch (error: unknown) {
      console.error('❌ Error fetching halls:', error);
      toast({
        title: "Error",
        description: "Failed to load halls. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast, user]);

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchHalls();
    }
  }, [fetchHalls, user]);

  const handleCreateHall = async (hallData: HallFormData) => {
    try {
      console.log('🏗️ Creating new hall:', hallData);
      const processedData = {
        ...hallData,
        capacity: typeof hallData.capacity === 'string' ? parseInt(hallData.capacity) : hallData.capacity
      };
      const response = await hallsAPI.create(processedData);
      console.log('✅ Hall created successfully:', response.data);

      toast({
        title: "Success",
        description: `Hall "${hallData.name}" created successfully!`,
      });

      setIsCreateDialogOpen(false);
      await fetchHalls(); // Refresh the list
    } catch (error: unknown) {
      const apiError = error as ApiError;
      console.error('❌ Error creating hall:', error);
      toast({
        title: "Error",
        description: apiError.response?.data?.message || "Failed to create hall. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateHall = async (hallData: HallFormData) => {
    if (!selectedHall) return;

    try {
      console.log('📝 Updating hall:', selectedHall._id, hallData);
      const processedData = {
        ...hallData,
        capacity: typeof hallData.capacity === 'string' ? parseInt(hallData.capacity) : hallData.capacity
      };
      const response = await hallsAPI.update(selectedHall._id, processedData);
      console.log('✅ Hall updated successfully:', response.data);

      toast({
        title: "Success",
        description: `Hall "${hallData.name}" updated successfully!`,
      });

      setIsEditDialogOpen(false);
      setSelectedHall(null);
      await fetchHalls(); // Refresh the list
    } catch (error: unknown) {
      const apiError = error as ApiError;
      console.error('❌ Error updating hall:', error);
      toast({
        title: "Error",
        description: apiError.response?.data?.message || "Failed to update hall. Please try again.",
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
      await fetchHalls(); // Refresh the list
    } catch (error: unknown) {
      const apiError = error as ApiError;
      console.error('❌ Error deleting hall:', error);
      toast({
        title: "Error",
        description: apiError.response?.data?.message || "Failed to delete hall. Please try again.",
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

  // Show loading while checking authentication
  if (authLoading || loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">
              {authLoading ? 'Checking permissions...' : 'Loading halls...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // DEBUG: Show user info if not admin
  if (!user || user.role !== 'admin') {
    return (
      <div className="container mx-auto py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-red-800 mb-4">🚨 Admin Access Required</h2>
          <div className="space-y-2 text-sm">
            <p><strong>User Status:</strong> {user ? 'Logged In' : 'Not Logged In'}</p>
            {user && (
              <>
                <p><strong>Name:</strong> {user.name}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Current Role:</strong> <span className="bg-red-100 px-2 py-1 rounded">{user.role}</span></p>
                <p><strong>Required Role:</strong> <span className="bg-green-100 px-2 py-1 rounded">admin</span></p>
              </>
            )}
          </div>
          <div className="mt-4 p-4 bg-blue-50 rounded">
            <p className="font-medium text-blue-800">Solutions:</p>
            <ul className="list-disc list-inside text-blue-700 mt-2 space-y-1">
              <li>Login with admin account: admin@test.com / password123</li>
              <li>Or update your user role to admin in database</li>
            </ul>
          </div>
          <div className="mt-4 p-4 bg-green-50 rounded">
            <p className="font-medium text-green-800">🎉 SUCCESS: Page is loading correctly!</p>
            <p className="text-green-700 text-sm">The admin UI components are working. You just need admin access.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Hall Management v3.0</h1>
          <p className="text-muted-foreground mt-2">
            Manage seminar halls, auditoriums, and meeting rooms - Admin Panel (Cache Busted: {Date.now()})
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

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Halls</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{halls.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Capacity</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {halls.reduce((sum, hall) => sum + hall.capacity, 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Halls</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {halls.filter(hall => hall.isAvailable).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Capacity</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {halls.length > 0 ? Math.round(halls.reduce((sum, hall) => sum + hall.capacity, 0) / halls.length) : 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {halls.map((hall) => (
          <Card key={hall._id} className="overflow-hidden">
            <div className="aspect-video relative bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
              <div className="text-center">
                <Building className="h-12 w-12 text-blue-600 mx-auto mb-2" />
                <p className="text-blue-800 font-medium">{hall.name}</p>
              </div>
              <div className="absolute top-2 right-2">
                <Badge variant={hall.isAvailable ? "default" : "secondary"}>
                  {hall.isAvailable ? "Available" : "Unavailable"}
                </Badge>
              </div>
            </div>
            
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{hall.name}</span>
                <div className="flex gap-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(hall)}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Edit hall details</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDeleteDialog(hall)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Delete hall</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </CardTitle>
              <CardDescription>{hall.description || 'No description available'}</CardDescription>
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

                {hall.facilities && hall.facilities.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {hall.facilities.slice(0, 3).map((facility, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {facility}
                      </Badge>
                    ))}
                    {hall.facilities.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{hall.facilities.length - 3} more
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
      {selectedHall && (
        <DeleteHallDialog
          hall={selectedHall}
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          onConfirm={handleDeleteHall}
        />
      )}
      </div>
    </TooltipProvider>
  );
}
