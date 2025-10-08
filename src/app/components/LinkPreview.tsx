import { useState, useEffect } from "react";
import { ExternalLink, AlertCircle } from "lucide-react";
import Image from "next/image";
import { Loading } from "./Loading";

interface LinkPreviewProps {
  url: string;
  className?: string;
}

interface PreviewData {
  title: string;
  description: string;
  image: string;
  favicon: string;
  url: string;
  domain: string;
}

export function LinkPreview({ url, className = "" }: LinkPreviewProps) {
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Função para processar URL da imagem
  const processImageUrl = (url: string) => {
    if (!url) return "";

    try {
      const urlObj = new URL(url);
      // Se for uma URL externa, usar nosso proxy
      if (urlObj.hostname !== window.location.hostname) {
        return `/api/image-proxy?url=${encodeURIComponent(url)}`;
      }
      return url;
    } catch {
      return url;
    }
  };

  // Função para extrair hostname de forma segura
  const getHostname = (url: string) => {
    try {
      return new URL(url).hostname;
    } catch {
      return url; // Retorna a URL original se for inválida
    }
  };

  useEffect(() => {
    if (!url) return;

    // Validar URL antes de fazer fetch
    try {
      new URL(url);
    } catch {
      setError("URL inválida");
      setLoading(false);
      return;
    }

    // Debounce para evitar muitas requisições
    const timeoutId = setTimeout(() => {
      const fetchPreview = async () => {
        setLoading(true);
        setError(null);

        try {
          const response = await fetch(
            `/api/preview?url=${encodeURIComponent(url)}`
          );

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();

          if (data.error) {
            throw new Error(data.error);
          }

          setPreviewData(data);
        } catch (err) {
          setError(
            err instanceof Error ? err.message : "Failed to load preview"
          );
        } finally {
          setLoading(false);
        }
      };

      fetchPreview();
    }, 500); // Aguarda 500ms após parar de digitar

    return () => clearTimeout(timeoutId);
  }, [url]);

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
                  src={processImageUrl(previewData.favicon)}
                  alt=""
                  className="w-4 h-4 flex-shrink-0"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              )}
              <span className="truncate">
                {previewData?.domain || getHostname(url)}
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
                src={processImageUrl(previewData.image)}
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
