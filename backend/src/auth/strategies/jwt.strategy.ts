import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

import { Request } from 'express';

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
      secretOrKey: process.env.JWT_SECRET || 'fallbackSuperSecretKey123',
    });
  }

  async validate(payload: any) {
    // Nếu là tài khoản Khách hàng (User)
    if (payload.role === 'USER') {
      const user = await this.prisma.user.findUnique({
        where: { id: BigInt(payload.sub) }
      });
      if (!user) {
        throw new UnauthorizedException('Tài khoản không tồn tại trên hệ thống');
      }
      if (!user.isActive) {
        throw new UnauthorizedException('Tài khoản của bạn đã bị khóa bởi quản trị viên');
      }
    }
    
    // Nếu là tài khoản Quản trị viên (Admin)
    if (payload.role === 'ADMIN' || payload.role === 'SUPERADMIN' || payload.role === 'MODERATOR') {
      const admin = await this.prisma.admin.findUnique({
        where: { id: BigInt(payload.sub) }
      });
      if (!admin) {
        throw new UnauthorizedException('Tài khoản quản trị không tồn tại');
      }
      if (!admin.isActive) {
        throw new UnauthorizedException('Tài khoản quản trị viên đã bị vô hiệu hóa');
      }
    }

    return { userId: payload.sub, username: payload.username, role: payload.role };
  }
}
