import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const getApiBaseUrl = () => {
  const target = process.env.API_PROXY_TARGET;
  if (target) return target.replace(/\/$/, '');
  return 'http://localhost:3020';
};

/**
 * POST /api/work-order/:id/send-for-approval - Proxy to backend.
 * Dedicated route ensures this endpoint is always routed (Docker + local).
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const baseUrl = getApiBaseUrl();
  const url = new URL(`/api/work-order/${id}/send-for-approval`, baseUrl);

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

  try {
    const res = await fetch(url.toString(), {
      method: 'POST',
      headers,
      body: body || undefined,
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
    console.error('[API Proxy] work-order/send-for-approval failed:', url.toString(), message);
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
