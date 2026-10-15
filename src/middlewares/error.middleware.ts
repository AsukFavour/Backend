import type { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { ApiError } from "../utils/apiError.js";

/**
 * Convert known library errors into ApiErrors with the right status code.
 * Anything not recognised becomes a generic 500.
 */
const normalizeError = (err: unknown): ApiError => {
  if (err instanceof ApiError) return err;

  // Mongoose schema validation (e.g. password too short, invalid email)
  if (err instanceof mongoose.Error.ValidationError) {
    const message = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
    return new ApiError(400, message);
  }

  // Invalid ObjectId or wrong type for a field
  if (err instanceof mongoose.Error.CastError) {
    return new ApiError(400, `Invalid value for ${err.path}`);
  }

  // MongoDB duplicate key (unique index), e.g. two signups with the same email at once
  if (typeof err === "object" && err !== null && (err as { code?: unknown }).code === 11000) {
    const keyValue = (err as { keyValue?: Record<string, unknown> }).keyValue ?? {};
    const field = Object.keys(keyValue)[0] ?? "Field";
    return new ApiError(409, `${field} is already in use`);
  }

  // Errors from express.json() etc. (malformed JSON, body too large) carry a 4xx status
  const status = (err as { status?: unknown; statusCode?: unknown })?.status ??
    (err as { statusCode?: unknown })?.statusCode;
  if (typeof status === "number" && status >= 400 && status < 500) {
    const type = (err as { type?: unknown }).type;
    const message = type === "entity.parse.failed" ? "Malformed JSON in request body" : (err as Error).message;
    return new ApiError(status, message);
  }

  // Unknown / programming error
  return new ApiError(500, "Internal Server Error", false);
};

export const notFoundHandler = (req: Request, _res: Response, next: NextFunction) => {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const apiError = normalizeError(err);

  // Always log unexpected errors server-side with the original error
  if (apiError.statusCode >= 500) {
    console.error(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`, err);
  }

  res.status(apiError.statusCode).json({
    success: false,
    message: apiError.message, // generic for 500s, so internals never leak
    ...(process.env.NODE_ENV === "development" &&
      err instanceof Error && { stack: err.stack }),
  });
};
