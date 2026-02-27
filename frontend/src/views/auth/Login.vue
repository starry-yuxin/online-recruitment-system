<template>
  <el-card style="max-width:420px;margin:80px auto">
    <h3 style="margin:0 0 12px 0;">登录</h3>

    <el-form :model="form" label-width="80px">
      <el-form-item label="用户名">
        <el-input v-model="form.username" />
      </el-form-item>

      <el-form-item label="密码">
        <el-input v-model="form.password" type="password" show-password />
      </el-form-item>

      <el-button type="primary" @click="login" style="width:100%">登录</el-button>

      <div style="margin-top:10px;color:#666">
        没账号？<router-link to="/register">注册</router-link>
      </div>

      <div style="margin-top:10px;color:#999;font-size:12px;">
        登录后会自动跳转到你的控制台（user/company/admin）。
      </div>
    </el-form>
  </el-card>
</template>

<script setup lang="ts">
import { reactive } from "vue";
import { http } from "../../api/http";
import { useAuthStore } from "../../stores/auth";
import { useRouter } from "vue-router";

const form = reactive({ username: "", password: "" });
const auth = useAuthStore();
const router = useRouter();

async function login() {
  const res = await http.post("/auth/login", form);
  auth.setAuth(res.data.data.token, res.data.data.role, res.data.data.uid);

  const role = res.data.data.role;
  if (role === "user") router.push("/app/user/resume");
  else if (role === "company") router.push("/app/company/jobs");
  else router.push("/app/admin/dashboard");
}
</script>
