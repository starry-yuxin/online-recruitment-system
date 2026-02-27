<template>
  <el-card>
    <h3>管理员统计</h3>
    <el-row :gutter="12">
      <el-col :span="8"><el-statistic title="岗位数" :value="stats.jobs" /></el-col>
      <el-col :span="8"><el-statistic title="投递数" :value="stats.applications" /></el-col>
      <el-col :span="8"><el-statistic title="新闻数" :value="stats.news" /></el-col>
    </el-row>

    <el-divider />

    <div style="display:flex;gap:12px;flex-wrap:wrap">
      <el-card style="flex:1;min-width:360px">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div style="font-weight:600">热门城市 Top5（岗位数）</div>
          <el-button size="small" @click="loadCharts">刷新</el-button>
        </div>
        <div ref="cityEl" style="height:320px;margin-top:8px"></div>
      </el-card>

      <el-card style="flex:1;min-width:360px">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div style="font-weight:600">投递趋势（最近 {{ days }} 天）</div>
          <el-select v-model="days" size="small" style="width:120px" @change="loadCharts">
            <el-option :value="7" label="7 天" />
            <el-option :value="14" label="14 天" />
            <el-option :value="30" label="30 天" />
          </el-select>
        </div>
        <div ref="trendEl" style="height:320px;margin-top:8px"></div>
      </el-card>
    </div>

    <el-divider />
    <el-button type="primary" @click="backup">备份数据库</el-button>
  </el-card>
</template>

<script setup lang="ts">
import { reactive, onMounted, ref, nextTick, onBeforeUnmount } from "vue";
import { http } from "../../api/http";
import * as echarts from "echarts";

const stats = reactive({ jobs: 0, applications: 0, news: 0 });

const cityEl = ref<HTMLDivElement | null>(null);
const trendEl = ref<HTMLDivElement | null>(null);

let cityChart: echarts.ECharts | null = null;
let trendChart: echarts.ECharts | null = null;

const days = ref(14);

async function loadStats() {
  const res = await http.get("/admin/stats");
  Object.assign(stats, res.data.data);
}

async function loadCharts() {
  const [citiesRes, trendRes] = await Promise.all([
    http.get("/admin/charts/cities"),
    http.get("/admin/charts/app_trend", { params: { days: days.value } })
  ]);

  const cities = citiesRes.data.data as Array<{ city: string; c: number }>;
  const trend = trendRes.data.data.points as Array<{ d: string; c: number }>;

  await nextTick();

  if (cityEl.value) {
    if (!cityChart) cityChart = echarts.init(cityEl.value);
    cityChart.setOption({
      tooltip: {},
      xAxis: { type: "category", data: cities.map(x => x.city) },
      yAxis: { type: "value" },
      series: [{ type: "bar", data: cities.map(x => x.c) }]
    });
  }

  if (trendEl.value) {
    if (!trendChart) trendChart = echarts.init(trendEl.value);
    trendChart.setOption({
      tooltip: { trigger: "axis" },
      xAxis: { type: "category", data: trend.map(x => x.d) },
      yAxis: { type: "value" },
      series: [{ type: "line", data: trend.map(x => x.c), smooth: true }]
    });
  }
}

async function backup() {
  await http.post("/admin/backup");
}

function handleResize() {
  cityChart?.resize();
  trendChart?.resize();
}

onMounted(async () => {
  await loadStats();
  await loadCharts();
  window.addEventListener("resize", handleResize);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", handleResize);
  cityChart?.dispose();
  trendChart?.dispose();
});
</script>
