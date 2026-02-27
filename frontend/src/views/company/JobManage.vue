<template>
  <div style="max-width:1100px;margin:20px auto;">
    <el-card>
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap;">
        <div>
          <div style="font-size:22px;font-weight:900;">岗位管理（企业端）</div>
          <div style="color:#666;margin-top:6px;">发布/编辑/下架岗位；发布后公共端立刻可见</div>
        </div>
        <div style="display:flex;gap:10px;">
          <el-button @click="loadJobs">刷新</el-button>
          <el-button type="primary" @click="openCreate">发布岗位</el-button>
        </div>
      </div>

      <el-divider />

      <el-table :data="myJobs" border>
        <el-table-column prop="id" label="ID" width="90" />
        <el-table-column prop="position" label="职位" />
        <el-table-column prop="city" label="城市" width="120" />
        <el-table-column prop="headcount" label="人数" width="100" />
        <el-table-column prop="publish_time" label="发布时间" width="200">
          <template #default="{ row }">{{ formatTime(row.publish_time) }}</template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="120" />
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button size="small" @click="openEdit(row)">编辑</el-button>
            <el-button size="small" type="danger" plain @click="remove(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div style="margin-top:12px;color:#999;font-size:12px;">
        调试：我的岗位 {{ myJobs.length }}；uid={{ auth.uid }}
      </div>
    </el-card>

    <!-- 弹窗：新增/编辑 -->
    <el-dialog v-model="dlg.visible" :title="dlg.mode==='create' ? '发布岗位' : '编辑岗位'" width="560px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="职位" required>
          <el-input v-model="form.position" placeholder="例如：前端开发工程师" />
        </el-form-item>
        <el-form-item label="城市" required>
          <el-input v-model="form.city" placeholder="例如：北京" />
        </el-form-item>
        <el-form-item label="人数" required>
          <el-input-number v-model="form.headcount" :min="1" :max="999" />
        </el-form-item>
        <el-form-item label="描述" required>
          <el-input v-model="form.description" type="textarea" :rows="6" placeholder="岗位职责/要求..." />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dlg.visible=false">取消</el-button>
        <el-button type="primary" @click="save">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { ElMessageBox, ElMessage } from "element-plus";
import { http } from "../../api/http";
import { useAuthStore } from "../../stores/auth";

type Job = {
  id: number;
  company_id?: number; // mine 接口会返回 company_id（我后端示例里加了），可选不影响
  position: string;
  headcount: number;
  city: string;
  description: string;
  publish_time: string;
  status: string;
  view_count?: number;
};

const auth = useAuthStore();

// ✅ 直接从后端 /jobs/mine 拿“我的岗位”，不要用公共列表筛选
const myJobs = ref<Job[]>([]);

const dlg = reactive({
  visible: false,
  mode: "create" as "create" | "edit",
  editingId: 0,
});

const form = reactive({
  position: "",
  city: "",
  headcount: 1,
  description: "",
});

function resetForm() {
  form.position = "";
  form.city = "";
  form.headcount = 1;
  form.description = "";
}

function formatTime(t?: string) {
  if (!t) return "-";
  return t.replace("T", " ").replace(".000Z", "");
}

async function loadJobs() {
  // ✅ 企业端获取我的岗位：GET /jobs/mine
  const res = await http.get("/jobs/mine");
  // 后端 ok(res, { list, total, page, pageSize })
  myJobs.value = res.data?.data?.list || [];
}

function openCreate() {
  dlg.mode = "create";
  dlg.editingId = 0;
  resetForm();
  dlg.visible = true;
}

function openEdit(row: Job) {
  dlg.mode = "edit";
  dlg.editingId = row.id;
  form.position = row.position;
  form.city = row.city;
  form.headcount = row.headcount;
  form.description = row.description;
  dlg.visible = true;
}

async function save() {
  const payload = {
    position: form.position,
    city: form.city,
    headcount: form.headcount,
    description: form.description,
    // 后端应从 token 取 company_id；这里传不传都不影响，保留也没坏处
    company_id: auth.uid,
  };

  if (dlg.mode === "create") {
    await http.post("/jobs", payload);
    ElMessage.success("发布成功");
  } else {
    await http.put(`/jobs/${dlg.editingId}`, payload);
    ElMessage.success("更新成功");
  }

  dlg.visible = false;
  await loadJobs();
}

async function remove(id: number) {
  await ElMessageBox.confirm("确定删除该岗位吗？", "提示", { type: "warning" });
  await http.delete(`/jobs/${id}`);
  ElMessage.success("删除成功");
  await loadJobs();
}

onMounted(loadJobs);
</script>
