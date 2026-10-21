import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

import { Request } from 'express';
import { AuthUser, getJwtSecret, isAdminRole, USER_ROLE } from '../auth.constants';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (request: Request) => {
          return request?.cookies?.user_token || request?.cookies?.admin_token || null;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: getJwtSecret(),
    });
  }

  async validate(payload: any): Promise<AuthUser> {
    // Tài khoản Khách hàng / Đối tác (bảng users)
    if (payload.role === USER_ROLE) {
      const user = await this.prisma.user.findUnique({
        where: { id: BigInt(payload.sub) },
        select: { isActive: true, deletedAt: true },
      });
      if (!user || user.deletedAt) {
        throw new UnauthorizedException('Tài khoản không tồn tại trên hệ thống');
      }
      if (!user.isActive) {
        throw new UnauthorizedException('Tài khoản của bạn đã bị khóa bởi quản trị viên');
      }
      return { userId: payload.sub, role: USER_ROLE };
    }

    // Tài khoản Quản trị viên (bảng admins)
    if (isAdminRole(payload.role)) {
      const admin = await this.prisma.admin.findUnique({
        where: { id: BigInt(payload.sub) },
        select: { isActive: true, role: true, username: true },
      });
      if (!admin) {
        throw new UnauthorizedException('Tài khoản quản trị không tồn tại');
      }
      if (!admin.isActive) {
        throw new UnauthorizedException('Tài khoản quản trị viên đã bị vô hiệu hóa');
      }
      // Dùng role hiện tại trong DB thay vì role trong token (phòng trường hợp đã bị hạ quyền)
      return { userId: payload.sub, username: admin.username, role: admin.role };
    }

    throw new UnauthorizedException('Token không hợp lệ');
  }
}
