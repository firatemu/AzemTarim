import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const getApiBaseUrl = () => {
  const target = process.env.API_PROXY_TARGET;
  if (target) return target.replace(/\/$/, '');
  return 'http://localhost:3020';
};

/**
 * GET /api/work-order/assignment-users - Proxy to backend.
 * Dedicated route ensures Turbopack/Next.js correctly routes this endpoint.
 */
export async function GET(request: NextRequest) {
  const baseUrl = getApiBaseUrl();
  const url = new URL('/api/work-order/assignment-users', baseUrl);
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

  try {
    const res = await fetch(url.toString(), {
      method: 'GET',
      headers,
    });

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
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Backend unreachable';
    console.error('[API Proxy] work-order/assignment-users failed:', url.toString(), message);
    return NextResponse.json(
      {
        statusCode: 503,
        message: 'API sunucusuna bağlanılamadı. Backend çalışıyor mu?',
        error: process.env.NODE_ENV === 'development' ? message : undefined,
      },
      { status: 503 }
    );
  }
}
