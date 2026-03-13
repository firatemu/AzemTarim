import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Docker: API_PROXY_TARGET (örn. http://backend-staging:3000). Local: localhost:3020
const getApiBaseUrl = () => {
  const target = process.env.API_PROXY_TARGET;
  if (target) return target.replace(/\/$/, '');
  return 'http://localhost:3020';
};

/**
 * Proxies all /api/* requests (except /api/hizli which has its own route) to the backend.
 * Fixes 404 when Next.js rewrites are not applied (e.g. with Turbopack in dev).
 */
async function proxyToBackend(request: NextRequest, pathSegments: string[]) {
  const baseUrl = getApiBaseUrl();
  const path = pathSegments.join('/');
  const url = new URL(`/api/${path}`, baseUrl);
  // Forward query string
  request.nextUrl.searchParams.forEach((value, key) => {
    url.searchParams.set(key, value);
  });

  const headers = new Headers();
  request.headers.forEach((value, key) => {
    if (
      key.toLowerCase() === 'host' ||
      key.toLowerCase() === 'connection' ||
      key.toLowerCase() === 'content-length'
    ) {
      return;
    }
    headers.set(key, value);
  });

  let body: string | undefined;
  try {
    body = await request.text();
  } catch {
    // no body
  }

  let res: Response;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);


    res = await fetch(url.toString(), {
      method: request.method,
      headers,
      body: body || undefined,
      signal: controller.signal,
      cache: 'no-store',
    });


    clearTimeout(timeoutId);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Backend unreachable';
    console.error('[API Proxy] Backend fetch failed:', url.toString(), message);
    return NextResponse.json(
      {
        statusCode: 503,
        message: 'API sunucusuna bağlanılamadı. Backend çalışıyor mu?',
        error: process.env.NODE_ENV === 'development' ? message : undefined,
      },
      { status: 503 }
    );
  }

  const responseHeaders = new Headers();
  res.headers.forEach((value, key) => {
    if (key.toLowerCase() === 'transfer-encoding') return;
    responseHeaders.set(key, value);
  });

  return new NextResponse(res.body, {
    status: res.status,
    statusText: res.statusText,
    headers: responseHeaders,
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyToBackend(request, path);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyToBackend(request, path);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyToBackend(request, path);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyToBackend(request, path);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyToBackend(request, path);
}

export async function OPTIONS(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyToBackend(request, path);
}
