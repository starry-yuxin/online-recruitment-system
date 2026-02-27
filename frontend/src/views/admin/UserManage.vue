<template>
  <el-card>
    <div style="display:flex;justify-content:space-between;align-items:center">
      <h3 style="margin:0">个人用户管理（管理员）</h3>
      <el-button @click="load">刷新</el-button>
    </div>

    <el-table :data="list" style="margin-top:12px">
      <el-table-column prop="id" label="ID" width="90" />
      <el-table-column prop="username" label="用户名" />
      <el-table-column prop="status" label="状态" width="120" />
      <el-table-column label="操作" width="220">
        <template #default="{ row }">
          <el-button size="small" type="success" @click="setStatus(row, 'active')">启用</el-button>
          <el-button size="small" type="danger" @click="setStatus(row, 'disabled')">禁用</el-button>
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { http } from "../../api/http";

const list = ref<any[]>([]);

async function load() {
  try {
    const res = await http.get("/admin/users");
    list.value = res.data?.data || [];
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.message || e?.message || "加载失败");
    list.value = [];
  }
}

async function setStatus(row: any, status: string) {
  try {
    await http.put(`/admin/users/${row.id}/status`, { status });
    ElMessage.success("更新成功");
    await load();
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.message || e?.message || "更新失败");
  }
}

onMounted(load);
</script>
