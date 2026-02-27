<template>
  <el-card>
    <div style="display:flex;justify-content:space-between;align-items:center">
      <h3 style="margin:0">企业用户管理（管理员）</h3>
      <el-button @click="load">刷新</el-button>
    </div>

    <el-table :data="list" style="margin-top:12px">
      <el-table-column prop="id" label="ID" width="90" />
      <el-table-column prop="username" label="企业账号" width="160" />
      <el-table-column prop="company_name" label="企业名称" />
      <el-table-column prop="company_type" label="类型" width="140" />
      <el-table-column prop="email" label="邮箱" width="200" />
      <el-table-column prop="phone" label="电话" width="140" />
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
    const res = await http.get("/admin/companies");
    list.value = res.data?.data || [];
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.message || e?.message || "加载失败");
    list.value = [];
  }
}

async function setStatus(row: any, status: string) {
  try {
    await http.put(`/admin/companies/${row.id}/status`, { status });
    ElMessage.success("更新成功");
    await load();
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.message || e?.message || "更新失败");
  }
}

onMounted(load);
</script>
