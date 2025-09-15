import { Request, Response } from 'express';
import Blog from '../../Models/Blog/Blog';
import moment from "moment-timezone";
import { BlobServiceClient } from '@azure/storage-blob';
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

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

const blobServiceClient = BlobServiceClient.fromConnectionString(
  process.env.AZURE_STORAGE_CONNECTION_STRING!
);

const containerClient = blobServiceClient.getContainerClient(
  process.env.AZURE_STORAGE_BLOG_CONTAINER_NAME!
);

export const uploadImageToAzure = async (req, res) => {
  try {
    const { blogId, hash } = req.body;
    const file = req.file;

    if (!file || !blogId || !hash) {
      res.status(400).send('Missing image, blogId or hash');
      return;
    }

    const blobName = `blog-${blogId}/${hash}`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    // ✅ Check if image already exists
    const exists = await blockBlobClient.exists();
    if (!exists) {
      await blockBlobClient.uploadData(file.buffer, {
        blobHTTPHeaders: { blobContentType: file.mimetype },
      });
    }

    res.status(200).json({ imageUrl: blockBlobClient.url });
    return;
  } catch (error) {
    console.error('Azure upload error:', error);
    res.status(500).json({ error: 'Failed to upload image' });
    return;
  }
};

export const updateBlogImages = async (req: Request, res: Response) => {
  try {
    const { sections } = req.body;
    const blogId = req.params.id;

    const updated = await Blog.findByIdAndUpdate(
      blogId,
      { sections },
      { new: true }
    );

    if (!updated){ 
      res.status(404).json({ error: "Blog not found" });
      return;
    };

    res.status(200).json(updated);
    return; 
  } catch (err) {
    console.error("Error updating blog images:", err);
    res.status(500).json({ error: "Failed to update blog images" });
    return;
  }
};

export const getAllBlogs = async (req: Request, res: Response) => {
  try {
    const userTimezone = req.headers['x-user-timezone'] as string || 'UTC';

    const blogs = await Blog.find({ isActive: true })
        .sort({ createdAt: -1 })
        .select('title slug isPublished tags views pings comments publishedAt sections createdAt author authorId')
        .populate('authorId', 'username full_name');


    const formattedBlogs = blogs.map((blog) => {
      // Extract first content item
      let firstContent = '';
      for (const section of blog.sections) {
        const contentItem = section.items.find(item => item.type === 'content');
        if (contentItem) {
          firstContent = contentItem.value;
          break;
        }
      }

      // Calculate published duration
      let publishedAgo = '';
      if (blog.isPublished && blog.publishedAt) {
        const now = moment().tz(userTimezone);
        const publishedAt = moment(blog.publishedAt).tz(userTimezone);
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
        author:blog.author,
        authorId:blog.authorId,
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

    res.status(200).json(formattedBlogs);
  } catch (error) {
    res.status(500).json({ error: 'Server error.' });
  }
};

export const getUserBlogs = async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId;
    const userTimezone = req.headers['x-user-timezone'] as string || 'UTC';

    const blogs = await Blog.find({ authorId: userId })
      .sort({ createdAt: -1 })
      .select('title slug isPublished tags views pings comments publishedAt sections createdAt');

    const formattedBlogs = blogs.map((blog) => {
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
        const now = moment().tz(userTimezone);
        const publishedAt = moment(blog.publishedAt).tz(userTimezone);
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
        pings: blog.pings.length,
        views:blog.views.length,
        comments: blog.comments.length,
        firstContent,
        publishedAgo: blog.isPublished ? publishedAgo : 'Draft',
      };
    });

    res.status(200).json(formattedBlogs);
  } catch (error) {
    res.status(500).json({ error: 'Server error.' });
  }
};

export const getBlogById = async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId;
    const blogDoc = await Blog.findById(req.params.id).populate('authorId', 'username full_name');

    if (!blogDoc) {
      res.status(404).json({ error: 'Blog not found.' });
      return;
    }

    const blog = blogDoc.toObject();
    const viewsCount = blog.views.length;
    const pingCount = blog.pings.length;

    let hasViewed = false;
    let hasPinged = false;

    if (userId) {
      hasViewed = blog.views.some(viewId => viewId.toString() === userId.toString());
      hasPinged = blog.pings.some(viewId => viewId.toString() === userId.toString())
    }

    delete blog.views;
    delete blog.pings;

    res.status(200).json({
      blog,
      viewsCount,
      hasViewed,
      pingCount,
      hasPinged,
    });
  } catch (error) {
    console.error('Error fetching blog:', error);
    res.status(500).json({ error: 'Server error.' });
  }
};

export const getBlogBySlug = async (req: Request, res: Response) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug }).populate('authorId', 'username full_name');

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

// const hf = new InferenceClient(process.env.HF_TOKEN!);

// export const translateCode = async (req: Request, res: Response) => {
//   const { sourceLang, targetLang, code } = req.body;

//   if (!sourceLang || !targetLang || !code) {
//     res.status(400).json({ error: "sourceLang, targetLang and code are required" });
//     return;
//   }

//   try {
//     const prompt = `Convert the following ${sourceLang} code to ${targetLang}. 
//       Return only the translated code.\n\n${code}`;

//     const response = await hf.textGeneration({
//       model: "codellama/CodeLlama-7b-Instruct-hf",
//       inputs: prompt,
//       parameters: {
//         max_new_tokens: 512,
//         temperature: 0.2,                // lower = more deterministic
//         return_full_text: false          // only generated text
//       }
//     });

//     res.status(200).json({ translatedCode: response.generated_text.trim() });
//   } catch (error: any) {
//     console.error("HF translation error:", error);
//     res.status(500).json({ error: "Failed to translate code" });
//   }
// };


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

export const translateCode = async (req: Request, res: Response) => {
  const { sourceLang, targetLang, code } = req.body;

  if (!sourceLang || !targetLang || !code) {
    res.status(400).json({ error: "sourceLang, targetLang and code are required" });
    return;
  }

  try {
    const prompt = `
      Convert the following ${sourceLang} code to ${targetLang}.
      ⚠️ Important:
      - Output ONLY the translated ${targetLang} code.
      - Do NOT include any explanation, comments, or markdown fences.
      - Keep formatting exactly as valid ${targetLang} code.

      ${code}
      `;

    const result = await model.generateContent(prompt);
    const translated = result.response.text().trim();

    res.status(200).json({ translatedCode: translated });
    return;
  } catch (error: any) {
    console.error("Translation error:", error);
    res.status(500).json({ error: "Failed to translate code" });
    return;
  }
};