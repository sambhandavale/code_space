import { Request, Response } from 'express';
import Contest, { generateSlug } from '../../../Models/Events/Contest/Contest';

export const createContest = async (req: Request, res: Response) => {
  try {
    const {
      title,
      desc,
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
    if (!title || !desc || !startDate || !type || !registrationDeadline || !rounds || !duration) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: title, desc, startDate, type, registrationDeadline, rounds, duration are mandatory.",
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
      desc: desc.trim(),
      slug,
      startDate: start,
      endDate: computedEndDate,
      type,
      registrationDeadline: new Date(registrationDeadline),
      rounds: Number(rounds),
      duration: Number(duration),
      limit: limit || 100,
      languages: languages || ["Python", "JavaScript", "C++"],
      rated: rated ?? false,
      host: host || { name: "System", meta: {} },
      status: status || "upcoming",
      visibility: visibility || "public",
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