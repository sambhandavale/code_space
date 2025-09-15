import mongoose from "mongoose";
import { ObjectId } from "mongoose";

export interface IUserStats{
    _id?:ObjectId;
    user_id:ObjectId;
    matches_played?:number;
    rating?:number;
    highest_rating?:number;
    wins?:number;
    draw?:number;
    loss?:number;
    streak?: {
        current: number;
        longest: number;
        start_date: Date;
        longest_start_date: Date;
    };
    last_match_date?: Date;
    daily_matches?: Record<string, { count: number; challenges: ObjectId[] }>;
    last_login_date?: Date;
    login_streak?:number;
    longest_login_streak?:number;
    questions_solved?: {
        question: ObjectId;
        language: string[];
        solved_at: Date;
    }[];
}

const UserStatsSchema = new mongoose.Schema<IUserStats>(
    {
        user_id:{
            type:mongoose.Schema.Types.ObjectId,
            ref: "User",
            required:true,
        },
        matches_played:{
            type:Number,
            default:0,
        },
        rating:{
            type:Number,
            default:800,
        },
        highest_rating:{
            type:Number,
            default:800,
        },
        wins:{
            type:Number,
            default:0,
        },
        loss:{
            type:Number,
            default:0,
        },
        draw:{
            type:Number,
            default:0,
        },
        streak: {
            current: { type: Number, default: 0 },
            longest: { type: Number, default: 0 },
            start_date: { type: Date },
            longest_start_date: { type: Date },
        },
        last_match_date: {
            type: Date,
        },
        daily_matches: {
            type: Map,
            of: {
                count: { type: Number, default: 0 },
                challenges: [{ type: mongoose.Schema.Types.ObjectId, ref: "UserChallenges" }],
            },
            default: {},
        },
        last_login_date: {
            type: Date,
        },
        login_streak:{
            type:Number,
        },
        longest_login_streak:{
            type:Number,
        },
        questions_solved: [
            {
                question: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Question",
                    required: true,
                },
                language: [{
                    type: String,
                    required: true,
                    trim: true,
                }],
                solved_at: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
    },
    {
        timestamps:true,
    }
);

UserStatsSchema.virtual('total_matches').get(function (this: IUserStats & { daily_matches: Map<string, { count: number }> }) {
    if (!this.daily_matches) return 0;

    let total = 0;

    // If using Mongoose's Map, use `this.daily_matches.forEach`
    this.daily_matches.forEach((value) => {
        total += value.count;
    });

    return total;
});


//Ensures that the virtual field appears in the responses when the document is converted to an object or JSON
UserStatsSchema.set('toObject', { virtuals: true });
UserStatsSchema.set('toJSON', { virtuals: true });

UserStatsSchema.index({ user_id: 1 }, { unique: true });

const UserStats = mongoose.model<IUserStats>("UserStats", UserStatsSchema);

export default UserStats;