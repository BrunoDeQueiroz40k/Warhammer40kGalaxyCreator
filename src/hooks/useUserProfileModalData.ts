"use client";

import { useEffect, useRef, useState } from "react";

import { AuthUser } from "./useAuth";
import {
  fetchOverviewStats,
  updateCurrentUserBannerImage,
  updateCurrentUserProfileImage,
} from "../lib/profileApi";
import { fileToBase64 } from "@/lib/formatters";

export function useUserProfileModalData(user: AuthUser, open: boolean) {
  const [profile, setProfile] = useState(user);
  const [planetCount, setPlanetCount] = useState(0);

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

  return {
    profile,
    planetCount,
    handleAvatarUpload,
    handleBannerUpload,
  };
}
