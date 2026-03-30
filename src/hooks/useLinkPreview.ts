import { useEffect, useState } from "react";

import { fetchPublicLinkPreview } from "../lib/previewApi";
import { PreviewData } from "../ts/interfaces";

export function useLinkPreview(url: string) {
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!url) return;

    try {
      new URL(url);
    } catch {
      setError("URL inválida");
      setLoading(false);
      return;
    }

    const timeoutId = setTimeout(() => {
      const fetchPreview = async () => {
        setLoading(true);
        setError(null);

        try {
          const data = await fetchPublicLinkPreview(url);
          setPreviewData(data);
        } catch (err) {
          setError(err instanceof Error ? err.message : "Failed to load preview");
        } finally {
          setLoading(false);
        }
      };

      void fetchPreview();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [url]);

  return {
    previewData,
    loading,
    error,
  };
}
