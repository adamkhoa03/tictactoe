import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

/**
 * Lấy instance Socket.io client duy nhất trong ứng dụng.
 * Khởi tạo trễ (lazy initialization) khi được gọi lần đầu.
 */
export const getSocket = (): Socket => {
  if (!socket) {
    // VITE_SOCKET_URL có thể được cấu hình trong file .env của frontend.
    // Nếu để trống, socket sẽ tự động kết nối đến origin hiện tại (phù hợp với proxy của Vite trong development).
    const socketUrl = (import.meta.env.VITE_SOCKET_URL as string) || '';

    socket = io(socketUrl, {
      autoConnect: false, // Tự động kết nối tắt đi để kết nối thủ công khi đã đăng nhập
      withCredentials: true, // Gửi kèm cookie phục vụ xác thực
    });
  }
  return socket;
};
