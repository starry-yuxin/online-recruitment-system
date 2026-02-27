
import { Router } from "express";
import { pool } from "../config/db";
import { ok, fail } from "../utils/response";
import { authRequired } from "../middleware/auth";
import { requireRole } from "../middleware/rbac";

const r = Router();


r.post("/", authRequired, requireRole("user"), async (req: any, res) => {
  // 从 token 解析出来的登录用户 id
  const uid = req.user.uid;
  // 从请求体里拿到岗位 id，并转成数字
  const jobId = Number(req.body?.job_post_id);

  if (!jobId) return fail(res, "missing job_post_id");

  const [job] = await pool.query<any[]>(
    "SELECT company_id FROM job_post WHERE id=:id",
    { id: jobId }
  );

 
  if (!job.length) return fail(res, "job not found", 404);

  const companyId = job[0].company_id;

  //  检查该用户是否已经创建简历（没有简历不允许投递）
  const [resume] = await pool.query<any[]>(
    "SELECT id FROM resume WHERE user_id=:uid LIMIT 1",
    { uid }
  );

  if (!resume.length) return fail(res, "Please create resume first", 400);

  try {
    // 插入一条投递记录到 application 表
    const [ret] = await pool.query<any>(
      "INSERT INTO application(user_id, company_id, job_post_id, resume_id) VALUES(:u,:c,:j,:r)",
      { u: uid, c: companyId, j: jobId, r: resume[0].id }
    );

    // 插入成功：返回新投递记录的 id
    return ok(res, { id: ret.insertId }, "applied");
  } catch (e: any) {
    return fail(res, "You have already applied this job", 400);
  }
});

/** 
 * 个人用户查看“我投递过的记录”
 */
r.get("/me", authRequired, requireRole("user"), async (req: any, res) => {
  // 当前登录用户 id
  const uid = req.user.uid;

  // 从视图 v_application_detail 查询投递详情
  const [rows] = await pool.query<any[]>(
    "SELECT * FROM v_application_detail WHERE user_id=:uid ORDER BY apply_time DESC",
    { uid }
  );

  return ok(res, rows);
});

/** 
 * GET /api/applications/company
 * 企业查看“投递到我公司”的投递列表
 */
r.get("/company", authRequired, requireRole("company"), async (req: any, res) => {
  // 企业账号的 uid
  const cid = req.user.uid;

  const status = String(req.query.status || "");

  const where = status ? "AND status=:s" : "";

  const params: any = { cid };
  if (status) params.s = status;

  // 查询视图 v_application_detail：只看 company_id = 当前企业
  const [rows] = await pool.query<any[]>(
    `SELECT * FROM v_application_detail WHERE company_id=:cid ${where} ORDER BY apply_time DESC`,
    params
  );

  return ok(res, rows);
});

/**
 * GET /api/applications/:id/resume
 * 企业查看某条投递对应的简历
 */
r.get("/:id/resume", authRequired, requireRole("company"), async (req: any, res) => {
  // 当前登录企业 id
  const cid = req.user.uid;

  const appId = Number(req.params.id);

  if (!appId) return fail(res, "bad id");

  // 1) 先确认：这条投递记录确实属于“当前企业”
  const [apps] = await pool.query<any[]>(
    "SELECT id, resume_id, user_id FROM application WHERE id=:id AND company_id=:cid LIMIT 1",
    { id: appId, cid }
  );

  if (!apps.length) return fail(res, "not found", 404);

  const resumeId = apps[0].resume_id;

  //  用 resume_id 去 resume 表里拿简历详情
  const [rows] = await pool.query<any[]>(
    "SELECT * FROM resume WHERE id=:rid LIMIT 1",
    { rid: resumeId }
  );


  if (!rows.length) return fail(res, "resume not found", 404);

  
  return ok(res, rows[0]);
});

/** 
 * PATCH /api/applications/:id/status
 * 企业修改投递状态
 */
r.patch("/:id/status", authRequired, requireRole("company"), async (req: any, res) => {
  // 当前企业 id
  const cid = req.user.uid;
  // URL 参数：投递记录 id
  const id = Number(req.params.id);
  const { status, remark } = req.body || {};

  if (!id || !status) return fail(res, "missing fields");

  // 再次做“归属校验”：确保这条投递记录属于本企业
  const [rows] = await pool.query<any[]>(
    "SELECT id FROM application WHERE id=:id AND company_id=:cid LIMIT 1",
    { id, cid }
  );


  if (!rows.length) return fail(res, "not found", 404);

  // 更新投递记录的状态和备注
  await pool.query(
    "UPDATE application SET status=:s, remark=:r WHERE id=:id",
    {
      id,
      s: status,          // 新状态
      r: remark || null,  
    }
  );

  return ok(res, null, "updated");
});

export default r;
