-- Xóa lịch sử migration cũ (không còn khớp với DB thật) để đánh dấu baseline 0_init.
-- Chỉ xóa bảng theo dõi migration của Prisma, KHÔNG đụng tới dữ liệu nghiệp vụ.
DO $$
BEGIN
  IF to_regclass('public._prisma_migrations') IS NOT NULL THEN
    DELETE FROM "_prisma_migrations";
  END IF;
END $$;
