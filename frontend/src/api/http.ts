import axios from "axios";
import { useAuthStore } from "../stores/auth";

// 公共接口：不带 token（岗位列表、岗位详情等）
export const publicHttp = axios.create({
  baseURL: "http://localhost:3001/api"
});

// 需要登录的接口：自动带 token（投递、收藏、企业端管理等）
export const http = axios.create({
  baseURL: "http://localhost:3001/api"
});

http.interceptors.request.use((config) => {
  const auth = useAuthStore();
  if (auth.token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${auth.token}`;
  }
  return config;
});
