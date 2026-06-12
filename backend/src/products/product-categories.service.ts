import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PartnersService } from '../partners/partners.service';

export function serializeProductCategory(cat: any) {
  if (!cat) return null;
  return {
    id: cat.id.toString(),
    partnerId: cat.partnerId.toString(),
    name: cat.name,
    icon: cat.icon,
    createdAt: cat.createdAt,
    updatedAt: cat.updatedAt,
  };
}

const DEFAULT_CATEGORIES = [
  { name: 'Nước uống / Giải khát', icon: '💧' },
  { name: 'Đồ ăn nhẹ',             icon: '🍿' },
  { name: 'Thiết bị / Dụng cụ',    icon: '🏸' },
  { name: 'Cho thuê dụng cụ',      icon: '👕' },
  { name: 'Dịch vụ khác',          icon: '📦' },
];

@Injectable()
export class ProductCategoriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly partnersService: PartnersService,
  ) {}

  // Lấy hoặc khởi tạo danh mục cho đối tác
  async findAll(userId: string | number | bigint) {
    const partner = await this.partnersService.getPartnerProfileOrThrow(userId);

    let categories = await this.prisma.productCategory.findMany({
      where: { partnerId: partner.id },
      orderBy: { id: 'asc' },
    });

    // Nếu chưa có danh mục nào, tự động seed danh mục mặc định
    if (categories.length === 0) {
      await this.prisma.productCategory.createMany({
        data: DEFAULT_CATEGORIES.map(c => ({
          partnerId: partner.id,
          name: c.name,
          icon: c.icon,
        })),
      });

      categories = await this.prisma.productCategory.findMany({
        where: { partnerId: partner.id },
        orderBy: { id: 'asc' },
      });
    }

    return categories.map(serializeProductCategory);
  }

  // Tạo danh mục mới
  async create(name: string, icon: string, userId: string | number | bigint) {
    const partner = await this.partnersService.getPartnerProfileOrThrow(userId);

    const category = await this.prisma.productCategory.create({
      data: {
        partnerId: partner.id,
        name,
        icon: icon || '📦',
      },
    });

    return serializeProductCategory(category);
  }

  // Cập nhật danh mục
  async update(id: string, name: string, icon: string, userId: string | number | bigint) {
    const partner = await this.partnersService.getPartnerProfileOrThrow(userId);

    const category = await this.prisma.productCategory.findUnique({
      where: { id: BigInt(id) },
    });

    if (!category) {
      throw new NotFoundException(`Không tìm thấy danh mục sản phẩm có ID: ${id}`);
    }

    if (category.partnerId !== partner.id) {
      throw new ForbiddenException('Bạn không có quyền chỉnh sửa danh mục này.');
    }

    const updated = await this.prisma.productCategory.update({
      where: { id: BigInt(id) },
      data: {
        name,
        icon: icon || '📦',
      },
    });

    return serializeProductCategory(updated);
  }

  // Xóa danh mục
  async remove(id: string, userId: string | number | bigint) {
    const partner = await this.partnersService.getPartnerProfileOrThrow(userId);

    const category = await this.prisma.productCategory.findUnique({
      where: { id: BigInt(id) },
    });

    if (!category) {
      throw new NotFoundException(`Không tìm thấy danh mục sản phẩm có ID: ${id}`);
    }

    if (category.partnerId !== partner.id) {
      throw new ForbiddenException('Bạn không có quyền xóa danh mục này.');
    }

    await this.prisma.productCategory.delete({
      where: { id: BigInt(id) },
    });

    return { message: 'Đã xóa danh mục sản phẩm thành công.' };
  }
}
