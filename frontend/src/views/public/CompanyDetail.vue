<template>
  <el-card class="page-card">
    <div class="header">
      <div>
        <div class="name">{{ company?.company_name || "-" }}</div>
        <div class="type">类型：{{ company?.company_type || "-" }}</div>
      </div>
      <el-button @click="router.back()">返回</el-button>
    </div>

    <el-divider />

    <el-descriptions :column="1" border>
      <el-descriptions-item label="邮箱">
        {{ company?.email || "-" }}
      </el-descriptions-item>

      <el-descriptions-item label="电话">
        {{ company?.phone || "-" }}
      </el-descriptions-item>

      <el-descriptions-item label="地址">
        {{ company?.address || "-" }}
      </el-descriptions-item>

      <el-descriptions-item label="邮编">
        {{ company?.zip_code || "-" }}
      </el-descriptions-item>

      <!-- ✅ 关键：Logo 用图片渲染 + 强制走 3001 -->
      <el-descriptions-item label="Logo">
        <el-image
          v-if="company?.logo_url"
          :src="assetUrl(company.logo_url)"
          style="width: 200px; height: 110px; border-radius: 8px"
          fit="cover"
        />
        <span v-else style="color:#888">无</span>
      </el-descriptions-item>
    </el-descriptions>
  </el-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { publicHttp } from "../../api/http";

const route = useRoute();
const router = useRouter();

const company = ref<any>(null);

/**
 * ✅ 关键：不要用相对路径 /uploads/xxx
 * 否则会变成 localhost:3000/uploads/xxx（前端服务器）
 * 必须拼成 localhost:3001/uploads/xxx（后端静态）
 */
const backendOrigin = "http://localhost:3001";

function assetUrl(p: string) {
  if (!p) return "";
  if (/^https?:\/\//i.test(p)) return p;           // 已经是完整 URL
  if (p.startsWith("/")) return backendOrigin + p; // /uploads/xxx -> http://localhost:3001/uploads/xxx
  return backendOrigin + "/" + p;
}

async function load() {
  const id = Number(route.params.id);
  if (!id) return ElMessage.error("非法公司ID");

  try {
    const res = await publicHttp.get(`/companies/${id}`);
    company.value = res.data?.data || null;
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.message || e?.message || "加载失败");
  }
}

onMounted(load);
</script>

<style scoped>
.page-card { max-width: 1100px; margin: 24px auto; }
.header { display:flex; justify-content:space-between; align-items:flex-start; gap:16px; }
.name { font-size: 28px; font-weight: 800; margin-bottom: 8px; }
.type { color:#666; }
</style>
