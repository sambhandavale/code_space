import { Request, Response } from 'express';
import Contest, { generateSlug } from '../../../Models/Events/Contest/Contest';
import ContestDetails from '../../../Models/Events/Contest/ContestDetails';
import mongoose from 'mongoose';
import UserProfile, { IUserProfile } from '../../../Models/Users/UserProfile';

export const createContest = async (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      startDate,
      type,
      registrationDeadline,
      rounds,
      duration,
      limit,
      languages,
      rated,
      host,
      status,
      visibility,
      rules,
      tags,
      questions_tags,
      endDate,
    } = req.body;

    // ✅ Validate required fields
    if (!title || !description || !startDate || !type || !registrationDeadline || !rounds || !duration) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: title, description, startDate, type, registrationDeadline, rounds, duration are mandatory.",
      });
    }

    // 🔍 Check for duplicate contest (unique based on title + type)
    const existingContest = await Contest.findOne({ title, type });
    if (existingContest) {
      return res.status(409).json({
        success: false,
        message: `A ${type} with the title "${title}" already exists.`,
      });
    }

    // 🔗 Generate slug
    const slug = generateSlug(title);

    const start = new Date(startDate);
    let computedEndDate = endDate ? new Date(endDate) : undefined;

    if (type !== "tournament" && !endDate) {
      computedEndDate = new Date(start.getTime() + Number(duration) * 60 * 1000);
    }

    // ⚙️ Construct contest document
    const contest = new Contest({
      title,
      // 📝 Store desc as Markdown (allowing for **bold**, lists, links, etc.)
      desc: description.trim(),
      slug,
      startDate: start,
      endDate: computedEndDate,
      type:type.toLowerCase(),
      registrationDeadline: new Date(registrationDeadline),
      rounds: Number(rounds),
      duration: type === 'contest' ? duration ? Number(duration) : 60 : duration ? Number(duration) : 5,
      limit: limit || 100,
      languages: languages.map((l)=>l.toLowerCase()) || ["python", "javascript", "cpp"],
      rated: rated ?? false,
      host: host || { name: "System", meta: {} },
      status: status || "upcoming",
      visibility: visibility.toLowerCase() || "public",
      // 📜 Rules in Markdown format for stylized rendering on frontend
      rules:
        rules?.trim() ||
        `
### General Rules
- Be respectful to all participants.  
- No plagiarism or unfair means.  
- Submissions must be original and within time limits.  
- Admin decisions are **final and binding**.  
        `.trim(),
      tags: tags || [],
      questions_tags: questions_tags || [],
    });

    // 💾 Save to DB
    const savedContest = await contest.save();

    return res.status(201).json({
      success: true,
      message: "Contest created successfully.",
      data: savedContest,
    });
  } catch (error: any) {
    console.error("❌ Error creating contest:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create contest.",
      error: error.message,
    });
  }
};

export const getContestDetails = async (req: Request, res: Response) => {
  try {
    const { contestId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(contestId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid contest ID.",
      });
    }

    // Fetch the contest
    const contest = await Contest.findById(contestId);
    if (!contest) {
      return res.status(404).json({
        success: false,
        message: "Contest not found.",
      });
    }

    // Fetch contest details
    const contestDetails = await ContestDetails.findOne({ contest: contest._id })
      .populate("participants", "name email");

    // Safely handle missing contestDetails
    const topParticipantsRaw = contestDetails?.participants?.slice(0, 3) || [];

    const topParticipants = await Promise.all(
      topParticipantsRaw.map(async (user: any) => {
        const profile: IUserProfile | null = await UserProfile.findOne({ user_id: user._id });
        return {
          _id: user._id,
          name: user.name,
          email: user.email,
          profile_image: profile?.profile_image || null,
        };
      })
    );

    return res.status(200).json({
      success: true,
      contest,
      topParticipants,
    });
  } catch (error: any) {
    console.error("❌ Error getting contest:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get contest.",
      error: error.message,
    });
  }
};
