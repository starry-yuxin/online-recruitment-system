<template>
  <el-card class="page-card">
    <div style="display:flex; justify-content:space-between; align-items:center;">
      <div>
        <h3 style="margin:0;">企业信息维护</h3>
        <div style="color:#888; margin-top:6px;">维护企业名称/类型/联系方式/地址/Logo</div>
      </div>
      <el-button type="primary" :loading="saving" @click="save">保存</el-button>
    </div>

    <el-divider />

    <el-form :model="form" label-width="110px" style="max-width:760px;">
      <el-form-item label="企业名称" required>
        <el-input v-model="form.company_name" placeholder="请输入企业名称" />
      </el-form-item>

      <el-form-item label="企业类型">
        <el-input v-model="form.company_type" placeholder="例如：互联网/制造业/教育..." />
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

      <el-form-item label="Logo">
        <input type="file" accept="image/*" @change="onFile" />
        <div v-if="previewUrl" style="margin-top:10px;">
          <el-image :src="previewUrl" style="width:160px;height:90px" fit="cover" />
        </div>
        <div v-else-if="form.logo_url" style="margin-top:10px;">
          <el-image :src="backendBase + form.logo_url" style="width:160px;height:90px" fit="cover" />
        </div>
        <div v-else style="color:#888; margin-top:8px;">未上传</div>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { http } from "../../api/http";

const backendBase = "http://localhost:3001";

const saving = ref(false);
const previewUrl = ref("");
const file = ref<File | null>(null);

const form = reactive<any>({
  company_id: null,
  company_name: "",
  company_type: "",
  email: "",
  phone: "",
  address: "",
  zip_code: "",
  logo_url: "",
});

async function load() {
  const res = await http.get("/company/profile");
  Object.assign(form, res.data?.data || {});
}

function onFile(e: Event) {
  const input = e.target as HTMLInputElement;
  if (!input.files || !input.files.length) return;
  file.value = input.files[0];
  previewUrl.value = URL.createObjectURL(file.value);
}

async function save() {
  if (!form.company_name) return ElMessage.error("请填写企业名称");

  saving.value = true;
  try {
    const fd = new FormData();
    fd.append("company_name", form.company_name);
    fd.append("company_type", form.company_type || "");
    fd.append("email", form.email || "");
    fd.append("phone", form.phone || "");
    fd.append("address", form.address || "");
    fd.append("zip_code", form.zip_code || "");
    if (file.value) fd.append("logo", file.value);

    const res = await http.put("/company/profile", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    ElMessage.success(res.data?.message || "保存成功");
    previewUrl.value = "";
    file.value = null;
    await load(); // 重新拉取，拿到最新 logo_url（带后缀）
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.message || e?.message || "保存失败");
  } finally {
    saving.value = false;
  }
}

onMounted(load);
</script>

<style scoped>
.page-card { max-width: 1100px; margin: 24px auto; }
</style>
