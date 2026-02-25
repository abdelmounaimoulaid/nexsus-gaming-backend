"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = exports.prisma = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const client_1 = require("@prisma/client");
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const auth_1 = __importDefault(require("./routes/auth"));
const categories_1 = __importDefault(require("./routes/categories"));
const products_1 = __importDefault(require("./routes/products"));
const sections_1 = __importDefault(require("./routes/sections"));
const banners_1 = __importDefault(require("./routes/banners"));
const upload_1 = __importDefault(require("./routes/upload"));
const brands_1 = __importDefault(require("./routes/brands"));
const collections_1 = __importDefault(require("./routes/collections"));
const users_1 = __importDefault(require("./routes/users"));
const roles_1 = __importDefault(require("./routes/roles"));
const customers_1 = __importDefault(require("./routes/customers"));
const companies_1 = __importDefault(require("./routes/companies"));
const settingsRoutes_1 = __importDefault(require("./routes/settingsRoutes"));
dotenv_1.default.config();
// Ensure JWT_SECRET is not the dummy dev value in production
if (process.env.NODE_ENV === 'production' && process.env.JWT_SECRET === 'NEXUS_GAMING_SUPER_SECRET_KEY_FOR_JWT_DEV_ONLY') {
    console.warn('⚠️ SECURITY WARNING: You are running in production using the default dev JWT_SECRET. Please change it in your Hostinger .env file ASAP!');
}
let prisma;
try {
    exports.prisma = prisma = new client_1.PrismaClient();
}
catch (error) {
    console.error('CRITICAL ERROR: Failed to instantiate Prisma Client. Check if your DATABASE_URL in Hostinger contains unescaped special characters like "@". Use percent-encoding.');
    console.error(error);
}
const app = (0, express_1.default)();
exports.app = app;
const port = process.env.PORT || 5000;
// Middleware - Security & Body Parsing
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: { policy: "cross-origin" } // Required if serving images across domains
}));
// Set up CORS using an environment variable whitelist
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://localhost:5174').split(',');
app.use((0, cors_1.default)({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests) only if not strictly enforced,
        // but for safety in browsers we check the whitelist.
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error('Not allowed by CORS'));
        }
    }
}));
// Limit JSON body size to prevent payload DDoS attacks
app.use(express_1.default.json({ limit: '1mb' }));
// Set up Global Rate Limiter
const globalLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: true, message: 'Too many requests from this IP, please try again after 15 minutes.' }
});
// Stricter Rate Limiter for Authentication endpoints
const authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 login/signup requests per `window`
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: true, message: 'Too many login attempts from this IP, please try again after 15 minutes.' }
});
// Apply global rate limiter to all api routes
app.use('/api', globalLimiter);
// Serve uploads statically
app.use('/uploads', express_1.default.static(path_1.default.join(process.cwd(), 'uploads')));
// API Routes
app.use('/api/auth', authLimiter, auth_1.default);
app.use('/api/categories', categories_1.default);
app.use('/api/products', products_1.default);
app.use('/api/sections', sections_1.default);
app.use('/api/banners', banners_1.default);
app.use('/api/upload', upload_1.default);
app.use('/api/brands', brands_1.default);
app.use('/api/collections', collections_1.default);
app.use('/api/users', users_1.default);
app.use('/api/roles', roles_1.default);
app.use('/api/customers', customers_1.default);
app.use('/api/companies', companies_1.default);
app.use('/api/settings', settingsRoutes_1.default);
// Simple Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Nexus Gaming Admin API running!' });
});
// -- Seed endpoint removed for production security --
// Global Error Handler Middleware
app.use((err, req, res, next) => {
    console.error('[Global Error]', err);
    const status = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    res.status(status).json({ error: true, message });
});
// Start server only if not in test mode
if (process.env.NODE_ENV !== 'test') {
    app.listen(port, async () => {
        console.log(`Server running on port ${port} (MySQL)`);
        if (prisma) {
            try {
                await prisma.$connect();
                console.log('Database connected successfully.');
            }
            catch (err) {
                console.error('DATABASE CONNECTION ERROR: Your connection string in Hostinger is likely malformed or blocking access.', err);
            }
        }
    });
}
