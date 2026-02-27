<template>
  <el-card style="max-width:520px;margin:40px auto">
    <h3>注册</h3>
    <el-form :model="form" label-width="110px">
      <el-form-item label="用户名"><el-input v-model="form.username" /></el-form-item>
      <el-form-item label="密码"><el-input v-model="form.password" type="password" /></el-form-item>
      <el-form-item label="角色">
        <el-select v-model="form.role">
          <el-option label="个人用户" value="user" />
          <el-option label="企业用户" value="company" />
        </el-select>
      </el-form-item>

      <template v-if="form.role==='user'">
        <el-form-item label="姓名"><el-input v-model="form.realName" /></el-form-item>
        <el-form-item label="邮箱"><el-input v-model="form.email" /></el-form-item>
      </template>

      <template v-else>
        <el-form-item label="企业名称"><el-input v-model="form.companyName" /></el-form-item>
        <el-form-item label="企业邮箱"><el-input v-model="form.companyEmail" /></el-form-item>
      </template>

      <el-button type="primary" @click="register" style="width:100%">注册</el-button>
      <div style="margin-top:10px">
        已有账号？<router-link to="/login">登录</router-link>
      </div>
    </el-form>
  </el-card>
</template>

<script setup lang="ts">
import { reactive } from "vue";
import { http } from "../../api/http";
import { useRouter } from "vue-router";

const router = useRouter();
const form = reactive<any>({
  username: "", password: "", role: "user",
  realName: "", email: "", companyName: "", companyEmail: ""
});

async function register() {
  await http.post("/auth/register", form);
  router.push("/login");
}
</script>
