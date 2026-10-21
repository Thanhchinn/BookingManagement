import { BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

// Kiểm tra mã tỉnh/xã (địa giới 2 cấp) hợp lệ và xã thuộc đúng tỉnh.
// Trả về { provinceCode, wardCode } đã chuẩn hóa để ghi vào DB; undefined = không thay đổi.
export async function resolveAddressCodes(
  prisma: PrismaService,
  provinceCode?: string | null,
  wardCode?: string | null,
): Promise<{ provinceCode?: string | null; wardCode?: string | null }> {
  if (provinceCode === undefined && wardCode === undefined) return {};

  const province = provinceCode || null;
  const ward = wardCode || null;
  if (ward && !province) {
    throw new BadRequestException('Vui lòng chọn tỉnh/thành trước khi chọn phường/xã.');
  }
  if (province) {
    const exists = await prisma.locationProvince.findUnique({ where: { provinceCode: province }, select: { id: true } });
    if (!exists) throw new BadRequestException('Mã tỉnh/thành không hợp lệ.');
  }
  if (ward) {
    const w = await prisma.locationWard.findUnique({ where: { wardCode: ward }, select: { provinceCode: true } });
    if (!w || w.provinceCode !== province) {
      throw new BadRequestException('Phường/xã không thuộc tỉnh/thành đã chọn.');
    }
  }
  return { provinceCode: province, wardCode: ward };
}
