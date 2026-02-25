import { prisma } from '../index';

export class BannerService {
    static async getBanners() {
        return await prisma.banner.findMany({
            orderBy: { createdAt: 'desc' }
        });
    }

    static async createBanner(data: any) {
        return await prisma.banner.create({ data });
    }

    static async updateBanner(id: string, data: any) {
        return await prisma.banner.update({
            where: { id },
            data
        });
    }

    static async deleteBanner(id: string) {
        return await prisma.banner.delete({ where: { id } });
    }
}
