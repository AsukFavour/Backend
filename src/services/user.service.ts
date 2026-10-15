import { isValidObjectId } from "mongoose";
import { User, type UserDocument } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";

export interface RegisterUserInput {
  username: string;
  email: string;
  password: string;
}

export interface LoginUserInput {
  email: string;
  password: string;
}

export interface LogoutUserInput {
  email: string;
}

/**
 * Create a new user. The password is hashed by the model's pre-save hook.
 */
export const registerUser = async (
  input: RegisterUserInput
): Promise<UserDocument> => {
  const email = input.email.trim().toLowerCase();
  const username = input.username.trim().toLowerCase();

  const existing = await User.findOne({ $or: [{ email }, { username }] });
  if (existing) {
    const field = existing.email === email ? "Email" : "Username";
    throw new ApiError(409, `${field} is already in use`);
  }

  return User.create({ username, email, password: input.password });
};

/**
 * Verify email + password. Returns the user on success.
 * Uses the same error for "no user" and "wrong password" so attackers
 * can't tell which emails are registered.
 */
export const loginUser = async (input: LoginUserInput): Promise<UserDocument> => {
  const email = input.email.trim().toLowerCase();

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.comparePassword(input.password))) {
    throw new ApiError(401, "Invalid email or password");
  }

  return user;
};



export const logoutUser = async (input: LogoutUserInput): Promise<UserDocument> => {
  const email = input.email.trim().toLowerCase();

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(401, "Logout failed");
  }

  return user;
};

/**
 * Find a single user by id.
 */
export const getUserById = async (id: string): Promise<UserDocument> => {
  if (!isValidObjectId(id)) {
    throw new ApiError(400, "Invalid user id");
  }

  const user = await User.findById(id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return user;
};

/**
 * List all users, newest first.
 */
export const getAllUsers = async (): Promise<UserDocument[]> => {
  return User.find().sort({ createdAt: -1 });
};
