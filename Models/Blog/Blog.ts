import mongoose, { Schema, Document } from 'mongoose';

interface Item {
  type: 'content' | 'bullet' | 'image' | 'code';
  value?: string;
  language?: string;
  theme?: string;
  imageUrl?: string;
  imageAlt?: string;
  align?: 'left' | 'center' | 'right';
  expanded?: boolean;
}


interface Section {
  header?: string;
  items: Item[];
}

interface Comment {
  userId: mongoose.Types.ObjectId;
  username: string;
  text: string;
  createdAt: Date;
}

export interface IBlog extends Document {
  title: string;
  slug: string;
  author: string;
  authorId: mongoose.Types.ObjectId;
  sections: Section[];
  tags: string[];
  coverImage?: string;
  isPublished: boolean;
  publishedAt?: Date;
  pings: mongoose.Types.ObjectId[]; // Users who "pinged" the blog
  views: mongoose.Types.ObjectId[];
  comments: Comment[];
  isActive:boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ItemSchema = new Schema<Item>({
  type: { type: String, enum: ['content', 'bullet', 'image', 'code'], required: true },
  value: { type: String, required: function (this: Item) { return this.type !== 'image'; } },
  language: {
    type: String,
    required: function (this: Item) {
      return this.type === 'code';
    },
  },
  theme: {
    type: String,
    required: function (this: Item) {
      return this.type === 'code';
    },
  },
  imageUrl: { type: String },
  imageAlt: { type: String },
  align: { type: String, enum: ['start', 'center', 'end'], default: 'center' },
  expanded: { type: Boolean, default: false },
});


const SectionSchema = new Schema<Section>({
  header: { type: String },
  items: { type: [ItemSchema], required: true },
});

const CommentSchema = new Schema<Comment>({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  username: { type: String, required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const BlogSchema = new Schema<IBlog>(
  {
    title: { type: String, required: true },
    slug: { type: String, unique: true },
    author: { type: String, required: true },
    authorId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    sections: { type: [SectionSchema], required: true },
    tags: { type: [String], default: [] },
    coverImage: { type: String },
    isPublished: { type: Boolean, default: false },
    publishedAt: { type: Date },
    pings: { type: [mongoose.Schema.Types.ObjectId], default: [], ref: 'User' },
    views: { type: [mongoose.Schema.Types.ObjectId], default: [], ref: 'User' },
    comments: { type: [CommentSchema], default: [] },
    isActive:{type:Boolean,default:true},
  },
  { timestamps: true }
);

// Improved slug generator
const generateSlug = (title: string): string => {
    return title.trim().toLowerCase()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-')     // Replace spaces with hyphens
        .replace(/--+/g, '-')     // Remove duplicate hyphens
        .substring(0, 75);        // Optional: limit slug length
};

// Pre-save hook with uniqueness check
BlogSchema.pre<IBlog>('save', async function (next) {
    if (this.isModified('title') || !this.slug) {
        let baseSlug = generateSlug(this.title);
        let slug = baseSlug;
        let counter = 1;

        // Check if slug already exists
        while (await mongoose.models.Blog.findOne({ slug })) {
            slug = `${baseSlug}-${counter++}`;
        }

        this.slug = slug;
    }
    next();
});

export default mongoose.model<IBlog>('Blog', BlogSchema);
