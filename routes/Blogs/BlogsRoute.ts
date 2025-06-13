import { Router } from "express";
import passport from "passport";
import {
  createBlog,
  getAllBlogs,
  getBlogById,
  getBlogBySlug,
  updateBlog,
  saveDraft,
  getUserBlogs
} from "../../controllers/Blogs/BlogsController";

import {
  pingBlog,
  unpingBlog,
  addComment,
  deleteComment,
  incrementView
} from "../../controllers/Blogs/BlogActivityController"; // Assuming these actions are in a separate controller

const router = Router();

// Create Blog
router.post(
  "/create",
  passport.authenticate("jwt", { session: false }),
  createBlog
);

// Get All Blogs
router.get("/", getAllBlogs);

// Get User Blogs
router.get("/user", getUserBlogs);

// Get Blog by ID
router.get(
  "/:id",
  passport.authenticate("jwt", { session: false }), 
  getBlogById
);

// Get Blog by Slug
router.get("/slug/:slug", getBlogBySlug);

// Update Blog
router.put(
  "/update/:slug",
  passport.authenticate("jwt", { session: false }),
  updateBlog
);

// Ping Blog
router.post(
  "/ping/:id",
  passport.authenticate("jwt", { session: false }),
  pingBlog
);

// Unping Blog
router.post(
  "/unping/:id",
  passport.authenticate("jwt", { session: false }),
  unpingBlog
);

// Add Comment
router.post(
  "/comment/:id",
  passport.authenticate("jwt", { session: false }),
  addComment
);

// Delete Comment
router.delete(
  "/comment/:id/:commentId",
  passport.authenticate("jwt", { session: false }),
  deleteComment
);

// Increment View
router.post(
  "/view/:id",
  passport.authenticate("jwt", { session: false }),
  incrementView
);

export default router;
