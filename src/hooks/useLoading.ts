import { useCallback } from 'react';

export function useLoading() {
   const showLoading = useCallback((message: string = "Carregando...") => {
      if (typeof window !== 'undefined' && window.showLoading) {
         window.showLoading();
         if (message !== "Carregando dados...") {
            window.updateLoadingProgress?.(0, message);
         }
      }
   }, []);

   const updateProgress = useCallback((progress: number, message?: string) => {
      if (typeof window !== 'undefined' && window.updateLoadingProgress) {
         window.updateLoadingProgress(progress, message || "Carregando...");
      }
   }, []);

   const hideLoading = useCallback(() => {
      if (typeof window !== 'undefined' && window.hideLoading) {
         window.hideLoading();
      }
   }, []);

   return {
      showLoading,
      updateProgress,
      hideLoading
   };
}
