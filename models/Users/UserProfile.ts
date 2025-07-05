import mongoose, { ObjectId } from "mongoose";

interface FavoriteItem {
    category: string; // e.g., "Language", "F1 Driver", "Footballer"
    value: string;
}

interface SocialItem {
    platform: string; // e.g., "GitHub", "LinkedIn", "Twitter", "Portfolio"
    url: string;
}

export interface IUserProfile {
    _id?: ObjectId;
    user_id: ObjectId;

    favorites?: FavoriteItem[];
    socials?: SocialItem[];

    title?: string;

    bio?: string;
    theme_preference?: string;
    profile_image?: string;
    profile_image_hash?:string,
}

const FavoriteSchema = new mongoose.Schema<FavoriteItem>(
    {
        category: { type: String },
        value: { type: String, default: "" },
    },
    { _id: false }
);

const SocialSchema = new mongoose.Schema<SocialItem>(
    {
        platform: { type: String },
        url: { type: String, default: "" },
    },
    { _id: false }
);

// Default favorites
const defaultFavorites: FavoriteItem[] = [
    { category: "Language", value: "" },
    { category: "Time Control", value: "" },
    { category: "Topic", value: "" },
];

// Default socials
const defaultSocials: SocialItem[] = [
    { platform: "GitHub", url: "https://github.com/..." },
    { platform: "LinkedIn", url: "https://linkedin.com/..." },
    { platform: "Twitter", url: "https://twitter.com/..." },
    { platform: "Portfolio", url: "https://..." },
];

const UserProfileSchema = new mongoose.Schema<IUserProfile>(
    {
        user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
        favorites: { type: [FavoriteSchema], default: defaultFavorites },
        socials: { type: [SocialSchema], default: defaultSocials },
        title: {
            type: String,
            default: 'Pupil (PU)'
        },
        bio: {
            type: String,
        },
        theme_preference: { type: String, default: "dark" },
        profile_image: { type: String},
        profile_image_hash: { type: String },
    },
    { timestamps: true }
);

const UserProfile = mongoose.model<IUserProfile>("UserProfile", UserProfileSchema);
export default UserProfile;
