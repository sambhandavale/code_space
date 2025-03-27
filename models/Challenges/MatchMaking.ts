import mongoose, { Schema, Document } from "mongoose";

interface IMatchMaking {
    user_id: mongoose.Schema.Types.ObjectId;
    language: string;
    time_control: number;
}

const MatchMakingSchema = new Schema<IMatchMaking>(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        language: {
            type: String,
            required: true,
        },
        time_control: {
            type: Number,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const MatchMakingModel = mongoose.model<IMatchMaking>("MatchMaking", MatchMakingSchema);

export default MatchMakingModel;
