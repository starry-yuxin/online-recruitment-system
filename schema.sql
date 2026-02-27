
-- utf8mb4：支持 emoji / 全量 Unicode，避免中文/特殊字符乱码
CREATE DATABASE IF NOT EXISTS recruitment_system DEFAULT CHARACTER SET utf8mb4;
USE recruitment_system;


-- 1) accounts：统一账户表（登录认证 + 角色 + 状态）
CREATE TABLE accounts (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,          -- 主键，自增账号ID
  username VARCHAR(50) NOT NULL UNIQUE,          -- 登录用户名（唯一）
  password_hash VARCHAR(255) NOT NULL,           -- 密码哈希（不存明文）
  role ENUM('admin','company','user') NOT NULL,  
  status ENUM('active','disabled') NOT NULL DEFAULT 'active', 
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP      -- 注册时间
) ENGINE=InnoDB;


-- 2) company_profile：企业资料表（企业信息）
CREATE TABLE company_profile (
  company_id BIGINT PRIMARY KEY,                 
  company_name VARCHAR(100) NOT NULL,            
  company_type VARCHAR(50) NULL,                 
  email VARCHAR(100) NOT NULL,                   
  phone VARCHAR(30) NULL,                        
  address VARCHAR(200) NULL,                     
  zip_code VARCHAR(20) NULL,                     
  logo_url VARCHAR(255) NULL,                    

  -- 外键：企业账号删除 -> 企业资料也删除（ON DELETE CASCADE）
  CONSTRAINT fk_company_account FOREIGN KEY (company_id) REFERENCES accounts(id)
    ON DELETE CASCADE ON UPDATE CASCADE,

  -- 邮箱唯一：防止多家企业重复注册同一邮箱
  UNIQUE KEY uniq_company_email (email)
) ENGINE=InnoDB;


-- 3) user_profile：个人用户资料表（个人信息）
CREATE TABLE user_profile (
  user_id BIGINT PRIMARY KEY,                    
  real_name VARCHAR(50) NOT NULL,                
  email VARCHAR(100) NOT NULL,                   

  -- 外键：用户账号删除 -> 用户资料也删除
  CONSTRAINT fk_user_account FOREIGN KEY (user_id) REFERENCES accounts(id)
    ON DELETE CASCADE ON UPDATE CASCADE,

  UNIQUE KEY uniq_user_email (email)
) ENGINE=InnoDB;


-- 4) news：新闻公告表（平台公告/企业新闻）

CREATE TABLE news (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,          
  title VARCHAR(150) NOT NULL,                   
  content TEXT NOT NULL,                         
  image_url VARCHAR(255) NULL,                   
  source VARCHAR(100) NULL,                      
  publish_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, -- 发布时间
  view_count INT NOT NULL DEFAULT 0,             
  publisher_id BIGINT NULL,                      

  -- 索引：按发布时间排序
  INDEX idx_news_time (publish_time),

  -- 外键：发布者账号删除 -> 新闻不删除，但 publisher_id 置空，保留历史新闻
  CONSTRAINT fk_news_publisher FOREIGN KEY (publisher_id) REFERENCES accounts(id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;


-- 5) job_post：岗位表（招聘信息）
CREATE TABLE job_post (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,          
  company_id BIGINT NOT NULL,                    -- 发布企业账号ID（外键）
  position VARCHAR(100) NOT NULL,                -- 职位名称
  headcount INT NOT NULL DEFAULT 1,              -- 招聘人数
  city VARCHAR(50) NOT NULL,                     
  description TEXT NOT NULL,                     
  publish_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, 
  view_count INT NOT NULL DEFAULT 0,             
  status ENUM('open','closed') NOT NULL DEFAULT 'open',     

  -- 索引1：支持岗位列表按城市+职位关键词筛选（city, position）
  INDEX idx_job_city_position (city, position),

  -- 索引2：支持企业查看“我的岗位”按时间排序（company_id, publish_time）
  INDEX idx_job_company_time (company_id, publish_time),

  -- 外键：企业账号删除 -> 该企业岗位一起删除（级联删除）
  CONSTRAINT fk_job_company FOREIGN KEY (company_id) REFERENCES accounts(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;


-- 6) resume：简历表（个人简历信息）
CREATE TABLE resume (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,          
  user_id BIGINT NOT NULL,                       
  username VARCHAR(50) NULL,                     
  gender ENUM('male','female','other') NULL,     
  email VARCHAR(100) NULL,                       
  phone VARCHAR(30) NULL,                        
  address VARCHAR(200) NULL,                     
  zip_code VARCHAR(20) NULL,                     
  education VARCHAR(50) NULL,                    
  skills VARCHAR(255) NULL,                      
  work_type VARCHAR(50) NULL,                    
  expected_position VARCHAR(100) NULL,           
  expected_city VARCHAR(50) NULL,                
  expected_salary VARCHAR(50) NULL,              
  intro TEXT NULL,                               
  publish_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, -- 发布时间
  view_count INT NOT NULL DEFAULT 0,             -- 简历浏览量（可扩展）
  status ENUM('public','private') NOT NULL DEFAULT 'public', 

  -- 索引：用户查看自己简历、取最新简历（user_id + publish_time）
  INDEX idx_resume_user_time (user_id, publish_time),

  -- 外键：用户账号删除 -> 简历也删除
  CONSTRAINT fk_resume_user FOREIGN KEY (user_id) REFERENCES accounts(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;


-- 7) application：投递表（在线申请/投递记录）

CREATE TABLE application (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,          
  user_id BIGINT NOT NULL,                       
  company_id BIGINT NOT NULL,                    
  job_post_id BIGINT NOT NULL,                   
  resume_id BIGINT NOT NULL,                     
  apply_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, -- 投递时间
  status ENUM('submitted','viewed','interview','rejected','offer') NOT NULL DEFAULT 'submitted',
  remark VARCHAR(255) NULL,                      

  -- 索引：企业端按状态筛选 + 时间排序（企业查投递列表常用）
  INDEX idx_app_company_status_time (company_id, status, apply_time),

  -- 索引：用户端查看“我的投递记录”按时间排序
  INDEX idx_app_user_time (user_id, apply_time),

  -- 唯一约束：防止同一用户重复投递同一岗位
  UNIQUE KEY uniq_user_job (user_id, job_post_id),

  -- 外键：账号/岗位/简历删除时，投递记录相应级联删除（保持数据一致性）
  CONSTRAINT fk_app_user FOREIGN KEY (user_id) REFERENCES accounts(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_app_company FOREIGN KEY (company_id) REFERENCES accounts(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_app_job FOREIGN KEY (job_post_id) REFERENCES job_post(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_app_resume FOREIGN KEY (resume_id) REFERENCES resume(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 8) favorites：收藏表（扩展功能，加分项）

CREATE TABLE favorites (
  user_id BIGINT NOT NULL,                       
  job_post_id BIGINT NOT NULL,                   
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, 
  PRIMARY KEY (user_id, job_post_id),            

  -- 外键：用户/岗位删除 -> 收藏记录一起删除
  CONSTRAINT fk_fav_user FOREIGN KEY (user_id) REFERENCES accounts(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_fav_job FOREIGN KEY (job_post_id) REFERENCES job_post(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;


-- 9) system_logs：系统日志表（扩展功能，加分项）
CREATE TABLE system_logs (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,          
  actor_id BIGINT NULL,                          
  action VARCHAR(100) NOT NULL,                  
  ip VARCHAR(64) NULL,                           -- 操作者IP（可选）
  details VARCHAR(255) NULL,                     -- 具体说明（可选）
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, -- 记录时间

  -- 索引：按时间查询日志更快（比如最近7天）
  INDEX idx_logs_time (created_at),

  -- 外键：操作者账号删除 -> actor_id 置空，日志保留
  CONSTRAINT fk_logs_actor FOREIGN KEY (actor_id) REFERENCES accounts(id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;


-- v_job_detail：岗位详情视图（岗位 + 公司信息）
CREATE OR REPLACE VIEW v_job_detail AS
SELECT
  j.*,                                     -- 岗位表所有字段
  cp.company_name,
  cp.company_type,
  cp.email AS company_email,
  cp.phone AS company_phone,
  cp.address AS company_address,
  cp.zip_code AS company_zip,
  cp.logo_url
FROM job_post j
JOIN company_profile cp ON cp.company_id = j.company_id;

-- v_application_detail：投递详情视图（投递 + 岗位 + 公司 + 用户真实姓名 + 简历摘要）
-- 用途：用户/企业查看投递列表时，直接查视图就能拿到展示信息
CREATE OR REPLACE VIEW v_application_detail AS
SELECT
  a.*,                                     -- 投递表所有字段
  j.position,
  j.city,
  cp.company_name,
  up.real_name AS user_real_name,          -- 投递者姓名（来自 user_profile）
  r.education,
  r.skills,
  r.expected_position,
  r.expected_city,
  r.expected_salary
FROM application a
JOIN job_post j ON j.id = a.job_post_id
JOIN company_profile cp ON cp.company_id = a.company_id
JOIN user_profile up ON up.user_id = a.user_id
JOIN resume r ON r.id = a.resume_id;

-- Triggers：触发器
-- 这里的业务约束是：浏览量 view_count 不允许减少（只能递增）
DELIMITER $$

-- trg_news_viewcount：更新 news 时，禁止 view_count 变小
CREATE TRIGGER trg_news_viewcount
BEFORE UPDATE ON news
FOR EACH ROW
BEGIN
  IF NEW.view_count < OLD.view_count THEN
    SET NEW.view_count = OLD.view_count;
  END IF;
END$$

-- trg_job_viewcount：更新 job_post 时，禁止 view_count 变小
CREATE TRIGGER trg_job_viewcount
BEFORE UPDATE ON job_post
FOR EACH ROW
BEGIN
  IF NEW.view_count < OLD.view_count THEN
    SET NEW.view_count = OLD.view_count;
  END IF;
END$$

DELIMITER ;
