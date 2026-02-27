<template>
  <el-card>
    <div style="display:flex;justify-content:space-between;align-items:center">
      <h3 style="margin:0">我的收藏</h3>
      <el-button @click="load">刷新</el-button>
    </div>

    <el-table :data="list" style="margin-top:12px" @row-click="go">
      <el-table-column prop="company_name" label="企业" />
      <el-table-column prop="position" label="职位" />
      <el-table-column prop="city" label="城市" width="120" />
      <el-table-column prop="status" label="状态" width="120">
        <template #default="{row}">
          <el-tag :type="row.status==='open' ? 'success' : 'info'">{{ row.status }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="140">
        <template #default="{row}">
          <el-button size="small" type="danger" @click.stop="unfav(row)">取消收藏</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div v-if="list.length===0" style="margin-top:12px;color:#888">
      还没有收藏任何职位。
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { listFavorites, removeFavorite } from "../../api/favorites.api";
import { ElMessageBox, ElMessage } from "element-plus";

const router = useRouter();
const list = ref<any[]>([]);

async function load() {
  const res = await listFavorites();
  list.value = res.data.data || [];
}

function go(row: any) {
  router.push(`/jobs/${row.id}`);
}

async function unfav(row: any) {
  await ElMessageBox.confirm(`取消收藏「${row.position}」？`, "提示", { type: "warning" });
  await removeFavorite(row.id);
  ElMessage.success("已取消收藏");
  await load();
}

onMounted(load);
</script>
