import { Request, Response, NextFunction } from "express"; 

export function errorHandler(
  err: any,          // 捕获到的错误对象
  _req: Request,     // 请求对象
  res: Response,     // 响应对象
  _next: NextFunction // 下一步中间件（这里也没用到）
) {
  console.error(err); // 把错误打印到控制台，方便调试
  res
    .status(500) 
    .json({ success: false, message: "Internal Server Error" }); 
}
