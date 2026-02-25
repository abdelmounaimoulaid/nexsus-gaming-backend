import { prisma } from './src/index';

async function addVariations() {
    console.log('Adding variations to products...');

    // 1. Monitor - Options for Resolution/Size
    const monitor = await prisma.product.findFirst({ where: { slug: { contains: 'odyssey' } } });
    if (monitor) {
        await prisma.product.update({
            where: { id: monitor.id },
            data: {
                variations: [
                    { name: 'Taille', options: ['32"', '49"', '57"'] },
                    { name: 'Résolution', options: ['4K', '8K'] }
                ]
            }
        });
        console.log('Updated monitor with variations');
    }

    // 2. Mouse - Options for Color
    const mouse = await prisma.product.findFirst({ where: { slug: { contains: 'superlight' } } });
    if (mouse) {
        await prisma.product.update({
            where: { id: mouse.id },
            data: {
                variations: [
                    { name: 'Couleur', options: ['Noir', 'Blanc', 'Rose', 'Rouge'] }
                ]
            }
        });
        console.log('Updated mouse with variations');
    }

    console.log('Done!');
}

addVariations()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
