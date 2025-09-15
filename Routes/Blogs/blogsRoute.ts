import { Router } from "express";
import passport from "passport";

import {
  createBlog,
  getAllBlogs,
  getBlogById,
  getBlogBySlug,
  updateBlog,
  saveDraft,
  getUserBlogs,
  updateBlogImages,
  uploadImageToAzure,
  translateCode
} from "../../Controllers/Blogs/blogsController";

import {
  pingBlog,
  unpingBlog,
  addComment,
  deleteComment,
  incrementView
} from "../../Controllers/Blogs/blogActivityController";
import multer from "multer";

const router = Router();
const upload = multer();

/* ========== BLOG CREATION & UPDATES ========== */

// Create Blog
router.post(
  "/create",
  passport.authenticate("jwt", { session: false }),
  createBlog
);

// Update Blog (e.g., title, slug, etc.)
router.put(
  "/update/:id",
  // passport.authenticate("jwt", { session: false }),
  updateBlog
);

router.post(
  "/upload-image",
  passport.authenticate("jwt", { session: false }),
  upload.single("image"),
  uploadImageToAzure 
);

// ✅ Update blog sections after image uploads (Azure)
router.patch(
  "/:id/update-images",
  passport.authenticate("jwt", { session: false }),
  updateBlogImages
);

// Save Draft (optional route if implemented)
// router.post("/save-draft", saveDraft);


/* ========== BLOG FETCHING ========== */

// Get All Blogs
router.get("/", getAllBlogs);

// Get User's Blogs
router.get("/user", getUserBlogs);

// Get Blog by ID
router.get(
  "/:id",
  // passport.authenticate("jwt", { session: false }),
  getBlogById
);

// Get Blog by Slug
router.get("/slug/:slug", getBlogBySlug);


/* ========== BLOG INTERACTIONS ========== */

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

// Increment View Count
router.post(
  "/view/:id",
  // passport.authenticate("jwt", { session: false }),
  incrementView
);

router.post(
  "/translateCode",
  translateCode
)

export default router;
