import { Request, Response, NextFunction } from "express"; 
import { fail } from "../utils/response"; // 统一的失败返回格式
import { verifyToken, JwtPayload } from "../utils/jwt"; // 验证 JWT 的函数 + token 解出来的数据类型

// 扩展 Express 的 Request：多加一个 user 字段，用来存放解析后的登录信息
export interface AuthedRequest extends Request {
  user?: JwtPayload;
}

// 登录校验中间件：需要登录的接口都可以先走它
export function authRequired(req: AuthedRequest, res: Response, next: NextFunction) {
  const h = req.headers.authorization || ""; 
  const token = h.startsWith("Bearer ") ? h.slice(7) : ""; 
  if (!token) return fail(res, "Unauthorized", 401); 

  try {
    req.user = verifyToken(token); 
    next(); 
  } catch {
    return fail(res, "Invalid token", 401); // token 无效/过期/伪造
  }
}
