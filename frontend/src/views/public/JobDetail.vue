<template>
  <el-card class="page-card">
    <div v-if="loading" style="padding: 40px 0;">
      <el-skeleton :rows="6" animated />
    </div>

    <template v-else>
      <div class="top">
        <div>
          <div class="title">{{ job?.position || "-" }}</div>
          <div class="meta">
            <el-tag size="small" type="info">{{ job?.city || "-" }}</el-tag>
            <span class="dot">•</span>
            <span>招聘 {{ job?.headcount ?? "-" }} 人</span>
            <span class="dot">•</span>
            <span>状态：{{ job?.status ?? "-" }}</span>
          </div>
        </div>

        <div class="actions">
          <el-button type="primary" @click="apply">一键投递</el-button>
          <el-button @click="favorite">收藏岗位</el-button>
        </div>
      </div>

      <el-divider />

      <el-descriptions :column="1" border>
        <el-descriptions-item label="公司">{{ job?.company_name || "-" }}</el-descriptions-item>
        <el-descriptions-item label="城市">{{ job?.city || "-" }}</el-descriptions-item>
        <el-descriptions-item label="发布时间">{{ formatTime(job?.publish_time) }}</el-descriptions-item>
        <el-descriptions-item label="岗位描述">
          <div style="white-space: pre-wrap">{{ job?.description || "-" }}</div>
        </el-descriptions-item>
      </el-descriptions>

      <!-- ✅ 新增：公司信息卡片（公共入口） -->
      <el-card v-if="company" style="margin-top: 12px;">
        <h4 style="margin: 0 0 8px 0;">公司信息</h4>
        <div>公司：{{ company.company_name || "-" }}</div>
        <div>类型：{{ company.company_type || "-" }}</div>
        <div>邮箱：{{ company.email || "-" }}</div>
        <div>电话：{{ company.phone || "-" }}</div>
        <div>地址：{{ company.address || "-" }}</div>
        <div>邮编：{{ company.zip_code || "-" }}</div>

        <el-button
          style="margin-top: 10px;"
          type="primary"
          @click="$router.push(`/companies/${company.company_id}`)"
        >
          查看公司信息
        </el-button>
      </el-card>

      <div class="debug">调试：OK /jobs/{{ jobId }} loaded</div>
    </template>
  </el-card>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute } from "vue-router";
import { ElMessage } from "element-plus";
import { publicHttp, http } from "../../api/http";
import { useAuthStore } from "../../stores/auth";

type JobDetail = {
  id: number;
  company_id: number;
  position: string;
  headcount: number;
  city: string;
  description: string;
  publish_time: string;
  view_count: number;
  status: string;

  company_name?: string;
  company_type?: string;
  company_email?: string;
  company_phone?: string;
  company_address?: string;
  company_zip?: string;
  logo_url?: string | null;
};

const route = useRoute();
const auth = useAuthStore();

const job = ref<JobDetail | null>(null);
const loading = ref(false);

// ✅ 新增：公司资料（company_profile）
const company = ref<any>(null);

const jobId = computed(() => {
  const id = Number(route.params.id);
  return Number.isFinite(id) ? id : 0;
});

function formatTime(t?: string) {
  if (!t) return "-";
  return String(t).replace("T", " ").replace(".000Z", "").slice(0, 19);
}

// ✅ 新增：加载公司资料（公共接口 /companies/:id）
async function loadCompany(companyId: number) {
  if (!companyId) {
    company.value = null;
    return;
  }
  try {
    const res = await publicHttp.get(`/companies/${companyId}`);
    company.value = res.data?.data || res.data || null;
  } catch {
    // 公司资料加载失败不影响岗位详情展示
    company.value = null;
  }
}

async function load() {
  if (!jobId.value) {
    ElMessage.error("非法岗位ID");
    return;
  }
  loading.value = true;
  try {
    const res = await publicHttp.get(`/jobs/${jobId.value}`);
    // 后端是 {success:true, data:{...}}
    job.value = res.data?.data || res.data || null;

    // ✅ 新增：拿到 job 后加载公司资料
    if (job.value?.company_id) {
      await loadCompany(job.value.company_id);
    } else {
      company.value = null;
    }
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.message || e?.message || "加载失败");
    job.value = null;
    company.value = null;
  } finally {
    loading.value = false;
  }
}

async function apply() {
  if (!auth.token) return ElMessage.warning("请先登录个人账号再投递");
  if (auth.role !== "user") return ElMessage.warning("请使用个人账号（user）投递");
  if (!jobId.value) return ElMessage.error("missing job_post_id");

  try {
    // ✅ 后端要求：job_post_id
    const res = await http.post("/applications", { job_post_id: jobId.value });
    ElMessage.success(res.data?.message || "投递成功");
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.message || e?.message || "投递失败");
  }
}

async function favorite() {
  if (!auth.token) return ElMessage.warning("请先登录个人账号再收藏");
  if (auth.role !== "user") return ElMessage.warning("请使用个人账号（user）收藏");
  if (!jobId.value) return ElMessage.error("missing job_post_id");

  try {
    // ✅ 后端要求：job_post_id
    const res = await http.post("/favorites", { job_post_id: jobId.value });
    ElMessage.success(res.data?.message || "收藏成功");
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.message || e?.message || "收藏失败");
  }
}

load();
</script>

<style scoped>
.page-card { max-width: 1100px; margin: 24px auto; }
.top { display:flex; justify-content:space-between; align-items:flex-start; gap:16px; }
.title { font-size: 28px; font-weight: 800; margin-bottom: 10px; }
.meta { display:flex; align-items:center; gap:8px; color:#666; }
.dot { color:#bbb; }
.actions { display:flex; gap:12px; }
.debug { margin-top: 14px; color:#888; font-size: 13px; }
</style>
