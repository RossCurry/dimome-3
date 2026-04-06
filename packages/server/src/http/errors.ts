import type { Response } from "express";

export type ApiErrorBody = {
  error: {
    code: string;
    message: string;
  };
};

export function sendError(
  res: Response,
  status: number,
  code: string,
  message: string,
): void {
  const body: ApiErrorBody = { error: { code, message } };
  res.status(status).json(body);
}

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "HttpError";
  }
}
