import { defineStore } from "pinia";

export type Role = "admin" | "company" | "user";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    token: localStorage.getItem("token") || "",
    role: (localStorage.getItem("role") as Role) || null,
    uid: Number(localStorage.getItem("uid") || 0)
  }),
  actions: {
    setAuth(token: string, role: Role, uid: number) {
      this.token = token; this.role = role; this.uid = uid;
      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
      localStorage.setItem("uid", String(uid));
    },
    logout() {
      this.token = ""; this.role = null; this.uid = 0;
      localStorage.clear();
    }
  }
});
