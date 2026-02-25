import { prisma } from '../index';

export class SectionService {
    static async getSections() {
        return await prisma.section.findMany({
            orderBy: { sortOrder: 'asc' },
        });
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
