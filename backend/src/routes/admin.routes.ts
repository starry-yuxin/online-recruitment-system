
import { Router } from "express";
import { authRequired } from "../middleware/auth";
import { requireRole } from "../middleware/rbac";
import { pool } from "../config/db";

// 引入统一返回格式：ok=成功返回，fail=失败返回
import { ok, fail } from "../utils/response";
import { env } from "../config/env";
// Node.js 的 child_process：用来执行系统命令（这里用来调用 mysqldump）
import { execFile } from "child_process";
import fs from "fs";
import path from "path";
const r = Router();

// 只要走到 /api/admin/... 的接口，都必须是管理员
r.use(authRequired, requireRole("admin"));

/** 管理员数据统计：返回岗位数、投递数、新闻数
 */
r.get("/stats", async (_req, res) => {
  const [[jobs]] = await pool.query<any[]>("SELECT COUNT(*) c FROM job_post");
  const [[apps]] = await pool.query<any[]>("SELECT COUNT(*) c FROM application");
  const [[news]] = await pool.query<any[]>("SELECT COUNT(*) c FROM news");
  // 统一成功返回，把查询结果打包成对象
  ok(res, { jobs: jobs.c, applications: apps.c, news: news.c });
});

/**
 * 备份数据库：调用系统 mysqldump 命令，把导出的 SQL 存成文件
 */
r.post("/backup", async (_req, res) => {
  try {
    // 确保备份目录存在
    fs.mkdirSync(env.BACKUP_DIR, { recursive: true });

    // 生成备份文件名：backup_2025-12-29Txx-xx-xx-xxxZ.sql
    // replace(/[:.]/g, "-") 是为了把文件名里不适合的字符替换掉
    const filename = `backup_${new Date().toISOString().replace(/[:.]/g, "-")}.sql`;

    // 拼出备份文件保存的完整路径
    const outPath = path.join(env.BACKUP_DIR, filename);

    
    execFile(
      "mysqldump", // 要执行的命令
      [
        "-h", env.DB_HOST,                // 数据库地址
        "-u", env.DB_USER,                // 数据库用户名
        `-p${env.DB_PASSWORD}`,           // 数据库密码
        env.DB_NAME                       // 数据库名
      ],
      {
        maxBuffer: 1024 * 1024 * 50
      },
      (err, stdout) => {
        // 如果命令执行失败（比如没装 mysqldump / 密码错 / 无权限）
        if (err) return fail(res, "mysqldump failed (check PATH/password)", 500);

        fs.writeFileSync(outPath, stdout, "utf8");

        // 返回成功，并告诉前端生成了哪个文件
        ok(res, { file: filename }, "backup created");
      }
    );
  } catch {
    // 任何异常（创建目录失败、写文件失败等）都返回 500
    fail(res, "backup failed", 500);
  }
});


r.get("/charts/cities", async (_req, res) => {
  const [rows] = await pool.query<any[]>(
    `SELECT city, COUNT(*) AS c
     FROM job_post
     GROUP BY city
     ORDER BY c DESC
     LIMIT 5`
  );

  ok(res, rows);
});

/**
 * 统计最近 N 天，每天的投递数量（趋势图用）
 */
r.get("/charts/app_trend", async (req, res) => {
  // 同时做一个范围限制：最少 7 天，最多 60 天，防止查询太大
  const days = Math.min(60, Math.max(7, Number(req.query.days || 14)));


  const [rows] = await pool.query<any[]>(
    `SELECT DATE(apply_time) AS d, COUNT(*) AS c
     FROM application
     WHERE apply_time >= DATE_SUB(CURDATE(), INTERVAL :days DAY)
     GROUP BY DATE(apply_time)
     ORDER BY d ASC`,
    { days } // 把 days 作为命名参数传入 SQL（:days）
  );


  ok(res, { days, points: rows });
});
export default r;
