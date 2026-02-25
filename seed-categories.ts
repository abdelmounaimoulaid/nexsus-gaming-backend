import { prisma } from './src/index';

const menuData = [
    {
        id: 'gaming-pcs',
        label: 'Gaming PCs',
        icon: 'Monitor',
        subGroups: [
            {
                title: 'Pre-Built Systems',
                items: [
                    { label: 'Entry Level', to: '/catalog/gaming-pcs' },
                    { label: 'Mid-Range', to: '/catalog/gaming-pcs' },
                    { label: 'High-End', to: '/catalog/gaming-pcs' },
                    { label: 'Extreme', to: '/catalog/gaming-pcs' },
                ],
            },
            {
                title: 'Custom Builds',
                items: [
                    { label: 'PC Builder', to: '/builder' },
                    { label: 'Workstation PCs', to: '/catalog/gaming-pcs' },
                    { label: 'Compact PCs', to: '/catalog/gaming-pcs' },
                ],
            },
        ],
    },
    {
        id: 'gpus',
        label: 'Graphics Cards',
        icon: 'Layers',
        subGroups: [
            {
                title: 'NVIDIA',
                items: [
                    { label: 'RTX 4090', to: '/catalog/gpus' },
                    { label: 'RTX 4080 / 4070', to: '/catalog/gpus' },
                    { label: 'RTX 4060 / 4050', to: '/catalog/gpus' },
                ],
            },
            {
                title: 'AMD',
                items: [
                    { label: 'RX 7900 Series', to: '/catalog/gpus' },
                    { label: 'RX 7800 Series', to: '/catalog/gpus' },
                    { label: 'RX 7600 Series', to: '/catalog/gpus' },
                ],
            },
        ],
    },
    {
        id: 'cpus',
        label: 'Processors',
        icon: 'Cpu',
        subGroups: [
            {
                title: 'Intel',
                items: [
                    { label: 'Core i9', to: '/catalog/cpus' },
                    { label: 'Core i7', to: '/catalog/cpus' },
                    { label: 'Core i5', to: '/catalog/cpus' },
                ],
            },
            {
                title: 'AMD Ryzen',
                items: [
                    { label: 'Ryzen 9', to: '/catalog/cpus' },
                    { label: 'Ryzen 7', to: '/catalog/cpus' },
                    { label: 'Ryzen 5', to: '/catalog/cpus' },
                ],
            },
        ],
    },
    {
        id: 'motherboards',
        label: 'Motherboards',
        icon: 'LayoutGrid',
        subGroups: [
            {
                title: 'Intel Platform',
                items: [
                    { label: 'Z790 Chipset', to: '/catalog/motherboards' },
                    { label: 'B760 Chipset', to: '/catalog/motherboards' },
                    { label: 'H770 Chipset', to: '/catalog/motherboards' },
                ],
            },
            {
                title: 'AMD Platform',
                items: [
                    { label: 'X670E Chipset', to: '/catalog/motherboards' },
                    { label: 'B650 Chipset', to: '/catalog/motherboards' },
                    { label: 'A620 Chipset', to: '/catalog/motherboards' },
                ],
            },
        ],
    },
    {
        id: 'ram',
        label: 'Memory',
        icon: 'MemoryStick',
        subGroups: [
            {
                title: 'DDR5',
                items: [
                    { label: '16 GB Kits', to: '/catalog/ram' },
                    { label: '32 GB Kits', to: '/catalog/ram' },
                    { label: '64 GB Kits', to: '/catalog/ram' },
                ],
            },
            {
                title: 'DDR4',
                items: [
                    { label: '16 GB Kits', to: '/catalog/ram' },
                    { label: '32 GB Kits', to: '/catalog/ram' },
                ],
            },
        ],
    },
    {
        id: 'storage',
        label: 'Storage',
        icon: 'HardDrive',
        subGroups: [
            {
                title: 'NVMe SSDs',
                items: [
                    { label: 'Gen 4 NVMe', to: '/catalog/storage' },
                    { label: 'Gen 5 NVMe', to: '/catalog/storage' },
                ],
            },
            {
                title: 'SATA / Other',
                items: [
                    { label: 'SATA SSD', to: '/catalog/storage' },
                    { label: 'Hard Drives', to: '/catalog/storage' },
                ],
            },
        ],
    },
    {
        id: 'psu',
        label: 'Power Supplies',
        icon: 'Zap',
        subGroups: [
            {
                title: 'Wattage',
                items: [
                    { label: '650W – 750W', to: '/catalog/psu' },
                    { label: '850W – 1000W', to: '/catalog/psu' },
                    { label: '1200W+', to: '/catalog/psu' },
                ],
            },
            {
                title: 'Efficiency',
                items: [
                    { label: '80+ Gold', to: '/catalog/psu' },
                    { label: '80+ Platinum', to: '/catalog/psu' },
                    { label: '80+ Titanium', to: '/catalog/psu' },
                ],
            },
        ],
    },
    {
        id: 'cases',
        label: 'Cases',
        icon: 'Package',
        subGroups: [
            {
                title: 'Form Factor',
                items: [
                    { label: 'Full Tower', to: '/catalog/cases' },
                    { label: 'Mid Tower (ATX)', to: '/catalog/cases' },
                    { label: 'Mini-ITX', to: '/catalog/cases' },
                ],
            },
            {
                title: 'Style',
                items: [
                    { label: 'Tempered Glass', to: '/catalog/cases' },
                    { label: 'Mesh Airflow', to: '/catalog/cases' },
                    { label: 'RGB Cases', to: '/catalog/cases' },
                ],
            },
        ],
    },
    {
        id: 'cooling',
        label: 'Cooling',
        icon: 'Wind',
        subGroups: [
            {
                title: 'Liquid Cooling',
                items: [
                    { label: '240mm AIO', to: '/catalog/cooling' },
                    { label: '360mm AIO', to: '/catalog/cooling' },
                    { label: 'Custom Loop', to: '/catalog/cooling' },
                ],
            },
            {
                title: 'Air Cooling',
                items: [
                    { label: 'Tower Coolers', to: '/catalog/cooling' },
                    { label: 'Case Fans', to: '/catalog/cooling' },
                    { label: 'Fan Controllers', to: '/catalog/cooling' },
                ],
            },
        ],
    },
    {
        id: 'monitors',
        label: 'Monitors',
        icon: 'Monitor',
        subGroups: [
            {
                title: 'Resolution',
                items: [
                    { label: '1080p Monitors', to: '/catalog/monitors' },
                    { label: '1440p Monitors', to: '/catalog/monitors' },
                    { label: '4K Monitors', to: '/catalog/monitors' },
                ],
            },
            {
                title: 'Panel Type',
                items: [
                    { label: 'OLED Monitors', to: '/catalog/monitors' },
                    { label: 'IPS Monitors', to: '/catalog/monitors' },
                    { label: 'VA Monitors', to: '/catalog/monitors' },
                ],
            },
        ],
    },
    {
        id: 'accessories',
        label: 'Accessories',
        icon: 'Headphones',
        subGroups: [
            {
                title: 'Peripherals',
                items: [
                    { label: 'Gaming Mice', to: '/catalog/accessories' },
                    { label: 'Keyboards', to: '/catalog/accessories' },
                    { label: 'Headsets', to: '/catalog/accessories' },
                ],
            },
            {
                title: 'Other',
                items: [
                    { label: 'Webcams', to: '/catalog/accessories' },
                    { label: 'Mouse Pads', to: '/catalog/accessories' },
                    { label: 'Controllers', to: '/catalog/accessories' },
                ],
            },
        ],
    },
];

async function seedCategories() {
    console.log('Seeding categories...');
    let order = 0;

    for (const mainCat of menuData) {
        order++;

        const parent = await prisma.category.upsert({
            where: { slug: mainCat.id },
            update: {
                name: mainCat.label,
                icon: mainCat.icon,
                sortOrder: order,
            },
            create: {
                name: mainCat.label,
                slug: mainCat.id,
                icon: mainCat.icon,
                sortOrder: order,
                visibility: true,
            }
        });

        console.log(`Upserted parent: ${parent.name}`);

        // Create groupings as actual Level 2 Subcategories
        let groupOrder = 0;
        for (const group of mainCat.subGroups) {
            groupOrder++;
            const groupSlug = `${mainCat.id}-${group.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`;

            const groupCategory = await prisma.category.upsert({
                where: { slug: groupSlug },
                update: {
                    name: group.title,
                    parentId: parent.id,
                    sortOrder: groupOrder,
                    visibility: true,
                    icon: mainCat.icon,
                },
                create: {
                    name: group.title,
                    slug: groupSlug,
                    parentId: parent.id,
                    sortOrder: groupOrder,
                    visibility: true,
                    icon: mainCat.icon,
                }
            });
            console.log(`  Upserted group: ${groupCategory.name}`);

            let itemOrder = 0;
            for (const item of group.items) {
                itemOrder++;
                const subSlug = item.label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                const uniqueSubSlug = `${groupSlug}-${subSlug}`;

                await prisma.category.upsert({
                    where: { slug: uniqueSubSlug },
                    update: {
                        name: item.label,
                        parentId: groupCategory.id,
                        sortOrder: itemOrder,
                        visibility: true,
                    },
                    create: {
                        name: item.label,
                        slug: uniqueSubSlug,
                        parentId: groupCategory.id,
                        sortOrder: itemOrder,
                        visibility: true,
                    }
                });
                console.log(`    Upserted item: ${item.label}`);
            }
        }
    }

    console.log('Categories seeded successfully!');
}

seedCategories()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
