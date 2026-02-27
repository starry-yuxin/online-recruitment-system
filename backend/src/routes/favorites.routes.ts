
import { Router } from "express";
import { pool } from "../config/db";
import { ok, fail } from "../utils/response";
import { authRequired } from "../middleware/auth";
import { requireRole } from "../middleware/rbac";


const r = Router();

/**
 * GET /api/favorites   (user)
 * 个人用户：查看“我收藏的岗位列表”
 */
r.get("/", authRequired, requireRole("user"), async (req: any, res) => {
  const uid = req.user.uid;

  // 查询收藏列表：
  const [rows] = await pool.query<any[]>(
    `SELECT j.id, j.position, j.city, j.headcount, j.status, j.publish_time, j.view_count,
            cp.company_name, cp.company_type
     FROM favorites f
     JOIN job_post j ON j.id = f.job_post_id
     JOIN company_profile cp ON cp.company_id = j.company_id
     WHERE f.user_id = :uid
     ORDER BY f.created_at DESC`,
    { uid } 
  );

  return ok(res, rows);
});

/**
 * POST /api/favorites  (user)
 * 个人用户：收藏某个岗位
 */
r.post("/", authRequired, requireRole("user"), async (req: any, res) => {
  const uid = req.user.uid;

  const jobId = Number(req.body?.job_post_id);

  if (!jobId) return fail(res, "missing job_post_id");

  // 先确认岗位存在：防止收藏一个不存在的岗位
  const [job] = await pool.query<any[]>(
    "SELECT id FROM job_post WHERE id=:id LIMIT 1",
    { id: jobId }
  );
  if (!job.length) return fail(res, "job not found", 404);

  try {
    // 插入收藏关系：user_id + job_post_id
    await pool.query(
      "INSERT INTO favorites(user_id, job_post_id) VALUES(:u,:j)",
      { u: uid, j: jobId }
    );
  } catch {
    // 如果插入失败，通常是“已经收藏过”触发了唯一约束（重复插入）
  
  }

  return ok(res, null, "favorited");
});

/**
 * DELETE /api/favorites/:jobId   (user)
 * 个人用户：取消收藏某个岗位
 
 */
r.delete("/:jobId", authRequired, requireRole("user"), async (req: any, res) => {
  const uid = req.user.uid;

  const jobId = Number(req.params.jobId);

 
  if (!jobId) return fail(res, "bad jobId");

  // 删除收藏关系：只删除当前用户对该岗位的收藏
  await pool.query(
    "DELETE FROM favorites WHERE user_id=:u AND job_post_id=:j",
    { u: uid, j: jobId }
  );

  
  return ok(res, null, "unfavorited");
});

/**
 * GET /api/favorites/has/:jobId   (user)
 * 个人用户：判断“我是否收藏过这个岗位”

 */
r.get("/has/:jobId", authRequired, requireRole("user"), async (req: any, res) => {
 
  const uid = req.user.uid;

 
  const jobId = Number(req.params.jobId);

 
  if (!jobId) return fail(res, "bad jobId");

  // 查询 favorites 是否存在这条记录
  // SELECT 1 只是为了判断有没有记录，不需要取真实字段，更轻量
  const [rows] = await pool.query<any[]>(
    "SELECT 1 AS x FROM favorites WHERE user_id=:u AND job_post_id=:j LIMIT 1",
    { u: uid, j: jobId }
  );

  return ok(res, { has: rows.length > 0 });
});

export default r;
