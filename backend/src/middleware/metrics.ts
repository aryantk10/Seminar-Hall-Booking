import promBundle from 'express-prom-bundle';
import { Registry, Counter, Gauge, Histogram, Summary, collectDefaultMetrics } from 'prom-client';

// Create a new registry
const register = new Registry();

// Initialize default Node.js metrics
collectDefaultMetrics({
    register,
    prefix: 'nodejs_',
    gcDurationBuckets: [0.001, 0.01, 0.1, 1, 2, 5]
});

// Business metrics
export const bookingCounter = new Counter({
    name: 'seminar_hall_bookings_total',
    help: 'Total number of booking requests',
    labelNames: ['status', 'hall_name', 'user_type'],
    registers: [register]
});

export const activeBookingsGauge = new Gauge({
    name: 'seminar_hall_active_bookings',
    help: 'Number of currently active bookings',
    labelNames: ['hall_name', 'day_of_week'],
    registers: [register]
});

export const hallUtilizationGauge = new Gauge({
    name: 'seminar_hall_utilization_rate',
    help: 'Utilization rate of each hall (percentage)',
    labelNames: ['hall_name', 'time_slot'],
    registers: [register]
});

export const bookingDurationHistogram = new Histogram({
    name: 'seminar_hall_booking_duration_hours',
    help: 'Duration of bookings in hours',
    labelNames: ['hall_name', 'event_type'],
    buckets: [1, 2, 4, 8, 12, 24],
    registers: [register]
});

// New metrics
export const bookingResponseTime = new Summary({
    name: 'seminar_hall_booking_response_seconds',
    help: 'Response time for booking operations',
    labelNames: ['operation', 'status'],
    registers: [register]
});

export const conflictingBookingsCounter = new Counter({
    name: 'seminar_hall_booking_conflicts_total',
    help: 'Number of conflicting booking attempts',
    labelNames: ['hall_name', 'time_slot'],
    registers: [register]
});

export const userActivityCounter = new Counter({
    name: 'seminar_hall_user_activity_total',
    help: 'User activity counter',
    labelNames: ['action_type', 'user_type'],
    registers: [register]
});

export const hallAvailabilityGauge = new Gauge({
    name: 'seminar_hall_availability',
    help: 'Current availability status of halls',
    labelNames: ['hall_name', 'status'],
    registers: [register]
});

export const bookingTrendGauge = new Gauge({
    name: 'seminar_hall_booking_trend',
    help: 'Booking trends over time',
    labelNames: ['hall_name', 'time_period'],
    registers: [register]
});

export const maintenanceEventsCounter = new Counter({
    name: 'seminar_hall_maintenance_events_total',
    help: 'Number of maintenance events',
    labelNames: ['hall_name', 'event_type'],
    registers: [register]
});

// System metrics
export const systemResourceGauge = new Gauge({
    name: 'seminar_hall_system_resources',
    help: 'System resource utilization',
    labelNames: ['resource_type'],
    registers: [register]
});

export const errorCounter = new Counter({
    name: 'seminar_hall_errors_total',
    help: 'Total number of errors',
    labelNames: ['error_type', 'component'],
    registers: [register]
});

// Create the metrics middleware
const metricsMiddleware = promBundle({
    includeMethod: true,
    includePath: true,
    includeStatusCode: true,
    includeUp: true,
    customLabels: { project: 'seminar-hall-booking' },
    promClient: { 
        collectDefaultMetrics: { 
            register,
            prefix: 'seminar_hall_',
            gcDurationBuckets: [0.001, 0.01, 0.1, 1, 2, 5]
        }
    },
    metricsPath: '/metrics',
    formatStatusCode: (res) => (res.statusCode || 0).toString(),
    bypass: (req) => false, // Never bypass metrics collection
    autoregister: true // Ensure metrics are auto-registered
});

// Initialize default metrics
register.setDefaultLabels({
    app: 'seminar-hall-booking'
});

export { metricsMiddleware, register }; 