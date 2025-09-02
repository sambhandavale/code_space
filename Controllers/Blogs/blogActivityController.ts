import { Request, Response } from 'express';
import Blog from '../../Models/Blog/Blog';
import mongoose from 'mongoose';

export const pingBlog = async (req: Request, res: Response) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      res.status(404).json({ error: 'Blog not found.' });
      return;
    }

    const userId = req.user['_id'];

    if (blog.pings.includes(userId)) {
      res.status(400).json({ error: 'You have already pinged this blog.' });
      return;
    } 

    blog.pings.push(userId);
    await blog.save();

    res.status(200).json({ message: 'Pinged successfully.', pings: blog.pings.length });
    return;
  } catch (error) {
    res.status(500).json({ error: 'Server error.' });
    return;
  }
};

export const unpingBlog = async (req: Request, res: Response) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      res.status(404).json({ error: 'Blog not found.' });
      return;
    }

    const userId = req.user['_id'];

    if (!blog.pings.includes(userId)) {
      res.status(400).json({ error: 'You have not pinged this blog.' });
      return;
    }

    blog.pings = blog.pings.filter((id) => id.toString() !== userId.toString());
    await blog.save();

    res.status(200).json({ message: 'Unpinged successfully.', pings: blog.pings.length });
    return;
  } catch (error) {
    res.status(500).json({ error: 'Server error.' });
    return;
  }
};

export const addComment = async (req: Request, res: Response) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      res.status(404).json({ error: 'Blog not found.' });
      return;
    }

    const { text } = req.body;

    if (!text) {
      res.status(400).json({ error: 'Comment text is required.' });
      return;
    }

    const newComment = {
      userId: req.user['_id'],
      username: req.user['username'],
      text,
      createdAt: new Date(),
    };

    blog.comments.push(newComment);
    await blog.save();

    res.status(201).json({ message: 'Comment added successfully.', comments: blog.comments });
    return;
  } catch (error) {
    res.status(500).json({ error: 'Server error.' });
    return;
  }
};

export const deleteComment = async (req: Request, res: Response) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      res.status(404).json({ error: 'Blog not found.' });
      return;
    }

    const commentId = req.params.commentId;

    const commentIndex = blog.comments.findIndex(
      (comment) => comment['_id'].toString() === commentId && comment.userId.toString() === req.user['_id'].toString()
    );

    if (commentIndex === -1) {
      res.status(403).json({ error: 'Comment not found or you are not authorized to delete this comment.' });
      return;
    }

    blog.comments.splice(commentIndex, 1);
    await blog.save();

    res.status(200).json({ message: 'Comment deleted successfully.', comments: blog.comments });
    return;
  } catch (error) {
    res.status(500).json({ error: 'Server error.' });
    return;
  }
};

export const incrementView = async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId;

    if (!userId || typeof userId !== 'string') {
      res.status(400).json({ error: 'Invalid userId.' });
      return;
    }

    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      res.status(404).json({ error: 'Blog not found.' });
      return;
    }

    if (blog.views.some(viewId => viewId.equals(userId))) {
      res.status(400).json({ error: 'User view already added' });
      return;
    }

    // Add userId to views
    blog.views.push(new mongoose.Types.ObjectId(userId));
    await blog.save();

    res.status(200).json({ message: 'View incremented.', views: blog.views });
    return;
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error.' });
    return;
  }
};

