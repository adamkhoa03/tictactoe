"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetWaitingRooms = void 0;
class GetWaitingRooms {
    roomRepository;
    constructor(roomRepository) {
        this.roomRepository = roomRepository;
    }
    async execute() {
        return this.roomRepository.findAllWaitingRooms();
    }
}
exports.GetWaitingRooms = GetWaitingRooms;
