import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PartnersService } from '../partners/partners.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

export function serializeProduct(product: any) {
  if (!product) return null;
  return {
    ...product,
    id: product.id.toString(),
    locationId: product.locationId.toString(),
    price: Number(product.price),
  };
}

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly partnersService: PartnersService,
  ) {}

  // Kiểm tra xem Location có thuộc về User (đối tác) không
  private async checkLocationOwnership(locationId: string | number | bigint, userId: string | number | bigint) {
    const partner = await this.partnersService.getPartnerProfileOrThrow(userId);

    const location = await this.prisma.location.findFirst({
      where: {
        id: BigInt(locationId),
        partnerId: partner.id,
        deletedAt: null,
      },
    });

    if (!location) {
      throw new ForbiddenException('Bạn không có quyền quản lý sản phẩm của cơ sở này.');
    }
    return location;
  }

  // Tìm danh mục sản phẩm của đối tác theo tên (không phân biệt hoa thường); không có thì null
  private async resolveProductCategoryId(partnerId: bigint, name?: string | null) {
    if (!name) return null;
    const category = await this.prisma.productCategory.findFirst({
      where: { partnerId, name: { equals: name, mode: 'insensitive' } },
      select: { id: true },
    });
    return category?.id ?? null;
  }

  // Lấy danh sách sản phẩm theo locationId
  async findByLocation(locationId: string, userId: string | number | bigint) {
    await this.checkLocationOwnership(locationId, userId);
    
    const products = await this.prisma.product.findMany({
      where: { locationId: BigInt(locationId), deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
    
    return products.map(serializeProduct);
  }

  // Lấy chi tiết 1 sản phẩm
  async findOne(id: string, userId: string | number | bigint) {
    const product = await this.prisma.product.findUnique({
      where: { id: BigInt(id) },
    });
    if (!product || product.deletedAt) {
      throw new NotFoundException(`Không tìm thấy sản phẩm có ID: ${id}`);
    }

    await this.checkLocationOwnership(product.locationId, userId);
    return serializeProduct(product);
  }

  // Tạo mới sản phẩm
  async create(dto: CreateProductDto, userId: string | number | bigint) {
    const location = await this.checkLocationOwnership(dto.locationId, userId);

    const product = await this.prisma.product.create({
      data: {
        locationId: BigInt(dto.locationId),
        name: dto.name,
        category: dto.category || 'DRINK',
        productCategoryId: await this.resolveProductCategoryId(location.partnerId, dto.category),
        description: dto.description || null,
        price: dto.price,
        imageUrl: dto.imageUrl || null,
        isAvailable: dto.isAvailable ?? true,
      },
    });

    return serializeProduct(product);
  }

  // Cập nhật sản phẩm
  async update(id: string, dto: UpdateProductDto, userId: string | number | bigint) {
    const product = await this.prisma.product.findUnique({
      where: { id: BigInt(id) },
    });
    if (!product || product.deletedAt) {
      throw new NotFoundException(`Không tìm thấy sản phẩm có ID: ${id}`);
    }

    const location = await this.checkLocationOwnership(product.locationId, userId);

    const updated = await this.prisma.product.update({
      where: { id: BigInt(id) },
      data: {
        name: dto.name,
        category: dto.category,
        ...(dto.category !== undefined
          ? { productCategoryId: await this.resolveProductCategoryId(location.partnerId, dto.category) }
          : {}),
        description: dto.description,
        price: dto.price,
        imageUrl: dto.imageUrl,
        isAvailable: dto.isAvailable,
      },
    });

    return serializeProduct(updated);
  }

  // Xóa sản phẩm
  async remove(id: string, userId: string | number | bigint) {
    const product = await this.prisma.product.findUnique({
      where: { id: BigInt(id) },
    });
    if (!product || product.deletedAt) {
      throw new NotFoundException(`Không tìm thấy sản phẩm có ID: ${id}`);
    }

    await this.checkLocationOwnership(product.locationId, userId);

    // Xóa mềm: hóa đơn cũ vẫn tham chiếu được sản phẩm
    await this.prisma.product.update({
      where: { id: BigInt(id) },
      data: { deletedAt: new Date(), isAvailable: false },
    });

    return { message: 'Đã xóa sản phẩm thành công.' };
  }
}
