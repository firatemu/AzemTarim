import { NextResponse } from 'next/server';

const base = process.env.B2B_API_BASE_URL || 'http://localhost:3001';

export async function POST(req: Request) {
  const body = await req.json();
  const domainHeader = req.headers.get('x-b2b-domain') || body.domain || '';
  const r = await fetch(`${base}/api/b2b/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-b2b-domain': domainHeader,
    },
    body: JSON.stringify({
      domain: body.domain,
      email: body.email,
      password: body.password,
    }),
  });
  const text = await r.text();
  let data: { accessToken?: string } = {};
  try {
    data = JSON.parse(text) as { accessToken?: string };
  } catch {
    /* ignore */
  }
  const res = new NextResponse(text, {
    status: r.status,
    headers: { 'Content-Type': r.headers.get('content-type') || 'application/json' },
  });
  if (r.ok && data.accessToken) {
    res.cookies.set('b2b_token', data.accessToken, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 12,
    });
  }
  return res;
}
