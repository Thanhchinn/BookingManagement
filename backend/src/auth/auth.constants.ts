import { Logger } from '@nestjs/common';
import { randomBytes } from 'crypto';

// Các vai trò của tài khoản quản trị (bảng admins). Tài khoản khách hàng/đối tác luôn có role 'USER'.
export const ADMIN_ROLES = ['SUPERADMIN', 'ADMIN', 'MODERATOR'] as const;
export const USER_ROLE = 'USER';

export interface AuthUser {
  userId: string;
  username?: string;
  role: string;
}

export function isAdminRole(role?: string): boolean {
  return !!role && (ADMIN_ROLES as readonly string[]).includes(role);
}

let cachedSecret: string | undefined;

// Lấy JWT secret từ biến môi trường. Không bao giờ dùng secret cố định trong code:
// - Production: thiếu JWT_SECRET thì dừng khởi động.
// - Dev: sinh secret ngẫu nhiên cho mỗi lần chạy (token cũ sẽ mất hiệu lực khi restart).
export function getJwtSecret(): string {
  if (cachedSecret) return cachedSecret;

  const secret = process.env.JWT_SECRET;
  if (secret && secret.length >= 32) {
    cachedSecret = secret;
    return cachedSecret;
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET phải được cấu hình (tối thiểu 32 ký tự) khi chạy production.');
  }

  new Logger('Auth').warn(
    'JWT_SECRET chưa được cấu hình hoặc quá ngắn (< 32 ký tự). Đang dùng secret ngẫu nhiên tạm thời — mọi phiên đăng nhập sẽ mất khi khởi động lại.',
  );
  cachedSecret = randomBytes(48).toString('hex');
  return cachedSecret;
}
