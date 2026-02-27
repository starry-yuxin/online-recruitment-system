<template>
  <el-container style="height:100vh">
    <el-aside width="220px" class="aside">
      <div class="brand" @click="$router.push('/')">
        Recruitment System
      </div>

      <el-menu :default-active="$route.path" router>
        <el-menu-item index="/">首页</el-menu-item>
        <el-menu-item index="/jobs">岗位列表</el-menu-item>
        <el-menu-item index="/news">新闻公告</el-menu-item>

        <el-sub-menu v-if="role==='user'" index="u">
          <template #title>个人中心</template>
          <el-menu-item index="/app/user/resume">我的简历</el-menu-item>
          <el-menu-item index="/app/user/applications">我的投递</el-menu-item>
          <el-menu-item index="/app/user/favorites">我的收藏</el-menu-item>
        </el-sub-menu>

        <el-sub-menu v-if="role==='company'" index="c">
          <template #title>企业中心</template>
          <el-menu-item index="/app/company/profile">企业资料</el-menu-item>
          <el-menu-item index="/app/company/jobs">岗位管理</el-menu-item>
          <el-menu-item index="/app/company/applications">投递管理</el-menu-item>
        </el-sub-menu>

        <el-sub-menu v-if="role==='admin'" index="a">
          <template #title>管理员</template>
          <el-menu-item index="/app/admin/dashboard">统计面板</el-menu-item>
          <el-menu-item index="/app/admin/news">新闻管理</el-menu-item>

          <!-- ✅ 这两项就是你说“被删掉”的入口 -->
          <el-menu-item index="/app/admin/users">个人用户管理</el-menu-item>
          <el-menu-item index="/app/admin/companies">企业用户管理</el-menu-item>
        </el-sub-menu>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="header">
        <div class="left">
          <el-button text @click="$router.push('/')">回首页</el-button>
          <el-button text @click="$router.push('/jobs')">岗位列表</el-button>
          <el-button text @click="$router.push('/news')">新闻公告</el-button>
        </div>

        <div class="right">
          <el-tag v-if="token" effect="light">角色：{{ role }}</el-tag>
          <el-button v-if="!token" type="primary" @click="$router.push('/login')">登录</el-button>
          <el-button v-if="token" type="danger" plain @click="logout">退出</el-button>
        </div>
      </el-header>

      <el-main class="main">
        <div class="main-inner">
          <router-view />
        </div>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useAuthStore } from "../stores/auth";
import { useRouter } from "vue-router";

const auth = useAuthStore();
const router = useRouter();

const role = computed(() => auth.role);
const token = computed(() => auth.token);

function logout() {
  auth.logout();
  router.push("/login");
}
</script>

<style scoped>
.aside { border-right: 1px solid #eee; background: #fff; }
.brand {
  height: 56px; display:flex; align-items:center; padding: 0 14px;
  font-weight: 800; cursor: pointer; border-bottom: 1px solid #eee;
}
.header {
  height: 56px; display:flex; align-items:center; justify-content:space-between;
  border-bottom: 1px solid #eee; background: #fff; padding: 0 12px;
}
.left, .right { display:flex; align-items:center; gap: 10px; }
.main { background: #f6f7fb; }
.main-inner { max-width: 1100px; margin: 18px auto; padding: 0 12px; }
</style>
