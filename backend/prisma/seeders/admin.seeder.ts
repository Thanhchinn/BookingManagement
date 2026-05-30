import { PrismaClient } from '@prisma/client';

export async function seedAdmins(prisma: PrismaClient) {
  console.log('  └─ Seeding Admins...');

  const existingAdmin = await prisma.admin.findFirst({
    where: { email: 'admin@booking.com' },
  });

  if (!existingAdmin) {
    await prisma.admin.create({
      data: {
        username: 'admin',
        email: 'admin@booking.com',
        password: '$2b$10$x.Xh6mZ85m0Fh1x2M7r.qOuL7w6xN2b7pE4wD7Vb9m1U2U8O9d6nK', // 'admin123'
        fullName: 'System Administrator',
        role: 'SUPERADMIN',
        isActive: true,
      },
    });
    console.log('  └─ ✅ Seeded default admin account successfully!');
  } else {
    console.log('  └─ ℹ️ Admin account already exists, skipping.');
  }
}
