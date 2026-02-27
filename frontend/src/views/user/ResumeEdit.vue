<template>
  <el-card>
    <h3>我的简历</h3>
    <el-form :model="form" label-width="110px">
      <el-form-item label="邮箱"><el-input v-model="form.email" /></el-form-item>
      <el-form-item label="电话"><el-input v-model="form.phone" /></el-form-item>
      <el-form-item label="教育程度"><el-input v-model="form.education" /></el-form-item>
      <el-form-item label="技能特长"><el-input v-model="form.skills" /></el-form-item>
      <el-form-item label="期望职位"><el-input v-model="form.expected_position" /></el-form-item>
      <el-form-item label="期望城市"><el-input v-model="form.expected_city" /></el-form-item>
      <el-form-item label="期望薪资"><el-input v-model="form.expected_salary" /></el-form-item>
      <el-form-item label="自我介绍"><el-input v-model="form.intro" type="textarea" rows="5" /></el-form-item>
      <el-button type="primary" @click="save">保存</el-button>
    </el-form>
  </el-card>
</template>

<script setup lang="ts">
import { reactive, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { http } from "../../api/http";

const form = reactive<any>({
  email:"", phone:"", education:"", skills:"",
  expected_position:"", expected_city:"", expected_salary:"", intro:""
});

onMounted(async () => {
  const res = await http.get("/resume/me");
  if (res.data.data) Object.assign(form, res.data.data);
});

async function save() {
  await http.put("/resume/me", form);
  ElMessage.success("已保存");
}
</script>
