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
        }
    },
    {
        timestamps:true,
    }
);

// UserStatsSchema.virtual('total_matches').get(function (this: IUserStats) {
//     if (!this.daily_matches) return 0;

//     let total = 0;
//     for (const entry of Object.values(this.daily_matches)) {
//         total += entry.count;
//     }
//     return total;
// });


UserStatsSchema.index({ user_id: 1 }, { unique: true });

const UserStats = mongoose.model<IUserStats>("UserStats", UserStatsSchema);

export default UserStats;