import mongoose from "mongoose";

export interface PlayerDetails {
    user_id: mongoose.Types.ObjectId;
    email: string;
    username: string;
    full_name: string;
}

export interface PlayerCodeDetails {
    user_id: mongoose.Types.ObjectId;
    code: string;
    passed_test_cases: number;
}

export interface IUserChallenges {
    players: PlayerDetails[];
    language: string;
    time: number;
    problem_id: mongoose.Types.ObjectId;
    codes: PlayerCodeDetails[]; // New: Array to store each user's code
    winner: mongoose.Types.ObjectId;
    rating_change: Record<string, number>;
    active: boolean;
    start_time: Date;
    room_code: string;
    status: string;
    is_private: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const PlayerSchema = new mongoose.Schema<PlayerDetails>({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    email: { type: String, required: true },
    username: { type: String, required: true },
    full_name: { type: String, required: true },
});

const PlayerCodeSchema = new mongoose.Schema<PlayerCodeDetails>({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    code: { type: String, default: '' },
    passed_test_cases: { type: Number, default: 0 },
}, { _id: false });

const UserChallengesSchema = new mongoose.Schema<IUserChallenges>(
    {
        players: [PlayerSchema],
        language: { type: String, required: true },
        time: { type: Number, required: true },
        problem_id: { type: mongoose.Schema.Types.ObjectId, ref: "Question", required: true },
        codes: [PlayerCodeSchema],
        winner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        rating_change: { type: Map, of: Number, default: {} },
        active: { type: Boolean, default: true },
        start_time: { type: Date },
        room_code: { type: String, unique: true, sparse: true, index: true },
        status: { type: String, enum: ["waiting", "active", "completed", 'stale'], default: "waiting" },
        is_private: { type: Boolean, default: false },
    },
    { timestamps: true }
);

const UserChallengesModel = mongoose.model<IUserChallenges>("UserChallenges", UserChallengesSchema);

export default UserChallengesModel;
