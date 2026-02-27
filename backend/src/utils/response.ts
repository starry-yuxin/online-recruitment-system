import { Response } from "express";

export function ok(res: Response, data: any = null, message = "ok") {
  return res.json({ success: true, message, data });
}
export function fail(res: Response, message = "error", code = 400) {
  return res.status(code).json({ success: false, message });
}
