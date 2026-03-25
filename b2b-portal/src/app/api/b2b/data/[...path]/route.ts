import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const base = process.env.B2B_API_BASE_URL || 'http://localhost:3001';

async function proxy(
  req: NextRequest,
  pathParts: string[],
  method: string,
) {
  const token = (await cookies()).get('b2b_token')?.value;
  const domain =
    req.headers.get('x-b2b-domain') ||
    req.nextUrl.searchParams.get('domain') ||
    '';
  const subpath = pathParts.join('/');
  const target = new URL(`${base}/api/b2b/${subpath}`);
  req.nextUrl.searchParams.forEach((v, k) => {
    if (k !== 'domain') target.searchParams.set(k, v);
  });

  const headers = new Headers();
  const ct = req.headers.get('content-type');
  if (ct) headers.set('content-type', ct);
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (domain) headers.set('x-b2b-domain', domain);

  const hasBody = !['GET', 'HEAD'].includes(method);
  const body = hasBody ? await req.arrayBuffer() : undefined;

  const r = await fetch(target.toString(), { method, headers, body });

  const outHeaders = new Headers();
  const resCt = r.headers.get('content-type');
  outHeaders.set('Content-Type', resCt || 'application/json');
  const cd = r.headers.get('content-disposition');
  if (cd) outHeaders.set('Content-Disposition', cd);

  return new NextResponse(await r.arrayBuffer(), {
    status: r.status,
    headers: outHeaders,
  });
}

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ path: string[] }> },
) {
  const { path } = await ctx.params;
  return proxy(req, path, 'GET');
}

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ path: string[] }> },
) {
  const { path } = await ctx.params;
  return proxy(req, path, 'POST');
}

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ path: string[] }> },
) {
  const { path } = await ctx.params;
  return proxy(req, path, 'PATCH');
}

export async function DELETE(
  req: NextRequest,
  ctx: { params: Promise<{ path: string[] }> },
) {
  const { path } = await ctx.params;
  return proxy(req, path, 'DELETE');
}
