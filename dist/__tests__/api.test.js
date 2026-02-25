"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const index_1 = require("../index");
describe('Admin API Endpoints', () => {
    let adminToken;
    let testCategoryId;
    beforeAll(async () => {
        // 1. Seed user and get token
        const resSeed = await (0, supertest_1.default)(index_1.app).post('/api/auth/seed');
        const resLogin = await (0, supertest_1.default)(index_1.app)
            .post('/api/auth/login')
            .send({ email: 'admin@nexusgaming.ma', password: 'admin123' });
        adminToken = resLogin.body.token;
    });
    afterAll(async () => {
        // Clean up
        await index_1.prisma.productImage.deleteMany();
        await index_1.prisma.product.deleteMany();
        await index_1.prisma.category.deleteMany();
        await index_1.prisma.section.deleteMany();
        await index_1.prisma.banner.deleteMany();
        await index_1.prisma.user.deleteMany({ where: { email: 'admin@nexusgaming.ma' } });
        await index_1.prisma.$disconnect();
    });
    it('Health Check returns OK', async () => {
        const res = await (0, supertest_1.default)(index_1.app).get('/api/health');
        expect(res.status).toBe(200);
        expect(res.body.status).toBe('ok');
    });
    it('Creates a Category', async () => {
        const res = await (0, supertest_1.default)(index_1.app)
            .post('/api/categories')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ name: 'Gaming Laptops', slug: 'gaming-laptops' });
        expect(res.status).toBe(200);
        expect(res.body.name).toBe('Gaming Laptops');
        testCategoryId = res.body.id;
    });
    it('Creates a Product under Category', async () => {
        const res = await (0, supertest_1.default)(index_1.app)
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
        const res = await (0, supertest_1.default)(index_1.app)
            .post('/api/sections')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ name: 'Featured Laptops', type: 'PRODUCT_CAROUSEL' });
        expect(res.status).toBe(200);
        expect(res.body.name).toBe('Featured Laptops');
    });
    it('Fetches public categories', async () => {
        const res = await (0, supertest_1.default)(index_1.app).get('/api/categories');
        expect(res.status).toBe(200);
        expect(res.body.length).toBeGreaterThan(0);
    });
    it('Fetches products with status filter', async () => {
        const res = await (0, supertest_1.default)(index_1.app).get('/api/products?status=ACTIVE');
        expect(res.status).toBe(200);
        expect(res.body.length).toBe(1);
        expect(res.body[0].name).toBe('Nexus Alpha Laptop');
    });
});
