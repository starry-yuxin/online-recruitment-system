import { Router } from "express";

import auth from "./auth.routes";
import jobs from "./jobs.routes";
import resume from "./resume.routes";
import applications from "./applications.routes";
import news from "./news.routes";
import admin from "./admin.routes";
import favorites from "./favorites.routes";
import companies from "./companies.routes"; 


import companyProfile from "./companyProfile";
import companyNews from "./companyNews";
import resumeVisibility from "./resumeVisibility";

// ✅ 管理员：个人用户管理 / 企业用户管理
import adminUsers from "./adminUsers";
import adminCompanies from "./adminCompanies";

const r = Router();


r.use("/auth", auth);
r.use("/jobs", jobs);
r.use("/resume", resume);
r.use("/applications", applications);
r.use("/news", news);
r.use("/admin", admin);
r.use("/favorites", favorites);
r.use("/companies", companies);  
r.use("/company", companyProfile);
r.use("/company", companyNews);

r.use("/", resumeVisibility);

r.use("/", adminUsers);
r.use("/", adminCompanies);

export default r;
