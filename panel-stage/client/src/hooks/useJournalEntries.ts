import { useQuery } from '@tanstack/react-query';
import axios from '@/lib/axios';
import type { JournalEntry } from '@/types/servis';

export function useJournalEntries(params?: {
  page?: number;
  limit?: number;
  referenceType?: string;
}) {
  const { page = 1, limit = 50, referenceType } = params || {};
  return useQuery({
    queryKey: ['journal-entries', page, limit, referenceType],
    queryFn: async () => {
      const response = await axios.get('/journal-entry', {
        params: { page, limit, referenceType },
      });
      const data = response.data?.data ?? response.data;
      return Array.isArray(data) ? data : data?.items ?? [];
    },
    staleTime: 60 * 1000,
  });
}

export function useJournalEntry(id: string | null) {
  return useQuery({
    queryKey: ['journal-entry', id],
    queryFn: async () => {
      const response = await axios.get(`/journal-entry/${id}`);
      return response.data as JournalEntry;
    },
    enabled: !!id,
  });
}

export function useJournalEntriesByReference(referenceType: string, referenceId: string) {
  return useQuery({
    queryKey: ['journal-entries', referenceType, referenceId],
    queryFn: async () => {
      const response = await axios.get('/journal-entry', {
        params: { referenceType, referenceId },
      });
      const data = response.data?.data ?? response.data;
      return Array.isArray(data) ? data : [];
    },
    enabled: !!referenceType && !!referenceId,
  });
}
