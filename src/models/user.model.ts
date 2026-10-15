import { Schema, model, type HydratedDocument } from "mongoose";
import bcrypt from "bcrypt";
import type { IUser, IUserMethods, UserModel } from "../types/user.types.js";

const SALT_ROUNDS = 10;

export type UserDocument = HydratedDocument<IUser, IUserMethods>;

const userSchema = new Schema<IUser, UserModel, IUserMethods>(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: [3, "Username must be at least 3 characters"],
      maxlength: [30, "Username must be at most 30 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false, // never returned in queries unless explicitly requested
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  }
);

// Expose `id` instead of `_id` and strip internal fields in JSON responses
userSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    const { _id, password, ...rest } = ret;
    return rest;
  },
});

// Hash the password whenever it is created or changed
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, SALT_ROUNDS);
});

// Check a plain-text password against the stored hash.
// Note: the user must be loaded with .select("+password") for this to work.
userSchema.methods.comparePassword = function (candidate: string) {
  return bcrypt.compare(candidate, this.password);
};

export const User = model<IUser, UserModel>("User", userSchema);
