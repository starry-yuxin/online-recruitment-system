<template>
  <el-card>
    <h3>投递管理（企业）</h3>

    <el-table :data="list" v-loading="loading">
      <el-table-column prop="user_real_name" label="姓名" width="120" />
      <el-table-column prop="position" label="职位" />
      <el-table-column prop="status" label="状态" width="140" />
      <el-table-column prop="apply_time" label="时间" width="180" />

      <el-table-column label="操作" width="340">
        <template #default="{ row }">
          <el-select v-model="row.status" style="width:140px" @change="update(row)">
            <el-option value="submitted" label="submitted" />
            <el-option value="viewed" label="viewed" />
            <el-option value="interview" label="interview" />
            <el-option value="rejected" label="rejected" />
            <el-option value="offer" label="offer" />
          </el-select>

          <el-button style="margin-left:10px" @click="openResume(row)">
            查看简历
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 简历 Drawer -->
    <el-drawer v-model="drawerOpen" title="求职者简历" size="45%">
      <div v-loading="resumeLoading">
        <el-empty v-if="!resume && !resumeLoading" description="暂无简历数据" />

        <el-descriptions v-else :column="1" border>
          <el-descriptions-item label="邮箱">{{ resume?.email || "-" }}</el-descriptions-item>
          <el-descriptions-item label="电话">{{ resume?.phone || "-" }}</el-descriptions-item>
          <el-descriptions-item label="性别">{{ resume?.gender || "-" }}</el-descriptions-item>
          <el-descriptions-item label="地址">{{ resume?.address || "-" }}</el-descriptions-item>
          <el-descriptions-item label="邮编">{{ resume?.zip_code || resume?.postal_code || "-" }}</el-descriptions-item>

          <el-descriptions-item label="教育程度">{{ resume?.education || "-" }}</el-descriptions-item>
          <el-descriptions-item label="技能特长">{{ resume?.skills || "-" }}</el-descriptions-item>
          <el-descriptions-item label="工作类型">{{ resume?.work_type || "-" }}</el-descriptions-item>

          <el-descriptions-item label="期望职位">{{ resume?.expected_position || "-" }}</el-descriptions-item>
          <el-descriptions-item label="期望城市">{{ resume?.expected_city || "-" }}</el-descriptions-item>
          <el-descriptions-item label="期望薪资">{{ resume?.expected_salary || "-" }}</el-descriptions-item>

          <el-descriptions-item label="自我介绍">
            <div style="white-space:pre-wrap">{{ resume?.intro || "-" }}</div>
          </el-descriptions-item>

          <el-descriptions-item label="简历状态">
            {{ resume?.status || "-" }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-drawer>
  </el-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { http } from "../../api/http";
import { ElMessage } from "element-plus";

const list = ref<any[]>([]);
const loading = ref(false);

const drawerOpen = ref(false);
const resumeLoading = ref(false);
const resume = ref<any>(null);

onMounted(async () => {
  await load();
});

async function load() {
  loading.value = true;
  try {
    const res = await http.get("/applications/company");
    list.value = res.data.data;
  } finally {
    loading.value = false;
  }
}

async function update(row: any) {
  await http.patch(`/applications/${row.id}/status`, { status: row.status });
  ElMessage.success("状态已更新");
}

async function openResume(row: any) {
  drawerOpen.value = true;
  resume.value = null;

  resumeLoading.value = true;
  try {
    // ✅ 调后端新接口
    const res = await http.get(`/applications/${row.id}/resume`);
    resume.value = res.data.data;
  } catch (e) {
    ElMessage.error("获取简历失败（请确认后端已加 /applications/:id/resume）");
  } finally {
    resumeLoading.value = false;
  }
}
</script>
