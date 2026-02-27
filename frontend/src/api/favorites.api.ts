import { http } from "./http";

export async function listFavorites() {
  return http.get("/favorites");
}
export async function addFavorite(job_post_id: number) {
  return http.post("/favorites", { job_post_id });
}
export async function removeFavorite(job_post_id: number) {
  return http.delete(`/favorites/${job_post_id}`);
}
export async function hasFavorite(job_post_id: number) {
  return http.get(`/favorites/has/${job_post_id}`);
}
