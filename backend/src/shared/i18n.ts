import { Request } from 'express';

const translations: Record<string, Record<string, string>> = {
  vi: {
    'Username is already taken': 'Tên đăng nhập đã được sử dụng',
    'Email is already registered': 'Email đã được đăng ký',
    'Invalid username/email or password': 'Tên đăng nhập/email hoặc mật khẩu không đúng',
    'Logged out successfully': 'Đăng xuất thành công',
    'Not authenticated': 'Không thể xác thực',
    'User not found': 'Không tìm thấy người dùng',
    'Validation failed': 'Xác thực dữ liệu thất bại',
    'Internal server error': 'Lỗi máy chủ nội bộ',
    'Authorization token required': 'Yêu cầu token xác thực',
    'Invalid or expired token': 'Token không hợp lệ hoặc đã hết hạn',
  },
  en: {
    'Username is already taken': 'Username is already taken',
    'Email is already registered': 'Email is already registered',
    'Invalid username/email or password': 'Invalid username/email or password',
    'Logged out successfully': 'Logged out successfully',
    'Not authenticated': 'Not authenticated',
    'User not found': 'User not found',
    'Validation failed': 'Validation failed',
    'Internal server error': 'Internal server error',
    'Authorization token required': 'Authorization token required',
    'Invalid or expired token': 'Invalid or expired token',
  }
};

export const getLanguage = (req: Request): string => {
  const acceptLanguage = req.headers['accept-language'];
  if (acceptLanguage) {
    if (acceptLanguage.toLowerCase().startsWith('en')) return 'en';
    if (acceptLanguage.toLowerCase().startsWith('vi')) return 'vi';
  }
  return 'vi'; // default fallback language
};

export const t = (req: Request, key: string): string => {
  const lang = getLanguage(req);
  return translations[lang]?.[key] || key;
};
