import mongoose, { Schema, Document } from "mongoose";

export interface IContest extends Document {
  title: string;
  desc: string;
  slug: string;
  startDate: Date;
  endDate?: Date;
  limit: number;
  languages: string[];
  rounds: number;
  type: "contest" | "tournament";
  duration: number;
  rated: boolean;
  host: {
    name: string;
    meta: Record<string, any>;
  };
  registrationDeadline: Date;
  status: "upcoming" | "running" | "completed" | "cancelled";
  visibility: "public" | "private";
  rules: string;
  tags: string[];
  questions_tags: string[];
  backdrop?: string;
  approved?:boolean;
  createdAt: Date;
  updatedAt: Date;
}

const HostSchema = new Schema({
  name: { type: String },
  meta: { type: Object, default: {} },
});

const ContestSchema = new Schema<IContest>(
  {
    title: { type: String, required: true },
    desc: { type: String, default: "" },
    slug: { type: String, unique: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    limit: { type: Number, default: 100 },
    languages: { type: [String], default: [] },
    rounds: { type: Number, default: 3 },
    type: { type: String, enum: ["contest", "tournament"], required: true },
    duration: { type: Number, required: true },
    rated: { type: Boolean, default: false },
    host: { type: HostSchema, default: { name: "System", meta: {} } },
    registrationDeadline: { type: Date, required: true },
    status: {
      type: String,
      enum: ["upcoming", "running", "completed", "cancelled"],
      default: "upcoming",
    },
    visibility: { type: String, enum: ["public", "private"], default: "public" },
    rules: { type: String, default: "" },
    tags: { type: [String], default: ["competitive-programming"], },
    questions_tags: { type: [String], default: ["algorithms", "data-structures", "maths"], },
    backdrop: { type: String, default: "" },
    approved: {type:Boolean, default:false}
  },
  { timestamps: true }
);

// 🔗 Slug generator
export const generateSlug = (title: string): string => {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, "") // remove special chars like #, !, etc.
    .replace(/\s+/g, "-")     // spaces → hyphens
    .replace(/--+/g, "-");    // collapse multiple hyphens
};

// 🧠 Pre-save hook for unique slug
ContestSchema.pre("save", async function (next) {
  if (this.isModified("title") || !this.slug) {
    let baseSlug = generateSlug(this.title);
    let slug = baseSlug;
    let counter = 1;

    // Ensure uniqueness
    while (await mongoose.models.Contest.findOne({ slug })) {
      slug = `${baseSlug}-${counter++}`;
    }

    this.slug = slug;
  }
  next();
});

export default mongoose.model<IContest>("Contest", ContestSchema);
