import { Request, Response } from 'express';
import Blog from '../../models/Blog/Blog';

export const createBlog = async (req: Request, res: Response) => {
  try {
    const { title, author, authorId, sections, tags, coverImage, isPublished } = req.body;

    if (!title || !author || !authorId || !sections) {
      res.status(400).json({ error: 'Title, author, authorId, and sections are required.' });
      return;
    }

    const newBlog = await Blog.create({
      title,
      author,
      authorId,
      sections,
      tags,
      coverImage,
      isPublished,
      publishedAt: isPublished ? new Date() : undefined,
    });

    res.status(201).json(newBlog);
  } catch (error: any) {
    console.error('Error creating blog:', error);

    if (error.code === 11000 && error.keyPattern && error.keyPattern.slug) {
      res.status(400).json({ error: 'A blog with this title already exists. Please choose a different title.' });
      return;
    }

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((val: any) => val.message);
      res.status(400).json({ error: messages.join('. ') });
      return;
    }

    res.status(500).json({ error: 'Internal server error. Please try again later.' });
  }
};

export const saveDraft = async (req: Request, res: Response) => {
  try {
    const { title, author, authorId, sections, tags, coverImage } = req.body;

    if (!title || !author || !authorId || !sections) {
      res.status(400).json({ error: 'Title, author, authorId, and sections are required.' });
      return;
    }

    const draftBlog = await Blog.create({
      title,
      author,
      authorId,
      sections,
      tags,
      coverImage,
      isPublished: false,
    });

    res.status(201).json({
      message: 'Draft saved successfully',
      draftBlog,
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error.' });
  }
};

export const getAllBlogs = async (req: Request, res: Response) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.status(200).json(blogs);
  } catch (error) {
    res.status(500).json({ error: 'Server error.' });
  }
};

export const getBlogById = async (req: Request, res: Response) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      res.status(404).json({ error: 'Blog not found.' });
      return;
    }

    res.status(200).json(blog);
  } catch (error) {
    res.status(500).json({ error: 'Server error.' });
  }
};

export const getBlogBySlug = async (req: Request, res: Response) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug });

    if (!blog) {
      res.status(404).json({ error: 'Blog not found.' });
      return;
    }

    res.status(200).json(blog);
  } catch (error) {
    res.status(500).json({ error: 'Server error.' });
  }
};

export const updateBlog = async (req: Request, res: Response) => {
  try {
    const { title, author, sections, tags, coverImage, isPublished } = req.body;

    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      res.status(404).json({ error: 'Blog not found.' });
      return;
    }

    blog.title = title || blog.title;
    blog.author = author || blog.author;
    blog.sections = sections || blog.sections;
    blog.tags = tags || blog.tags;
    blog.coverImage = coverImage || blog.coverImage;
    blog.isPublished = isPublished !== undefined ? isPublished : blog.isPublished;

    if (isPublished && !blog.publishedAt) {
      blog.publishedAt = new Date();
    }

    await blog.save();

    res.status(200).json(blog);
  } catch (error) {
    res.status(500).json({ error: 'Server error.' });
  }
};
