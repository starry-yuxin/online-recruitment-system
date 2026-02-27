
import { Router } from "express";
import { pool } from "../config/db";
import { ok, fail } from "../utils/response";
import { authRequired } from "../middleware/auth";
import { requireRole } from "../middleware/rbac";

const r = Router();

/**
 * GET /api/resume/me
 * 个人用户查看“我的简历”
 */
r.get("/me", authRequired, requireRole("user"), async (req: any, res) => {
  const uid = req.user.uid;

  // 查询简历表 resume：

  const [rows] = await pool.query<any[]>(
    "SELECT * FROM resume WHERE user_id=:uid ORDER BY publish_time DESC LIMIT 1",
    { uid }
  );

  return ok(res, rows[0] || null);
});

/**
 * PUT /api/resume/me
 * 个人用户新增/修改“我的简历”（保存）
 */
r.put("/me", authRequired, requireRole("user"), async (req: any, res) => {
 
  const uid = req.user.uid;
  const b = req.body || {};

  // Upsert 的第一步：先查这个用户有没有简历记录
  // 只查 id 就够了，用来判断“有/没有”
  const [rows] = await pool.query<any[]>(
    "SELECT id FROM resume WHERE user_id=:uid LIMIT 1",
    { uid }
  );

  if (rows.length) {
    await pool.query(
      `UPDATE resume SET
        gender=:gender, email=:email, phone=:phone, address=:address, zip_code=:zip,
        education=:edu, skills=:skills, work_type=:wt,
        expected_position=:ep, expected_city=:ec, expected_salary=:es, intro=:intro,
        status=:status
       WHERE user_id=:uid`,
      {
        // WHERE user_id=:uid：只更新当前用户自己的简历
        uid,

        
        gender: b.gender || null,
        email: b.email || null,
        phone: b.phone || null,
        address: b.address || null,
        zip: b.zip_code || null,

        edu: b.education || null,
        skills: b.skills || null,
        wt: b.work_type || null,

        ep: b.expected_position || null,
        ec: b.expected_city || null,
        es: b.expected_salary || null,
        intro: b.intro || null,

        // status：简历可见性，比如 public / private
        // 没传就默认 public
        status: b.status || "public"
      }
    );
  } else {
    // 如果 rows.length == 0：说明没有简历 -> INSERT 新增一条
    await pool.query(
      `INSERT INTO resume(
        user_id, gender, email, phone, address, zip_code, education, skills, work_type,
        expected_position, expected_city, expected_salary, intro, status
       )
       VALUES(
        :uid,:gender,:email,:phone,:address,:zip,:edu,:skills,:wt,:ep,:ec,:es,:intro,:status
       )`,
      {
        uid,
        gender: b.gender || null,
        email: b.email || null,
        phone: b.phone || null,
        address: b.address || null,
        zip: b.zip_code || null,
        edu: b.education || null,
        skills: b.skills || null,
        wt: b.work_type || null,
        ep: b.expected_position || null,
        ec: b.expected_city || null,
        es: b.expected_salary || null,
        intro: b.intro || null,
        status: b.status || "public"
      }
    );
  }

 
  return ok(res, null, "saved");
});

export default r;
