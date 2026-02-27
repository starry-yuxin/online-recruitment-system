<template>
  <div style="max-width:1100px;margin:20px auto;">
    <el-card>
      <div style="font-size:22px;font-weight:900;">新闻公告</div>
      <div style="color:#666;margin-top:6px;">系统公告 / 就业指导 / 通知新闻</div>

      <el-divider />

      <el-table :data="list" stripe>
        <el-table-column prop="title" label="标题" />
        <el-table-column prop="source" label="来源" width="160" />
        <el-table-column prop="publish_time" label="发布时间" width="200">
          <template #default="{ row }">
            {{ formatTime(row.publish_time) }}
          </template>
        </el-table-column>
        <el-table-column prop="view_count" label="点击" width="80" />
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button type="primary" link @click="goDetail(row.id)">
              查看
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { publicHttp } from "../../api/http";

const router = useRouter();
const list = ref<any[]>([]);

function formatTime(t?: string) {
  if (!t) return "-";
  return t.replace("T", " ").replace(".000Z", "");
}

async function load() {
  const res = await publicHttp.get("/news");
  list.value = res.data?.data?.list || [];
}

function goDetail(id: number) {
  router.push(`/news/${id}`);
}

onMounted(load);
</script>
