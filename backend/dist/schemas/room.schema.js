"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.joinRoomSchema = exports.createRoomSchema = void 0;
const zod_1 = require("zod");
exports.createRoomSchema = zod_1.z.object({
    boardSize: zod_1.z.union([
        zod_1.z.literal(3),
        zod_1.z.literal(6),
        zod_1.z.literal(9),
        zod_1.z.literal(11),
        zod_1.z.literal(15),
    ]),
    winCondition: zod_1.z.union([
        zod_1.z.literal(3),
        zod_1.z.literal(4),
        zod_1.z.literal(5),
    ]),
}).refine((data) => {
    // Bàn cờ 3x3 bắt buộc điều kiện thắng là 3
    if (data.boardSize === 3 && data.winCondition !== 3)
        return false;
    // Điều kiện thắng không được lớn hơn kích thước bàn cờ
    if (data.winCondition > data.boardSize)
        return false;
    return true;
}, {
    message: 'Điều kiện thắng không hợp lệ với kích thước bàn cờ đã chọn.',
    path: ['winCondition'],
});
exports.joinRoomSchema = zod_1.z.object({
    roomId: zod_1.z.string().min(1, 'Mã phòng không được để trống'),
});
