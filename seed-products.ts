/**
 * seed-products.ts
 * Seeds sample gaming products for CRUD testing.
 * Run with: npx ts-node seed-products.ts
 */
import { PrismaClient, ProductStatus } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as any);

async function main() {
    // ── Fetch a few real category slugs from the DB ───────────────────────────
    const cats = await prisma.category.findMany({ select: { id: true, slug: true, name: true } });
    const catBySlug = (slug: string) => cats.find(c => c.slug === slug)?.id ?? cats[0]?.id;

    if (cats.length === 0) {
        console.error('❌  No categories found. Run seed-categories.ts first.');
        process.exit(1);
    }

    console.log(`✅  Found ${cats.length} categories. Seeding products…`);

    // ── Products ──────────────────────────────────────────────────────────────
    const products = [
        {
            name: 'Nexus Beast RTX 4090 Gaming PC',
            slug: 'nexus-beast-rtx-4090',
            brand: 'Nexus Custom',
            description: 'The ultimate 4K/240Hz gaming machine. Powered by the RTX 4090 and Intel Core i9-14900K for unmatched frame rates in any title.',
            price: 42999,
            originalPrice: 47999,
            status: 'ACTIVE',
            stock: 5,
            badge: 'BEST SELLER',
            isFeatured: true,
            categorySlug: 'high-end',
            specs: { GPU: 'RTX 4090 24GB', CPU: 'Intel Core i9-14900K', RAM: '64GB DDR5', Storage: '4TB NVMe', PSU: '1000W 80+ Platinum', Case: 'Nexus Phantom V3' },
            metaTitle: 'Nexus Beast RTX 4090 Gaming PC | Nexus Gaming',
            metaDescription: 'Buy the Nexus Beast RTX 4090 Gaming PC. Dominate 4K gaming with 24GB VRAM, i9-14900K, and 64GB DDR5. Free delivery in Morocco.',
            metaKeywords: 'rtx 4090, gaming pc, nexus gaming, i9-14900K',
        },
        {
            name: 'Nexus Alpha RTX 4070 Ti Mid-Range PC',
            slug: 'nexus-alpha-rtx-4070-ti',
            brand: 'Nexus Custom',
            description: 'Perfect 1440p gaming at ultra settings. The RTX 4070 Ti Super paired with Ryzen 7 7800X3D delivers incredible gaming performance.',
            price: 22999,
            originalPrice: null,
            status: 'ACTIVE',
            stock: 12,
            badge: 'NEW',
            isFeatured: true,
            categorySlug: 'mid-range',
            specs: { GPU: 'RTX 4070 Ti Super 16GB', CPU: 'AMD Ryzen 7 7800X3D', RAM: '32GB DDR5', Storage: '2TB NVMe', PSU: '850W 80+ Gold', Case: 'Nexus Stealth M2' },
            metaTitle: 'Nexus Alpha RTX 4070 Ti Gaming PC | Nexus Gaming',
            metaDescription: 'The best 1440p gaming PC. Ryzen 7 7800X3D + RTX 4070 Ti Super for under 23,000 MAD.',
            metaKeywords: 'rtx 4070 ti, 1440p gaming pc, ryzen 7800x3d',
        },
        {
            name: 'ASUS ROG STRIX RTX 4080 Super',
            slug: 'asus-rog-strix-rtx-4080-super',
            brand: 'ASUS ROG',
            description: 'Triple-fan ROG STRIX cooling design, 2.9 GHz boost clock, 16GB GDDR6X. For gamers who demand the absolute best in a standalone GPU.',
            price: 13500,
            originalPrice: 15000,
            status: 'ACTIVE',
            stock: 8,
            badge: 'SALE',
            isFeatured: false,
            categorySlug: 'rtx-4080-4070',
            specs: { VRAM: '16GB GDDR6X', 'Boost Clock': '2.9 GHz', 'TDP': '320W', Connectors: '3x DisplayPort 1.4, 1x HDMI 2.1', Width: '3.1 slots' },
            metaTitle: 'ASUS ROG STRIX RTX 4080 Super 16GB | Nexus Gaming',
            metaDescription: 'ASUS ROG STRIX RTX 4080 Super with triple-fan cooling. Now on sale at Nexus Gaming Morocco.',
            metaKeywords: 'rtx 4080 super, asus rog strix, gpu',
        },
        {
            name: 'MSI MAG Coreliquid 360 AIO',
            slug: 'msi-mag-coreliquid-360-aio',
            brand: 'MSI',
            description: '360mm all-in-one liquid cooler with three 120mm ARGB fans. Keeps your CPU under 70°C even during extreme overclocks.',
            price: 1499,
            originalPrice: null,
            status: 'ACTIVE',
            stock: 20,
            badge: null,
            isFeatured: false,
            categorySlug: 'cooling',
            specs: { Radiator: '360mm', Fans: '3x 120mm ARGB', 'Fan Speed': '500–2000 RPM', 'Socket Support': 'AM5, AM4, LGA1700, LGA1200', Warranty: '2 years' },
            metaTitle: 'MSI MAG Coreliquid 360 AIO CPU Cooler | Nexus Gaming',
            metaDescription: 'Keep your CPU cool with the MSI MAG Coreliquid 360mm AIO. Compatible with AM5 and LGA1700.',
            metaKeywords: 'aio cooler, 360mm, msi, cpu cooler',
        },
        {
            name: 'Kingston FURY Beast DDR5 32GB 6000MHz',
            slug: 'kingston-fury-beast-ddr5-32gb',
            brand: 'Kingston',
            description: 'Dual-channel 2×16GB DDR5 kit running at 6000MHz CL36. XMP 3.0 and EXPO compatible for easy overclocking.',
            price: 1199,
            originalPrice: 1399,
            status: 'ACTIVE',
            stock: 30,
            badge: 'HOT',
            isFeatured: false,
            categorySlug: 'memory',
            specs: { Capacity: '2×16GB', Speed: '6000MHz', Latency: 'CL36', Voltage: '1.35V', Profile: 'XMP 3.0 / EXPO', RGB: 'Yes' },
            metaTitle: 'Kingston FURY Beast DDR5 32GB 6000MHz | Nexus Gaming',
            metaDescription: 'Upgrade to DDR5 with the Kingston FURY Beast 32GB kit at 6000MHz for next-gen performance.',
            metaKeywords: 'ddr5, kingston fury, ram, 6000mhz',
        },
        {
            name: 'Samsung 990 Pro NVMe 2TB',
            slug: 'samsung-990-pro-nvme-2tb',
            brand: 'Samsung',
            description: '7,450 MB/s sequential read, 6,900 MB/s write. The fastest consumer NVMe SSD for gaming and content creation.',
            price: 1899,
            originalPrice: null,
            status: 'ACTIVE',
            stock: 0,
            badge: null,
            isFeatured: false,
            categorySlug: 'storage',
            specs: { Capacity: '2TB', Interface: 'PCIe 4.0 NVMe M.2', 'Seq. Read': '7,450 MB/s', 'Seq. Write': '6,900 MB/s', NAND: 'V-NAND 3-bit MLC', Warranty: '5 years' },
            metaTitle: 'Samsung 990 Pro 2TB NVMe SSD | Nexus Gaming',
            metaDescription: 'The Samsung 990 Pro 2TB offers blazing 7,450 MB/s speeds. Best NVMe SSD for gaming in Morocco.',
            metaKeywords: 'nvme, samsung 990 pro, ssd, 2tb',
        },
        {
            name: 'Nexus Starter AMD Ryzen 5 Entry PC',
            slug: 'nexus-starter-ryzen5-entry',
            brand: 'Nexus Custom',
            description: 'Budget-friendly 1080p gaming machine. Ryzen 5 7600 + RX 7600 XT combo crushes 1080p gaming at ultra settings for an unbeatable price.',
            price: 8999,
            originalPrice: null,
            status: 'ACTIVE',
            stock: 15,
            badge: 'VALUE PICK',
            isFeatured: false,
            categorySlug: 'entry-level',
            specs: { GPU: 'RX 7600 XT 16GB', CPU: 'AMD Ryzen 5 7600', RAM: '16GB DDR5', Storage: '1TB NVMe', PSU: '650W 80+ Bronze', Case: 'Nexus NX200' },
            metaTitle: 'Nexus Starter Ryzen 5 Budget Gaming PC | Nexus Gaming',
            metaDescription: 'Best budget gaming PC in Morocco. Ryzen 5 + RX 7600 XT for 1080p ultra gaming under 9,000 MAD.',
            metaKeywords: 'budget gaming pc, ryzen 5, rx 7600, entry level',
        },
    ];

    let created = 0, skipped = 0;

    for (const p of products) {
        const { categorySlug, specs, status: statusStr, ...rest } = p;
        const categoryId = catBySlug(categorySlug);

        const existing = await prisma.product.findUnique({ where: { slug: rest.slug } });
        if (existing) { console.log(`  ⏭  Skip (exists): ${rest.name}`); skipped++; continue; }

        await prisma.product.create({
            data: {
                ...rest,
                status: statusStr as ProductStatus,
                categoryId,
                specs: specs as any,
            }
        });
        console.log(`  ✅  Created: ${rest.name}`);
        created++;
    }

    console.log(`\n🎉  Done! ${created} products created, ${skipped} skipped.`);
}

main()
    .catch(e => { console.error(e); process.exit(1); })
    .finally(() => prisma.$disconnect());
