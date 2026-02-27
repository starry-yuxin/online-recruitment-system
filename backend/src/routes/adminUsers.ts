
import { Router } from "express";
import { pool } from "../config/db";
import { ok, fail } from "../utils/response";
import { authRequired } from "../middleware/auth";
import { requireRole } from "../middleware/rbac";

const r = Router();


r.get("/admin/users", authRequired, requireRole("admin"), async (req, res) => {
  // 从 accounts 表里查询所有 role='user' 的账号（个人用户）
  const [rows] = await pool.query<any[]>(
    `SELECT id, username, role, status
     FROM accounts
     WHERE role='user'
     ORDER BY id DESC`
  );

  return ok(res, rows);
});

/**
 * PUT /api/admin/users/:id/status
 * 管理员修改某个个人用户账号的状态（启用/禁用）
 */
r.put(
  "/admin/users/:id/status",
  authRequired,
  requireRole("admin"),
  async (req, res) => {
    // 从 URL 参数里拿到用户 id
    const id = Number(req.params.id);
    if (!id) return fail(res, "bad id");

    const status = String((req as any).body?.status || "");

    if (!["active", "disabled"].includes(status)) return fail(res, "bad status");

    // 更新 accounts 表：把该用户的 status 改为传入的值
    await pool.query("UPDATE accounts SET status=:s WHERE id=:id AND role='user'", {
      s: status, 
      id       
    });

    return ok(res, null, "updated");
  }
);

export default r;
