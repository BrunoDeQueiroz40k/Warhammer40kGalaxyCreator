import { api } from "./apiClient";

export type DownloadImportEntry = {
  id: string;
  createdAt: string;
  fileName: string;
  planetCount: number;
};

export type DownloadExportEntry = {
  id: string;
  createdAt: string;
  fileName: string;
  planetCount: number;
  snapshotId: string | null;
};

export async function fetchOverviewStats() {
  return await api.request<{ stats: { planetCount: number } }>("/stats/overview");
}

export async function fetchImportsHistory(limit = 50) {
  return await api.request<{ downloads: DownloadImportEntry[] }>(
    `/downloads?type=IMPORT&limit=${limit}`
  );
}

export async function fetchExportsHistory(limit = 50) {
  return await api.request<{ downloads: DownloadExportEntry[] }>(
    `/downloads?type=EXPORT&limit=${limit}`
  );
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

export async function fetchSnapshotPlanets(snapshotId: string) {
  return await api.request<{
    snapshot: {
      payload: { planets?: unknown[] };
    };
  }>(`/snapshots/${snapshotId}`);
}
