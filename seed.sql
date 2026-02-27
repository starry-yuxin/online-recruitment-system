USE recruitment_system;

-- =========================
-- 0) 清空 demo 数据（保留表）
-- =========================
SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE job_post;
TRUNCATE TABLE news;
TRUNCATE TABLE resume;
TRUNCATE TABLE user_profile;
TRUNCATE TABLE company_profile;
TRUNCATE TABLE accounts;


SET FOREIGN_KEY_CHECKS = 1;

-- =========================
-- 1) accounts
-- admin / admin123
-- company1 / company123
-- company2 / company123
-- user1 / user123
-- user2 / user123
-- =========================
INSERT INTO accounts (id, username, password_hash, role, status) VALUES
(1, 'admin',    '$2b$10$1CSI.EMOumuZFhpLhT7to.plcIcsZm8JGmLVEoLrZf6wQ8E/VikvK', 'admin',   'active'),
(2, 'company1', '$2b$10$Uu8a8pSqZebxvuiHf5Ru.eFW2fvHltEjgjzBwkduU.gmrXqI/ou8a', 'company', 'active'),
(3, 'user1',    '$2b$10$QxfdSz1vNa7aqQbifKTe1.5MgpauJxQecv6ATC3BXsqEbUEKzEyrS', 'user',    'active'),
(4, 'company2', '$2b$10$Uu8a8pSqZebxvuiHf5Ru.eFW2fvHltEjgjzBwkduU.gmrXqI/ou8a', 'company', 'active'),
(5, 'user2',    '$2b$10$OUhJ7t4Q3xzhtZbReTM9duaJJbNZp3nlCNKDM1TuKNyiAZd.1VlVe', 'user',    'active');


INSERT INTO company_profile
(company_id, company_name, company_type, email, phone, address, zip_code, logo_url)
VALUES
(2, '星河科技有限公司', '互联网', 'hr@startech.com', '010-88886666', '北京市海淀区中关村xx路', '100080', NULL),
(4, '蓝鲸数据有限公司', '数据/AI', 'hr@bluewhale.com', '021-66668888', '上海市浦东新区xx路', '200120', NULL);


INSERT INTO user_profile (user_id, real_name, email) VALUES
(3, '张三', 'user1@test.com'),
(5, '李四', 'user2@test.com');


INSERT INTO job_post
(id, company_id, position, headcount, city, description, publish_time, view_count, status)
VALUES
(101, 2, '前端开发工程师（Vue3）', 2, '北京',
'负责招聘系统前端开发，Vue3 + Element Plus；熟悉组件化与状态管理优先；有完整项目经验加分。',
NOW(), 12, 'open'),

(102, 2, '后端开发工程师（Node.js）', 1, '北京',
'负责 API 开发与数据库设计；熟悉 Express/MySQL，了解 JWT 鉴权；有接口规范意识。',
NOW(), 9, 'open'),

(103, 4, '数据分析实习生', 3, '上海',
'负责数据整理、SQL 查询、报表输出；会 Excel/Python 加分；对业务有敏感度。',
NOW(), 20, 'open'),

(104, 4, '测试工程师', 1, '上海',
'负责功能测试/接口测试，编写测试用例；熟悉 Postman/Swagger（任意一个）加分。',
NOW(), 6, 'open');


INSERT INTO resume
(id, user_id, username, gender, email, phone, address, zip_code,
 education, skills, work_type, intro, publish_time, view_count, status)
VALUES
(201, 3, 'user1', 'male',   'user1@test.com', '13800001111', '北京朝阳区xx路', '100020',
 '本科', 'Vue3/TS/Element Plus/SQL', '全职',
 '学习能力强，能快速上手项目；希望做前端/全栈方向，有完整课设/项目经验。', NOW(), 5, 'public'),

(202, 5, 'user2', 'female', 'user2@test.com', '13900002222', '上海浦东新区xx路', '200120',
 '本科', 'SQL/Excel/Python', '实习',
 '做事细致，喜欢数据分析与可视化；能写清晰报告并复现分析过程。', NOW(), 3, 'public');


INSERT INTO news
(id, title, content, image_url, source, publish_time, view_count, publisher_id)
VALUES
(301, '系统上线公告',
'在线人才招聘系统已上线：个人可创建简历并一键投递；企业可发布岗位并处理投递；管理员可管理新闻与统计。',
NULL, '系统管理员', NOW(), 10, 1),

(302, '面试技巧：如何准备自我介绍',
'建议准备 1 分钟与 3 分钟两个版本，突出项目经验、结果与可量化指标（例如性能提升、缺陷减少等）。',
NULL, '就业指导中心', NOW(), 23, 1),

(303, '简历优化：项目经历怎么写',
'用 STAR 法则写：情境-任务-行动-结果。结果尽量量化（例如：将页面加载时间从 2.3s 降到 1.1s）。',
NULL, '系统新闻', NOW(), 18, 1);
