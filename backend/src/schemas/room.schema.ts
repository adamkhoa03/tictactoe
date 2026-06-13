import { z } from 'zod';

export const createRoomSchema = z.object({
  boardSize: z.union([
    z.literal(3),
    z.literal(6),
    z.literal(9),
    z.literal(11),
    z.literal(15),
  ]),
  winCondition: z.union([
    z.literal(3),
    z.literal(4),
    z.literal(5),
  ]),
}).refine((data) => {
  // Bàn cờ 3x3 bắt buộc điều kiện thắng là 3
  if (data.boardSize === 3 && data.winCondition !== 3) return false;
  // Điều kiện thắng không được lớn hơn kích thước bàn cờ
  if (data.winCondition > data.boardSize) return false;
  return true;
}, {
  message: 'Điều kiện thắng không hợp lệ với kích thước bàn cờ đã chọn.',
  path: ['winCondition'],
});

export const joinRoomSchema = z.object({
  roomId: z.string().min(1, 'Mã phòng không được để trống'),
});

export type CreateRoomInput = z.infer<typeof createRoomSchema>;
export type JoinRoomInput = z.infer<typeof joinRoomSchema>;
