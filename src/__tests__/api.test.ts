import request from 'supertest';
import { app, prisma } from '../index';

describe('Admin API Endpoints', () => {
    let adminToken: string;
    let testCategoryId: string;

    beforeAll(async () => {
        // 1. Seed user and get token
        const resSeed = await request(app).post('/api/auth/seed');
        const resLogin = await request(app)
            .post('/api/auth/login')
            .send({ email: 'admin@nexusgaming.ma', password: 'admin123' });

        adminToken = resLogin.body.token;
    });

    afterAll(async () => {
        // Clean up
        await prisma.productImage.deleteMany();
        await prisma.product.deleteMany();
        await prisma.category.deleteMany();
        await prisma.section.deleteMany();
        await prisma.banner.deleteMany();
        await prisma.user.deleteMany({ where: { email: 'admin@nexusgaming.ma' } });
        await prisma.$disconnect();
    });

    it('Health Check returns OK', async () => {
        const res = await request(app).get('/api/health');
        expect(res.status).toBe(200);
        expect(res.body.status).toBe('ok');
    });

    it('Creates a Category', async () => {
        const res = await request(app)
            .post('/api/categories')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ name: 'Gaming Laptops', slug: 'gaming-laptops' });

        expect(res.status).toBe(200);
        expect(res.body.name).toBe('Gaming Laptops');
        testCategoryId = res.body.id;
    });

    it('Creates a Product under Category', async () => {
        const res = await request(app)
            .post('/api/products')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                name: 'Nexus Alpha Laptop',
                slug: 'nexus-alpha',
                description: 'Powerful gaming laptop',
                price: 1500,
                categoryId: testCategoryId,
                brand: 'Nexus',
                status: 'ACTIVE'
            });

        expect(res.status).toBe(200);
        expect(res.body.name).toBe('Nexus Alpha Laptop');
        expect(res.body.categoryId).toBe(testCategoryId);
    });

    it('Creates a Homepage Section', async () => {
        const res = await request(app)
            .post('/api/sections')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ name: 'Featured Laptops', type: 'PRODUCT_CAROUSEL' });

        expect(res.status).toBe(200);
        expect(res.body.name).toBe('Featured Laptops');
    });

    it('Fetches public categories', async () => {
        const res = await request(app).get('/api/categories');
        expect(res.status).toBe(200);
        expect(res.body.length).toBeGreaterThan(0);
    });

    it('Fetches products with status filter', async () => {
        const res = await request(app).get('/api/products?status=ACTIVE');
        expect(res.status).toBe(200);
        expect(res.body.length).toBe(1);
        expect(res.body[0].name).toBe('Nexus Alpha Laptop');
    });
});
