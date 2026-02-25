"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const index_1 = require("../index");
class CustomerService {
    static async getCustomers(query) {
        const { page = '1', limit = '10', search } = query;
        const pageNumber = parseInt(String(page), 10) || 1;
        const limitNumber = parseInt(String(limit), 10) || 10;
        const skip = (pageNumber - 1) * limitNumber;
        const where = {};
        if (search) {
            const searchStr = String(search);
            where.OR = [
                { email: { contains: searchStr } },
                { firstName: { contains: searchStr } },
                { lastName: { contains: searchStr } },
                { phone: { contains: searchStr } }
            ];
        }
        const total = await index_1.prisma.customer.count({ where });
        const customers = await index_1.prisma.customer.findMany({
            where,
            include: {
                user: {
                    select: {
                        id: true,
                        systemRole: true,
                        roleName: true,
                        createdAt: true
                    }
                },
                company: true
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limitNumber
        });
        return {
            data: customers.map((c) => ({
                ...c,
                hasAccount: !!c.user,
                accountId: c.user?.id || null
            })),
            meta: {
                total,
                page: pageNumber,
                limit: limitNumber,
                totalPages: Math.ceil(total / limitNumber)
            }
        };
    }
    static async createCustomer(data, authorId) {
        const { email, password, firstName, lastName, phone, address, city, country, zipCode, customerType, companyId, companyName, companyRegistrationNumber, companyIndustry } = data;
        // Verify author exists before setting audit fields
        const authorExists = authorId ? await index_1.prisma.user.findUnique({ where: { id: authorId } }) : null;
        const auditData = authorExists ? { createdById: authorId, updatedById: authorId } : {};
        const finalEmail = email?.trim() || null;
        // 1. Create Customer
        return await index_1.prisma.$transaction(async (tx) => {
            let finalCompanyId = companyId || null;
            // 1. Handle inline Company creation
            if (customerType === 'COMPANY' && !finalCompanyId && companyName) {
                const company = await tx.company.create({
                    data: {
                        name: companyName,
                        registrationNumber: companyRegistrationNumber,
                        industry: companyIndustry,
                        address, city, country, zipCode, // Reuse customer location for company
                        ...auditData
                    }
                });
                finalCompanyId = company.id;
            }
            const customer = await tx.customer.create({
                data: {
                    email: finalEmail, firstName, lastName, phone, address, city, country, zipCode,
                    customerType: customerType || 'INDIVIDUAL',
                    companyId: finalCompanyId,
                    ...auditData
                }
            });
            // 2. If password provided, create User account
            if (password && finalEmail) {
                const hashedPassword = await bcryptjs_1.default.hash(password, 10);
                const user = await tx.user.create({
                    data: {
                        email: finalEmail,
                        password: hashedPassword,
                        systemRole: 'USER',
                        roleName: 'Customer',
                        firstName,
                        lastName
                    }
                });
                // Link User to Customer
                await tx.customer.update({
                    where: { id: customer.id },
                    data: { userId: user.id }
                });
                return { ...customer, hasAccount: true, accountId: user.id };
            }
            return { ...customer, hasAccount: false, accountId: null };
        }).catch((error) => {
            console.error('[CustomerService.createCustomer]', error);
            throw error;
        });
    }
    static async updateCustomer(id, data, authorId) {
        const { email, password, firstName, lastName, phone, address, city, country, zipCode, customerType, companyId, companyName, companyRegistrationNumber, companyIndustry } = data;
        // Verify author exists before setting audit fields
        const authorExists = authorId ? await index_1.prisma.user.findUnique({ where: { id: authorId } }) : null;
        const auditUpdate = authorExists ? { updatedById: authorId } : {};
        const finalEmail = email?.trim() || null;
        return await index_1.prisma.$transaction(async (tx) => {
            const currentCustomer = await tx.customer.findUnique({
                where: { id },
                include: { user: true }
            });
            if (!currentCustomer)
                throw new Error('Customer not found');
            let finalCompanyId = companyId || null;
            // Update or Create inline Company
            if (customerType === 'COMPANY') {
                if (finalCompanyId) {
                    // Update existing company if we have a name to update
                    if (companyName) {
                        await tx.company.update({
                            where: { id: finalCompanyId },
                            data: {
                                name: companyName,
                                registrationNumber: companyRegistrationNumber,
                                industry: companyIndustry,
                                ...auditUpdate
                            }
                        });
                    }
                }
                else if (companyName) {
                    // Create new if none selected but name provided
                    const company = await tx.company.create({
                        data: {
                            name: companyName,
                            registrationNumber: companyRegistrationNumber,
                            industry: companyIndustry,
                            address, city, country, zipCode,
                            createdById: authorExists ? authorId : undefined,
                            updatedById: authorExists ? authorId : undefined
                        }
                    });
                    finalCompanyId = company.id;
                }
            }
            // Update Customer fields
            const customer = await tx.customer.update({
                where: { id },
                data: {
                    email: finalEmail, firstName, lastName, phone, address, city, country, zipCode,
                    customerType, companyId: finalCompanyId,
                    ...auditUpdate
                }
            });
            // If password provided and user exists, update user
            if (password && currentCustomer.userId) {
                const hashedPassword = await bcryptjs_1.default.hash(password, 10);
                await tx.user.update({
                    where: { id: currentCustomer.userId },
                    data: {
                        password: hashedPassword,
                        email: finalEmail || currentCustomer.email, // sync email if updated
                        firstName,
                        lastName
                    }
                });
            }
            // If password provided but no user exists, create one?
            else if (password && !currentCustomer.userId && finalEmail) {
                const hashedPassword = await bcryptjs_1.default.hash(password, 10);
                const user = await tx.user.create({
                    data: {
                        email: finalEmail,
                        password: hashedPassword,
                        systemRole: 'USER',
                        roleName: 'Customer',
                        firstName,
                        lastName
                    }
                });
                await tx.customer.update({
                    where: { id: customer.id },
                    data: { userId: user.id }
                });
            }
            return customer;
        });
    }
    static async deleteCustomer(id) {
        return await index_1.prisma.$transaction(async (tx) => {
            const customer = await tx.customer.findUnique({ where: { id } });
            if (customer?.userId) {
                await tx.user.delete({ where: { id: customer.userId } });
            }
            return await tx.customer.delete({ where: { id } });
        });
    }
    static async checkEmailExists(email) {
        // Check in both tables? Customer might have same email as a User
        const customer = await index_1.prisma.customer.findUnique({ where: { email } });
        if (customer)
            return customer;
        return await index_1.prisma.user.findUnique({ where: { email } });
    }
}
exports.CustomerService = CustomerService;
