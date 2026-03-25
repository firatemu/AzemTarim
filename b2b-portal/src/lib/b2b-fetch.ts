import { getClientB2bDomain } from './b2b-domain';

/** Cookie + ayni origin proxy: /api/b2b/data/... */
export async function b2bFetch(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const domain = getClientB2bDomain();
  const url = path.startsWith('http')
    ? path
    : `/api/b2b/data/${path.replace(/^\//, '')}`;
  return fetch(url, {
    ...init,
    credentials: 'include',
    headers: {
      'x-b2b-domain': domain,
      ...(init.headers as Record<string, string>),
    },
  });
}
