"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdmin = exports.optionalAuth = exports.requireAuth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';
const requireAuth = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (e) {
        res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }
};
exports.requireAuth = requireAuth;
const optionalAuth = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return next();
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (e) {
        // Continue without user if token is invalid
        next();
    }
};
exports.optionalAuth = optionalAuth;
const requireAdmin = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        // Allow if user is SUPER_ADMIN, ADMIN, or has any explicit permissions/is system role
        const isAdmin = decoded.systemRole === 'ADMIN' ||
            decoded.systemRole === 'SUPER_ADMIN' ||
            decoded.isSystem ||
            (decoded.permissions && decoded.permissions.length > 0);
        if (!isAdmin) {
            return res.status(403).json({ message: 'Forbidden: Admin access only' });
        }
        req.user = decoded;
        next();
    }
    catch (e) {
        res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }
};
exports.requireAdmin = requireAdmin;
