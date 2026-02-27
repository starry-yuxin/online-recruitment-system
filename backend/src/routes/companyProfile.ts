
import { Router } from "express";
import multer from "multer";
import path from "path";
import crypto from "crypto";
import { env } from "../config/env";
import { pool } from "../config/db";
import { ok, fail } from "../utils/response";
import { authRequired } from "../middleware/auth";
import { requireRole } from "../middleware/rbac";

const r = Router();


const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, env.UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase(); // 例如 .png/.jpg
    const safeExt = ext && ext.length <= 10 ? ext : "";
    const filename = crypto.randomUUID() + safeExt;
    cb(null, filename);
  },
});


const upload = multer({ storage });

/**
 * GET /api/company/profile
 * 企业获取自己的企业资料（company_profile）
 */
r.get("/profile", authRequired, requireRole("company"), async (req: any, res) => {
  const companyId = req.user.uid;
  const [rows] = await pool.query<any[]>(
    "SELECT * FROM company_profile WHERE company_id=:cid LIMIT 1",
    { cid: companyId }
  );

  // 如果没查到：说明企业还没完善资料
  // 这里返回一个“空结构”给前端，方便前端直接填表，不用处理 null
  if (!rows.length) {
    return ok(res, {
      company_id: companyId,
      company_name: "",
      company_type: "",
      email: "",
      phone: "",
      address: "",
      zip_code: "",
      logo_url: null,
    });
  }


  return ok(res, rows[0]);
});

/**
 * PUT /api/company/profile
 * 企业保存/更新自己的企业资料

 */
r.put(
  "/profile",
  authRequired,
  requireRole("company"),
  upload.single("logo"), 
  async (req: any, res) => {
    
    const companyId = req.user.uid;

    const { company_name, company_type, email, phone, address, zip_code } = req.body || {};
    if (!company_name) return fail(res, "company_name required");

    const logo_url = req.file ? `/uploads/${req.file.filename}` : null;

    const [exist] = await pool.query<any[]>(
      "SELECT company_id FROM company_profile WHERE company_id=:cid LIMIT 1",
      { cid: companyId }
    );

    // 如果不存在：说明第一次保存资料 -> INSERT 新记录
    if (!exist.length) {
      await pool.query(
        `INSERT INTO company_profile
         (company_id, company_name, company_type, email, phone, address, zip_code, logo_url)
         VALUES (:cid,:name,:type,:email,:phone,:addr,:zip,:logo)`,
        {
          cid: companyId,
          name: company_name,
          type: company_type || null,
          email: email || null,
          phone: phone || null,
          addr: address || null,
          zip: zip_code || null,
          logo: logo_url, // 新建时 logo 可以直接存（没有就 null）
        }
      );
    } else {
      // 如果已存在：说明是更新资料 -> UPDATE
      await pool.query(
        `UPDATE company_profile SET
          company_name=:name,
          company_type=:type,
          email=:email,
          phone=:phone,
          address=:addr,
          zip_code=:zip,
          logo_url = COALESCE(:logo, logo_url)
         WHERE company_id=:cid`,
        {
          cid: companyId,
          name: company_name,
          type: company_type || null,
          email: email || null,
          phone: phone || null,
          addr: address || null,
          zip: zip_code || null,
          logo: logo_url,
        }
      );
      // 重点：COALESCE(:logo, logo_url)
      // - 如果这次上传了新 logo（:logo 不是 null），就用新的
      // - 如果没上传（:logo 是 null），就保持旧的 logo_url 不变
    }

    return ok(res, null, "saved");
  }
);

export default r;
