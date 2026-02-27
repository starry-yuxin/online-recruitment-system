import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../stores/auth";

// auth
import Login from "../views/auth/Login.vue";
import Register from "../views/auth/Register.vue";

// layout
import Layout from "../layout/AdminLayout.vue";

// public
import Home from "../views/public/Home.vue";
import JobList from "../views/public/JobList.vue";
import JobDetail from "../views/public/JobDetail.vue";
import NewsList from "../views/public/NewsList.vue";
import NewsDetail from "../views/public/NewsDetail.vue";
import CompanyDetail from "../views/public/CompanyDetail.vue";

// user
import ResumeEdit from "../views/user/ResumeEdit.vue";
import MyApplications from "../views/user/MyApplications.vue";
import Favorites from "../views/user/Favorites.vue";

// company
import JobManage from "../views/company/JobManage.vue";
import ApplicationManage from "../views/company/ApplicationManage.vue";
import CompanyProfile from "../views/company/CompanyProfile.vue";

// admin
import AdminDashboard from "../views/admin/AdminDashboard.vue";
import NewsManage from "../views/admin/NewsManage.vue";
import UserManage from "../views/admin/UserManage.vue";       // ✅ 新增
import CompanyManage from "../views/admin/CompanyManage.vue"; // ✅ 新增

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // ===== 公共页面 =====
    { path: "/", component: Home },

    { path: "/jobs", component: JobList },
    { path: "/jobs/:id", component: JobDetail },

    { path: "/news", component: NewsList },
    { path: "/news/:id", component: NewsDetail },

    { path: "/companies/:id", component: CompanyDetail },

    { path: "/login", component: Login },
    { path: "/register", component: Register },

    // ===== 登录后系统 =====
    {
      path: "/app",
      component: Layout,
      meta: { requiresAuth: true },
      children: [
        // user
        { path: "user/resume", component: ResumeEdit, meta: { role: "user" } },
        { path: "user/applications", component: MyApplications, meta: { role: "user" } },
        { path: "user/favorites", component: Favorites, meta: { role: "user" } },

        // company
        { path: "company/jobs", component: JobManage, meta: { role: "company" } },
        { path: "company/applications", component: ApplicationManage, meta: { role: "company" } },
        { path: "company/profile", component: CompanyProfile, meta: { role: "company" } },

        // admin
        { path: "admin/dashboard", component: AdminDashboard, meta: { role: "admin" } },
        { path: "admin/news", component: NewsManage, meta: { role: "admin" } },

        // ✅ 这两条就是你缺的
        { path: "admin/users", component: UserManage, meta: { role: "admin" } },
        { path: "admin/companies", component: CompanyManage, meta: { role: "admin" } }
      ]
    }
  ]
});

// ===== 路由守卫 =====
router.beforeEach((to) => {
  const auth = useAuthStore();

  if (to.meta.requiresAuth && !auth.token) {
    return "/login";
  }

  const needRole = to.meta.role as string | undefined;
  if (needRole && auth.role !== needRole) {
    return "/login";
  }

  return true;
});

export default router;
