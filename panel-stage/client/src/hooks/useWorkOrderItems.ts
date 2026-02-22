import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '@/lib/axios';
import type { CreateWorkOrderItemDto } from '@/types/servis';

export function useWorkOrderItems(workOrderId: string | null) {
  return useQuery({
    queryKey: ['work-order-items', workOrderId],
    queryFn: async () => {
      const response = await axios.get(`/work-order-item/work-order/${workOrderId}`);
      const data = response.data?.data ?? response.data;
      return Array.isArray(data) ? data : [];
    },
    enabled: !!workOrderId,
    staleTime: 60 * 1000,
  });
}

export function useCreateWorkOrderItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (dto: CreateWorkOrderItemDto) => {
      const response = await axios.post('/work-order-item', dto);
      return response.data;
    },
    onSuccess: (_, dto) => {
      queryClient.invalidateQueries({ queryKey: ['work-order-items', dto.workOrderId] });
      queryClient.invalidateQueries({ queryKey: ['work-order', dto.workOrderId] });
    },
  });
}

export function useUpdateWorkOrderItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, dto }: { id: string; dto: Partial<CreateWorkOrderItemDto> }) => {
      const response = await axios.patch(`/work-order-item/${id}`, dto);
      return response.data;
    },
    onSuccess: (data: { workOrderId?: string }) => {
      if (data?.workOrderId) {
        queryClient.invalidateQueries({ queryKey: ['work-order-items', data.workOrderId] });
        queryClient.invalidateQueries({ queryKey: ['work-order', data.workOrderId] });
      }
    },
  });
}

export function useDeleteWorkOrderItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, workOrderId }: { id: string; workOrderId: string }) => {
      await axios.delete(`/work-order-item/${id}`);
      return { workOrderId };
    },
    onSuccess: (_, { workOrderId }) => {
      queryClient.invalidateQueries({ queryKey: ['work-order-items', workOrderId] });
      queryClient.invalidateQueries({ queryKey: ['work-order', workOrderId] });
    },
  });
}
