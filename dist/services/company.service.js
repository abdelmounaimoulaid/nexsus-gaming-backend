"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanyService = void 0;
const index_1 = require("../index");
class CompanyService {
    async getAllCompanies() {
        return index_1.prisma.company.findMany({
            orderBy: { name: 'asc' },
            include: {
                _count: {
                    select: { customers: true }
                }
            }
        });
    }
    async createCompany(data) {
        // Verify user exists before setting audit fields
        const userExists = data.createdById ? await index_1.prisma.user.findUnique({ where: { id: data.createdById } }) : null;
        return index_1.prisma.company.create({
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
    async getCompanyById(id) {
        return index_1.prisma.company.findUnique({
            where: { id },
            include: {
                customers: true
            }
        });
    }
}
exports.CompanyService = CompanyService;
