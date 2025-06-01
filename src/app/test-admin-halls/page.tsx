'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { halls as hallsAPI } from '@/lib/api';
import { CheckCircle, XCircle, AlertTriangle, Loader2 } from 'lucide-react';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  details?: string;
}

interface HallResponse {
  _id: string;
  name: string;
  capacity: number;
  location: string;
  description: string;
  image: string;
  block: string;
  type: string;
  amenities: string[];
}

export default function TestAdminHallsPage() {
  const [tests, setTests] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [testHallId, setTestHallId] = useState<string | null>(null);
  const { toast } = useToast();

  const updateTest = (name: string, status: TestResult['status'], message: string, details?: string) => {
    setTests(prev => prev.map(test => 
      test.name === name ? { ...test, status, message, details } : test
    ));
  };

  const runTests = async () => {
    setIsRunning(true);
    setTests([
      { name: 'Create Hall', status: 'pending', message: 'Testing hall creation...' },
      { name: 'Fetch Halls', status: 'pending', message: 'Testing hall retrieval...' },
      { name: 'Update Hall', status: 'pending', message: 'Testing hall update...' },
      { name: 'Delete Hall', status: 'pending', message: 'Testing hall deletion...' },
    ]);

    try {
      // Test 1: Create Hall
      console.log('🧪 Test 1: Creating test hall...');
      const testHallData = {
        name: `Test Hall ${Date.now()}`,
        capacity: 50,
        location: 'Test Location',
        description: 'Test hall for admin functionality testing',
        image: '/images/halls/default-hall.jpg',
        block: 'Test Block',
        type: 'Seminar Hall',
        amenities: ['Projector', 'Wi-Fi', 'Air Conditioning']
      };

      const createResponse = await hallsAPI.create(testHallData);
      const createdHall = createResponse.data as HallResponse;
      if (createdHall && createdHall._id) {
        setTestHallId(createdHall._id);
        updateTest('Create Hall', 'success', 'Hall created successfully',
          `Created hall with ID: ${createdHall._id}`);
      } else {
        throw new Error('No hall ID returned from create operation');
      }

      // Test 2: Fetch Halls
      console.log('🧪 Test 2: Fetching halls...');
      const fetchResponse = await hallsAPI.getAll();
      const hallsList = fetchResponse.data as HallResponse[];
      if (hallsList && Array.isArray(hallsList)) {
        const hallCount = hallsList.length;
        const foundTestHall = hallsList.some((h: HallResponse) => h._id === createdHall._id);
        updateTest('Fetch Halls', 'success', `Retrieved ${hallCount} halls`,
          `Found test hall: ${foundTestHall}`);
      } else {
        throw new Error('Invalid response format from fetch operation');
      }

      // Test 3: Update Hall
      console.log('🧪 Test 3: Updating test hall...');
      const updateData = {
        name: `Updated Test Hall ${Date.now()}`,
        capacity: 75,
        description: 'Updated test hall description'
      };
      
      const updateResponse = await hallsAPI.update(createdHall._id, updateData);
      if (updateResponse.data) {
        updateTest('Update Hall', 'success', 'Hall updated successfully', 
          `Updated capacity from 50 to 75`);
      } else {
        throw new Error('No response data from update operation');
      }

      // Test 4: Delete Hall
      console.log('🧪 Test 4: Deleting test hall...');
      await hallsAPI.delete(createdHall._id);
      updateTest('Delete Hall', 'success', 'Hall deleted successfully',
        `Cleaned up test hall with ID: ${createdHall._id}`);
      setTestHallId(null);

      toast({
        title: "All Tests Passed! ✅",
        description: "Admin hall management functionality is working correctly.",
      });

    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string }; status?: number }; message?: string };
      console.error('❌ Test failed:', error);
      const errorMessage = apiError.response?.data?.message || apiError.message || 'Unknown error';
      
      // Update the current test as failed
      const currentTest = tests.find(t => t.status === 'pending');
      if (currentTest) {
        updateTest(currentTest.name, 'error', `Failed: ${errorMessage}`,
          apiError.response?.status ? `HTTP ${apiError.response.status}` : undefined);
      }

      // Clean up test hall if it was created
      if (testHallId) {
        try {
          await hallsAPI.delete(testHallId);
          console.log('🧹 Cleaned up test hall after error');
        } catch (cleanupError) {
          console.error('❌ Failed to clean up test hall:', cleanupError);
        }
      }

      toast({
        title: "Test Failed ❌",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'pending':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusBadge = (status: TestResult['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Running</Badge>;
      case 'success':
        return <Badge variant="default" className="bg-green-500">Passed</Badge>;
      case 'error':
        return <Badge variant="destructive">Failed</Badge>;
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Admin Hall Management Tests</h1>
          <p className="text-muted-foreground mt-2">
            Test all CRUD operations for hall management functionality
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Test Suite</CardTitle>
            <CardDescription>
              This will test Create, Read, Update, and Delete operations for halls
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={runTests} 
              disabled={isRunning}
              className="w-full"
            >
              {isRunning ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Running Tests...
                </>
              ) : (
                'Run All Tests'
              )}
            </Button>
          </CardContent>
        </Card>

        {tests.length > 0 && (
          <div className="space-y-4">
            {tests.map((test, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(test.status)}
                      <div>
                        <h3 className="font-semibold">{test.name}</h3>
                        <p className="text-sm text-muted-foreground">{test.message}</p>
                        {test.details && (
                          <p className="text-xs text-muted-foreground mt-1">{test.details}</p>
                        )}
                      </div>
                    </div>
                    {getStatusBadge(test.status)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Important Notes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>• This test creates a temporary hall and then deletes it</p>
            <p>• Make sure you have admin privileges to run these tests</p>
            <p>• The test will automatically clean up any created data</p>
            <p>• Check the browser console for detailed logs</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
