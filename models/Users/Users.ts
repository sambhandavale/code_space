import mongoose, { Document, Model } from "mongoose";
import { ObjectId } from "mongoose";
import crypto from "crypto";

export interface IUser {
    _id?: ObjectId;
    user_photo?: string;
    first_name?: string;
    last_name?: string;
    gender?: string;
    mobile_number?: number;
    email: string;
    username: string;
    hashed_password: string;
    salt?: string;
    bod?: string;
    role?: string;
    authenticate: (plainText: string) => boolean;
    encryptPassword: (password: string) => string;
    makeSalt: () => string;
}

const UserSchema = new mongoose.Schema<IUser>(
    {
        first_name: { type: String, trim: true },
        last_name: { type: String, trim: true },
        gender: { type: String, enum: ["m", "f"] },
        user_photo: { type: String, default: "default.png" },
        bod: String,
        hashed_password: { type: String },
        salt: { type: String },
        email: { type: String, lowercase: true, unique: true },
        username: { type: String, required: true, lowercase: true, trim: true, unique: true },
        mobile_number: { type: Number },
        role: { type: String, enum: ["user", "admin", "tester"], default: "user" },
    },
    { timestamps: true }
);

UserSchema.virtual("password")
    .set(function (this: any, password: string) {
        this._password = password;
        this.salt = UserModel.schema.methods.makeSalt();
        this.hashed_password = UserModel.schema.methods.encryptPassword.call(this, password);
    })
    .get(function (this: any) {
        return this._password;
    });

UserSchema.virtual("full_name")
    .get(function (this: IUser) {
        return `${this.first_name || ""} ${this.last_name || ""}`.trim();
    }); 

UserSchema.set('toObject', { virtuals: true });
UserSchema.set('toJSON', { virtuals: true });

UserSchema.pre("save", function (next) {
  if (this.isModified("username") && typeof this.username === "string") {
    this.username = this.username.trim().toLowerCase();
  }

  if (this.isModified("email") && typeof this.email === "string") {
    this.email = this.email.trim().toLowerCase();
  }

  next();
});


UserSchema.methods = {
    authenticate: function (this: IUser, plainText: string): boolean {
        return this.encryptPassword(plainText) === this.hashed_password;
    },

    encryptPassword: function (this: IUser, password: string): string {
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

UserSchema.set("toJSON", { virtuals: true });

const UserModel = mongoose.model<IUser>("User", UserSchema) as Model<IUser>;

export default UserModel; 
