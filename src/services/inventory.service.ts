import { prisma } from '../index';

export class InventoryService {
    static async getInventory(query: any) {
        const { search, availability, page = '1', limit = '50', sortBy = 'name-asc' } = query;
        const pageNumber = parseInt(String(page), 10) || 1;
        const limitNumber = parseInt(String(limit), 10) || 50;
        const skip = (pageNumber - 1) * limitNumber;

        const where: any = {};

        if (search) {
            where.OR = [
                { name: { contains: String(search) } },
                { slug: { contains: String(search) } },
                { brand: { contains: String(search) } }
            ];
        }

        if (availability === 'low-stock') {
            where.stock = { gt: 0, lte: 5 }; // Threshold for low stock
        } else if (availability === 'out-of-stock') {
            where.stock = { lte: 0 };
        } else if (availability === 'in-stock') {
            where.stock = { gt: 5 };
        }

        let orderBy: any = { name: 'asc' };
        if (sortBy === 'stock-asc') orderBy = { stock: 'asc' };
        else if (sortBy === 'stock-desc') orderBy = { stock: 'desc' };
        else if (sortBy === 'name-desc') orderBy = { name: 'desc' };

        const [total, products] = await Promise.all([
            prisma.product.count({ where }),
            prisma.product.findMany({
                where,
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    brand: true,
                    stock: true,
                    price: true,
                    status: true,
                    category: { select: { name: true } },
                    images: { take: 1, select: { url: true } }
                },
                orderBy,
                skip,
                take: limitNumber
            })
        ]);

        return {
            data: products,
            meta: {
                total,
                page: pageNumber,
                limit: limitNumber,
                totalPages: Math.ceil(total / limitNumber)
            }
        };
    }

    static async updateStock(id: string, newStock: number, userId?: string) {
        return await prisma.product.update({
            where: { id },
            data: {
                stock: newStock,
                updatedById: userId
            }
        });
    }

    static async bulkUpdateStock(updates: { id: string, stock: number }[], userId?: string) {
        return await prisma.$transaction(
            updates.map(update => prisma.product.update({
                where: { id: update.id },
                data: {
                    stock: update.stock,
                    updatedById: userId
                }
            }))
        );
    }
}
