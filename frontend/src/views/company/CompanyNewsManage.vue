<template>
  <el-card>
    <div style="display:flex;justify-content:space-between;align-items:center">
      <h3 style="margin:0">企业新闻（企业端）</h3>
      <el-button type="primary" @click="openCreate">发布企业新闻</el-button>
    </div>

    <el-table :data="list" style="margin-top:12px" v-loading="loading">
      <el-table-column prop="title" label="标题" />
      <el-table-column prop="source" label="来源" width="160" />
      <el-table-column prop="publish_time" label="发布时间" width="180" />
      <el-table-column prop="view_count" label="点击" width="90" />
      <el-table-column label="封面" width="120">
        <template #default="{row}">
          <el-image
            v-if="row.image_url"
            :src="backendBase + row.image_url"
            style="width:90px;height:50px"
            fit="cover"
          />
          <span v-else style="color:#888">无</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="220">
        <template #default="{row}">
          <el-button size="small" @click="openEdit(row)">编辑</el-button>
          <el-button size="small" type="danger" @click="remove(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      style="margin-top:12px"
      layout="prev, pager, next"
      :page-size="pageSize"
      :total="total"
      @current-change="load"
    />

    <el-drawer v-model="drawer.open" :title="drawer.mode==='create'?'发布新闻':'编辑新闻'" size="45%">
      <el-form :model="form" label-width="90px">
        <el-form-item label="标题" required><el-input v-model="form.title" /></el-form-item>
        <el-form-item label="来源"><el-input v-model="form.source" placeholder="例如：公司公告/HR部门" /></el-form-item>
        <el-form-item label="内容" required>
          <el-input v-model="form.content" type="textarea" rows="10" />
        </el-form-item>

        <el-form-item label="封面">
          <input type="file" accept="image/*" @change="onFile" />
          <div v-if="form.preview" style="margin-top:8px">
            <el-image :src="form.preview" style="width:200px;height:120px" fit="cover" />
          </div>
        </el-form-item>

        <el-button type="primary" @click="submit">{{ drawer.mode==='create'?'发布':'保存' }}</el-button>
      </el-form>
    </el-drawer>
  </el-card>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { http } from "../../api/http";
import { ElMessageBox, ElMessage } from "element-plus";

const backendBase = "http://localhost:3001";
const loading = ref(false);

const list = ref<any[]>([]);
const total = ref(0);
const pageSize = 10;

const drawer = reactive<{open:boolean; mode:"create"|"edit"; id:number|null}>({
  open: false, mode: "create", id: null
});

const form = reactive<any>({
  title: "",
  source: "",
  content: "",
  file: null as File | null,
  preview: ""
});

function resetForm() {
  form.title = "";
  form.source = "";
  form.content = "";
  form.file = null;
  form.preview = "";
}

async function load(page=1) {
  loading.value = true;
  try {
    const res = await http.get("/company/news", { params: { page, pageSize } });
    list.value = res.data.data.list;
    total.value = res.data.data.total;
  } finally {
    loading.value = false;
  }
}

function openCreate() {
  drawer.mode = "create";
  drawer.id = null;
  resetForm();
  drawer.open = true;
}

function openEdit(row: any) {
  drawer.mode = "edit";
  drawer.id = row.id;
  resetForm();
  form.title = row.title;
  form.source = row.source || "";
  form.content = row.content || ""; // 如果列表没带 content，就自己 GET 详情（你现在 companyNews 列表没带 content）
  form.preview = row.image_url ? backendBase + row.image_url : "";
  drawer.open = true;
}

function onFile(e: Event) {
  const input = e.target as HTMLInputElement;
  if (!input.files || !input.files.length) return;
  form.file = input.files[0];
  form.preview = URL.createObjectURL(form.file);
}

async function submit() {
  if (!form.title || !form.content) {
    ElMessage.error("请填写标题和内容");
    return;
  }
  const fd = new FormData();
  fd.append("title", form.title);
  fd.append("content", form.content);
  fd.append("source", form.source);
  if (form.file) fd.append("image", form.file);

  if (drawer.mode === "create") {
    await http.post("/company/news", fd, { headers: { "Content-Type": "multipart/form-data" } });
    ElMessage.success("发布成功");
  } else {
    await http.put(`/company/news/${drawer.id}`, fd, { headers: { "Content-Type": "multipart/form-data" } });
    ElMessage.success("保存成功");
  }

  drawer.open = false;
  await load(1);
}

async function remove(row: any) {
  await ElMessageBox.confirm(`确定删除新闻「${row.title}」？`, "提示", { type: "warning" });
  await http.delete(`/company/news/${row.id}`);
  ElMessage.success("已删除");
  await load(1);
}

onMounted(() => load(1));
</script>
