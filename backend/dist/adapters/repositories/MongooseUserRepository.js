"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongooseUserRepository = void 0;
const User_1 = require("../../infrastructure/database/models/User");
class MongooseUserRepository {
    async findByUsername(username) {
        const userDoc = await User_1.UserModel.findOne({ username });
        if (!userDoc)
            return null;
        return this.toEntity(userDoc);
    }
    async findByEmail(email) {
        const userDoc = await User_1.UserModel.findOne({ email });
        if (!userDoc)
            return null;
        return this.toEntity(userDoc);
    }
    async findById(id) {
        const userDoc = await User_1.UserModel.findById(id);
        if (!userDoc)
            return null;
        return this.toEntity(userDoc);
    }
    async create(user) {
        const userDoc = new User_1.UserModel({
            username: user.username,
            email: user.email,
            password: user.password,
            wins: user.wins || 0,
            losses: user.losses || 0,
            draws: user.draws || 0,
            gamesPlayed: user.gamesPlayed || 0,
        });
        const savedDoc = await userDoc.save();
        return this.toEntity(savedDoc);
    }
    async findAll() {
        const userDocs = await User_1.UserModel.find({});
        return userDocs.map((doc) => this.toEntity(doc));
    }
    toEntity(doc) {
        return {
            id: doc._id.toString(),
            username: doc.username,
            email: doc.email,
            password: doc.password,
            wins: doc.wins,
            losses: doc.losses,
            draws: doc.draws,
            gamesPlayed: doc.gamesPlayed,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
        };
    }
}
exports.MongooseUserRepository = MongooseUserRepository;
