/**
 * Chuyển đổi mã slug của danh mục thể thao sang tên hiển thị Tiếng Việt tương ứng
 */
export const getCategoryLabel = (slug?: string): string => {
  if (!slug) return 'Khác';
  const val = slug.toLowerCase().trim();
  switch (val) {
    case 'cau-long':
    case 'badminton':
    case 'cầu lông':
      return 'Cầu lông';
    case 'bong-da':
    case 'football':
    case 'soccer':
    case 'bóng đá':
      return 'Bóng đá';
    case 'pickleball':
      return 'Pickleball';
    case 'tennis':
    case 'quần vợt':
      return 'Tennis';
    case 'bong-ro':
    case 'basketball':
    case 'bóng rổ':
      return 'Bóng rổ';
    case 'bong-chuyen':
    case 'volleyball':
    case 'bóng chuyền':
      return 'Bóng chuyền';
    default:
      return slug.charAt(0).toUpperCase() + slug.slice(1);
  }
};

/**
 * Chuyển đổi mã bộ môn thể thao sang tên bộ môn hiển thị dạng Title Case
 */
export const getSportTypeName = (type?: string): string => {
  if (!type) return 'Thể thao';
  const val = type.toLowerCase().trim();
  switch (val) {
    case 'cau-long':
    case 'badminton':
    case 'cầu lông':
      return 'Cầu Lông';
    case 'bong-da':
    case 'football':
    case 'soccer':
    case 'bóng đá':
      return 'Bóng Đá';
    case 'tennis':
    case 'quần vợt':
      return 'Tennis';
    case 'pickleball':
      return 'Pickleball';
    case 'bong-ro':
    case 'basketball':
    case 'bóng rổ':
      return 'Bóng Rổ';
    case 'bong-chuyen':
    case 'volleyball':
    case 'bóng chuyền':
      return 'Bóng Chuyền';
    default:
      return type.charAt(0).toUpperCase() + type.slice(1);
  }
};

/**
 * Lấy biểu tượng emoji tương ứng với slug danh mục thể thao
 */
export const getCategoryEmoji = (slug?: string): string => {
  if (!slug) return '🏆';
  const val = slug.toLowerCase().trim();
  switch (val) {
    case 'cau-long':
    case 'badminton':
    case 'cầu lông':
      return '🏸';
    case 'bong-da':
    case 'football':
    case 'soccer':
    case 'bóng đá':
      return '⚽';
    case 'tennis':
    case 'quần vợt':
      return '🎾';
    case 'pickleball':
      return '🏓';
    case 'bong-ro':
    case 'basketball':
    case 'bóng rổ':
      return '🏀';
    case 'bong-chuyen':
    case 'volleyball':
    case 'bóng chuyền':
      return '🏐';
    default:
      return '🏆';
  }
};
