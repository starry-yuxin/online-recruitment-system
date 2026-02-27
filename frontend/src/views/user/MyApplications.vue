<template>
  <el-card>
    <h3>我的投递</h3>
    <el-table :data="list">
      <el-table-column prop="company_name" label="企业" />
      <el-table-column prop="position" label="职位" />
      <el-table-column prop="status" label="状态" width="140" />
      <el-table-column prop="apply_time" label="投递时间" width="180" />
    </el-table>
  </el-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { http } from "../../api/http";

const list = ref<any[]>([]);
onMounted(async () => {
  const res = await http.get("/applications/me");
  list.value = res.data.data;
});
</script>
