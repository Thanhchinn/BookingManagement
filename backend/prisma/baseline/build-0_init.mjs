// Dựng lại prisma/migrations/0_init/migration.sql sau khi sửa schema.prisma (khi DB thật CHƯA áp baseline).
//   = SQL Prisma sinh từ schema.prisma
//   + phần Prisma không biểu diễn được: ràng buộc chống trùng giờ (EXCLUDE) và các khối CHECK
//     lấy từ các script baseline (đoạn giữa "-- >>> CHECKS" và "-- <<< CHECKS").
// Chạy trong thư mục backend:  node prisma/baseline/build-0_init.mjs
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const prismaDir = path.resolve('prisma');
const generated = execSync('npx prisma migrate diff --from-empty --to-schema prisma/schema.prisma --script', {
  encoding: 'utf8',
  stdio: ['ignore', 'pipe', 'ignore'],
}).trimEnd();

const exclusion = `-- ============================================================================
-- Phần Prisma không biểu diễn được trong schema.prisma (thêm thủ công).
-- Prisma bỏ qua ràng buộc EXCLUDE/CHECK khi so sánh schema (đã kiểm tra: \`migrate dev\` không sinh lệnh DROP).
-- Nếu sau này một migration mới có lệnh DROP "bookings_no_overlap" hoặc DROP CHECK, hãy xóa lệnh đó trước khi áp dụng.
-- ============================================================================

-- Chống đặt trùng giờ: 2 đơn PENDING/CONFIRMED trên cùng một sân không được giao nhau về thời gian
CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE "bookings" ADD CONSTRAINT "bookings_no_overlap"
  EXCLUDE USING gist (
    "sports_pitch_id" WITH =,
    tsrange("booking_date" + "start_time", "booking_date" + "end_time", '[)') WITH &&
  )
  WHERE ("status" IN ('PENDING', 'CONFIRMED'));`;

const baselineDir = path.join(prismaDir, 'baseline');
const blocks = [];
for (const f of fs.readdirSync(baselineDir).filter((f) => f.endsWith('.sql')).sort()) {
  const text = fs.readFileSync(path.join(baselineDir, f), 'utf8');
  for (const m of text.matchAll(/-- >>> CHECKS[^\n]*\n([\s\S]*?)-- <<< CHECKS/g)) {
    blocks.push(`-- CHECK từ ${f}\n${m[1].trim()}`);
  }
}

const out = `${generated}\n\n${exclusion}\n\n${blocks.join('\n\n')}\n`;
fs.writeFileSync(path.join(prismaDir, 'migrations', '0_init', 'migration.sql'), out, 'utf8');
console.log(`0_init rebuilt with ${blocks.length} CHECK blocks`);
