import { PublicRoom } from '../slices/gameSlice';

interface APIResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export const gameApi = {
  /**
   * Lấy danh sách phòng đang chờ người chơi từ REST API.
   * Sử dụng khi lần đầu vào trang Lobby (HTTP request thay vì socket).
   */
  getWaitingRooms: async (): Promise<APIResponse<PublicRoom[]>> => {
    const response = await fetch('/api/rooms/waiting', {
      method: 'GET',
      credentials: 'include',
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Không thể tải danh sách phòng.');
    }
    return data;
  },
};
