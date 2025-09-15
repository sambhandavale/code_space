import { Request, Response } from "express";
import UserStats, { IUserStats } from "../../Models/Users/UserStats";
import UserModel, { IUser } from "../../Models/Users/Users";
import UserProfile, { IUserProfile } from "../../Models/Users/UserProfile";
import { formatDate } from "../../Utility/utils";
import UserChallengesModel, { IUserChallenges } from "../../Models/Challenges/User-Challenges";
import Users from "../../Models/Users/Users";
import Blog from "../../Models/Blog/Blog";
import moment from "moment-timezone";
import { BlobServiceClient } from "@azure/storage-blob";
import crypto from "crypto";

export const getUserProfileDetails = async (req: Request, res: Response) => {
    try {
        const username = req.query.username;
        const userId = req.query.userId;
        const timezone = req.headers['x-user-timezone'] as string || 'UTC';
        let userInfo: IUser;
        let userStats: IUserStats;
        let userProfile: IUserProfile;

        if (userId) {
            userInfo = await UserModel.findById(userId);
            if (!userInfo) {
                res.status(404).json({ message: "User not found" });
                return;
            }
            userProfile = await UserProfile.findOne({ user_id: userId });
            userStats = await UserStats.findOne({ user_id: userId })
                .populate("user_id")
                .populate({
                    path: "questions_solved.question",
                    select: "title difficulty description tags",
                });
        } else if (username) {
            const user = await UserModel.findOne({ username });
            if (!user) {
                res.status(404).json({ message: "User not found" });
                return;
            }
            userInfo = user;
            userStats = await UserStats.findOne({ user_id: user._id })
                .populate("user_id")
                .populate({
                    path: "questions_solved.question",
                    select: "title difficulty description tags",
                });
            userProfile = await UserProfile.findOne({ user_id: user._id });
        } else {
            res.status(400).json({ message: "User ID or Username is required" });
            return;
        }

        if (!userStats || !userProfile) {
            res.status(404).json({ message: "User stats or profile not found" });
            return;
        }

        const challenges = await UserChallengesModel.find({ "players.user_id": userInfo._id })
            .populate('players', 'username full_name')
            .lean();

        const userMatches = challenges.map((challenge) => {
            const opponent = (challenge.players as any[]).find(p => p.user_id.toString() !== userInfo._id.toString());

            let result = 'Draw';
            if (challenge.winner) {
                result = challenge.winner.toString() === userInfo._id.toString() ? 'Win' : 'Loss';
            }

            return {
                challengeId: challenge._id,
                opponentName: opponent?.username || opponent?.full_name || 'Unknown',
                opponentUsername: opponent?.username || 'Unknown',
                language: challenge.language,
                time: challenge.time,
                result,
                startTime: formatDate(challenge.start_time, timezone),
            };
        });

        const userStreaks = {
            currentLoginStreak: userStats.login_streak || 0,
            longestLoginStreak: userStats.longest_login_streak || 0,
            highestRating: userStats.highest_rating || 0,
            totalMatches: userStats['total_matches'] || 0,
        }

        const profileCardInfo = {
            userBio: userProfile.bio || "",
            userEmail: userInfo.email,
            joinedOn: formatDate(userInfo['createdAt'], timezone),
            userRating: userStats.rating,
            userTitle: userProfile.title,
            fullName: userInfo['full_name'],
            username: userInfo.username,
            profileImage:userProfile.profile_image,
        }

        const dailyMatches = userStats.daily_matches;
        const userFavourites = userProfile.favorites;
        const userSocials = userProfile.socials;
        const userSolvedQuestions = userStats.questions_solved;

        // Get user blogs
        const userBlogsData = await Blog.find({ authorId: userInfo._id })
            .sort({ createdAt: -1 })
            .select('title slug isPublished tags views pings comments publishedAt sections createdAt');

        const userBlogs = userBlogsData.map((blog) => {
            let firstContent = '';
            for (const section of blog.sections) {
                const contentItem = section.items.find(item => item.type === 'content');
                if (contentItem) {
                    firstContent = contentItem.value;
                    break;
                }
            }

            let publishedAgo = '';
            if (blog.isPublished && blog.publishedAt) {
                const now = moment().tz(timezone);
                const publishedAt = moment(blog.publishedAt).tz(timezone);
                const diffMinutes = now.diff(publishedAt, 'minutes');
                const diffHours = now.diff(publishedAt, 'hours');
                const diffDays = now.diff(publishedAt, 'days');

                if (diffMinutes < 1) {
                    publishedAgo = 'Just now';
                } else if (diffMinutes < 60) {
                    publishedAgo = `${diffMinutes}min`;
                } else if (diffHours < 24) {
                    publishedAgo = `${diffHours}hr`;
                } else if (diffDays < 7) {
                    publishedAgo = `${diffDays}d`;
                } else if (diffDays < 14) {
                    publishedAgo = '1w';
                } else if (diffDays < 21) {
                    publishedAgo = '2w';
                } else {
                    publishedAgo = publishedAt.format('MMM D');
                }
            }

            return {
                id: blog._id,
                title: blog.title,
                slug: blog.slug,
                isPublished: blog.isPublished,
                tags: blog.tags,
                views: blog.views.length,
                pings: blog.pings.length,
                comments: blog.comments.length,
                firstContent,
                publishedAgo: blog.isPublished ? publishedAgo : 'Draft',
            };
        });

        res.status(200).json({
            message: "User profile details fetched successfully",
            data: {
                userStreaks,
                profileCardInfo,
                dailyMatches,
                userFavourites,
                userSocials,
                userMatches,
                userBlogs,
                userSolvedQuestions
            }
        });

    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
} 

export const updateLoginStreak = async (userId: string, timezone: string = 'UTC') => {
  const userStats = await UserStats.findOne({ user_id: userId });
  if (!userStats) return;

  const now = moment().tz(timezone).startOf('day');
  const lastActive = userStats.last_login_date
    ? moment(userStats.last_login_date).tz(timezone).startOf('day')
    : null;

  const diff = lastActive ? now.diff(lastActive, 'days') : null;

  if (diff === 0) {
    // Already active today
    if (!userStats.login_streak || userStats.login_streak === 0) {
      userStats.login_streak = 1;
      if ((userStats.longest_login_streak || 0) < userStats.login_streak) {
        userStats.longest_login_streak = userStats.login_streak;
      }
    }
  } else if (diff === 1) {
    // Streak continues
    userStats.login_streak = (userStats.login_streak || 0) + 1;
    if ((userStats.longest_login_streak || 0) < userStats.login_streak) {
      userStats.longest_login_streak = userStats.login_streak;
    }
  } else {
    // Missed a day or first login → reset
    userStats.login_streak = 1;
    if ((userStats.longest_login_streak || 0) < userStats.login_streak) {
      userStats.longest_login_streak = userStats.login_streak;
    }
  }

  userStats.last_login_date = moment().tz(timezone).toDate();
  await userStats.save();
};

export const updateUserProfile = async (req: Request, res: Response) => {
    try {
        const { userId, socials, favorites, profileCardInfo } = req.body;

        if (!userId) {
            res.status(400).json({ message: "userId is required" });
            return;
        }

        const updateProfilePayload: any = {};
        const updateUserPayload: any = {};

        if (Array.isArray(socials)) {
            updateProfilePayload.socials = socials;
        }

        if (Array.isArray(favorites)) {
            updateProfilePayload.favorites = favorites;
        }

        if (profileCardInfo) {
            const { userBio, userEmail, fullName } = profileCardInfo;

            if (userBio !== undefined) {
                updateProfilePayload.bio = userBio;
            }

            if (userEmail !== undefined) {
                const existingUser = await Users.findOne({ email: userEmail, _id: { $ne: userId } });
                if (existingUser) {
                    res.status(400).json({ message: "Email is already in use by another user." });
                    return;
                }
                updateUserPayload.email = userEmail;
            }

            if (fullName !== undefined) {
                const nameParts = fullName.trim().split(" ");
                updateUserPayload.first_name = nameParts[0] || "";
                updateUserPayload.last_name = nameParts.slice(1).join(" ") || "";
            }
        }

        if (Object.keys(updateProfilePayload).length === 0 && Object.keys(updateUserPayload).length === 0) {
            res.status(400).json({ message: "No valid fields to update" });
            return;
        }

        // Update UserProfile
        let updatedProfile = null;
        if (Object.keys(updateProfilePayload).length > 0) {
            updatedProfile = await UserProfile.findOneAndUpdate(
                { user_id: userId },
                updateProfilePayload,
                { new: true }
            );
        }

        // Update Users model
        let updatedUser = null;
        if (Object.keys(updateUserPayload).length > 0) {
            updatedUser = await Users.findOneAndUpdate(
                { _id: userId },
                updateUserPayload,
                { new: true }
            );
        }

        if (!updatedProfile && !updatedUser) {
            res.status(404).json({ message: "User profile not found" });
            return;
        }

        res.status(200).json({
            message: "User profile updated successfully",
            data: {
                socials: updatedProfile?.socials,
                favorites: updatedProfile?.favorites,
                userBio: updatedProfile?.bio,
                userEmail: updatedUser?.email,
                fullName: `${updatedUser?.first_name ?? ""} ${updatedUser?.last_name ?? ""}`.trim()
            },
        });
        return;
    } catch (error) {
        console.error("Error updating user profile:", error);
        res.status(500).json({ message: "Server error", error });
        return;
    }
};

const blobServiceClient = BlobServiceClient.fromConnectionString(
  process.env.AZURE_STORAGE_CONNECTION_STRING!
);

const containerClient = blobServiceClient.getContainerClient(
  process.env.AZURE_STORAGE_PROFILE_CONTAINER_NAME!
);

export const uploadProfileImage = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    const file = req.file;

    if (!file || !userId) {
        res.status(400).json({ error: "Missing image or userId" });
        return;
    }

    const hash = crypto.createHash("sha256").update(file.buffer).digest("hex");

    // 2. Create blob name using hash
    const ext = file.originalname.split(".").pop(); // jpg, png etc.
    const blobName = `${userId}/${hash}.${ext}`;

    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    // 3. Check if already uploaded
    const exists = await blockBlobClient.exists();
    if (!exists) {
      await blockBlobClient.uploadData(file.buffer, {
        blobHTTPHeaders: { blobContentType: file.mimetype },
      });
    }

    const imageUrl = blockBlobClient.url;

    // 4. Save URL and hash to user profile
    await UserProfile.findOneAndUpdate(
      { user_id: userId },
      {
        profile_image: imageUrl,
        profile_image_hash: hash,
      },
      { new: true }
    );

    res.status(200).json({ imageUrl });
    return;
  } catch (error) {
    console.error("Profile image upload error:", error);
    res.status(500).json({ error: "Failed to upload profile image" });
    return;
    }
};

