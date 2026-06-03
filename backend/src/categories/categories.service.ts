import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from '@prisma/client';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  // Lấy tất cả bộ môn, sắp xếp theo sortOrder tăng dần và ngày tạo giảm dần
  async findAll(): Promise<Category[]> {
    return this.prisma.category.findMany({
      orderBy: [
        { sortOrder: 'asc' },
        { id: 'desc' }
      ]
    });
  }

  // Lấy danh sách phân trang và tìm kiếm bộ môn
  async findPaginated(options: { page: number; limit: number; search?: string }) {
    const page = Math.max(1, options.page);
    const limit = Math.max(1, options.limit);
    const skip = (page - 1) * limit;

    const where: any = {};
    if (options.search) {
      where.OR = [
        { name: { contains: options.search, mode: 'insensitive' } },
        { slug: { contains: options.search, mode: 'insensitive' } }
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.category.findMany({
        where,
        orderBy: [
          { sortOrder: 'asc' },
          { id: 'desc' }
        ],
        skip,
        take: limit,
      }),
      this.prisma.category.count({ where }),
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

  // Tìm chi tiết bộ môn theo ID
  async findOne(id: string | number | bigint): Promise<Category> {
    const category = await this.prisma.category.findUnique({
      where: { id: BigInt(id) },
    });
    if (!category) {
      throw new NotFoundException(`Không tìm thấy bộ môn thể thao có ID: ${id}`);
    }
    return category;
  }

  // Tạo bộ môn mới
  async create(dto: CreateCategoryDto): Promise<Category> {
    // 1. Kiểm tra xem tên bộ môn đã tồn tại chưa
    const existingName = await this.prisma.category.findUnique({
      where: { name: dto.name },
    });
    if (existingName) {
      throw new ConflictException(`Tên bộ môn "${dto.name}" đã tồn tại trên hệ thống.`);
    }

    // 2. Kiểm tra xem slug đã tồn tại chưa
    const existingSlug = await this.prisma.category.findUnique({
      where: { slug: dto.slug },
    });
    if (existingSlug) {
      throw new ConflictException(`Đường dẫn slug "${dto.slug}" đã tồn tại trên hệ thống.`);
    }

    // 3. Tiến hành tạo mới
    return this.prisma.category.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        icon: dto.icon ?? 'fa-medal',
        colorBg: dto.colorBg ?? 'bg-emerald-100',
        colorText: dto.colorText ?? 'text-emerald-600',
        isActive: dto.isActive ?? true,
        sortOrder: dto.sortOrder ?? 0,
      },
    });
  }

  // Cập nhật thông tin bộ môn
  async update(id: string | number | bigint, dto: UpdateCategoryDto): Promise<Category> {
    // 1. Đảm bảo ID bộ môn có tồn tại
    await this.findOne(id);

    // 2. Kiểm tra trùng lặp tên nếu đổi tên
    if (dto.name) {
      const existingName = await this.prisma.category.findFirst({
        where: {
          name: dto.name,
          NOT: { id: BigInt(id) },
        },
      });
      if (existingName) {
        throw new ConflictException(`Tên bộ môn "${dto.name}" đã được sử dụng.`);
      }
    }

    // 3. Kiểm tra trùng lặp slug nếu đổi slug
    if (dto.slug) {
      const existingSlug = await this.prisma.category.findFirst({
        where: {
          slug: dto.slug,
          NOT: { id: BigInt(id) },
        },
      });
      if (existingSlug) {
        throw new ConflictException(`Đường dẫn slug "${dto.slug}" đã được sử dụng.`);
      }
    }

    // 4. Tiến hành cập nhật
    return this.prisma.category.update({
      where: { id: BigInt(id) },
      data: dto,
    });
  }

  // Xóa bộ môn
  async remove(id: string | number | bigint): Promise<{ message: string }> {
    await this.findOne(id);
    
    // Thực hiện xóa cứng (hoặc bạn có thể đổi thành xóa mềm bằng cách update isActive = false tùy nhu cầu)
    await this.prisma.category.delete({
      where: { id: BigInt(id) },
    });

    return { message: `Đã xóa thành công bộ môn thể thao có ID: ${id}` };
  }
}
