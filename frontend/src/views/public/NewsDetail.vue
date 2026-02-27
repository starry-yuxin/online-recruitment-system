<template>
  <div style="max-width:900px;margin:22px auto;">
    <el-card v-loading="loading">
      <div style="font-size:34px;font-weight:900;line-height:1.2;">
        {{ news.title || "-" }}
      </div>

      <div style="color:#888;margin-top:10px;font-size:14px;">
        {{ news.source || "—" }} ｜ {{ formatTime(news.publish_time) }} ｜ 点击 {{ news.view_count ?? 0 }}
      </div>

      <el-divider />

      <!-- ✅ 封面：有 image_url 才显示 -->
      <div v-if="coverUrl" style="margin:12px 0 18px 0;">
        <el-image
          :src="coverUrl"
          style="width:100%;max-height:420px;border-radius:10px;"
          fit="cover"
          :preview-src-list="[coverUrl]"
        />
      </div>

      <!-- 内容 -->
      <div style="font-size:16px;line-height:1.9;white-space:pre-wrap;">
        {{ news.content || "" }}
      </div>

      <div style="margin-top:16px;color:#999;font-size:12px;">
        id={{ news.id }}
        <span v-if="news.image_url">｜image_url={{ news.image_url }}</span>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { publicHttp } from "../../api/http";

const backendBase = "http://localhost:3001";

const route = useRoute();
const loading = ref(false);

const news = ref<any>({
  id: null,
  title: "",
  source: "",
  publish_time: "",
  view_count: 0,
  image_url: "",
  content: ""
});

// ✅ 兼容两种：/uploads/xxx.png 或 http://xxx/uploads/xxx.png
const coverUrl = computed(() => {
  const u = news.value?.image_url;
  if (!u) return "";
  if (typeof u !== "string") return "";
  if (u.startsWith("http://") || u.startsWith("https://")) return u;
  return backendBase + u;
});

function formatTime(t?: string) {
  if (!t) return "-";
  return String(t).replace("T", " ").replace(".000Z", "");
}

async function load() {
  const id = Number(route.params.id);
  if (!id) return;

  loading.value = true;
  try {
    // 详情是公开可看的：用 publicHttp
    const res = await publicHttp.get(`/news/${id}`);
    // 你的后端结构：ok(res, rows[0])
    news.value = res.data?.data || {};
  } finally {
    loading.value = false;
  }
}

onMounted(load);
</script>
