import { useEffect } from 'react';
import { Socket } from 'socket.io-client';
import { getSocket } from '../socketService';

/**
 * Custom Hook để lấy instance Socket.io client
 */
export const useSocket = (): Socket => {
  return getSocket();
};

/**
 * Custom Hook để lắng nghe sự kiện từ socket một cách an toàn.
 * Tự động đăng ký khi component mount và hủy đăng ký khi unmount hoặc khi callback thay đổi.
 *
 * @param event Tên sự kiện
 * @param callback Hàm xử lý dữ liệu nhận được
 */
export const useSocketEvent = <T = any>(
  event: string,
  callback: (data: T) => void
): void => {
  useEffect(() => {
    const socket = getSocket();

    socket.on(event, callback);

    return () => {
      socket.off(event, callback);
    };
  }, [event, callback]);
};
