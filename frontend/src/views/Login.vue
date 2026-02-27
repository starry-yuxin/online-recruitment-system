<template>
  <div class="page">
    <el-card style="max-width:420px;margin:auto">
      <h3 style="text-align:center">系统登录</h3>

      <el-form :model="form" label-position="top">
        <el-form-item label="用户名">
          <el-input v-model="form.username" />
        </el-form-item>

        <el-form-item label="密码">
          <el-input type="password" v-model="form.password" show-password />
        </el-form-item>

        <el-form-item label="登录角色">
          <el-select v-model="form.role" style="width:100%">
            <el-option label="个人用户" value="user" />
            <el-option label="企业用户" value="company" />
            <el-option label="管理员" value="admin" />
          </el-select>
        </el-form-item>

        <el-button type="primary" style="width:100%" @click="submit">
          登录
        </el-button>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { reactive } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";

const router = useRouter();
const auth = useAuthStore();

const form = reactive({
  username: "",
  password: "",
  role: "user",
});

async function submit() {
  try {
    await auth.login(form.username, form.password, form.role);
    router.push("/");
  } catch (e) {
    // 错误已经由 http.ts 统一弹出
  }
}
</script>

<style scoped>
.page {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
