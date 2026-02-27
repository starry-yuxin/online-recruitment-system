import { Response, NextFunction } from "express"; 
import { AuthedRequest } from "./auth"; 
import { fail } from "../utils/response"; 

export function requireRole(...roles: Array<"admin" | "company" | "user">) {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    // 如果还没登录（req.user 不存在）
    if (!req.user) return fail(res, "Unauthorized", 401);

    // 如果登录了，但角色不在允许的角色列表里
    if (!roles.includes(req.user.role)) return fail(res, "Forbidden", 403);

    // 校验通过，放行
    next();
  };
}
