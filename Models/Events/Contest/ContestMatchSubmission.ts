import mongoose, { Schema, Document } from "mongoose";

export interface IContestMatchSubmission extends Document {
  participant: mongoose.Types.ObjectId;
  code: string;
  language: string;
  timeComplexity?: string;
  spaceComplexity?: string;
  testCasesPassed: number;
  totalTestCases: number;
  pointsAwarded: number;
  submittedAt: Date;
  status: "pending" | "judged" | "failed";
  createdAt: Date;
  updatedAt: Date;
}

const ContestMatchSubmissionSchema = new Schema<IContestMatchSubmission>(
  {
    participant: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    code: { type: String, required: true },
    language: { type: String, required: true },
    timeComplexity: { type: String },
    spaceComplexity: { type: String },
    testCasesPassed: { type: Number, default: 0 },
    totalTestCases: { type: Number, default: 0 },
    pointsAwarded: { type: Number, default: 0 },
    submittedAt: { type: Date, default: Date.now },
    status: { type: String, enum: ["pending", "judged", "failed"], default: "pending" },
  },
  { timestamps: true }
);

export default mongoose.model<IContestMatchSubmission>(
  "ContestMatchSubmission",
  ContestMatchSubmissionSchema
);
