"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardStats = void 0;
const index_1 = require("../index");
const getDashboardStats = async (req, res) => {
    try {
        // Run concurrent queries to minimize load time
        const [ordersResult, totalProducts, totalCustomers, recentOrders, lowStockProducts] = await Promise.all([
            // Orders metrics (completed/valid orders)
            index_1.prisma.order.aggregate({
                _sum: { finalAmount: true },
                _count: { id: true },
                where: {
                    status: {
                        notIn: ['CANCELLED', 'REFUNDED']
                    }
                }
            }),
            // Total Active Products
            index_1.prisma.product.count(),
            // Total Customers
            index_1.prisma.customer.count(),
            // Recent Orders
            index_1.prisma.order.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    customerName: true,
                    finalAmount: true,
                    status: true,
                    createdAt: true
                }
            }),
            // Low Stock Alerts (threshold < 5)
            index_1.prisma.product.findMany({
                where: { stock: { lt: 5 } },
                take: 5,
                orderBy: { stock: 'asc' },
                select: {
                    id: true,
                    name: true,
                    stock: true,
                    price: true,
                    images: true
                }
            })
        ]);
        res.json({
            // Ensure numbers default to 0 if null
            totalRevenue: ordersResult._sum.finalAmount || 0,
            totalOrders: ordersResult._count.id || 0,
            totalCustomers,
            totalProducts,
            recentOrders,
            lowStockProducts
        });
    }
    catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ error: true, message: 'Failed to fetch dashboard statistics' });
    }
};
exports.getDashboardStats = getDashboardStats;
