<template>
  <el-card v-loading="loading">
    <h3>企业资料（企业信息维护）</h3>

    <el-form :model="form" label-width="110px" style="margin-top:10px">
      <el-form-item label="企业名称" required>
        <el-input v-model="form.company_name" placeholder="必填" />
      </el-form-item>

      <el-form-item label="企业类型">
        <el-input v-model="form.company_type" placeholder="例如：互联网/制造业/教育等" />
      </el-form-item>

      <el-form-item label="邮箱">
        <el-input v-model="form.email" />
      </el-form-item>

      <el-form-item label="电话">
        <el-input v-model="form.phone" />
      </el-form-item>

      <el-form-item label="地址">
        <el-input v-model="form.address" />
      </el-form-item>

      <el-form-item label="邮编">
        <el-input v-model="form.zip_code" />
      </el-form-item>

      <el-form-item label="Logo URL">
        <el-input v-model="form.logo_url" placeholder="可选：放一个图片链接" />
      </el-form-item>

      <el-button type="primary" @click="save">保存</el-button>
    </el-form>
  </el-card>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from "vue";
import { http } from "../../api/http";
import { ElMessage } from "element-plus";

const loading = ref(false);

const form = reactive<any>({
  company_name: "",
  company_type: "",
  email: "",
  phone: "",
  address: "",
  zip_code: "",
  logo_url: ""
});

onMounted(async () => {
  loading.value = true;
  try {
    const res = await http.get("/company/me");
    Object.assign(form, res.data.data || {});
  } finally {
    loading.value = false;
  }
});

async function save() {
  if (!form.company_name) {
    ElMessage.error("企业名称必填");
    return;
  }
  await http.put("/company/me", form);
  ElMessage.success("保存成功");
}
</script>
