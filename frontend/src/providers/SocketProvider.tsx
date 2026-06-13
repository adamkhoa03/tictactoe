import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { getSocket } from '../features/socket/socketService';
import { setConnected, setConnectionError } from '../features/socket/slices/socketSlice';

interface SocketProviderProps {
  children: React.ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Nếu chưa đăng nhập, ngắt kết nối socket nếu đang mở
    if (!isAuthenticated) {
      const socket = getSocket();
      if (socket.connected) {
        socket.disconnect();
      }
      dispatch(setConnected(false));
      return;
    }

    // Nếu đã đăng nhập, khởi tạo kết nối
    const socket = getSocket();

    const handleConnect = () => {
      dispatch(setConnected(true));
      dispatch(setConnectionError(null));
    };

    const handleDisconnect = (reason: string) => {
      dispatch(setConnected(false));
      console.log(`🔌 Socket disconnected: ${reason}`);
    };

    const handleConnectError = (error: Error) => {
      dispatch(setConnected(false));
      dispatch(setConnectionError(error.message));
      console.error('🔌 Socket connection error:', error);
    };

    // Đăng ký lắng nghe sự kiện hệ thống
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);

    // Kích hoạt kết nối
    socket.connect();

    // Cleanup khi unmount hoặc khi trạng thái đăng nhập thay đổi
    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleConnectError);
      
      socket.disconnect();
      dispatch(setConnected(false));
    };
  }, [isAuthenticated, dispatch]);

  return <>{children}</>;
};
