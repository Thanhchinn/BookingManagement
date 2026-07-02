import { PrismaClient } from '@prisma/client';

export async function seedCategories(prisma: PrismaClient) {
  console.log('  └─ Seeding Categories...');
  
  const categories = [
    { name: 'Cầu Lông', slug: 'cau-long', icon: 'fa-medal', colorBg: 'bg-emerald-100', colorText: 'text-emerald-600' },
    { name: 'Bóng Đá', slug: 'bong-da', icon: 'fa-futbol', colorBg: 'bg-blue-100', colorText: 'text-blue-600' },
    { name: 'Tennis', slug: 'tennis', icon: 'fa-baseball-ball', colorBg: 'bg-amber-100', colorText: 'text-amber-600' }
  ];

  for (const cat of categories) {
    const existing = await prisma.category.findUnique({
      where: { slug: cat.slug }
    });
    if (!existing) {
      await prisma.category.create({
        data: cat
      });
    }
  }
}
