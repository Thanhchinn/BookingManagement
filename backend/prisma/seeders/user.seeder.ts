import { PrismaClient } from '@prisma/client';

export async function seedUsers(prisma: PrismaClient) {
  console.log('  └─ Seeding Users...');

  const existingUser = await prisma.user.findFirst({
    where: { email: 'customer@booking.com' },
  });

  if (!existingUser) {
    await prisma.user.create({
      data: {
        fullName: 'Nguyễn Văn A',
        email: 'customer@booking.com',
        password: '$2b$10$x.Xh6mZ85m0Fh1x2M7r.qOuL7w6xN2b7pE4wD7Vb9m1U2U8O9d6nK', // 'admin123'
        phone: '0912345678',
        address: '123 Đường Lê Lợi, Quận 1, TP. Hồ Chí Minh',
        loyaltyPoints: 100,
        isActive: true,
      },
    });
    console.log('  └─ ✅ Seeded default user account successfully!');
  } else {
    console.log('  └─ ℹ️ User account already exists, skipping.');
  }
}
