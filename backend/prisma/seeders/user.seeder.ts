import { PrismaClient } from '@prisma/client';

export async function seedUsers(prisma: PrismaClient) {
  console.log('  └─ Seeding/Updating Users...');

  const correctHash = '$2b$10$4d5RdFzf7LO6QFHZTy5S8.5.b1QpisbtCidfFEzDT9mdeTy2eC87y'; // 'admin123'

  const existingUser = await prisma.user.findFirst({
    where: { email: 'customer@booking.com' },
  });

  if (!existingUser) {
    await prisma.user.create({
      data: {
        fullName: 'Nguyễn Văn A',
        email: 'customer@booking.com',
        password: correctHash,
        phone: '0912345678',
        address: '123 Đường Lê Lợi, Quận 1, TP. Hồ Chí Minh',
        loyaltyPoints: 100,
        isActive: true,
      },
    });
    console.log('  └─ ✅ Seeded default user account successfully!');
  } else {
    await prisma.user.update({
      where: { id: existingUser.id },
      data: { password: correctHash },
    });
    console.log('  └─ ✅ Updated default user password successfully!');
  }

  const partnerUser = await prisma.user.findFirst({
    where: { email: 'partner@booking.com' },
  });

  if (!partnerUser) {
    const newPartnerUser = await prisma.user.create({
      data: {
        fullName: 'Chủ Sân Nguyễn Văn B',
        email: 'partner@booking.com',
        password: correctHash,
        phone: '0987654321',
        address: '456 Đường Trần Hưng Đạo, Quận 5, TP. Hồ Chí Minh',
        loyaltyPoints: 0,
        isActive: true,
      },
    });

    await prisma.partnerProfile.create({
      data: {
        userId: newPartnerUser.id,
        businessName: 'Tổ hợp Sân Cầu Lông & Bóng Đá SportZone',
        taxCode: '0316789123',
        businessLicenseUrl: 'https://example.com/license.pdf',
        commissionRate: 10.00,
        commissionType: 'PERCENTAGE',
        commissionFixedAmount: 0.00,
        balance: 0.00,
        status: 'ACTIVE',
      },
    });
    console.log('  └─ ✅ Seeded default partner account successfully!');
  }
}
