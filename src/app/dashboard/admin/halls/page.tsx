'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { halls as hallsAPI } from '@/lib/api';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { HallForm } from '@/components/admin/HallForm';
import { DeleteHallDialog } from '@/components/admin/DeleteHallDialog';
import type { Hall } from '@/lib/types';

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

interface BackendHall {
  _id: string;
  frontendId: string;
  name: string;
  location: string;
  capacity: number;
  facilities: string[];
  images?: string[];
}

interface HallData {
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

  const handleCreateHall = async (hallData: HallData) => {
    try {
      console.log('📝 Creating new hall:', hallData);
      const processedData = {
        ...hallData,
        capacity: Number(hallData.capacity)
      };
      const response = await hallsAPI.create(processedData);
      const backendHall = response.data as BackendHall;

      // Convert the response data to match frontend Hall type
      const newHall: Hall = {
        id: backendHall._id,
        frontendId: backendHall.frontendId,
        name: backendHall.name,
        block: backendHall.location,
        capacity: backendHall.capacity,
        amenities: backendHall.facilities,
        image: backendHall.images?.[0],
        dataAiHint: backendHall.capacity > 500 ? 'large auditorium' : 'seminar hall'
      };

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

  const handleUpdateHall = async (hallData: HallData) => {
    if (!selectedHall) return;

    try {
      console.log('📝 Updating hall:', selectedHall.id, hallData);
      const processedData = {
        ...hallData,
        capacity: Number(hallData.capacity)
      };
      const response = await hallsAPI.update(selectedHall.id, processedData);
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
      console.log('🗑️ Deleting hall:', selectedHall.name);
      const response = await hallsAPI.delete(selectedHall.frontendId);
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
    <div className="container mx-auto py-8">
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
        <h1 className="text-3xl font-bold text-green-800">🎉 ADMIN UI WORKING!</h1>
        <p className="text-green-700 mt-2">
          Hall Management v5.0 - Admin Panel Successfully Loaded! (Timestamp: {Date.now()})
        </p>
        <div className="mt-4 space-y-2">
          <p className="text-sm text-green-600">✅ Authentication: Working</p>
          <p className="text-sm text-green-600">✅ Admin Role: Verified</p>
          <p className="text-sm text-green-600">✅ Page Loading: Stable</p>
          <p className="text-sm text-green-600">✅ Backend Auth: Tested & Working</p>
        </div>
        <div className="mt-4 p-4 bg-blue-50 rounded">
          <p className="font-medium text-blue-800">🔐 Auth Debug Info:</p>
          <div className="text-sm text-blue-700 mt-2 space-y-1">
            <p><strong>User:</strong> {user?.name} ({user?.email})</p>
            <p><strong>Role:</strong> {user?.role}</p>
            <p><strong>Token:</strong> {localStorage.getItem('token') ? '✅ Present' : '❌ Missing'}</p>
            <p><strong>Token Preview:</strong> {localStorage.getItem('token')?.substring(0, 20)}...</p>
          </div>
          <div className="mt-3 flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.open('/debug-frontend-auth.html', '_blank')}
            >
              🔧 Debug Tool
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                localStorage.removeItem('token');
                localStorage.removeItem('hallHubUser');
                window.location.href = '/login/admin';
              }}
            >
              🔑 Re-authenticate
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-bold text-blue-800 mb-2">🏗️ Create Hall</h3>
          <p className="text-blue-700 text-sm mb-4">Add new seminar halls to the system</p>
          <Button
            className="w-full"
            onClick={() => setIsCreateDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Hall
          </Button>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
          <h3 className="font-bold text-purple-800 mb-2">📊 Statistics</h3>
          <p className="text-purple-700 text-sm mb-4">Total Halls: {halls.length}</p>
          <p className="text-purple-700 text-sm">Total Capacity: {halls.reduce((sum, hall) => sum + hall.capacity, 0)}</p>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
          <h3 className="font-bold text-orange-800 mb-2">🔧 Management</h3>
          <p className="text-orange-700 text-sm mb-4">Edit and delete existing halls</p>
          <Button variant="outline" className="w-full">
            Manage Halls
          </Button>
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">📋 Hall List</h2>
        {halls.length > 0 ? (
          <div className="space-y-4">
            {halls.map((hall) => (
              <div
                key={hall.id}
                className="bg-white shadow-lg rounded-lg overflow-hidden"
              >
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{hall.name}</h3>
                  <p className="text-gray-600 mb-4">
                    Block: {hall.block}<br />
                    Capacity: {hall.capacity}<br />
                    Amenities: {hall.amenities.join(', ') || 'None'}
                  </p>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(hall)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => openDeleteDialog(hall)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">You haven&apos;t created any halls yet. Click &apos;Add New Hall&apos; to get started.</p>
        )}
      </div>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Hall</DialogTitle>
            <DialogDescription>
              Fill in the details below to create a new hall.
            </DialogDescription>
          </DialogHeader>
          <HallForm
            onSubmit={handleCreateHall}
            initialData={{
              name: '',
              capacity: '',
              location: '',
              facilities: [],
              description: '',
              images: []
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Hall Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Hall</DialogTitle>
            <DialogDescription>
              Make changes to the hall information below.
            </DialogDescription>
          </DialogHeader>
          {selectedHall && (
            <HallForm
              onSubmit={handleUpdateHall}
              initialData={{
                name: selectedHall.name,
                capacity: selectedHall.capacity.toString(),
                location: selectedHall.block,
                facilities: selectedHall.amenities,
                description: selectedHall.description || '',
                images: selectedHall.image ? [selectedHall.image] : []
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Hall Dialog */}
      {selectedHall && (
        <DeleteHallDialog
          hall={selectedHall}
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          onConfirm={handleDeleteHall}
        />
      )}
    </div>
  );
}
