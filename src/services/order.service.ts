import { prisma } from '../index';
import { CouponService } from './coupon.service';
import { MailService } from './mail.service';
import { OrderStatus, PaymentMethod } from '@prisma/client';

export class OrderService {
    static async createOrder(data: {
        userId?: string;
        customerName: string;
        customerEmail: string;
        customerPhone: string;
        address?: string;
        city?: string;
        notes?: string;
        items: Array<{
            productId: string;
            quantity: number;
            variations?: any;
        }>;
        couponCode?: string;
        paymentMethod: PaymentMethod;
    }) {
        return await prisma.$transaction(async (tx) => {
            let totalAmount = 0;
            let discountAmount = 0;
            const orderItems = [];

            // 1. Process Items
            for (const item of data.items) {
                const product = await tx.product.findUnique({
                    where: { id: item.productId }
                });

                if (!product) {
                    throw new Error(`Product with ID ${item.productId} not found`);
                }

                if (product.stock < item.quantity) {
                    throw new Error(`Insufficient stock for product ${product.name}`);
                }

                const itemPrice = product.price;
                totalAmount += itemPrice * item.quantity;

                orderItems.push({
                    productId: item.productId,
                    quantity: item.quantity,
                    price: itemPrice,
                    variations: item.variations || []
                });

                // Update stock
                await tx.product.update({
                    where: { id: item.productId },
                    data: { stock: { decrement: item.quantity } }
                });
            }

            // 2. Process Coupon
            let couponId = null;
            if (data.couponCode) {
                try {
                    const coupon = await CouponService.validateCoupon(
                        data.couponCode,
                        data.userId || 'guest',
                        totalAmount
                    );

                    couponId = coupon.id;
                    if (coupon.type === 'PERCENTAGE') {
                        discountAmount = totalAmount * (coupon.value / 100);
                    } else {
                        discountAmount = Math.min(coupon.value, totalAmount);
                    }

                    // Increment usedCount
                    await (tx as any).coupon.update({
                        where: { id: coupon.id },
                        data: { usedCount: { increment: 1 } }
                    });

                    // Record usage if user is logged in
                    if (data.userId) {
                        await (tx as any).couponUsage.create({
                            data: {
                                couponId: coupon.id,
                                userId: data.userId
                            }
                        });
                    }
                } catch (error: any) {
                    // If coupon is invalid, we might want to fail the order or just continue without discount
                    // For now, let's fail to be safe and clear to user
                    throw new Error(`Coupon error: ${error.message}`);
                }
            }

            // 2b. Process Delivery Cost
            const deliverySettings = await (tx as any).systemSetting.findMany({
                where: { key: { in: ['is_free_delivery', 'min_free_delivery_price', 'delivery_cost'] } }
            });

            const settings = deliverySettings.reduce((acc: any, s: any) => ({ ...acc, [s.key]: s.value }), {
                is_free_delivery: 'true',
                min_free_delivery_price: '0',
                delivery_cost: '0'
            });

            let deliveryCost = 0;
            if (settings.is_free_delivery === 'false') {
                const minFree = parseFloat(settings.min_free_delivery_price);
                const cost = parseFloat(settings.delivery_cost);
                if (!(minFree > 0 && totalAmount >= minFree)) {
                    deliveryCost = cost;
                }
            }

            const finalAmount = Math.max(0, totalAmount - discountAmount + deliveryCost);

            // 3. Create Order
            const order = await (tx as any).order.create({
                data: {
                    userId: data.userId || null,
                    customerName: data.customerName,
                    customerEmail: data.customerEmail,
                    customerPhone: data.customerPhone,
                    address: data.address,
                    city: data.city,
                    notes: data.notes,
                    totalAmount,
                    discountAmount,
                    finalAmount,
                    paymentMethod: data.paymentMethod,
                    couponId,
                    items: {
                        create: orderItems
                    }
                },
                include: {
                    items: {
                        include: {
                            product: {
                                include: {
                                    images: {
                                        where: { isPrimary: true },
                                        take: 1
                                    }
                                }
                            }
                        }
                    }
                }
            });

            // 4. Send Notifications (Async - don't block response)
            MailService.sendOrderConfirmation(order).catch(err => console.error('Notification failed:', err));

            return order;
        });
    }

    static async getAllOrders(query: any = {}) {
        const page = parseInt(query.page as string) || 1;
        const limit = parseInt(query.limit as string) || 20;
        const skip = (page - 1) * limit;

        const where: any = {};
        if (query.search) {
            where.OR = [
                { orderNumber: { contains: query.search } },
                { customerName: { contains: query.search } },
                { customerEmail: { contains: query.search } }
            ];
        }

        const [orders, total] = await Promise.all([
            (prisma as any).order.findMany({
                where,
                skip,
                take: limit,
                include: {
                    items: {
                        include: {
                            product: true
                        }
                    },
                    user: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            }),
            (prisma as any).order.count({ where })
        ]);

        return {
            data: orders,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    static async getOrderById(id: string) {
        return (prisma as any).order.findUnique({
            where: { id },
            include: {
                items: {
                    include: {
                        product: true
                    }
                },
                user: true,
                coupon: true
            }
        });
    }

    static async updateOrderStatus(id: string, status: OrderStatus) {
        return (prisma as any).order.update({
            where: { id },
            data: { status }
        });
    }

    static async deleteOrder(id: string) {
        // Note: deleting an order should probably restore stock?
        // Usually, orders aren't deleted but cancelled.
        // If really deleted, let's not restore stock to avoid complexity for now unless requested.
        return (prisma as any).order.delete({
            where: { id }
        });
    }
}
