import {
    bookingCounter,
    activeBookingsGauge,
    hallUtilizationGauge,
    bookingDurationHistogram,
    bookingResponseTime,
    conflictingBookingsCounter,
    userActivityCounter,
    hallAvailabilityGauge,
    bookingTrendGauge,
    maintenanceEventsCounter,
    systemResourceGauge,
    errorCounter
} from '../middleware/metrics';
import Hall from '../models/hall.model';
import Booking from '../models/booking.model';

class MetricsService {
    async initializeMetrics() {
        try {
            // Get all halls
            const halls = await Hall.find({});
            
            // Initialize metrics for each hall
            for (const hall of halls) {
                // Set initial utilization to 0
                hallUtilizationGauge.labels(hall.name, 'all').set(0);
                
                // Set initial active bookings to 0
                activeBookingsGauge.labels(hall.name, 'weekday').set(0);
                
                // Set initial availability
                hallAvailabilityGauge.labels(hall.name, 'available').set(1);
                
                // Calculate and set actual metrics
                await this.updateHallMetrics(hall._id.toString());
            }
            
            console.log('✅ Metrics initialized successfully');
        } catch (error) {
            console.error('Error initializing metrics:', error);
        }
    }

    async updateHallMetrics(hallId: string) {
        try {
            const hall = await Hall.findById(hallId);
            if (!hall) return;

            // Count active bookings
            const activeBookings = await Booking.countDocuments({
                hall: hallId,
                status: 'approved',
                startTime: { $lte: new Date() },
                endTime: { $gt: new Date() }
            });

            // Update active bookings gauge
            activeBookingsGauge.labels(hall.name, 'weekday').set(activeBookings);

            // Calculate utilization rate (next 7 days)
            const nextWeek = new Date();
            nextWeek.setDate(nextWeek.getDate() + 7);
            
            const totalBookingHours = await Booking.aggregate([
                {
                    $match: {
                        hall: hallId,
                        status: 'approved',
                        startTime: { $gte: new Date() },
                        endTime: { $lte: nextWeek }
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalHours: {
                            $sum: {
                                $divide: [
                                    { $subtract: ['$endTime', '$startTime'] },
                                    3600000 // Convert ms to hours
                                ]
                            }
                        }
                    }
                }
            ]);

            const totalPossibleHours = 24 * 7; // 24 hours * 7 days
            const utilizationRate = totalBookingHours.length > 0 
                ? (totalBookingHours[0].totalHours / totalPossibleHours) * 100 
                : 0;

            // Update utilization gauge
            hallUtilizationGauge.labels(hall.name, 'all').set(utilizationRate);

            // Update availability
            const isAvailable = activeBookings === 0;
            hallAvailabilityGauge.labels(hall.name, 'available').set(isAvailable ? 1 : 0);
        } catch (error) {
            console.error('Error updating hall metrics:', error);
        }
    }

    // Booking metrics
    recordBooking(status: string, hallName: string, userType: string) {
        bookingCounter.labels(status, hallName, userType).inc();
    }

    updateActiveBookings(hallName: string, dayOfWeek: string, count: number) {
        activeBookingsGauge.labels(hallName, dayOfWeek).set(count);
    }

    updateHallUtilization(hallName: string, timeSlot: string, rate: number) {
        hallUtilizationGauge.labels(hallName, timeSlot).set(rate);
    }

    recordBookingDuration(hallName: string, eventType: string, duration: number) {
        bookingDurationHistogram.labels(hallName, eventType).observe(duration);
    }

    // Performance metrics
    recordBookingResponseTime(operation: string, status: string, duration: number) {
        bookingResponseTime.labels(operation, status).observe(duration);
    }

    // Conflict metrics
    recordBookingConflict(hallName: string, timeSlot: string) {
        conflictingBookingsCounter.labels(hallName, timeSlot).inc();
    }

    // User activity metrics
    recordUserActivity(actionType: string, userType: string) {
        userActivityCounter.labels(actionType, userType).inc();
    }

    // Hall availability metrics
    updateHallAvailability(hallName: string, status: string, value: number) {
        hallAvailabilityGauge.labels(hallName, status).set(value);
    }

    // Booking trends
    updateBookingTrend(hallName: string, timePeriod: string, value: number) {
        bookingTrendGauge.labels(hallName, timePeriod).set(value);
    }

    // Maintenance metrics
    recordMaintenanceEvent(hallName: string, eventType: string) {
        maintenanceEventsCounter.labels(hallName, eventType).inc();
    }

    // System metrics
    updateSystemResource(resourceType: string, value: number) {
        systemResourceGauge.labels(resourceType).set(value);
    }

    // Error metrics
    recordError(errorType: string, component: string) {
        errorCounter.labels(errorType, component).inc();
    }

    // Utility methods for calculating metrics
    calculateHallUtilization(totalBookedHours: number, totalAvailableHours: number): number {
        return (totalBookedHours / totalAvailableHours) * 100;
    }

    calculateBookingTrend(currentBookings: number, previousBookings: number): number {
        return previousBookings === 0 ? 0 : ((currentBookings - previousBookings) / previousBookings) * 100;
    }
}

export const metricsService = new MetricsService(); 