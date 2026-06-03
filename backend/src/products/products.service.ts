import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
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
  constructor(private readonly prisma: PrismaService) {}

  // Kiểm tra xem Location có thuộc về User (đối tác) không
  private async checkLocationOwnership(locationId: string | number | bigint, userId: string | number | bigint) {
    const partner = await this.prisma.partnerProfile.findUnique({
      where: { userId: BigInt(userId) },
    });
    if (!partner) {
      throw new NotFoundException('Không tìm thấy thông tin đối tác của tài khoản này.');
    }

    const location = await this.prisma.location.findFirst({
      where: {
        id: BigInt(locationId),
        partnerId: partner.id,
      },
    });

    if (!location) {
      throw new ForbiddenException('Bạn không có quyền quản lý sản phẩm của cơ sở này.');
    }
    return location;
  }

  // Lấy danh sách sản phẩm theo locationId
  async findByLocation(locationId: string, userId: string | number | bigint) {
    await this.checkLocationOwnership(locationId, userId);
    
    const products = await this.prisma.product.findMany({
      where: { locationId: BigInt(locationId) },
      orderBy: { createdAt: 'desc' },
    });
    
    return products.map(serializeProduct);
  }

  // Lấy chi tiết 1 sản phẩm
  async findOne(id: string, userId: string | number | bigint) {
    const product = await this.prisma.product.findUnique({
      where: { id: BigInt(id) },
    });
    if (!product) {
      throw new NotFoundException(`Không tìm thấy sản phẩm có ID: ${id}`);
    }

    await this.checkLocationOwnership(product.locationId, userId);
    return serializeProduct(product);
  }

  // Tạo mới sản phẩm
  async create(dto: CreateProductDto, userId: string | number | bigint) {
    await this.checkLocationOwnership(dto.locationId, userId);

    const product = await this.prisma.product.create({
      data: {
        locationId: BigInt(dto.locationId),
        name: dto.name,
        category: dto.category || 'DRINK',
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
    if (!product) {
      throw new NotFoundException(`Không tìm thấy sản phẩm có ID: ${id}`);
    }

    await this.checkLocationOwnership(product.locationId, userId);

    const updated = await this.prisma.product.update({
      where: { id: BigInt(id) },
      data: {
        name: dto.name,
        category: dto.category,
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
    if (!product) {
      throw new NotFoundException(`Không tìm thấy sản phẩm có ID: ${id}`);
    }

    await this.checkLocationOwnership(product.locationId, userId);

    await this.prisma.product.delete({
      where: { id: BigInt(id) },
    });

    return { message: 'Đã xóa sản phẩm thành công.' };
  }
}
