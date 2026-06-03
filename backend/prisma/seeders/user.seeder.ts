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
}
