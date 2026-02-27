import express from "express";
import cors from "cors";
import path from "path";
import { env } from "./config/env";
import routes from "./routes";
import { errorHandler } from "./middleware/error";

export function createApp() {
  const app = express();

  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true }));

  // ✅ 静态封面目录：优先用 env.UPLOAD_DIR；没有则默认 <项目根>/uploads
  // - env.UPLOAD_DIR 可能是绝对路径，也可能是相对路径
  // - 用 process.cwd() 作为基准最稳（ts-node / dist 都适用）
  const uploadDirFromEnv = (env as any)?.UPLOAD_DIR as string | undefined;
  const uploadDir = uploadDirFromEnv
    ? (path.isAbsolute(uploadDirFromEnv)
        ? uploadDirFromEnv
        : path.join(process.cwd(), uploadDirFromEnv))
    : path.join(process.cwd(), "uploads");

  app.use("/uploads", express.static(uploadDir));
  console.log("[static] /uploads =>", uploadDir);

  app.get("/health", (_req, res) => res.json({ ok: true }));

  app.use("/api", routes);

  app.use(errorHandler);
  return app;
}
