/** Istemci: tenant domain hostname uzerinden */
export function getClientB2bDomain(): string {
  if (typeof window === 'undefined') return '';
  return window.location.hostname;
}
