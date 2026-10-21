import { Injectable, NotFoundException, ConflictException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Gender, Prisma, SkillLevel, User } from '@prisma/client';
import { resolveAddressCodes } from '../common/utils/address.util';
import { randomBytes } from 'crypto';
import { countUpcomingBookings } from '../bookings/booking-rules';

// Người dùng đã xóa mềm không xuất hiện ở bất kỳ danh sách nào
const NOT_DELETED = { deletedAt: null };
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  // Lấy tất cả danh sách người dùng
  async findAll(): Promise<User[]> {
    return this.prisma.user.findMany({
      where: NOT_DELETED,
      orderBy: { createdAt: 'desc' },
    });
  }

  // Phân trang và tìm kiếm khách hàng
  async findPaginated(options: { page: number; limit: number; search?: string }) {
    const page = Math.max(1, options.page);
    const limit = Math.max(1, options.limit);
    const skip = (page - 1) * limit;

    const where: any = { ...NOT_DELETED };
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
      this.prisma.user.count({ where: NOT_DELETED }),
      this.prisma.user.count({ where: { ...NOT_DELETED, isActive: true } }),
      this.prisma.user.count({ where: { ...NOT_DELETED, isActive: false } }),
      this.prisma.user.aggregate({
        where: NOT_DELETED,
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
    if (!user || user.deletedAt) {
      throw new NotFoundException(`Không tìm thấy người dùng có ID: ${id}`);
    }
    return this.withSportPreferences(user);
  }

  // Trả về sở thích thể thao theo định dạng cũ của API: favoriteSports = [tên bộ môn], skillLevels = { tên: trình độ }
  private async withSportPreferences<T extends { id: bigint }>(user: T) {
    const prefs = await this.prisma.userSportPreference.findMany({
      where: { userId: user.id },
      include: { category: { select: { name: true } } },
      orderBy: { createdAt: 'asc' },
    });
    return {
      ...user,
      favoriteSports: prefs.map((p) => p.category.name),
      skillLevels: Object.fromEntries(prefs.filter((p) => p.skillLevel).map((p) => [p.category.name, p.skillLevel])),
    };
  }

  // Ghi lại toàn bộ sở thích thể thao từ dữ liệu API (tên hoặc slug bộ môn)
  private async replaceSportPreferences(tx: Prisma.TransactionClient, userId: bigint, favoriteSports: unknown, skillLevels: unknown) {
    const favorites = Array.isArray(favoriteSports) ? favoriteSports.map(String) : [];
    const levels: Record<string, unknown> =
      skillLevels && typeof skillLevels === 'object' && !Array.isArray(skillLevels) ? (skillLevels as Record<string, unknown>) : {};
    const keys = [...new Set([...favorites, ...Object.keys(levels)].map((k) => k.trim()).filter(Boolean))];

    const categories = keys.length
      ? await tx.category.findMany({
          where: {
            OR: keys.flatMap((k) => [
              { name: { equals: k, mode: 'insensitive' as const } },
              { slug: { equals: k, mode: 'insensitive' as const } },
            ]),
          },
          select: { id: true, name: true, slug: true },
        })
      : [];
    const rows = new Map<bigint, SkillLevel | null>();
    for (const key of keys) {
      const cat = categories.find((c) => c.name.toLowerCase() === key.toLowerCase() || c.slug.toLowerCase() === key.toLowerCase());
      if (!cat) continue;
      const level = String(levels[key] ?? '').toUpperCase();
      rows.set(cat.id, (Object.values(SkillLevel) as string[]).includes(level) ? (level as SkillLevel) : (rows.get(cat.id) ?? null));
    }

    await tx.userSportPreference.deleteMany({ where: { userId } });
    if (rows.size) {
      await tx.userSportPreference.createMany({
        data: [...rows.entries()].map(([categoryId, skillLevel]) => ({ userId, categoryId, skillLevel })),
      });
    }
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
  async update(
    id: string | number | bigint,
    dto: UpdateUserDto,
    options: { skipCurrentPasswordCheck?: boolean } = {},
  ): Promise<User> {
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
    const { favoriteSports, skillLevels, provinceCode, wardCode, ...rest } = dto;
    const updateData: any = { ...rest, ...(await resolveAddressCodes(this.prisma, provinceCode, wardCode)) };
    if (dto.gender !== undefined) {
      updateData.gender = dto.gender ? (dto.gender as Gender) : null;
    }
    if (dto.birthDate !== undefined) {
      updateData.birthDate = dto.birthDate ? new Date(dto.birthDate) : null;
    }
    delete updateData.currentPassword;
    if (dto.password) {
      // Admin đặt lại mật khẩu không cần mật khẩu cũ; người dùng tự đổi thì bắt buộc
      if (!options.skipCurrentPasswordCheck) {
        if (!dto.currentPassword) {
          throw new BadRequestException('Vui lòng nhập mật khẩu hiện tại.');
        }
        const user = await this.prisma.user.findUnique({
          where: { id: BigInt(id) },
          select: { password: true },
        });
        if (!user) {
          throw new NotFoundException('Không tìm thấy người dùng.');
        }
        const isMatch = await bcrypt.compare(dto.currentPassword, user.password);
        if (!isMatch) {
          throw new ForbiddenException('Mật khẩu hiện tại không chính xác.');
        }
      }
      updateData.password = await bcrypt.hash(dto.password, 10);
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      if (favoriteSports !== undefined || skillLevels !== undefined) {
        await this.replaceSportPreferences(tx, BigInt(id), favoriteSports, skillLevels);
      }
      return tx.user.update({
        where: { id: BigInt(id) },
        data: updateData,
      });
    });
    return this.withSportPreferences(updated);
  }

  // Xóa người dùng: xóa mềm + ẩn danh hóa thông tin cá nhân.
  // Không xóa cứng để giữ lịch sử đặt sân/thanh toán của đối tác và hệ thống.
  async remove(id: string | number | bigint): Promise<{ message: string }> {
    await this.findOne(id);
    const userId = BigInt(id);

    // Còn đơn sắp diễn ra thì phải hủy trước, tránh giữ chỗ "ma" trên lịch sân
    const upcoming = await countUpcomingBookings(this.prisma, { userId });
    if (upcoming > 0) {
      throw new ConflictException(`Người dùng còn ${upcoming} đơn đặt sân sắp diễn ra. Vui lòng hủy các đơn này trước khi xóa.`);
    }

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userId },
        data: {
          fullName: 'Người dùng đã xóa',
          email: `deleted-${userId}-${randomBytes(4).toString('hex')}@deleted.invalid`, // Giải phóng email gốc
          phone: null,
          password: await bcrypt.hash(randomBytes(32).toString('hex'), 10), // Không thể đăng nhập
          avatarUrl: null,
          address: null,
          ward: null,
          district: null,
          city: null,
          latitude: null,
          longitude: null,
          birthDate: null,
          gender: null,
          bio: null,
          provinceCode: null,
          wardCode: null,
          preferredPlayTime: Prisma.DbNull,
          isActive: false,
          deletedAt: new Date(),
        },
      }),
      this.prisma.userSportPreference.deleteMany({ where: { userId } }),
      // Nếu là chủ sân: khóa hồ sơ đối tác (cơ sở/sân không còn nhận đặt)
      this.prisma.partnerProfile.updateMany({
        where: { userId },
        data: { status: 'SUSPENDED' },
      }),
    ]);
    return { message: `Đã xóa thành công người dùng có ID: ${id}` };
  }
}
