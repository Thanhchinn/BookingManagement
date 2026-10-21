# Nâng cấp database cũ lên baseline `0_init`

Làm **một lần duy nhất** cho mỗi database đã có dữ liệu từ trước (tạo bằng `prisma db push` hoặc chuỗi migration cũ).
Database mới tinh thì **không cần** làm, chỉ chạy `npx prisma migrate deploy`.

## Vì sao cần làm

Chuỗi migration cũ (nay nằm trong `prisma/migrations_archive/`) không khớp với database thật: migration tạo bảng `services`, còn schema và database dùng `sports_pitches`; thiếu `product_categories`, `admin_partner_messages`; thừa `partner_payouts`. Nếu chạy `prisma migrate dev` trên database như vậy, Prisma sẽ phát hiện lệch và **đề nghị xóa toàn bộ dữ liệu**.

Baseline thay chuỗi cũ bằng một migration gốc `0_init` phản ánh đúng `schema.prisma`, sau đó đánh dấu nó là đã áp dụng trên database hiện có.

## Các bước

Chạy trong thư mục `backend`, với `DATABASE_URL` trong `.env` trỏ tới database cần nâng cấp.

```bash
# 0. Backup (bắt buộc)
pg_dump -Fc "<DATABASE_URL>" -f backup_truoc_baseline.dump

# 1. Nâng cấp cấu trúc (chạy đúng thứ tự)
npx prisma db execute --file prisma/baseline/01_harden_otp_verifications.sql   # OTP an toàn
npx prisma db execute --file prisma/baseline/02_harden_booking_flow.sql        # chống đặt trùng giờ, enum trạng thái
npx prisma db execute --file prisma/baseline/03_r1_data_safety.sql             # chống mất dữ liệu, index, CHECK
npx prisma db execute --file prisma/baseline/04_r2_money_and_history.sql       # tách tiền, lịch sử đơn, lượt dùng mã
npx prisma db execute --file prisma/baseline/05_r3_reference_data.sql          # enum, mã tỉnh/xã, sở thích thể thao
npx prisma db execute --file prisma/baseline/06_r4_ledger_chat_tz.sql          # TIMESTAMPTZ, gộp chat, sổ cái hoa hồng

# 2. KIỂM TRA (chỉ đọc): phải in ra "No difference detected."
npx prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma
```

**Nếu bước 2 in ra bất kỳ khác biệt nào: DỪNG LẠI**, không chạy tiếp. Database của bạn khác với giả định; hãy lưu kết quả và xử lý trước.

```bash
# 3. Xóa lịch sử migration cũ (chỉ bảng _prisma_migrations, không đụng dữ liệu nghiệp vụ)
npx prisma db execute --file prisma/baseline/09_reset_migration_history.sql

# 4. Đánh dấu baseline đã áp dụng
npx prisma migrate resolve --applied 0_init

# 5. Xác nhận: phải in ra "Database schema is up to date!"
npx prisma migrate status

# 6. Thêm dữ liệu mẫu còn thiếu (mã khuyến mãi SPORT20, DONGGIA50K). Seeder bỏ qua bản ghi đã tồn tại.
npx prisma db seed
```

## Lưu ý về dữ liệu

- `01_harden_otp_verifications.sql` xóa các mã OTP đang chờ (mã cũ lưu dạng chữ thường, không dùng được nữa). Người đang đăng ký dở chỉ cần bấm gửi lại mã.
- `02_harden_booking_flow.sql`:
  - Chuẩn hóa trạng thái đơn/thanh toán về chữ in hoa; giá trị không hợp lệ được đưa về mặc định (`PENDING` / `UNPAID`).
  - Nếu có các đơn **đặt trùng giờ** trên cùng sân (do lỗi trước đây), giữ đơn tạo trước và **tự động hủy** đơn tạo sau, với lý do "Hệ thống tự động hủy do trùng giờ với đơn đặt trước đó.". Có thể tra cứu bằng:
    ```sql
    SELECT booking_code, booking_date, start_time, end_time FROM bookings
    WHERE cancellation_reason = 'Hệ thống tự động hủy do trùng giờ với đơn đặt trước đó.';
    ```
  - Xóa bản ghi trùng trong `user_promotions` (mỗi người chỉ dùng một mã một lần).

- `03_r1_data_safety.sql` (chạy trong 1 transaction, lỗi thì không thay đổi gì):
  - Đổi các quan hệ của dữ liệu tài chính/lịch sử từ `ON DELETE CASCADE` sang `RESTRICT`. Ứng dụng giờ **xóa mềm** (`deleted_at`) sân, cơ sở, sản phẩm, người dùng; "xóa" đơn đã hủy chỉ là ẩn (`archived_at`).
  - Thêm cột `product_name` vào `booking_details` và điền từ bảng `products`.
  - Xóa cột không dùng `users.remember_token`, `otp_verifications.user_id`.
  - Thêm ~20 ràng buộc `CHECK` (rating 1–5, số lượng > 0, giá ≥ 0, giờ kết thúc > giờ bắt đầu…). Nếu dữ liệu cũ vi phạm, script **không dừng** mà in `WARNING` và ràng buộc vẫn chặn dữ liệu mới. Kiểm tra ràng buộc nào chưa xác thực được:
    ```sql
    SELECT conrelid::regclass AS bang, conname FROM pg_constraint WHERE NOT convalidated;
    ```
    Sửa dữ liệu sai rồi chạy `ALTER TABLE "<bang>" VALIDATE CONSTRAINT "<conname>";`

- `04_r2_money_and_history.sql`:
  - Thêm `service_amount`, `vat_amount`, `paid_amount` vào `bookings` và tính ngược từ dữ liệu cũ.
  - `payments.payment_method/payment_type` chuyển sang enum (giá trị lạ: phương thức -> NULL, loại -> FULL).
  - `user_promotions` được chuyển sang `promotion_redemptions` (gắn với đơn) rồi **xóa bảng cũ**; `promotions.used_count` được **tính lại** theo số lượt đang áp dụng.
  - Mỗi đơn cũ có 1 dòng lịch sử khởi đầu trong `booking_status_history`.
- `05_r3_reference_data.sql`:
  - 12 cột trạng thái/phân loại chuyển sang enum; giá trị lạ về mặc định (VD giới tính "Nam" -> MALE, skill "ALL" -> ANY).
  - Khớp `city`/`ward` dạng chữ sang `province_code`/`ward_code` theo tên. Chỉ khớp được khi bảng `location_provinces`/`location_wards` đã có dữ liệu; không khớp thì để NULL (cột chữ cũ vẫn giữ để hiển thị).
  - `favorite_sports`/`skill_levels` (JSON) chuyển sang bảng `user_sport_preferences` rồi **xóa 2 cột JSON**; tên bộ môn không tồn tại bị bỏ qua.
  - Danh mục sản phẩm trùng tên trong cùng đối tác được đổi tên thành `"<tên> #<id>"`.
- `06_r4_ledger_chat_tz.sql`:
  - Mọi cột thời điểm chuyển sang `TIMESTAMPTZ`, ép theo UTC (giá trị không đổi, kể cả khi server đặt múi giờ VN).
  - Tin nhắn `admin_partner_messages` chuyển vào phòng chat loại SUPPORT rồi **xóa bảng cũ**.
  - Tạo sổ cái hoa hồng từ các đơn đã hoàn thành; `partner_profiles.balance` được **tính lại** từ sổ cái.

## Khôi phục nếu có sự cố

```bash
pg_restore --clean --if-exists -d "<DATABASE_URL>" backup_truoc_baseline.dump
```

## Đã được kiểm thử

Quy trình trên (gồm các bước 01–06) đã được chạy bằng Prisma CLI trên một database PostgreSQL giả lập (tạo từ `schema.prisma` trước khi nâng cấp, có sẵn lịch sử migration cũ và dữ liệu):
`migrate diff` báo không khác biệt, `migrate status` báo up to date, `migrate dev` sau đó sinh migration rỗng (không xóa ràng buộc chống trùng giờ), và cấu trúc database giống hệt database mới tạo bằng `migrate deploy`; dữ liệu được giữ nguyên.

## Khi sửa `schema.prisma` trước khi áp baseline

Chừng nào DB thật chưa chạy xong các bước trên, **đừng tạo migration mới** bằng `migrate dev`. Thay vào đó:

1. Sửa `schema.prisma`.
2. Viết script nâng cấp tiếp theo trong thư mục này (`07_...sql`, trong 1 transaction, chuyển dữ liệu an toàn). Nếu có ràng buộc CHECK, đặt chúng giữa `-- >>> CHECKS` và `-- <<< CHECKS`.
3. Dựng lại `0_init`: `node prisma/baseline/build-0_init.mjs`

Sau khi baseline đã áp dụng, quay lại quy trình bình thường: `npx prisma migrate dev --name <ten>`.
