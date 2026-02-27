
import { Router } from "express";
import { pool } from "../config/db";
import { ok, fail } from "../utils/response";

const r = Router();

/**
 * GET /api/companies/:id （公共端接口，不需要登录）
 * 用途：给“岗位详情页 / 公司主页”展示企业信息
 */
r.get("/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (!id) return fail(res, "bad id");

  // 查询 company_profile 表：根据 company_id 找到对应的公司资料
  const [rows] = await pool.query<any[]>(
    "SELECT * FROM company_profile WHERE company_id=:id LIMIT 1",
    { id }
  );

  if (!rows.length) return fail(res, "company not found", 404);


  return ok(res, rows[0]);
});


export default r;
