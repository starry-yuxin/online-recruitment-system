import jwt from "jsonwebtoken";
import { env } from "../config/env";

export type JwtPayload = { uid: number; role: "admin" | "company" | "user" };

export function signToken(payload: JwtPayload) {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
}
