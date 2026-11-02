import type { Request, Response, NextFunction } from "express";

export interface CustomHttpError extends Error {
  status?: number;
  statusCode?: number;
}

export function errorHandler(
  err: CustomHttpError,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "An unexpected internal server error occurred.";

  console.error("❌ Backend Error:", {
    status,
    message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });

  res.status(status).json({
    error: err.name || "ServerError",
    message,
    status,
    timestamp: new Date().toISOString(),
  });
}
