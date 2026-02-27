import { Router } from "express"; 
import { pool } from "../config/db"; 
import { ok, fail } from "../utils/response";
import { hashPassword, verifyPassword } from "../utils/password"; 
import { signToken } from "../utils/jwt"; // 生成 JWT token（登录凭证）

const r = Router(); // 创建一个路由“容器”，专门放 auth 相关接口

/**
 * POST /api/auth/register
 * body: { username, password, role, realName?, email?, companyName?, companyEmail? }
 */
r.post("/register", async (req, res) => {
  const { username, password, role, realName, email, companyName, companyEmail } = req.body || {};
  if (!username || !password || !role) return fail(res, "Missing fields");

  const conn = await pool.getConnection();
  try {
    // 开启事务：保证 accounts + profile 两表写入要么全成功，要么全失败
    await conn.beginTransaction();

    // 先检查用户名是否已存在
    const [exist] = await conn.query<any[]>(
      "SELECT id FROM accounts WHERE username = :u LIMIT 1",
      { u: username }
    );
    if (exist.length) {
      await conn.rollback(); // 回滚事务
      return fail(res, "Username already exists");
    }

    // 对密码进行 hash（不存明文）
    const pwHash = await hashPassword(password);
    //  插入账号表 accounts（写入 username、password_hash、role）
    const [ret] = await conn.query<any>(
      "INSERT INTO accounts(username, password_hash, role) VALUES(:u, :p, :r)",
      { u: username, p: pwHash, r: role }
    );
    // 新账号的自增 id
    const uid = ret.insertId as number;

    if (role === "user") {
      // 个人用户必须提供 realName/email
      if (!realName || !email) { await conn.rollback(); return fail(res, "Missing user profile"); }
      await conn.query(
        "INSERT INTO user_profile(user_id, real_name, email) VALUES(:id,:n,:e)",
        { id: uid, n: realName, e: email }
      );
    } else if (role === "company") {
      // 企业用户必须提供 companyName/companyEmail
      if (!companyName || !companyEmail) { await conn.rollback(); return fail(res, "Missing company profile"); }
      await conn.query(
        "INSERT INTO company_profile(company_id, company_name, email) VALUES(:id,:n,:e)",
        { id: uid, n: companyName, e: companyEmail }
      );
    }

    
    await conn.commit();
    return ok(res, { id: uid }, "registered");
  } catch (e: any) {
    // 任何异常都回滚
    await conn.rollback();
    return fail(res, e?.message || "register failed");
  } finally {
    // 释放连接回连接池，避免连接泄漏
    conn.release();
  }
});

/**
 * POST /api/auth/login
 * body: { username, password }
 */
r.post("/login", async (req, res) => {
  const { username, password } = req.body || {};
  // 缺字段直接失败
  if (!username || !password) return fail(res, "Missing fields");

  // 按用户名查询账号信息（id、密码hash、角色、状态）
  const [rows] = await pool.query<any[]>(
    "SELECT id, password_hash, role, status FROM accounts WHERE username=:u LIMIT 1",
    { u: username }
  );
  if (!rows.length) return fail(res, "Invalid credentials", 401);
  if (rows[0].status !== "active") return fail(res, "Account disabled", 403);

  // 2) 校验输入密码是否与数据库中的 password_hash 匹配
  const okPw = await verifyPassword(password, rows[0].password_hash);
  if (!okPw) return fail(res, "Invalid credentials", 401);

  //  生成 JWT token（里面带 uid 和 role，供后续鉴权用）
  const token = signToken({ uid: rows[0].id, role: rows[0].role });
  return ok(res, { token, role: rows[0].role, uid: rows[0].id }, "logged in");
});

export default r; 
