import mongoose, { Schema, Document } from "mongoose";

export interface IContestDetails extends Document {
  contest: mongoose.Types.ObjectId;
  slug: string;
  participants: mongoose.Types.ObjectId[];
  rounds: mongoose.Types.ObjectId[];
  leaderboard?: { user: mongoose.Types.ObjectId; points: number; rank: number }[];
  createdAt: Date;
  updatedAt: Date;
}

const LeaderboardSchema = new Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  points: { type: Number, default: 0 },
  rank: { type: Number, default: 0 },
});

const ContestDetailsSchema = new Schema<IContestDetails>(
  {
    contest: { type: mongoose.Schema.Types.ObjectId, ref: "Contest", required: true },
    slug: { type: String, unique: true },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    rounds: [{ type: mongoose.Schema.Types.ObjectId, ref: "ContestRound" }],
    leaderboard: { type: [LeaderboardSchema], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model<IContestDetails>("ContestDetails", ContestDetailsSchema);
