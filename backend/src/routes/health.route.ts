import express from 'express';
import mongoose, { Connection } from 'mongoose';
import { register } from '../middleware/metrics';

const router = express.Router();

type DbStatus = {
    [K in 0 | 1 | 2 | 3]: string;
};

router.get('/', async (req, res) => {
    try {
        // Check MongoDB connection
        const dbState = mongoose.connection.readyState;
        const dbStatus: DbStatus = {
            0: 'disconnected',
            1: 'connected',
            2: 'connecting',
            3: 'disconnecting'
        };

        // Get metrics with error handling
        let metricsData;
        try {
            metricsData = await register.metrics();
        } catch (metricsError) {
            console.error('Failed to collect metrics:', metricsError);
            metricsData = 'Metrics collection failed';
        }

        // Basic system metrics
        const systemInfo = {
            uptime: process.uptime(),
            memoryUsage: process.memoryUsage(),
            nodeVersion: process.version
        };

        res.json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            database: {
                status: dbStatus[dbState as keyof DbStatus] || 'unknown',
                connected: dbState === 1
            },
            metrics: metricsData,
            system: systemInfo
        });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        res.status(500).json({
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            error: errorMessage
        });
    }
});

export default router; 