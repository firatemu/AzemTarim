import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '@/lib/axios';
import type { ServiceInvoice } from '@/types/servis';

export function useServiceInvoices(params?: { page?: number; limit?: number }) {
  const { page = 1, limit = 50 } = params || {};
  return useQuery({
    queryKey: ['service-invoices', page, limit],
    queryFn: async () => {
      const response = await axios.get('/service-invoice', {
        params: { page, limit },
      });
      const data = response.data?.data ?? response.data;
      return Array.isArray(data) ? data : data?.items ?? [];
    },
    staleTime: 60 * 1000,
  });
}

export function useServiceInvoice(id: string | null) {
  return useQuery({
    queryKey: ['service-invoice', id],
    queryFn: async () => {
      const response = await axios.get(`/service-invoice/${id}`);
      return response.data as ServiceInvoice;
    },
    enabled: !!id,
  });
}

export function useCreateServiceInvoiceFromWorkOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (workOrderId: string) => {
      const response = await axios.post(`/service-invoice/from-work-order/${workOrderId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-invoices'] });
      queryClient.invalidateQueries({ queryKey: ['work-orders'] });
    },
  });
}
