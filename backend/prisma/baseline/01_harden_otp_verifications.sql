-- Lưu OTP dạng hash SHA-256 (64 ký tự hex) và đếm số lần nhập sai
ALTER TABLE "otp_verifications" ALTER COLUMN "otp_code" TYPE VARCHAR(64);
ALTER TABLE "otp_verifications" ADD COLUMN "attempts" INTEGER NOT NULL DEFAULT 0;

-- Các mã OTP cũ đang lưu dạng plain text, không còn khớp với cách kiểm tra mới
DELETE FROM "otp_verifications";
