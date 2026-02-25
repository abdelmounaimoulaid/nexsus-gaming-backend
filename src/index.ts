import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/auth';
import categoryRoutes from './routes/categories';
import productRoutes from './routes/products';
import sectionsRoutes from './routes/sections';
import bannersRoutes from './routes/banners';
import uploadRoutes from './routes/upload';
import brandRoutes from './routes/brands';
import collectionRoutes from './routes/collections';
import userRoutes from './routes/users';
import rolesRoutes from './routes/roles';
import customersRoutes from './routes/customers';
import companiesRoutes from './routes/companies';
import settingsRoutes from './routes/settingsRoutes';
dotenv.config();

// Ensure JWT_SECRET is not the dummy dev value in production
if (process.env.NODE_ENV === 'production' && process.env.JWT_SECRET === 'NEXUS_GAMING_SUPER_SECRET_KEY_FOR_JWT_DEV_ONLY') {
    console.warn('⚠️ SECURITY WARNING: You are running in production using the default dev JWT_SECRET. Please change it in your Hostinger .env file ASAP!');
}

export const prisma = new PrismaClient();
const app = express();
const port = process.env.PORT || 5000;

// Middleware - Security & Body Parsing
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" } // Required if serving images across domains
}));

// Set up CORS using an environment variable whitelist
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://localhost:5174').split(',');
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests) only if not strictly enforced,
        // but for safety in browsers we check the whitelist.
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    }
}));

// Limit JSON body size to prevent payload DDoS attacks
app.use(express.json({ limit: '1mb' }));

// Set up Global Rate Limiter
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: true, message: 'Too many requests from this IP, please try again after 15 minutes.' }
});

// Stricter Rate Limiter for Authentication endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 login/signup requests per `window`
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: true, message: 'Too many login attempts from this IP, please try again after 15 minutes.' }
});

// Apply global rate limiter to all api routes
app.use('/api', globalLimiter);

// Serve uploads statically
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// API Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/sections', sectionsRoutes);
app.use('/api/banners', bannersRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/collections', collectionRoutes);
app.use('/api/users', userRoutes);
app.use('/api/roles', rolesRoutes);
app.use('/api/customers', customersRoutes);
app.use('/api/companies', companiesRoutes);
app.use('/api/settings', settingsRoutes);

// Simple Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Nexus Gaming Admin API running!' });
});

// -- Seed endpoint removed for production security --

// Global Error Handler Middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('[Global Error]', err);
    const status = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    res.status(status).json({ error: true, message });
});

// Start server only if not in test mode
if (process.env.NODE_ENV !== 'test') {
    app.listen(port, () => {
        console.log(`Server running on port ${port} (MySQL)`);
    });
}

export { app };
