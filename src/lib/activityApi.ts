import { api } from "./apiClient";
import { ExportablePlanetData } from "../ts/interfaces";

export async function recordImportDownloadActivity(params: {
  fileName: string;
  planetCount: number;
}) {
  return await api.request("/downloads", {
    method: "POST",
    body: JSON.stringify({
      fileName: params.fileName,
      format: "zip",
      activityType: "IMPORT",
      planetCount: params.planetCount,
    }),
  });
}

export async function createSnapshotAndRecordExport(params: {
  planets: ExportablePlanetData[];
  fileName?: string;
}) {
  const { snapshot } = await api.request<{ snapshot: { id: string } }>(
    "/snapshots",
    {
      method: "POST",
      body: JSON.stringify({
        payload: {
          planets: params.planets,
          exportDate: new Date().toISOString(),
          version: "1.0.0",
        },
      }),
    }
  );

  await api.request("/downloads", {
    method: "POST",
    body: JSON.stringify({
      fileName: params.fileName ?? "galaxy_export.zip",
      format: "zip",
      snapshotId: snapshot.id,
      activityType: "EXPORT",
      planetCount: params.planets.length,
    }),
  });
}
