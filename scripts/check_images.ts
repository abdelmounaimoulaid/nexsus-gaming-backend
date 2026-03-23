import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const banners = await prisma.banner.findMany({
    take: 5,
    select: { id: true, title: true, imagePath: true }
  });
  console.log('Banners:', JSON.stringify(banners, null, 2));

  const products = await prisma.product.findMany({
    take: 5,
    include: { images: true }
  });
  console.log('Products:', JSON.stringify(products, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
