
import { Router } from "express";
import multer from "multer";
import path from "path";
// 引入 crypto：用来生成唯一文件名（randomUUID）
import crypto from "crypto";
// 引入环境配置：UPLOAD_DIR 表示上传文件保存目录
import { env } from "../config/env";
import { pool } from "../config/db";
import { ok, fail } from "../utils/response";
import { authRequired } from "../middleware/auth";
import { requireRole } from "../middleware/rbac";

const r = Router();

/**
 * ✅ 这一段是“上传文件配置”
 * 目标：上传的图片文件保留后缀（.png/.jpg），避免浏览器识别不稳定
 */
const storage = multer.diskStorage({
  // destination：把上传的文件放到 env.UPLOAD_DIR 指定的目录
  destination: (_req, _file, cb) => {
    cb(null, env.UPLOAD_DIR);
  },

  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname); 

    // 用 UUID 生成一个不会重复的文件名，再拼上后缀
    const name = crypto.randomUUID() + ext;
    cb(null, name);
  }
});

const upload = multer({ storage });

/**
 * GET /api/news
 * 公共端：新闻列表（分页）
 */
r.get("/", async (req, res) => {
 
  const page = Math.max(1, Number(req.query.page || 1));
  const pageSize = Math.min(50, Math.max(1, Number(req.query.pageSize || 10)));

  const offset = (page - 1) * pageSize;

  const [list] = await pool.query<any[]>(
    `SELECT id,title,source,publish_time,view_count,image_url
     FROM news
     ORDER BY publish_time DESC
     LIMIT :limit OFFSET :offset`,
    { limit: pageSize, offset } 
  );

  const [cnt] = await pool.query<any[]>("SELECT COUNT(*) AS c FROM news");

  return ok(res, { list, total: cnt[0].c, page, pageSize });
});

/**
 * GET /api/news/:id
 * 公共端：新闻详情
 */
r.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!id) return fail(res, "bad id");

  // 访问一次详情，浏览量 +1
  await pool.query(
    "UPDATE news SET view_count=view_count+1 WHERE id=:id",
    { id }
  );

  const [rows] = await pool.query<any[]>(
    "SELECT * FROM news WHERE id=:id",
    { id }
  );

  if (!rows.length) return fail(res, "not found", 404);

  return ok(res, rows[0]);
});

/**
 * POST /api/news
 * 管理员发布新闻（支持上传图片）
 */
r.post(
  "/",
  authRequired,
  requireRole("admin"),
  upload.single("image"),
  async (req: any, res) => {
    
    const { title, content, source } = req.body || {};

    if (!title || !content) return fail(res, "missing fields");

    // 如果上传了图片，保存图片访问路径；否则为 null
    const image_url = req.file
      ? `/uploads/${req.file.filename}`
      : null;

    // 插入新闻记录
    const [ret] = await pool.query<any>(
      `INSERT INTO news(title, content, image_url, source, publisher_id)
       VALUES(:t,:c,:i,:s,:pid)`,
      {
        t: title,
        c: content,
        i: image_url,
        s: source || null,
        pid: req.user.uid
      }
    );

    return ok(res, { id: ret.insertId }, "created");
  }
);

/**
 * PUT /api/news/:id
 * 管理员编辑新闻（支持更换图片）
 */
r.put(
  "/:id",
  authRequired,
  requireRole("admin"),
  upload.single("image"),
  async (req: any, res) => {
    const id = Number(req.params.id);
    if (!id) return fail(res, "bad id");

    const { title, content, source } = req.body || {};
    if (!title || !content) return fail(res, "missing fields");

    // 如果上传了新图片，生成新的 image_url；没上传则为 null
    const image_url = req.file
      ? `/uploads/${req.file.filename}`
      : null;

    // 更新新闻：
    // COALESCE(:i, image_url)：如果 :i 不为空就用新图片，否则保留旧图片
    await pool.query(
      `UPDATE news SET
        title=:t,
        content=:c,
        source=:s,
        image_url = COALESCE(:i, image_url)
       WHERE id=:id`,
      {
        id,
        t: title,
        c: content,
        s: source || null,
        i: image_url
      }
    );

    return ok(res, null, "updated");
  }
);

/**
 * DELETE /api/news/:id
 * 管理员删除新闻
 */
r.delete("/:id", authRequired, requireRole("admin"), async (req, res) => {

  const id = Number(req.params.id);
  if (!id) return fail(res, "bad id");

  await pool.query("DELETE FROM news WHERE id=:id", { id });

  return ok(res, null, "deleted");
});

export default r;
