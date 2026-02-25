"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SectionService = void 0;
const index_1 = require("../index");
class SectionService {
    static async getSections() {
        return await index_1.prisma.section.findMany({
            orderBy: { sortOrder: 'asc' },
        });
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
