import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '@/lib/axios';
import type { CreatePartRequestDto } from '@/types/servis';

export function usePartRequests(workOrderId: string | null) {
  return useQuery({
    queryKey: ['part-requests', workOrderId],
    queryFn: async () => {
      const response = await axios.get('/part-request', {
        params: { workOrderId },
      });
      const data = response.data?.data ?? response.data;
      return Array.isArray(data) ? data : [];
    },
    enabled: !!workOrderId,
    staleTime: 60 * 1000,
  });
}

export function useCreatePartRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (dto: CreatePartRequestDto) => {
      const response = await axios.post('/part-request', dto);
      return response.data;
    },
    onSuccess: (_, dto) => {
      queryClient.invalidateQueries({ queryKey: ['part-requests', dto.workOrderId] });
      queryClient.invalidateQueries({ queryKey: ['work-order', dto.workOrderId] });
    },
  });
}

export function useSupplyPartRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      suppliedQty,
      warehouseId,
    }: {
      id: string;
      suppliedQty: number;
      warehouseId?: string;
    }) => {
      const response = await axios.post(`/part-request/${id}/supply`, {
        suppliedQty,
        warehouseId,
      });
      return response.data;
    },
    onSuccess: (data: { workOrderId?: string }) => {
      if (data?.workOrderId) {
        queryClient.invalidateQueries({ queryKey: ['part-requests', data.workOrderId] });
        queryClient.invalidateQueries({ queryKey: ['work-order', data.workOrderId] });
      }
    },
  });
}

export function useMarkPartRequestAsUsed() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await axios.post(`/part-request/${id}/mark-as-used`);
      return response.data;
    },
    onSuccess: (data: { workOrderId?: string }) => {
      if (data?.workOrderId) {
        queryClient.invalidateQueries({ queryKey: ['part-requests', data.workOrderId] });
        queryClient.invalidateQueries({ queryKey: ['work-order', data.workOrderId] });
      }
    },
  });
}

export function useCancelPartRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await axios.post(`/part-request/${id}/cancel`);
      return response.data;
    },
    onSuccess: (data: { workOrderId?: string }) => {
      if (data?.workOrderId) {
        queryClient.invalidateQueries({ queryKey: ['part-requests', data.workOrderId] });
        queryClient.invalidateQueries({ queryKey: ['work-order', data.workOrderId] });
      }
    },
  });
}
