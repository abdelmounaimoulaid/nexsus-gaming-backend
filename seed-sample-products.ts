import { prisma } from './src/index';
import fs from 'fs';
import path from 'path';

const UPLOADS_DIR = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const sourceImages = [
    {
        src: '/Users/abdelmonaimoulaid/.gemini/antigravity/brain/21dae883-4915-4fa3-8df4-3612f55b64d6/mouse_sample_1771892293430.png',
        dest: 'nexus-pro-mouse.png',
        slug: 'accessories-peripherals-gaming-mice'
    },
    {
        src: '/Users/abdelmonaimoulaid/.gemini/antigravity/brain/21dae883-4915-4fa3-8df4-3612f55b64d6/gpu_sample_1771892308491.png',
        dest: 'rtx-5090.png',
        slug: 'gpus-nvidia-rtx-4090'
    },
    {
        src: '/Users/abdelmonaimoulaid/.gemini/antigravity/brain/21dae883-4915-4fa3-8df4-3612f55b64d6/chair_sample_1771892325077.png',
        dest: 'titan-ergo-chair.png',
        slug: 'accessories-other' // we'll use 'accessories-other' if specific doesn't exist
    },
    {
        src: '/Users/abdelmonaimoulaid/.gemini/antigravity/brain/21dae883-4915-4fa3-8df4-3612f55b64d6/keyboard_sample_1771892338473.png',
        dest: 'mechstrike-keyboard.png',
        slug: 'accessories-peripherals-keyboards'
    }
];

const productsData = [
    {
        name: 'Nexus Pro Wireless Gaming Mouse',
        slug: 'nexus-pro-wireless-gaming-mouse',
        brand: 'Nexus Gear',
        price: 899.00,
        originalPrice: 1199.00,
        stock: 45,
        status: 'ACTIVE',
        isFeatured: true,
        description: 'Experience ultra-fast wireless connectivity and precision tracking with our flagship gaming mouse. Features customizable RGB zones, 26K DPI optical sensor, and a lightweight carbon fiber shell.',
        specs: { weight: '65g', sensor: 'Optical 26K', connection: '2.4GHz Wireless / Bluetooth', battery: 'Up to 80 hours' },
        metaTitle: 'Buy Nexus Pro Wireless Gaming Mouse',
        imageDest: 'nexus-pro-mouse.png',
        catSlug: 'accessories-peripherals-gaming-mice'
    },
    {
        name: 'NVIDIA GeForce RTX 5090 Supreme', // Using 4090 cat but naming 5090 for fun
        slug: 'nvidia-geforce-rtx-5090-supreme',
        brand: 'NVIDIA',
        price: 24999.00,
        originalPrice: null,
        stock: 3,
        status: 'ACTIVE',
        isFeatured: true,
        description: 'The ultimate GPU for gamers and creators. Powered by next-gen architecture, delivering unprecedented performance, AI-powered graphics, and ray tracing capabilities. Massive triple-fan design keeps things ice-cold.',
        specs: { vram: '32GB GDDR7', coreClock: '2750 MHz', power: '600W', outputs: '3x DP 2.1, 1x HDMI 2.1a' },
        metaTitle: 'Buy NVIDIA RTX 5090 Supreme Graphics Card',
        imageDest: 'rtx-5090.png',
        catSlug: 'gpus-nvidia-rtx-4090'
    },
    {
        name: 'Titan Ergo Gaming Chair Red/Black',
        slug: 'titan-ergo-gaming-chair-red-black',
        brand: 'Titan Series',
        price: 2450.00,
        originalPrice: 2900.00,
        stock: 15,
        status: 'ACTIVE',
        isFeatured: false,
        description: 'Built for intense gaming sessions and long workdays. The Titan Ergo provides premium lumbar support, high-density foam, fully adjustable 4D armrests, and a sleek carbon-texture finish.',
        specs: { material: 'PU Leather / Breathable Mesh', capacity: '150 kg', recline: 'Up to 165 degrees', armrests: '4D Adjustable' },
        metaTitle: 'Buy Titan Ergo Gaming Chair Red/Black',
        imageDest: 'titan-ergo-chair.png',
        catSlug: 'accessories-other'
    },
    {
        name: 'MechStrike Pro RGB Mechanical Keyboard',
        slug: 'mechstrike-pro-rgb-mechanical-keyboard',
        brand: 'Nexus Gear',
        price: 1250.00,
        originalPrice: 1450.00,
        stock: 22,
        status: 'ACTIVE',
        isFeatured: true,
        description: 'Dominate your opponents with the MechStrike Pro. Featuring aircraft-grade aluminum frame, hot-swappable linear mechanical switches, and per-key vibrant RGB backlighting customizable via software.',
        specs: { switches: 'Hot-Swap Linear Red', format: 'TKL (80%)', connection: 'Wired USB-C', keycaps: 'Double-shot PBT' },
        metaTitle: 'Buy MechStrike Pro RGB Mechanical Keyboard',
        imageDest: 'mechstrike-keyboard.png',
        catSlug: 'accessories-peripherals-keyboards'
    }
];

async function seed() {
    console.log('Starting seed...');

    for (const image of sourceImages) {
        if (fs.existsSync(image.src)) {
            fs.copyFileSync(image.src, path.join(UPLOADS_DIR, image.dest));
            console.log(`Copied ${image.dest}`);
        } else {
            console.warn(`Source image not found: ${image.src}`);
        }
    }

    const categories = await prisma.category.findMany();

    for (const prod of productsData) {
        let category = categories.find(c => c.slug === prod.catSlug);

        // If exact cat not found (e.g. accessories-other isn't strictly there, maybe the slug is different), fallback to first category
        if (!category) {
            console.warn(`Category slug ${prod.catSlug} not found. Trying prefix matching...`);
            category = categories.find(c => c.slug.includes(prod.catSlug.split('-')[0])) || categories[0];
        }

        const product = await prisma.product.upsert({
            where: { slug: prod.slug },
            update: {
                name: prod.name,
                brand: prod.brand,
                price: prod.price,
                originalPrice: prod.originalPrice,
                stock: prod.stock,
                status: prod.status as any,
                isFeatured: prod.isFeatured,
                description: prod.description,
                specs: prod.specs,
                categoryId: category.id,
                images: {
                    deleteMany: {},
                    create: [{ url: `/uploads/${prod.imageDest}` }]
                }
            },
            create: {
                name: prod.name,
                slug: prod.slug,
                brand: prod.brand,
                price: prod.price,
                originalPrice: prod.originalPrice,
                stock: prod.stock,
                status: prod.status as any,
                isFeatured: prod.isFeatured,
                description: prod.description,
                specs: prod.specs,
                categoryId: category.id,
                images: {
                    create: [{ url: `/uploads/${prod.imageDest}` }]
                }
            }
        });

        console.log(`Seeded Product: ${product.name} in category ${category.name}`);
    }

    console.log('Seeding finished.');
}

seed()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
