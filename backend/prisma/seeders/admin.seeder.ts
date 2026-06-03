import { PrismaClient } from '@prisma/client';

export async function seedAdmins(prisma: PrismaClient) {
  console.log('  └─ Seeding/Updating Admins...');

  const correctHash = '$2b$10$4d5RdFzf7LO6QFHZTy5S8.5.b1QpisbtCidfFEzDT9mdeTy2eC87y'; // 'admin123'

  const existingAdmin = await prisma.admin.findFirst({
    where: { email: 'admin@booking.com' },
  });

  if (!existingAdmin) {
    await prisma.admin.create({
      data: {
        username: 'admin',
        email: 'admin@booking.com',
        password: correctHash,
        fullName: 'System Administrator',
        role: 'SUPERADMIN',
        isActive: true,
      },
    });
    console.log('  └─ ✅ Seeded default admin account successfully!');
  } else {
    await prisma.admin.update({
      where: { id: existingAdmin.id },
      data: { password: correctHash },
    });
    console.log('  └─ ✅ Updated default admin password successfully!');
  }
}
