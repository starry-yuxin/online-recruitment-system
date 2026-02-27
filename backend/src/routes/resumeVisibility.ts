
import { Router } from "express";
import { pool } from "../config/db";
import { ok, fail } from "../utils/response";
import { authRequired } from "../middleware/auth";
import { requireRole } from "../middleware/rbac";
const r = Router();

/**
 * GET /api/resume/visibility
 * 作用：返回当前登录用户“最新一份简历”的可见性状态（resume.status）
 */
r.get("/resume/visibility", authRequired, requireRole("user"), async (req: any, res) => {
  const userId = req.user.uid;

  // 查询该用户的“最新一份简历”
  const [rows] = await pool.query<any[]>(
    "SELECT id, status FROM resume WHERE user_id=:uid ORDER BY publish_time DESC LIMIT 1",
    { uid: userId }
  );

  if (!rows.length) return ok(res, { status: "private" });
  return ok(res, { status: rows[0].status || "private" });
});

/**
 * PUT /api/resume/visibility
 */
r.put("/resume/visibility", authRequired, requireRole("user"), async (req: any, res) => {
  const userId = req.user.uid;
  const status = String(req.body?.status || "");

  if (!["public", "private"].includes(status)) {
    return fail(res, "bad status");
  }

  // 先找到“最新一份简历”的 id
  const [rows] = await pool.query<any[]>(
    "SELECT id FROM resume WHERE user_id=:uid ORDER BY publish_time DESC LIMIT 1",
    { uid: userId }
  );

  // 没有简历就没法更新，返回 404
  if (!rows.length) return fail(res, "resume not found", 404);

  // 根据简历 id 更新 status
  await pool.query(
    "UPDATE resume SET status=:s WHERE id=:id",
    { s: status, id: rows[0].id }
  );

  // 返回更新成功
  return ok(res, null, "updated");
});

export default r;
