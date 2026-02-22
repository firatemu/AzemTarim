import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '@/lib/axios';
import type { WorkOrder, CreateWorkOrderDto } from '@/types/servis';
import type { WorkOrderStatus } from '@/types/servis';

export function useWorkOrders(params?: {
  page?: number;
  limit?: number;
  status?: WorkOrderStatus;
}) {
  const { page = 1, limit = 50, status } = params || {};
  return useQuery({
    queryKey: ['work-orders', page, limit, status],
    queryFn: async () => {
      const response = await axios.get('/work-order', {
        params: { page, limit, status },
      });
      const data = response.data?.data ?? response.data;
      return Array.isArray(data) ? data : data?.items ?? [];
    },
    staleTime: 60 * 1000,
  });
}

export function useWorkOrder(id: string | null) {
  return useQuery({
    queryKey: ['work-order', id],
    queryFn: async () => {
      const response = await axios.get(`/work-order/${id}`);
      return response.data as WorkOrder;
    },
    enabled: !!id,
  });
}

export function useCreateWorkOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (dto: CreateWorkOrderDto) => {
      const response = await axios.post('/work-order', dto);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-orders'] });
    },
  });
}

export function useUpdateWorkOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: WorkOrderStatus }) => {
      const response = await axios.patch(`/work-order/${id}/status`, { status });
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['work-orders'] });
      queryClient.invalidateQueries({ queryKey: ['work-order', id] });
    },
  });
}
