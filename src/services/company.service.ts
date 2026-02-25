import { prisma } from '../index';

export class CompanyService {
    async getAllCompanies() {
        return prisma.company.findMany({
            orderBy: { name: 'asc' },
            include: {
                _count: {
                    select: { customers: true }
                }
            }
        });
    }

    async createCompany(data: any) {
        // Verify user exists before setting audit fields
        const userExists = data.createdById ? await (prisma as any).user.findUnique({ where: { id: data.createdById } }) : null;

        return prisma.company.create({
            data: {
                name: data.name,
                industry: data.industry,
                registrationNumber: data.registrationNumber,
                website: data.website,
                email: data.email,
                phone: data.phone,
                address: data.address,
                city: data.city,
                country: data.country,
                zipCode: data.zipCode,
                createdById: userExists ? data.createdById : undefined
            }
        });
    }

    async getCompanyById(id: string) {
        return prisma.company.findUnique({
            where: { id },
            include: {
                customers: true
            }
        });
    }
}
