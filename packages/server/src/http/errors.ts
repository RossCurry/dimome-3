import type { NextFunction, Response, Request } from "express";

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

/**
 * Use later to register http errors elsewhere in the code.
 */
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
export function defaultErrorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  next: NextFunction,
){
  if (err instanceof HttpError) {
    sendError(res, err.status, err.code, err.message);
    return;
  }
  next(err);
}