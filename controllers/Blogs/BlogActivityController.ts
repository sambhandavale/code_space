import { Request, Response } from 'express';
import Blog from '../../models/Blog/Blog';

export const pingBlog = async (req: Request, res: Response) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ error: 'Blog not found.' });

    const userId = req.user['_id'];

    if (blog.pings.includes(userId)) {
      return res.status(400).json({ error: 'You have already pinged this blog.' });
    }

    blog.pings.push(userId);
    await blog.save();

    res.status(200).json({ message: 'Pinged successfully.', pings: blog.pings.length });
  } catch (error) {
    res.status(500).json({ error: 'Server error.' });
  }
};

export const unpingBlog = async (req: Request, res: Response) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ error: 'Blog not found.' });

    const userId = req.user['_id'];

    if (!blog.pings.includes(userId)) {
      return res.status(400).json({ error: 'You have not pinged this blog.' });
    }

    blog.pings = blog.pings.filter((id) => id.toString() !== userId.toString());
    await blog.save();

    res.status(200).json({ message: 'Unpinged successfully.', pings: blog.pings.length });
  } catch (error) {
    res.status(500).json({ error: 'Server error.' });
  }
};

export const addComment = async (req: Request, res: Response) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ error: 'Blog not found.' });

    const { text } = req.body;

    if (!text) return res.status(400).json({ error: 'Comment text is required.' });

    const newComment = {
      userId: req.user['_id'],
      username: req.user['username'],
      text,
      createdAt: new Date(),
    };

    blog.comments.push(newComment);
    await blog.save();

    res.status(201).json({ message: 'Comment added successfully.', comments: blog.comments });
  } catch (error) {
    res.status(500).json({ error: 'Server error.' });
  }
};

export const deleteComment = async (req: Request, res: Response) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ error: 'Blog not found.' });

    const commentId = req.params.commentId;

    const commentIndex = blog.comments.findIndex(
      (comment) => comment['_id'].toString() === commentId && comment.userId.toString() === req.user['_id'].toString()
    );

    if (commentIndex === -1) {
      return res.status(403).json({ error: 'Comment not found or you are not authorized to delete this comment.' });
    }

    blog.comments.splice(commentIndex, 1);
    await blog.save();

    res.status(200).json({ message: 'Comment deleted successfully.', comments: blog.comments });
  } catch (error) {
    res.status(500).json({ error: 'Server error.' });
  }
};

export const incrementView = async (req: Request, res: Response) => {
  try {
    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    );

    if (!blog) return res.status(404).json({ error: 'Blog not found.' });

    res.status(200).json({ message: 'View incremented.', views: blog.views });
  } catch (error) {
    res.status(500).json({ error: 'Server error.' });
  }
};