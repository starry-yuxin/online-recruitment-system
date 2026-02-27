<template>
  <el-card class="page-card">
    <div class="header">
      <div>
        <h2 style="margin:0">岗位列表</h2>
        <div class="sub">点击岗位进入详情页（登录个人账号可收藏/投递）</div>
      </div>
      <el-button @click="load" type="primary" plain>刷新</el-button>
    </div>

    <div class="filters">
      <el-input v-model="kw" placeholder="搜索职位/城市" clearable style="max-width: 320px" />
      <el-select v-model="city" placeholder="城市" clearable style="width: 180px">
        <el-option v-for="c in cityOptions" :key="c" :label="c" :value="c" />
      </el-select>
      <el-button type="primary" @click="load">查询</el-button>
    </div>

    <el-divider />

    <el-empty v-if="jobs.length === 0" description="暂无岗位" />

    <div class="grid" v-else>
      <el-card v-for="j in jobs" :key="j.id" class="job-card" shadow="hover">
        <div class="job-title">{{ j.position }}</div>

        <div class="meta">
          <el-tag size="small" type="info">{{ j.city || "-" }}</el-tag>
          <span class="dot">•</span>
          <span>招聘 {{ j.headcount ?? "-" }} 人</span>
          <span class="dot">•</span>
          <span>状态：{{ j.status ?? "-" }}</span>
        </div>

        <div class="footer">
          <div class="time">发布：{{ formatTime(j.publish_time) }}</div>
          <el-button type="primary" link @click.stop="goDetail(j.id)">查看</el-button>
        </div>
      </el-card>
    </div>

    <div class="debug">调试信息：已加载岗位 {{ jobs.length }} 条；第一条 id：{{ jobs[0]?.id ?? "-" }}</div>
  </el-card>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { publicHttp } from "../../api/http";

type Job = {
  id: number;
  company_id: number;
  position: string;
  headcount: number;
  city: string;
  description: string;
  publish_time: string;
  view_count: number;
  status: string;
};

const router = useRouter();

const jobs = ref<Job[]>([]);
const kw = ref("");
const city = ref("");
const cityOptions = ["北京", "上海", "广州", "深圳", "杭州", "南京", "成都", "武汉", "西安", "苏州"];

function pickList(payload: any): Job[] {
  // 兼容各种返回结构：
  // 1) {success:true, data:[...]}
  // 2) {success:true, data:{list:[...]}}
  // 3) 直接返回 [...]
  const d = payload?.data ?? payload;
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.list)) return d.list;
  if (Array.isArray(d?.rows)) return d.rows;
  return [];
}

function formatTime(t?: string) {
  if (!t) return "-";
  // 直接截取到秒，避免时区显示乱
  return String(t).replace("T", " ").replace(".000Z", "").slice(0, 19);
}

async function load() {
  try {
    const res = await publicHttp.get("/jobs", {
      params: {
        keyword: kw.value || undefined,
        city: city.value || undefined
      }
    });

    // 后端一般是 {success, message, data}
    const list = pickList(res.data);
    jobs.value = list;
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.message || e?.message || "加载失败");
    jobs.value = [];
  }
}

function goDetail(id: number) {
  if (!id) return ElMessage.error("非法岗位ID");
  router.push({ path: `/jobs/${id}` });
}

load();
</script>

<style scoped>
.page-card { max-width: 1200px; margin: 24px auto; }
.header { display:flex; justify-content:space-between; align-items:flex-start; gap:12px; }
.sub { margin-top:6px; color:#888; font-size:13px; }
.filters { margin-top: 14px; display:flex; gap:12px; align-items:center; flex-wrap:wrap; }
.grid { display:grid; grid-template-columns: repeat(3, 1fr); gap:16px; }
@media (max-width: 1100px) { .grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 720px) { .grid { grid-template-columns: 1fr; } }
.job-card { border-radius: 12px; }
.job-title { font-size: 20px; font-weight: 700; margin-bottom: 10px; }
.meta { display:flex; align-items:center; gap:8px; color:#666; }
.dot { color:#bbb; }
.footer { display:flex; justify-content:space-between; align-items:center; margin-top: 16px; color:#888; font-size: 13px; }
.debug { margin-top: 16px; padding: 10px 12px; background: #fafafa; border-radius: 10px; color:#777; font-size: 13px; }
</style>
