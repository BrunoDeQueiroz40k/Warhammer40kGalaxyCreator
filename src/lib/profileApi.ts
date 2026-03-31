import { api } from "./apiClient";

export async function fetchOverviewStats() {
  return await api.request<{ stats: { planetCount: number } }>("/stats/overview");
}

export async function updateCurrentUserProfileImage(profileImage: string) {
  return await api.request("/users/me", {
    method: "PATCH",
    body: JSON.stringify({ profileImage }),
  });
}

export async function updateCurrentUserBannerImage(bannerImage: string) {
  return await api.request("/users/me", {
    method: "PATCH",
    body: JSON.stringify({ bannerImage }),
  });
}
