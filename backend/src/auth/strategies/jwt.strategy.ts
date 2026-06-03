import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'fallbackSuperSecretKey123',
    });
  }

  async validate(payload: any) {
    // Giá trị trả về ở đây sẽ được gắn vào request.user
    return { userId: payload.sub, username: payload.username, role: payload.role };
  }
}
