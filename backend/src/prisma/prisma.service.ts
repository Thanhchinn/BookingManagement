import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly pool: Pool;

  constructor() {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: Number(process.env.DATABASE_POOL_MAX) || 10, // Số kết nối tối đa tới Postgres
    });
    const adapter = new PrismaPg(pool);
    super({
      adapter,
      // Mặc định không bao giờ trả về trường nhạy cảm; truy vấn cần dùng phải ghi rõ `omit: { password: false }`
      omit: {
        user: { password: true },
        admin: { password: true },
      },
    });
    this.pool = pool;
  }
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
    await this.pool.end();
  }
}
