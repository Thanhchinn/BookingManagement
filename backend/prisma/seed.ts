import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import 'dotenv/config';

// Import các seeder riêng lẻ
import { seedAdmins } from './seeders/admin.seeder';
import { seedUsers } from './seeders/user.seeder';
import { seedLocations } from './seeders/location.seeder';

// Khởi tạo connection pool Postgres chuẩn của Prisma 7 Wasm engine
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 [DatabaseSeeder] Starting database seeding...');

  // Thực thi các seeder theo thứ tự an toàn (bảng cha trước, bảng con sau)
  await seedAdmins(prisma);
  await seedUsers(prisma);
  await seedLocations(prisma);

  console.log('🌱 [DatabaseSeeder] Database seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error('❌ [DatabaseSeeder] Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    // Đóng toàn bộ kết nối sạch sẽ để giải phóng tài nguyên
    await prisma.$disconnect();
    await pool.end();
  });
