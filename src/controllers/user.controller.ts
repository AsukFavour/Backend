import type { Request, Response } from "express";
import * as userService from "../services/user.service.js";
import { ApiError } from "../utils/apiError.js";

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

// POST /api/users/register
export const register = async (req: Request, res: Response) => {
  const { username, email, password } = req.body ?? {};
  if (!isNonEmptyString(username) || !isNonEmptyString(email) || !isNonEmptyString(password)) {
    throw new ApiError(400, "username, email and password are required and must be strings");
  }

  const user = await userService.registerUser({ username, email, password });
  res.status(201).json({ success: true, message: "User registered", data: user });
};

// POST /api/users/login
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body ?? {};
  if (!isNonEmptyString(email) || !isNonEmptyString(password)) {
    throw new ApiError(400, "email and password are required and must be strings");
  }

  const user = await userService.loginUser({ email, password });
  res.status(200).json({ success: true, message: "Login successful", data: user });
};

// POST /api/users/logout
export const logout = async (req: Request, res: Response) => {
  const { email  } = req.body ?? {};
  if (!isNonEmptyString(email)) {
    throw new ApiError(400, "email is required and must be a string");
  }

  const user = await userService.logoutUser({ email });
  res.status(200).json({ success: true, message: "Logout successful", data: user });
};

// GET /api/users
export const getAllUsers = async (_req: Request, res: Response) => {
  const users = await userService.getAllUsers();
  res.status(200).json({ success: true, data: users });
};

// GET /api/users/:id
export const getUserById = async (req: Request<{ id: string }>, res: Response) => {
  const user = await userService.getUserById(req.params.id);
  res.status(200).json({ success: true, data: user });
};
