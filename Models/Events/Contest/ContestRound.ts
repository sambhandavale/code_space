import mongoose, { Schema, Document } from "mongoose";

export interface IContestRound extends Document {
  contest: mongoose.Types.ObjectId;
  name: string;
  roundNumber: number;
  match: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const ContestRoundSchema = new Schema<IContestRound>(
  {
    contest: { type: mongoose.Schema.Types.ObjectId, ref: "Contest", required: true },
    name: { type: String, required: true },
    roundNumber: { type: Number, required: true },
    match: [{ type: mongoose.Schema.Types.ObjectId, ref: "ContestMatch" }],
  },
  { timestamps: true }
);

export default mongoose.model<IContestRound>("ContestRound", ContestRoundSchema);
