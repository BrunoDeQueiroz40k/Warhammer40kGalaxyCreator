"use client";

import { useEffect, useRef, useState } from "react";

import { AuthUser } from "./useAuth";
import {
  DownloadExportEntry,
  DownloadImportEntry,
  fetchExportsHistory,
  fetchImportsHistory,
  fetchOverviewStats,
  fetchSnapshotPlanets,
  updateCurrentUserBannerImage,
  updateCurrentUserProfileImage,
} from "../lib/profileApi";
import { GalaxyExporter } from "../lib/galaxyExport";
import { fileToBase64 } from "../ts/functions";

export function useUserProfileModalData(user: AuthUser, open: boolean) {
  const [profile, setProfile] = useState(user);
  const [planetCount, setPlanetCount] = useState(0);
  const [imports, setImports] = useState<DownloadImportEntry[]>([]);
  const [exportsHistory, setExportsHistory] = useState<DownloadExportEntry[]>([]);
  const [importsLoaded, setImportsLoaded] = useState(false);
  const [exportsLoaded, setExportsLoaded] = useState(false);
  const [loadingImports, setLoadingImports] = useState(false);
  const [loadingExports, setLoadingExports] = useState(false);
  const [downloadingSnapshotId, setDownloadingSnapshotId] = useState<string | null>(null);

  const hasFetchedDataRef = useRef(false);
  const isFetchingRef = useRef(false);

  useEffect(() => {
    setProfile(user);
  }, [user]);

  useEffect(() => {
    if (!open || hasFetchedDataRef.current || isFetchingRef.current) return;

    isFetchingRef.current = true;
    const refresh = async () => {
      try {
        const stats = await fetchOverviewStats();
        setPlanetCount(stats.stats.planetCount);
        hasFetchedDataRef.current = true;
      } catch {
        // silent fail in modal refresh
      } finally {
        isFetchingRef.current = false;
      }
    };

    void refresh();
  }, [open]);

  const loadImports = async () => {
    if (importsLoaded || loadingImports) return;
    setLoadingImports(true);
    try {
      const importsRes = await fetchImportsHistory(50);
      setImports(importsRes.downloads);
      setImportsLoaded(true);
    } catch {
      // silent fail
    } finally {
      setLoadingImports(false);
    }
  };

  const loadExports = async () => {
    if (exportsLoaded || loadingExports) return;
    setLoadingExports(true);
    try {
      const exportsRes = await fetchExportsHistory(50);
      setExportsHistory(exportsRes.downloads);
      setExportsLoaded(true);
    } catch {
      // silent fail
    } finally {
      setLoadingExports(false);
    }
  };

  const handleAvatarUpload = async (file?: File) => {
    if (!file) return;
    const content = await fileToBase64(file);
    setProfile((p) => ({ ...p, profileImage: content }));
    await updateCurrentUserProfileImage(content);
  };

  const handleBannerUpload = async (file?: File) => {
    if (!file) return;
    const content = await fileToBase64(file);
    setProfile((p) => ({ ...p, bannerImage: content }));
    await updateCurrentUserBannerImage(content);
  };

  const handleExportRedownload = async (snapshotId: string | null) => {
    if (!snapshotId) return;
    setDownloadingSnapshotId(snapshotId);
    try {
      const res = await fetchSnapshotPlanets(snapshotId);
      const planets = (res.snapshot.payload?.planets || []) as Parameters<
        typeof GalaxyExporter.exportGalaxy
      >[0];
      if (planets.length > 0) {
        await GalaxyExporter.exportGalaxy(planets);
      }
    } catch {
      // ignore download error
    } finally {
      setDownloadingSnapshotId(null);
    }
  };

  return {
    profile,
    planetCount,
    imports,
    exportsHistory,
    importsLoaded,
    exportsLoaded,
    loadingImports,
    loadingExports,
    loadImports,
    loadExports,
    handleAvatarUpload,
    handleBannerUpload,
    handleExportRedownload,
    downloadingSnapshotId,
  };
}
