
"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import type { Booking, Hall } from "@/lib/types"; // Import Hall
import { halls as defaultAllHallsData } from "@/lib/data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useRouter } from "next/navigation";
import { CheckCircle, Clock, XCircle, TrendingUp, Building } from "lucide-react";
import { bookings as bookingsAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const HALL_CONFIG_STORAGE_KEY = "hallHubConfiguredHalls";

interface BookingsPerHallChartData {
  name: string;
  bookings: number;
}

interface StatusChartData {
  name: string;
  value: number;
}

const STATUS_COLORS_FOR_CHART = {
  approved: 'hsl(var(--primary))', 
  pending: 'hsl(var(--muted))', 
  rejected: 'hsl(var(--destructive))',
};


export default function AdminReportsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentAllHallsData, setCurrentAllHallsData] = useState<Hall[]>(defaultAllHallsData);


  useEffect(() => {
    const fetchReportsData = async () => {
      if (!authLoading && (!user || user.role !== 'admin')) {
        router.push("/dashboard");
        return;
      }

      // Load configured halls (keep localStorage for hall configuration)
      const storedHallsString = localStorage.getItem(HALL_CONFIG_STORAGE_KEY);
      if (storedHallsString) {
        try {
          setCurrentAllHallsData(JSON.parse(storedHallsString));
        } catch (error) {
          console.error("Failed to parse configured halls for reports", error);
          localStorage.setItem(HALL_CONFIG_STORAGE_KEY, JSON.stringify(defaultAllHallsData));
          setCurrentAllHallsData(defaultAllHallsData);
        }
      } else {
        localStorage.setItem(HALL_CONFIG_STORAGE_KEY, JSON.stringify(defaultAllHallsData));
        setCurrentAllHallsData(defaultAllHallsData);
      }

      // Fetch bookings from API instead of localStorage
      if (user && user.role === 'admin') {
        try {
          // Clear old localStorage data
          localStorage.removeItem("hallHubBookings");

          const response = await bookingsAPI.getAll();
          const apiBookings = response.data.map((booking: any) => ({
            id: booking._id,
            hallId: booking.hall?._id || booking.hallId,
            hallName: booking.hall?.name || 'Unknown Hall',
            userId: booking.user?._id || booking.userId,
            userName: booking.user?.name || 'Unknown User',
            date: new Date(booking.startTime || booking.date),
            startTime: new Date(booking.startTime).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            }),
            endTime: new Date(booking.endTime).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            }),
            purpose: booking.purpose,
            status: booking.status,
            requestedAt: new Date(booking.createdAt || booking.requestedAt),
          }));

          setBookings(apiBookings);
        } catch (error) {
          console.error('Failed to fetch bookings for reports:', error);
          toast({
            title: "Error",
            description: "Failed to load booking data for reports. Please try again.",
            variant: "destructive",
          });
        }
      }
      setLoading(false);
    };

    fetchReportsData();
  }, [user, authLoading, router, toast]);

  const reportStats = useMemo(() => {
    const totalBookings = bookings.length;
    const pendingCount = bookings.filter((b: Booking) => b.status === 'pending').length;
    const approvedCount = bookings.filter((b: Booking) => b.status === 'approved').length;
    const rejectedCount = bookings.filter((b: Booking) => b.status === 'rejected').length;
    return { totalBookings, pendingCount, approvedCount, rejectedCount };
  }, [bookings]);

  const bookingsPerHallChartData: BookingsPerHallChartData[] = useMemo(() => {
    const counts: { [hallId: string]: number } = {};
    bookings.forEach(booking => {
      counts[booking.hallId] = (counts[booking.hallId] || 0) + 1;
    });
    return currentAllHallsData.map(hall => ({ 
      name: hall.name.length > 20 ? hall.name.substring(0,17) + "..." : hall.name,
      bookings: counts[hall.id] || 0,
    })).sort((a,b) => b.bookings - a.bookings);
  }, [bookings, currentAllHallsData]); 

  const bookingStatusChartData: StatusChartData[] = useMemo(() => [
    { name: 'Approved', value: reportStats.approvedCount },
    { name: 'Pending', value: reportStats.pendingCount },
    { name: 'Rejected', value: reportStats.rejectedCount },
  ].filter(d => d.value > 0), [reportStats]);


  if (loading || authLoading) {
    return <div className="flex items-center justify-center h-full"><p>Loading reports...</p></div>;
  }
  if (!user || user.role !== 'admin') {
    return <div className="flex items-center justify-center h-full"><p>Access Denied.</p></div>;
  }

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold flex items-center"><TrendingUp className="mr-3 h-8 w-8 text-primary"/>Booking Reports</CardTitle>
          <CardDescription>Overview of seminar hall booking statistics.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-card shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                <Building className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reportStats.totalBookings}</div>
              </CardContent>
            </Card>
            <Card className="bg-card shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Approved</CardTitle>
                <CheckCircle className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reportStats.approvedCount}</div>
              </CardContent>
            </Card>
            <Card className="bg-card shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reportStats.pendingCount}</div>
              </CardContent>
            </Card>
            <Card className="bg-card shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rejected</CardTitle>
                <XCircle className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reportStats.rejectedCount}</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <Card className="shadow-md lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-xl">Bookings by Status</CardTitle>
                <CardDescription>Distribution of requests by status.</CardDescription>
              </CardHeader>
              <CardContent>
                {bookingStatusChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={bookingStatusChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      >
                        {bookingStatusChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={STATUS_COLORS_FOR_CHART[entry.name.toLowerCase() as keyof typeof STATUS_COLORS_FOR_CHART]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value, name) => [`${value} bookings`, name]} />
                      <Legend wrapperStyle={{fontSize: "12px"}}/>
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-muted-foreground text-center py-10">No booking data for status chart.</p>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-md lg:col-span-3">
              <CardHeader>
                <CardTitle className="text-xl">Bookings per Hall</CardTitle>
                <CardDescription>Total booking requests for each hall.</CardDescription>
              </CardHeader>
              <CardContent>
                {bookingsPerHallChartData.filter(d => d.bookings > 0).length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={bookingsPerHallChartData.filter(d => d.bookings > 0)} margin={{ top: 5, right: 10, left: -25, bottom: 50 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" angle={-40} textAnchor="end" interval={0} tick={{fontSize: 10}}/>
                      <YAxis allowDecimals={false} tick={{fontSize: 12}}/>
                      <Tooltip />
                      <Legend wrapperStyle={{fontSize: "12px"}}/>
                      <Bar dataKey="bookings" name="Total Bookings" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                   <p className="text-muted-foreground text-center py-10">No booking data for hall chart.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
