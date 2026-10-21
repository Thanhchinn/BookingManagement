import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Admin } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { CreateAdminDto, UpdateAdminDto } from './dto/admin.dto';

@Injectable()
export class AdminsService {
  constructor(private readonly prisma: PrismaService) {}

  // Lấy tất cả tài khoản Admin
  async findAll(): Promise<Admin[]> {
    return this.prisma.admin.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  // Lấy chi tiết tài khoản Admin theo ID
  async findOne(id: string | number | bigint): Promise<Admin> {
    const admin = await this.prisma.admin.findUnique({
      where: { id: BigInt(id) },
    });
    if (!admin) {
      throw new NotFoundException(`Không tìm thấy quản trị viên có ID: ${id}`);
    }
    return admin;
  }

  // Tìm Admin theo Username (dùng cho Login)
  async findByUsername(username: string): Promise<Admin | null> {
    return this.prisma.admin.findUnique({
      where: { username },
    });
  }

  // Tạo tài khoản Admin mới
  async create(data: CreateAdminDto): Promise<Admin> {
    const existingUsername = await this.findByUsername(data.username);
    if (existingUsername) {
      throw new ConflictException('Tên đăng nhập admin này đã tồn tại.');
    }

    const existingEmail = await this.prisma.admin.findUnique({
      where: { email: data.email },
    });
    if (existingEmail) {
      throw new ConflictException('Email admin này đã tồn tại.');
    }

    return this.prisma.admin.create({
      data: {
        ...data,
        password: await bcrypt.hash(data.password, 10), // Luôn lưu mật khẩu đã băm
        role: data.role ?? 'MODERATOR',
        isActive: data.isActive ?? true,
      },
    });
  }

  // Cập nhật tài khoản Admin
  async update(id: string | number | bigint, data: UpdateAdminDto): Promise<Admin> {
    await this.findOne(id); // Check existence

    if (data.username) {
      const existing = await this.prisma.admin.findFirst({
        where: {
          username: data.username,
          NOT: { id: BigInt(id) },
        },
      });
      if (existing) {
        throw new ConflictException('Tên đăng nhập này đã được sử dụng.');
      }
    }

    if (data.email) {
      const existingEmail = await this.prisma.admin.findFirst({
        where: {
          email: data.email,
          NOT: { id: BigInt(id) },
        },
      });
      if (existingEmail) {
        throw new ConflictException('Email này đã được sử dụng.');
      }
    }

    return this.prisma.admin.update({
      where: { id: BigInt(id) },
      data: {
        ...data,
        ...(data.password ? { password: await bcrypt.hash(data.password, 10) } : {}),
      },
    });
  }

  // Xóa tài khoản Admin
  async remove(id: string | number | bigint): Promise<{ message: string }> {
    await this.findOne(id);
    await this.prisma.admin.delete({
      where: { id: BigInt(id) },
    });
    return { message: `Đã xóa thành công quản trị viên có ID: ${id}` };
  }
}
