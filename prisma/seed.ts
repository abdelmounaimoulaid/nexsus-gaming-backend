import { PrismaClient, SectionType } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const rawUrl = process.env.DATABASE_URL || '';
const url = rawUrl.replace('mysql://', 'mariadb://').replace('localhost', '127.0.0.1');
const adapter = new PrismaMariaDb(url);
const prisma = new PrismaClient({ adapter } as any);

async function main() {
    console.log('🌱 Starting seed (Clean Architecture)...');

    // 1. Create Default Roles
    console.log('Creating roles...');
    const superAdminRole = await prisma.role.upsert({
        where: { name: 'Super Admin' },
        update: {},
        create: {
            name: 'Super Admin',
            description: 'Full system access',
            isSystem: true,
            icon: 'ShieldCheck',
            color: '#E05727',
            permissions: [
                "products.view", "products.create", "products.edit", "products.delete",
                "categories.view", "categories.create", "categories.edit", "categories.delete",
                "brands.view", "brands.create", "brands.edit", "brands.delete",
                "collections.view", "collections.create", "collections.edit", "collections.delete",
                "sections.view", "sections.create", "sections.edit", "sections.delete",
                "banners.view", "banners.create", "banners.edit", "banners.delete",
                "users.view", "users.create", "users.edit", "users.delete",
                "roles.view", "roles.create", "roles.edit", "roles.delete",
                "customers.view", "customers.create", "customers.edit", "customers.delete",
                "companies.view", "companies.create", "companies.edit", "companies.delete"
            ]
        },
    });

    const adminRole = await prisma.role.upsert({
        where: { name: 'Admin' },
        update: {},
        create: {
            name: 'Admin',
            description: 'Management access',
            isSystem: false,
            icon: 'Shield',
            color: '#3B82F6',
            permissions: [
                "products.view", "products.create", "products.edit",
                "categories.view", "categories.create", "categories.edit",
                "brands.view", "brands.create", "brands.edit",
                "collections.view", "collections.create", "collections.edit",
                "customers.view", "customers.create", "customers.edit"
            ]
        },
    });

    // 2. Create Default Admin User
    console.log('Creating default admin user...');
    const password = await bcrypt.hash('admin123', 10);

    await prisma.user.upsert({
        where: { email: 'admin@nexusgaming.ma' },
        update: {
            systemRole: 'SUPER_ADMIN',
            roleId: superAdminRole.id,
            roleName: superAdminRole.name
        },
        create: {
            email: 'admin@nexusgaming.ma',
            password: password,
            firstName: 'System',
            lastName: 'Admin',
            systemRole: 'SUPER_ADMIN',
            roleId: superAdminRole.id,
            roleName: superAdminRole.name
        },
    });

    await prisma.user.upsert({
        where: { email: 'nexus@nexusgaming.ma' },
        update: {
            systemRole: 'SUPER_ADMIN',
            roleId: superAdminRole.id,
            roleName: superAdminRole.name
        },
        create: {
            email: 'nexus@nexusgaming.ma',
            password: password,
            firstName: 'Nexus',
            lastName: 'Gaming',
            systemRole: 'SUPER_ADMIN',
            roleId: superAdminRole.id,
            roleName: superAdminRole.name
        },
    });

    // 3. Create Default Sections
    console.log('Creating default homepage sections...');
    const sectionsData: any[] = [
        { name: 'Main Hero Grid', type: SectionType.HERO, sortOrder: 0, isActive: true, config: {} },
        { name: 'Category Browser', type: SectionType.CATEGORIES, sortOrder: 1, isActive: true, config: {} },
        { name: 'Products Tendances', type: SectionType.PRODUCT_CAROUSEL, sortOrder: 2, isActive: true, config: { title: 'Tendances', subtitle: 'Les produits les plus populaires du moment', limit: 4 } },
        { name: 'Nouveautés', type: SectionType.PRODUCT_CAROUSEL, sortOrder: 3, isActive: true, config: { title: 'Nouveautés', subtitle: 'Le matériel le plus récent et le plus performant', limit: 4 } },
        { name: 'Configurations Vedettes', type: SectionType.FEATURED_BUILDS, sortOrder: 4, isActive: true, config: {} },
        { name: 'Pourquoi nous choisir', type: SectionType.FEATURES, sortOrder: 5, isActive: true, config: {} },
        { name: 'PC Builder Promo', type: SectionType.PROMO_BANNER, sortOrder: 6, isActive: true, config: {} },
    ];

    for (const section of sectionsData) {
        await prisma.section.upsert({
            where: { id: `default-${section.type.toLowerCase().replace('_', '-')}` },
            update: section,
            create: {
                id: `default-${section.type.toLowerCase().replace('_', '-')}`,
                ...section
            },
        });
    }

    console.log('✅ Seed complete.');
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
