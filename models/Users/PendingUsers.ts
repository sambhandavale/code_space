import mongoose, { Document, Model } from "mongoose";
import { ObjectId } from "mongoose";
import crypto from "crypto";

export interface IPendingUser {
  _id?: ObjectId;
  first_name?: string;
  last_name?: string;
  email: string;
  username: string;
  hashed_password: string;
  salt?: string;
  token: string;
  expiresAt: Date;
  password?: string; // virtual
  authenticate: (plainText: string) => boolean;
  encryptPassword: (password: string) => string;
  makeSalt: () => string;
}

const PendingUserSchema = new mongoose.Schema<IPendingUser>(
  {
    first_name: { type: String, trim: true },
    last_name: { type: String, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true, unique: true },
    username: { type: String, required: true, lowercase: true, trim: true, unique: true },
    hashed_password: { type: String, required: true },
    salt: { type: String, required: true },
    token: { type: String, required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

// Virtual password
PendingUserSchema.virtual("password")
  .set(function (this: any, password: string) {
    this._password = password;
    this.salt = PendingUserModel.schema.methods.makeSalt();
    this.hashed_password = PendingUserModel.schema.methods.encryptPassword.call(this, password);
  })
  .get(function (this: any) {
    return this._password;
  });

// Virtual full_name
PendingUserSchema.virtual("full_name").get(function (this: IPendingUser) {
  return `${this.first_name || ""} ${this.last_name || ""}`.trim();
});

PendingUserSchema.set("toObject", { virtuals: true });
PendingUserSchema.set("toJSON", { virtuals: true });

// Pre-save sanitization
PendingUserSchema.pre("save", function (next) {
  if (this.isModified("username") && typeof this.username === "string") {
    this.username = this.username.trim().toLowerCase();
  }

  if (this.isModified("email") && typeof this.email === "string") {
    this.email = this.email.trim().toLowerCase();
  }

  next();
});

// Methods
PendingUserSchema.methods = {
  authenticate: function (this: IPendingUser, plainText: string): boolean {
    return this.encryptPassword(plainText) === this.hashed_password;
  },

  encryptPassword: function (this: IPendingUser, password: string): string {
    if (!password) return "";
    try {
      return crypto.createHmac("sha1", this.salt!).update(password).digest("hex");
    } catch (err) {
      return "";
    }
  },

  makeSalt: function (): string {
    return Math.round(new Date().valueOf() * Math.random()) + "";
  },
};

const PendingUserModel = mongoose.model<IPendingUser>("PendingUser", PendingUserSchema) as Model<IPendingUser>;

export default PendingUserModel;
