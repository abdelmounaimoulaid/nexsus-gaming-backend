import { prisma } from '../index';

export class SectionService {
    static async getSections(resolve: boolean = false) {
        const sections = await prisma.section.findMany({
            orderBy: { sortOrder: 'asc' },
        });

        if (!resolve) return sections;

        const resolvedSections = await Promise.all(sections.map(async (section) => {
            const config = section.config as any;
            if (!config || !section.isActive) return { ...section, items: [] };

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

            let items: any[] = [];

            if (config.sourceType === 'manual' && config.manualProductIds?.length) {
                items = await prisma.product.findMany({
                    where: { id: { in: config.manualProductIds }, status: 'ACTIVE' },
                    select: productSelect,
                    take: limit
                });
                // Maintain manual order
                items = config.manualProductIds
                    .map((id: string) => items.find(p => p.id === id))
                    .filter(Boolean);
            } else if (config.sourceType === 'category' && config.sourceId) {
                // Get all sub-categories first
                const allCats = await prisma.category.findMany();
                const validCategoryIds: Set<string> = new Set([config.sourceId]);
                const findDescendants = (parentId: string) => {
                    allCats.filter(c => c.parentId === parentId).forEach(s => {
                        validCategoryIds.add(s.id);
                        findDescendants(s.id);
                    });
                };
                findDescendants(config.sourceId);

                items = await prisma.product.findMany({
                    where: { categoryId: { in: Array.from(validCategoryIds) }, status: 'ACTIVE' },
                    orderBy: { createdAt: 'desc' },
                    select: productSelect,
                    take: limit
                });
            } else if (config.sourceType === 'collection' && config.sourceId) {
                items = await prisma.product.findMany({
                    where: { collections: { some: { id: config.sourceId } }, status: 'ACTIVE' },
                    orderBy: { createdAt: 'desc' },
                    select: productSelect,
                    take: limit
                });
            } else if (section.type === 'PRODUCT_CAROUSEL' || section.type === 'PRODUCT_GRID') {
                // Default: get latest active products if sourceType is 'all' or fallback
                items = await prisma.product.findMany({
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

    static async createSection(data: any) {
        if (data.sortOrder === undefined) {
            const lastSection = await prisma.section.findFirst({
                orderBy: { sortOrder: 'desc' },
                select: { sortOrder: true }
            });
            data.sortOrder = (lastSection?.sortOrder ?? -1) + 1;
        }
        return await prisma.section.create({ data });
    }

    static async updateSection(id: string, data: any) {
        return await prisma.section.update({
            where: { id },
            data
        });
    }

    static async deleteSection(id: string) {
        return await prisma.section.delete({ where: { id } });
    }

    static async reorderSections(orderedIds: string[]) {
        return await prisma.$transaction(
            orderedIds.map((id: string, index: number) =>
                prisma.section.update({
                    where: { id },
                    data: { sortOrder: index }
                })
            )
        );
    }
}
