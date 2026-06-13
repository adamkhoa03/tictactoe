"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sharedRoomRepository = void 0;
/**
 * Shared singleton instances để đảm bảo các lớp Use Cases và Adapters
 * khác nhau (REST routes, Socket handlers) dùng chung một instance Repository.
 */
const InMemoryRoomRepository_1 = require("../adapters/repositories/InMemoryRoomRepository");
exports.sharedRoomRepository = new InMemoryRoomRepository_1.InMemoryRoomRepository();
