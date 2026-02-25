"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SectionService = void 0;
const index_1 = require("../index");
class SectionService {
    static async getSections(resolve = false) {
        const sections = await index_1.prisma.section.findMany({
            orderBy: { sortOrder: 'asc' },
        });
        if (!resolve)
            return sections;
        const resolvedSections = await Promise.all(sections.map(async (section) => {
            const config = section.config;
            if (!config || !section.isActive)
                return { ...section, items: [] };
            const configLimit = (config.rows || 1) * (config.columns || 5);
            const limit = Math.min(10, configLimit);
            const productSelect = {
                id: true,
                name: true,
                slug: true,
                price: true,
                originalPrice: true,
                brand: true,
                stock: true,
                status: true,
                badge: true,
                isFeatured: true,
                categoryId: true,
                category: { select: { id: true, name: true, slug: true } },
                images: { take: 1, select: { id: true, url: true } },
                collections: { select: { id: true, name: true, slug: true, color: true } }
            };
            let items = [];
            if (config.sourceType === 'manual' && config.manualProductIds?.length) {
                items = await index_1.prisma.product.findMany({
                    where: { id: { in: config.manualProductIds }, status: 'ACTIVE' },
                    select: productSelect,
                    take: limit
                });
                // Maintain manual order
                items = config.manualProductIds
                    .map((id) => items.find(p => p.id === id))
                    .filter(Boolean);
            }
            else if (config.sourceType === 'category' && config.sourceId) {
                // Get all sub-categories first
                const allCats = await index_1.prisma.category.findMany();
                const validCategoryIds = new Set([config.sourceId]);
                const findDescendants = (parentId) => {
                    allCats.filter(c => c.parentId === parentId).forEach(s => {
                        validCategoryIds.add(s.id);
                        findDescendants(s.id);
                    });
                };
                findDescendants(config.sourceId);
                items = await index_1.prisma.product.findMany({
                    where: { categoryId: { in: Array.from(validCategoryIds) }, status: 'ACTIVE' },
                    orderBy: { createdAt: 'desc' },
                    select: productSelect,
                    take: limit
                });
            }
            else if (config.sourceType === 'collection' && config.sourceId) {
                items = await index_1.prisma.product.findMany({
                    where: { collections: { some: { id: config.sourceId } }, status: 'ACTIVE' },
                    orderBy: { createdAt: 'desc' },
                    select: productSelect,
                    take: limit
                });
            }
            else if (section.type === 'PRODUCT_CAROUSEL' || section.type === 'PRODUCT_GRID') {
                // Default: get latest active products if sourceType is 'all' or fallback
                items = await index_1.prisma.product.findMany({
                    where: { status: 'ACTIVE' },
                    orderBy: { createdAt: 'desc' },
                    select: productSelect,
                    take: limit
                });
            }
            return { ...section, items };
        }));
        return resolvedSections;
    }
    static async createSection(data) {
        if (data.sortOrder === undefined) {
            const lastSection = await index_1.prisma.section.findFirst({
                orderBy: { sortOrder: 'desc' },
                select: { sortOrder: true }
            });
            data.sortOrder = (lastSection?.sortOrder ?? -1) + 1;
        }
        return await index_1.prisma.section.create({ data });
    }
    static async updateSection(id, data) {
        return await index_1.prisma.section.update({
            where: { id },
            data
        });
    }
    static async deleteSection(id) {
        return await index_1.prisma.section.delete({ where: { id } });
    }
    static async reorderSections(orderedIds) {
        return await index_1.prisma.$transaction(orderedIds.map((id, index) => index_1.prisma.section.update({
            where: { id },
            data: { sortOrder: index }
        })));
    }
}
exports.SectionService = SectionService;
