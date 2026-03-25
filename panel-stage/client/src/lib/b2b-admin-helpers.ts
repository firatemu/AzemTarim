/** B2B Admin API list yanıtlarından tablo satırlarını çıkarır */
export function extractListRows(data: unknown): Record<string, unknown>[] {
  if (Array.isArray(data)) {
    return data as Record<string, unknown>[];
  }
  if (
    data &&
    typeof data === 'object' &&
    'data' in data &&
    Array.isArray((data as { data: unknown }).data)
  ) {
    return (data as { data: Record<string, unknown>[] }).data;
  }
  return [];
}
