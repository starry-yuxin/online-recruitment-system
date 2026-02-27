
import { Router } from "express";
import { pool } from "../config/db";
import { ok, fail } from "../utils/response";
import { authRequired } from "../middleware/auth";
import { requireRole } from "../middleware/rbac";
const r = Router();

/**
 * GET /api/admin/companies
 * - 必须登录（authRequired）
 * - 并且必须是 admin 角色（requireRole("admin")）
 */
r.get("/admin/companies", authRequired, requireRole("admin"), async (_req, res) => {
  // 查询企业账号 + 企业资料（company_profile）
  const [rows] = await pool.query<any[]>(
    `SELECT 
        a.id, a.username, a.status,                 
        cp.company_name, cp.company_type,           
        cp.email, cp.phone,                        
        cp.address, cp.zip_code,                    
        cp.logo_url                                
     FROM accounts a
     LEFT JOIN company_profile cp ON cp.company_id = a.id
     -- LEFT JOIN 的意思：即使某个企业账号还没完善 company_profile，也能查出来
     WHERE a.role='company'
     -- 只查角色是 company 的账号
     ORDER BY a.id DESC`
  );

  // 返回企业列表数据给前端
  return ok(res, rows);
});


r.put(
  "/admin/companies/:id/status",
  authRequired,
  requireRole("admin"),
  async (req, res) => {
    const id = Number(req.params.id);
    if (!id) return fail(res, "bad id");

    // 从请求体里拿 status
    const status = String((req as any).body?.status || "");
    if (!["active", "disabled"].includes(status)) return fail(res, "bad status");

    // 更新 accounts 表中的 status
    // 并且加上 role='company'：防止误把管理员/普通用户账号也改了
    await pool.query(
      "UPDATE accounts SET status=:s WHERE id=:id AND role='company'",
      { s: status, id }
    );

    return ok(res, null, "updated");
  }
);

export default r;
