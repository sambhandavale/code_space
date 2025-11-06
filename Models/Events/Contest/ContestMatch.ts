import mongoose, { Schema, Document } from "mongoose";

export interface IContestMatch extends Document {
  contest: mongoose.Types.ObjectId;
  contestRound: mongoose.Types.ObjectId;
  participants: mongoose.Types.ObjectId[];
  winner?: mongoose.Types.ObjectId;
  submissions: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const ContestMatchSchema = new Schema<IContestMatch>(
  {
    contest: { type: mongoose.Schema.Types.ObjectId, ref: "Contest", required: true },
    contestRound: { type: mongoose.Schema.Types.ObjectId, ref: "ContestRound", required: true },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }],
    winner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    submissions: [{ type: mongoose.Schema.Types.ObjectId, ref: "ContestMatchSubmission" }],
  },
  { timestamps: true }
);

export default mongoose.model<IContestMatch>("ContestMatch", ContestMatchSchema);
