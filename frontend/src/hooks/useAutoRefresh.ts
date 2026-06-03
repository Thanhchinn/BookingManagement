import { useEffect, useRef } from 'react';

/**
 * Hook tự động gọi lại hàm `fetchFn` mỗi `intervalMs` milliseconds.
 * Dừng lại khi component unmount.
 * @param fetchFn - Hàm async để fetch dữ liệu
 * @param intervalMs - Khoảng thời gian giữa các lần tự động refresh (mặc định 15 giây)
 * @param enabled - Có bật tính năng auto-refresh không (mặc định true)
 */
export function useAutoRefresh(
  fetchFn: () => Promise<void>,
  intervalMs = 10000,
  enabled = true,
) {
  const savedFetch = useRef(fetchFn);

  // Luôn giữ ref trỏ đến hàm fetch mới nhất
  useEffect(() => {
    savedFetch.current = fetchFn;
  }, [fetchFn]);

  useEffect(() => {
    if (!enabled) return;

    const tick = () => {
      savedFetch.current().catch(() => {
        // Bỏ qua lỗi kết nối trong auto-refresh để tránh làm rối giao diện
      });
    };

    const id = setInterval(tick, intervalMs);
    return () => clearInterval(id);
  }, [intervalMs, enabled]);
}
