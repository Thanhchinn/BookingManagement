import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  // Lấy tất cả danh sách người dùng
  async findAll(): Promise<User[]> {
    return this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  // Lấy chi tiết một người dùng theo ID
  async findOne(id: string | number | bigint): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id: BigInt(id) },
    });
    if (!user) {
      throw new NotFoundException(`Không tìm thấy người dùng có ID: ${id}`);
    }
    return user;
  }

  // Tìm người dùng theo Email (dùng cho Authentication)
  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  // Tạo người dùng mới
  async create(data: any): Promise<User> {
    // Kiểm tra trùng Email
    const existingUser = await this.findByEmail(data.email);
    if (existingUser) {
      throw new ConflictException('Email này đã tồn tại trên hệ thống.');
    }

    if (data.phone) {
      const existingPhone = await this.prisma.user.findUnique({
        where: { phone: data.phone },
      });
      if (existingPhone) {
        throw new ConflictException('Số điện thoại này đã tồn tại.');
      }
    }

    return this.prisma.user.create({
      data: {
        ...data,
        loyaltyPoints: data.loyaltyPoints ?? 0,
        isActive: data.isActive ?? true,
      },
    });
  }

  // Cập nhật thông tin người dùng
  async update(id: string | number | bigint, data: any): Promise<User> {
    await this.findOne(id); // Check existence

    if (data.email) {
      const existingUser = await this.prisma.user.findFirst({
        where: {
          email: data.email,
          NOT: { id: BigInt(id) },
        },
      });
      if (existingUser) {
        throw new ConflictException('Email này đã được sử dụng bởi tài khoản khác.');
      }
    }

    if (data.phone) {
      const existingPhone = await this.prisma.user.findFirst({
        where: {
          phone: data.phone,
          NOT: { id: BigInt(id) },
        },
      });
      if (existingPhone) {
        throw new ConflictException('Số điện thoại này đã được sử dụng bởi tài khoản khác.');
      }
    }

    return this.prisma.user.update({
      where: { id: BigInt(id) },
      data,
    });
  }

  // Xóa người dùng
  async remove(id: string | number | bigint): Promise<{ message: string }> {
    await this.findOne(id);
    await this.prisma.user.delete({
      where: { id: BigInt(id) },
    });
    return { message: `Đã xóa thành công người dùng có ID: ${id}` };
  }
}
