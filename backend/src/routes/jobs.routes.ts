
import { Router } from "express";
import { pool } from "../config/db";
import { ok, fail } from "../utils/response";
import { authRequired } from "../middleware/auth";
import { requireRole } from "../middleware/rbac";

const r = Router();

/**
 * GET /api/jobs?city=&keyword=&page=1&pageSize=10
 * 公共端：岗位列表（支持筛选 + 分页）
 */
r.get("/", async (req, res) => {

  const city = String(req.query.city || "");
  const keyword = String(req.query.keyword || "");

  const page = Math.max(1, Number(req.query.page || 1));
  const pageSize = Math.min(50, Math.max(1, Number(req.query.pageSize || 10)));

  
  const offset = (page - 1) * pageSize;

  const where: string[] = ["j.status='open'"];

  const params: any = { limit: pageSize, offset };

  if (city) {
    where.push("j.city = :city");
    params.city = city;
  }

  
  if (keyword) {
    where.push("j.position LIKE :kw");
    params.kw = `%${keyword}%`;
  }

  
  const w = where.length ? `WHERE ${where.join(" AND ")}` : "";

 
  const [list] = await pool.query<any[]>(
    `SELECT j.id, j.position, j.city, j.headcount, j.publish_time, j.view_count,
            cp.company_name, cp.company_type
     FROM job_post j
     JOIN company_profile cp ON cp.company_id=j.company_id
     ${w}
     ORDER BY j.publish_time DESC
     LIMIT :limit OFFSET :offset`,
    params
  );

  
  const countParams: any = {};
  if (params.city) countParams.city = params.city;
  if (params.kw) countParams.kw = params.kw;

  const [cnt] = await pool.query<any[]>(
    `SELECT COUNT(*) AS c
     FROM job_post j
     ${w}`,
    countParams
  );
  return ok(res, { list, total: cnt[0].c, page, pageSize });
});

/**
 * GET /api/jobs/mine   (company)
 * 企业端：查看“我发布的岗位列表”（分页）
 */
r.get("/mine", authRequired, requireRole("company"), async (req: any, res) => {
  const cid = Number(req.user?.uid ?? req.user?.id);
  if (!cid) return fail(res, "bad company id");

  // 分页参数
  const page = Math.max(1, Number(req.query.page || 1));
  const pageSize = Math.min(50, Math.max(1, Number(req.query.pageSize || 10)));
  const offset = (page - 1) * pageSize;

  // 查询“本企业发布的岗位”，不限制 open/close（企业管理端要看到全部状态）
  const [list] = await pool.query<any[]>(
    `SELECT id, position, city, headcount, status, publish_time, view_count, description, company_id
     FROM job_post
     WHERE company_id=:cid
     ORDER BY publish_time DESC
     LIMIT :limit OFFSET :offset`,
    { cid, limit: pageSize, offset }
  );

  // 统计本企业岗位总数
  const [cnt] = await pool.query<any[]>(
    `SELECT COUNT(*) AS c FROM job_post WHERE company_id=:cid`,
    { cid }
  );

  return ok(res, { list, total: cnt[0].c, page, pageSize });
});

/**
 * GET /api/jobs/:id
 * 公共端：岗位详情
 */
r.get("/:id", async (req, res) => {
  // 读取岗位 id
  const id = Number(req.params.id);
  if (!id) return fail(res, "bad id");

  // 访问一次详情，浏览量 +1
  await pool.query("UPDATE job_post SET view_count=view_count+1 WHERE id=:id", { id });

  // 查询岗位详情 + 公司信息（join company_profile）
  const [rows] = await pool.query<any[]>(
    `SELECT
        j.id,
        j.company_id,
        j.position,
        j.headcount,
        j.city,
        j.description,
        j.publish_time,
        j.view_count,
        j.status,

        cp.company_name,
        cp.company_type,
        cp.email        AS company_email,
        cp.phone        AS company_phone,
        cp.address      AS company_address,
        cp.zip_code     AS company_zip,
        cp.logo_url
     FROM job_post j
     LEFT JOIN company_profile cp ON cp.company_id = j.company_id
     WHERE j.id = :id
     LIMIT 1`,
    { id }
  );

  if (!rows.length) return fail(res, "not found", 404);

  return ok(res, rows[0]);
});

/**
 * POST /api/jobs   (company)
 * 企业发布岗位
 */
r.post("/", authRequired, requireRole("company"), async (req: any, res) => {
  const { position, headcount, city, description } = req.body || {};

  
  if (!position || !city || !description) return fail(res, "missing fields");

  const companyId = Number(req.user?.uid ?? req.user?.id);
  if (!companyId) return fail(res, "bad company id");

  
  const [ret] = await pool.query<any>(
    "INSERT INTO job_post(company_id, position, headcount, city, description) VALUES(:cid,:p,:h,:c,:d)",
    { cid: companyId, p: position, h: headcount || 1, c: city, d: description }
  );

  return ok(res, { id: ret.insertId }, "created");
});

/**
 * PUT /api/jobs/:id   (company)
 * 企业编辑岗位（只能编辑自己发布的）

 */
r.put("/:id", authRequired, requireRole("company"), async (req: any, res) => {

  const cid = Number(req.user?.uid ?? req.user?.id);

  const id = Number(req.params.id);

  const { position, headcount, city, description, status } = req.body || {};

  if (!id) return fail(res, "bad id");
  if (!cid) return fail(res, "bad company id");

  const [own] = await pool.query<any[]>(
    "SELECT id FROM job_post WHERE id=:id AND company_id=:cid LIMIT 1",
    { id, cid }
  );
  if (!own.length) return fail(res, "not found", 404);

  // 更新岗位：
  // COALESCE(:p, position) 意思是：如果传了新值就用新值；没传就保持原值
  await pool.query(
    `UPDATE job_post SET
      position = COALESCE(:p, position),
      headcount = COALESCE(:h, headcount),
      city = COALESCE(:c, city),
      description = COALESCE(:d, description),
      status = COALESCE(:s, status)
     WHERE id=:id`,
    {
      id,
      p: position ?? null,
      h: headcount ?? null,
      c: city ?? null,
      d: description ?? null,
      s: status ?? null
    }
  );


  return ok(res, null, "updated");
});

/**
 * DELETE /api/jobs/:id   (company)
 * 企业删除岗位（只能删除自己发布的）

 */
r.delete("/:id", authRequired, requireRole("company"), async (req: any, res) => {

  const cid = Number(req.user?.uid ?? req.user?.id);

  const id = Number(req.params.id);

  if (!id) return fail(res, "bad id");
  if (!cid) return fail(res, "bad company id");

  const [own] = await pool.query<any[]>(
    "SELECT id FROM job_post WHERE id=:id AND company_id=:cid LIMIT 1",
    { id, cid }
  );
  if (!own.length) return fail(res, "not found", 404);


  await pool.query("DELETE FROM job_post WHERE id=:id", { id });

 
  return ok(res, null, "deleted");
});

export default r;
