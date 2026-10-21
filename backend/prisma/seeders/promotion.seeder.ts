import { PrismaClient } from '@prisma/client';

// Mã khuyến mãi toàn hệ thống dùng để demo (trước đây chỉ được hardcode ở frontend)
export async function seedPromotions(prisma: PrismaClient) {
  console.log('  └─ Seeding Promotions...');

  const now = new Date();
  const oneYearLater = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);

  const promotions = [
    { code: 'DONGGIA50K', description: 'Giảm 25% tối đa 50.000đ', discountPercent: 25, maxDiscountAmount: 50000 },
    { code: 'SPORT20', description: 'Giảm 20% tối đa 80.000đ', discountPercent: 20, maxDiscountAmount: 80000 },
  ];

  for (const promo of promotions) {
    const existing = await prisma.promotion.findUnique({ where: { code: promo.code } });
    if (!existing) {
      await prisma.promotion.create({
        data: {
          ...promo,
          minOrderValue: 0,
          startDate: now,
          endDate: oneYearLater,
          usageLimit: 0, // 0 = không giới hạn tổng lượt dùng (mỗi người vẫn chỉ dùng 1 lần)
        },
      });
    }
  }
}
