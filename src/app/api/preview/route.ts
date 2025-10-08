import { NextRequest, NextResponse } from 'next/server';

interface PreviewData {
  title: string;
  description: string;
  image: string;
  favicon: string;
  url: string;
  domain: string;
}

// Função para extrair metadados usando regex
function extractMetadata(html: string, baseUrl: string) {
  const baseUrlObj = new URL(baseUrl);
  
  // Função para converter URLs relativas em absolutas
  const resolveUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    if (url.startsWith('//')) return `https:${url}`;
    if (url.startsWith('/')) return `${baseUrlObj.origin}${url}`;
    return `${baseUrlObj.origin}/${url}`;
  };

  // Extrair título
  const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']*)["'][^>]*>/i);
  const twitterTitleMatch = html.match(/<meta[^>]*name=["']twitter:title["'][^>]*content=["']([^"']*)["'][^>]*>/i);
  const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  
  const title = ogTitleMatch?.[1] || twitterTitleMatch?.[1] || titleMatch?.[1] || 'Untitled';

  // Extrair descrição
  const ogDescMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']*)["'][^>]*>/i);
  const twitterDescMatch = html.match(/<meta[^>]*name=["']twitter:description["'][^>]*content=["']([^"']*)["'][^>]*>/i);
  const metaDescMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i);
  
  const description = ogDescMatch?.[1] || twitterDescMatch?.[1] || metaDescMatch?.[1] || '';

  // Extrair imagem
  const ogImageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']*)["'][^>]*>/i);
  const twitterImageMatch = html.match(/<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']*)["'][^>]*>/i);
  const twitterImageSrcMatch = html.match(/<meta[^>]*name=["']twitter:image:src["'][^>]*content=["']([^"']*)["'][^>]*>/i);
  
  const image = resolveUrl(ogImageMatch?.[1] || twitterImageMatch?.[1] || twitterImageSrcMatch?.[1] || '');

  // Extrair favicon
  const faviconMatch = html.match(/<link[^>]*rel=["'](?:icon|shortcut icon|apple-touch-icon)["'][^>]*href=["']([^"']*)["'][^>]*>/i);
  const favicon = resolveUrl(faviconMatch?.[1] || '/favicon.ico');

  return {
    title: title.trim(),
    description: description.trim(),
    image,
    favicon
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url) {
      return NextResponse.json(
        { error: 'URL parameter is required' },
        { status: 400 }
      );
    }

    // Validar se é uma URL válida
    let validUrl: URL;
    try {
      validUrl = new URL(url);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Fazer fetch da página
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch URL' },
        { status: response.status }
      );
    }

    const html = await response.text();
    const metadata = extractMetadata(html, url);

    const previewData: PreviewData = {
      ...metadata,
      url: url,
      domain: validUrl.hostname
    };

    return NextResponse.json(previewData);

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
