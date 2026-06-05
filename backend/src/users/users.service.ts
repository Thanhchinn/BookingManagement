import { Injectable, NotFoundException, ConflictException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  // Lấy tất cả danh sách người dùng
  async findAll(): Promise<User[]> {
    return this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  // Phân trang và tìm kiếm khách hàng
  async findPaginated(options: { page: number; limit: number; search?: string }) {
    const page = Math.max(1, options.page);
    const limit = Math.max(1, options.limit);
    const skip = (page - 1) * limit;

    const where: any = {};
    if (options.search) {
      where.OR = [
        { fullName: { contains: options.search, mode: 'insensitive' } },
        { email: { contains: options.search, mode: 'insensitive' } },
        { phone: { contains: options.search, mode: 'insensitive' } }
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  // Thống kê nhanh thông số tài khoản người dùng
  async getStats() {
    const [totalUsers, activeUsers, blockedUsers, loyaltyStats] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { isActive: true } }),
      this.prisma.user.count({ where: { isActive: false } }),
      this.prisma.user.aggregate({
        _sum: {
          loyaltyPoints: true,
        },
      }),
    ]);

    return {
      totalUsers,
      activeUsers,
      blockedUsers,
      totalLoyaltyPoints: loyaltyStats._sum.loyaltyPoints ?? 0,
    };
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

  // Tạo người dùng mới phía quản trị (Mã hóa mật khẩu bằng bcrypt)
  async create(dto: CreateUserDto): Promise<User> {
    // 1. Kiểm tra trùng Email
    const existingUser = await this.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('Email này đã tồn tại trên hệ thống.');
    }

    // 2. Kiểm tra trùng Số điện thoại
    if (dto.phone) {
      const existingPhone = await this.prisma.user.findUnique({
        where: { phone: dto.phone },
      });
      if (existingPhone) {
        throw new ConflictException('Số điện thoại này đã tồn tại trên hệ thống.');
      }
    }

    // 3. Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    return this.prisma.user.create({
      data: {
        fullName: dto.fullName,
        email: dto.email,
        password: hashedPassword,
        phone: dto.phone || null,
        avatarUrl: dto.avatarUrl || null,
        address: dto.address || null,
        ward: dto.ward || null,
        district: dto.district || null,
        city: dto.city || null,
        loyaltyPoints: dto.loyaltyPoints ?? 0,
        isActive: dto.isActive ?? true,
      },
    });
  }

  // Cập nhật thông tin người dùng (Mã hóa mật khẩu mới nếu thay đổi)
  async update(id: string | number | bigint, dto: UpdateUserDto): Promise<User> {
    await this.findOne(id); // Kiểm tra sự tồn tại

    // 1. Kiểm tra trùng Email với tài khoản khác
    if (dto.email) {
      const existingUser = await this.prisma.user.findFirst({
        where: {
          email: dto.email,
          NOT: { id: BigInt(id) },
        },
      });
      if (existingUser) {
        throw new ConflictException('Email này đã được sử dụng bởi tài khoản khác.');
      }
    }

    // 2. Kiểm tra trùng Số điện thoại với tài khoản khác
    if (dto.phone) {
      const existingPhone = await this.prisma.user.findFirst({
        where: {
          phone: dto.phone,
          NOT: { id: BigInt(id) },
        },
      });
      if (existingPhone) {
        throw new ConflictException('Số điện thoại này đã được sử dụng bởi tài khoản khác.');
      }
    }

    // 3. Chuẩn bị dữ liệu cập nhật
    const updateData: any = { ...dto };
    if (dto.birthDate !== undefined) {
      updateData.birthDate = dto.birthDate ? new Date(dto.birthDate) : null;
    }
    if (dto.password) {
      if (!dto.currentPassword) {
        throw new BadRequestException('Vui lòng nhập mật khẩu hiện tại.');
      }
      const user = await this.prisma.user.findUnique({
        where: { id: BigInt(id) },
      });
      if (!user) {
        throw new NotFoundException('Không tìm thấy người dùng.');
      }
      const isMatch = await bcrypt.compare(dto.currentPassword, user.password);
      if (!isMatch) {
        throw new ForbiddenException('Mật khẩu hiện tại không chính xác.');
      }
      updateData.password = await bcrypt.hash(dto.password, 10);
      delete updateData.currentPassword;
    }

    return this.prisma.user.update({
      where: { id: BigInt(id) },
      data: updateData,
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
