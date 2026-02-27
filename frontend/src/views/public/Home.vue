<template>
  <div style="max-width:980px;margin:24px auto;">
    <el-card>
      <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;">
        <div>
          <div style="font-size:26px;font-weight:800;">在线人才招聘系统</div>
          <div style="color:#666;margin-top:6px;line-height:1.7;">
            流程：浏览岗位 → 登录/注册 → 个人填简历投递/收藏 → 企业发布岗位处理投递 → 管理员发布新闻
          </div>
        </div>

        <div style="display:flex;gap:10px;flex-wrap:wrap;">
          <el-button @click="$router.push('/jobs')">岗位列表</el-button>
          <el-button v-if="!token" type="primary" @click="$router.push('/login')">登录</el-button>
          <el-button v-if="!token" @click="$router.push('/register')">注册</el-button>
          <el-button v-if="token" type="primary" plain @click="goCenter">进入控制台</el-button>
          <el-button v-if="token" type="danger" plain @click="logout">退出</el-button>
        </div>
      </div>

      <el-divider />

      <el-row :gutter="12">
        <el-col :span="8">
          <el-card shadow="never">
            <div style="font-weight:800;margin-bottom:6px;">个人用户（user）</div>
            <div style="color:#666;">简历管理 → 一键投递 → 收藏岗位 → 查看投递</div>
            <div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap;">
              <el-button size="small" @click="$router.push('/app/user/resume')">简历</el-button>
              <el-button size="small" @click="$router.push('/app/user/applications')">投递</el-button>
              <el-button size="small" @click="$router.push('/app/user/favorites')">收藏</el-button>
            </div>
          </el-card>
        </el-col>

        <el-col :span="8">
          <el-card shadow="never">
            <div style="font-weight:800;margin-bottom:6px;">企业用户（company）</div>
            <div style="color:#666;">发布岗位 → 公共端立即可见 → 查看投递 → 更新状态</div>
            <div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap;">
              <el-button size="small" @click="$router.push('/app/company/jobs')">岗位管理</el-button>
              <el-button size="small" @click="$router.push('/app/company/applications')">投递管理</el-button>
            </div>
          </el-card>
        </el-col>

        <el-col :span="8">
          <el-card shadow="never">
            <div style="font-weight:800;margin-bottom:6px;">管理员（admin）</div>
            <div style="color:#666;">统计面板 → 新闻管理/发布</div>
            <div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap;">
              <el-button size="small" @click="$router.push('/app/admin/dashboard')">看板</el-button>
              <el-button size="small" @click="$router.push('/app/admin/news')">新闻管理</el-button>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../../stores/auth";

const router = useRouter();
const auth = useAuthStore();
const token = computed(() => auth.token);

function goCenter() {
  if (auth.role === "user") router.push("/app/user/resume");
  else if (auth.role === "company") router.push("/app/company/jobs");
  else router.push("/app/admin/dashboard");
}

function logout() {
  auth.logout();
  router.push("/");
}
</script>
