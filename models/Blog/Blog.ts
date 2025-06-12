import mongoose, { Schema, Document } from 'mongoose';

interface Item {
  type: 'content' | 'bullet' | 'image';
  value: string;
}

interface Section {
  header?: string;
  items: Item[];
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
  createdAt: Date;
  updatedAt: Date;
}

const ItemSchema = new Schema<Item>({
  type: { type: String, enum: ['content', 'bullet', 'image'], required: true },
  value: { type: String, required: true },
});

const SectionSchema = new Schema<Section>({
  header: { type: String },
  items: { type: [ItemSchema], required: true },
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
  },
  { timestamps: true }
);

// Slug generator function
const generateSlug = (title: string): string => {
  return title.trim().toLowerCase().replace(/\s+/g, '-');
};

// Pre-save hook to set the slug
BlogSchema.pre<IBlog>('save', function (next) {
  this.slug = generateSlug(this.title);
  next();
});

export default mongoose.model<IBlog>('Blog', BlogSchema);
