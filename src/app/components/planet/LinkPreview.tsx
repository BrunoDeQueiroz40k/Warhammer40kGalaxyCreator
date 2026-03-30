import Image from "next/image";

import { ExternalLink, AlertCircle } from "lucide-react";

import { LinkPreviewProps } from "../../../ts/interfaces";
import { getHostnameFromUrl } from "../../../ts/functions";
import { buildProxyImageUrl } from "../../../lib/previewApi";
import { useLinkPreview } from "../../../hooks/useLinkPreview";

import { Loading } from "../Loading";

export function LinkPreview({ url, className = "" }: LinkPreviewProps) {
  const { previewData, loading, error } = useLinkPreview(url);

  if (!url) return null;

  return (
    <div
      className={`border border-amber-500/30 rounded-lg overflow-hidden hover:border-amber-500/50 transition-colors duration-200 ${className}`}
    >
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="block group"
      >
        <div className="flex">
          {/* Conteúdo do link */}
          <div className="flex-1 p-2 px-4 space-y-2">
            <div className="space-y-1">
              <h3 className="text-white font-semibold text-sm group-hover:text-amber-300 transition-colors duration-200 line-clamp-1">
                {loading
                  ? "Carregando..."
                  : error
                    ? "Erro ao carregar"
                    : previewData?.title || "Untitled"}
              </h3>
              {previewData?.description && !loading && !error && (
                <p className="text-slate-400 text-xs line-clamp-2">
                  {previewData.description}
                </p>
              )}
            </div>

            {/* Favicon + domínio */}
            <div className="flex items-center gap-2 text-amber-400 text-xs">
              {previewData?.favicon && !loading && !error && (
                <Image
                  width={16}
                  height={16}
                  src={buildProxyImageUrl(previewData.favicon)}
                  alt=""
                  className="w-4 h-4 flex-shrink-0"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              )}
              <span className="truncate">
                {previewData?.domain || getHostnameFromUrl(url)}
              </span>
              <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 transition-transform duration-200 flex-shrink-0" />
            </div>
          </div>
          {/* Imagem do preview */}
          <div className="w-32 h-24 bg-gradient-to-br from-amber-500/20 to-amber-600/30 flex-shrink-0 relative overflow-hidden">
            {loading ? (
              <div className="w-full h-full flex items-center justify-center">
                <Loading size={40} animationSpeed={7} />
              </div>
            ) : error ? (
              <div className="w-full h-full flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-400" />
              </div>
            ) : previewData?.image ? (
              <Image
                width={128}
                height={72}
                src={buildProxyImageUrl(previewData.image)}
                alt={previewData.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                onError={(e) => {
                  // Se a imagem falhar, mostrar gradiente
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ExternalLink className="w-8 h-8 text-amber-400" />
              </div>
            )}
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors duration-200" />
          </div>
        </div>
      </a>
    </div>
  );
}
