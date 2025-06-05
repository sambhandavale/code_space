import mongoose, { ObjectId } from "mongoose";

interface FavoriteItem {
    category: string; // e.g., "Language", "F1 Driver", "Footballer"
    value: string;
}

interface SocialItem {
    platform: string; // e.g., "GitHub", "LinkedIn", "Twitter", "Portfolio"
    url: string;
}

interface IUserProfile {
    _id?: ObjectId;
    user_id: ObjectId;

    favorites?: FavoriteItem[];
    socials?: SocialItem[];

    highest_rating?: number;
    title?: string;

    bio?: string;
    theme_preference?: string;
    avatar_frame?: string;
}

const FavoriteSchema = new mongoose.Schema<FavoriteItem>(
    {
        category: { type: String },
        value: { type: String },
    },
    { _id: false }
);

const SocialSchema = new mongoose.Schema<SocialItem>(
    {
        platform: { type: String },
        url: { type: String },
    },
    { _id: false }
);

const UserProfileSchema = new mongoose.Schema<IUserProfile>(
    {
        user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
        favorites: [FavoriteSchema],
        socials: [SocialSchema],
        highest_rating: Number,
        title: {
            type:String,
            default:'Pupil (PU)'
        },
        bio: {
            type:String,
        },
        theme_preference: { type: String, default: "dark" },
        avatar_frame: {
            type:String,
            default:'default.png'
        },
    },
    { timestamps: true }
);

const UserProfile = mongoose.model<IUserProfile>("UserProfile", UserProfileSchema);
export default UserProfile;
