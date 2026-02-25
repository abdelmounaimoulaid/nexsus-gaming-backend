"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BannerService = void 0;
const index_1 = require("../index");
class BannerService {
    static async getBanners() {
        return await index_1.prisma.banner.findMany({
            orderBy: { createdAt: 'desc' }
        });
    }
    static async createBanner(data) {
        return await index_1.prisma.banner.create({ data });
    }
    static async updateBanner(id, data) {
        return await index_1.prisma.banner.update({
            where: { id },
            data
        });
    }
    static async deleteBanner(id) {
        return await index_1.prisma.banner.delete({ where: { id } });
    }
}
exports.BannerService = BannerService;
