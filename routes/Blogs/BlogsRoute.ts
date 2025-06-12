import { Router } from "express";
import passport from "passport";
import {
  createBlog,
  getAllBlogs,
  getBlogById,
  getBlogBySlug,
  updateBlog,
  saveDraft
} from "../../controllers/Blogs/BlogsController"

const router = Router();

router.post(
  "/create",
  passport.authenticate("jwt", { session: false }),
  createBlog,
);

// router.post(
//   "/saveDraft",
//   passport.authenticate("jwt", { session: false }),
//   saveBlog,
// );

router.get(
  "/",
  getAllBlogs
);

router.get(
  "/:id",
  getBlogById
);

router.get(
  "/slug/:slug",
  getBlogBySlug
);

router.put(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  updateBlog
);

export default router;
