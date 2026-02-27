
import { Router } from "express";
import { pool } from "../config/db"
import { ok, fail } from "../utils/response";

const r = Router();

/**
 * GET /api/companies/:id   （公共接口，不需要登录）
 * 根据公司 id 查询并返回 company_profile（企业资料）
 */
r.get("/:id", async (req, res) => {
  const id = Number(req.params.id);

  // 如果 id 转出来是 0/NaN（非法），直接返回错误
  if (!id) return fail(res, "bad id");

  //  查询 company_profile 表，拿到该公司对应的资料
  //    注意：这里只查 company_profile，不查 accounts
  //    LIMIT 1：最多只拿一条（因为 company_id 是主键，理论上也只会有一条）
  const [rows] = await pool.query<any[]>(
    `SELECT
        company_id,      
        company_name,    
        company_type,    
        email,           
        phone,           
        address,         
        zip_code,        
        logo_url         -- 公司 logo 图片地址（一般是上传后存的路径/URL）
     FROM company_profile
     WHERE company_id=:id
     LIMIT 1`,
    { id }
  );

  if (!rows.length) return fail(res, "company not found", 404);

  return ok(res, rows[0]);
});


export default r;
