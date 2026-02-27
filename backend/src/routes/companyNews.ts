
import { Router } from "express";
// 引入 multer：用来处理前端 form-data 上传文件（比如新闻封面图）
import multer from "multer";
import { env } from "../config/env";
import { pool } from "../config/db";
import { ok, fail } from "../utils/response";
import { authRequired } from "../middleware/auth";
import { requireRole } from "../middleware/rbac";

const r = Router();

// 创建上传中间件 upload：
// multer 会把上传的文件保存到 env.UPLOAD_DIR 指定的目录里
// 保存后，文件信息会出现在 req.file 里
const upload = multer({ dest: env.UPLOAD_DIR });

/**
 * GET /api/company/news?page=1&pageSize=10
 * 企业查看自己发布的新闻列表
 */
r.get("/news", authRequired, requireRole("company"), async (req: any, res) => {
  const companyId = req.user.uid;

 
  const page = Math.max(1, Number(req.query.page || 1));
  const pageSize = Math.min(50, Math.max(1, Number(req.query.pageSize || 10)));
  const offset = (page - 1) * pageSize;

  //    按发布时间倒序：最新的在最上面
  const [list] = await pool.query<any[]>(
    `SELECT id,title,source,publish_time,view_count,image_url
     FROM news
     WHERE publisher_id=:pid
     ORDER BY publish_time DESC
     LIMIT :limit OFFSET :offset`,
    { pid: companyId, limit: pageSize, offset }
  );

 
  const [cnt] = await pool.query<any[]>(
    "SELECT COUNT(*) AS c FROM news WHERE publisher_id=:pid",
    { pid: companyId }
  );


  return ok(res, { list, total: cnt[0].c, page, pageSize });
});

/**
 * POST /api/company/news
 * 企业发布新闻

 */
r.post(
  "/news",
  authRequired,
  requireRole("company"),
  upload.single("image"), 
  async (req: any, res) => {
    
    const { title, content, source } = req.body || {};

    if (!title || !content) return fail(res, "missing fields");

    // 如果上传了图片，multer 会把文件存在 UPLOAD_DIR 里，并且给一个随机 filename
    const image_url = req.file ? `/uploads/${req.file.filename}` : null;

    // 插入新闻记录到 news 表
    // publisher_id 存当前企业 id，表示“这条新闻是谁发的”
    const [ret] = await pool.query<any>(
      "INSERT INTO news(title, content, image_url, source, publisher_id) VALUES(:t,:c,:i,:s,:pid)",
      {
        t: title,
        c: content,
        i: image_url,
        s: source || null,
        pid: req.user.uid,
      }
    );

    return ok(res, { id: ret.insertId }, "created");
  }
);

/**
 * PUT /api/company/news/:id
 * 企业编辑新闻（只能编辑自己发布的）
 */
r.put(
  "/news/:id",
  authRequired,
  requireRole("company"),
  upload.single("image"), 
  async (req: any, res) => {
    // 新闻 id（从 URL 参数拿）
    const id = Number(req.params.id);
    if (!id) return fail(res, "bad id");

    const { title, content, source } = req.body || {};
    if (!title || !content) return fail(res, "missing fields");

    // 先检查：这条新闻是否存在，并且确实是“当前企业发布的”
    const [exist] = await pool.query<any[]>(
      "SELECT id FROM news WHERE id=:id AND publisher_id=:pid LIMIT 1",
      { id, pid: req.user.uid }
    );
    if (!exist.length) return fail(res, "not found", 404);

    const image_url = req.file ? `/uploads/${req.file.filename}` : null;

    // 更新新闻
 
    await pool.query(
      `UPDATE news SET
        title=:t,
        content=:c,
        source=:s,
        image_url = COALESCE(:i, image_url)
       WHERE id=:id AND publisher_id=:pid`,
      {
        id,
        pid: req.user.uid,
        t: title,
        c: content,
        s: source || null,
        i: image_url,
      }
    );

    return ok(res, null, "updated");
  }
);

/**
 * DELETE /api/company/news/:id
 * 企业删除新闻（只能删除自己发布的）
 */
r.delete("/news/:id", authRequired, requireRole("company"), async (req: any, res) => {
  const id = Number(req.params.id);
  if (!id) return fail(res, "bad id");

  // 删除时也加 publisher_id 限制：只能删自己的新闻
  await pool.query("DELETE FROM news WHERE id=:id AND publisher_id=:pid", {
    id,
    pid: req.user.uid,
  });

  return ok(res, null, "deleted");
});

export default r;
