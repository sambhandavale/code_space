import { Request, Response } from "express";
import UserModel from "../../Models/Users/Users";
import Blog from "../../Models/Blog/Blog";

export const globalSearch = async (req: Request, res: Response) => {
    try {
        const query = req.query.q as string;
        const type = (req.query.type as string) || "all";

        if (!query || query.trim() === "") {
             res.status(400).json({ error: "Search query is required" });
             return;
        }

        const regex = new RegExp(query, "i");

        let users: any[] = [];
        let blogs: any[] = [];

        if (type === "user" || type === "all") {
            users = await UserModel.find({
                $or: [
                    { username: { $regex: regex } },
                    { first_name: { $regex: regex } },
                    { last_name: { $regex: regex } }
                ]
            })
            .select("_id username first_name last_name user_photo role")
            .limit(20);
        }

        if (type === "blog" || type === "all") {
            blogs = await Blog.find({
                isPublished: true,
                isActive: true,
                $or: [
                    { title: { $regex: regex } },
                    { author: { $regex: regex } },
                    { tags: { $in: [regex] } }
                ]
            })
            .select("title slug author tags coverImage createdAt views pings")
            .limit(20);
        }

        res.status(200).json({
            users: type === "blog" ? undefined : users,
            blogs: type === "user" ? undefined : blogs
        });
    } catch (error) {
        console.error("Global search error:", error);
        res.status(500).json({ error: "Internal server error during search" });
    }
};
