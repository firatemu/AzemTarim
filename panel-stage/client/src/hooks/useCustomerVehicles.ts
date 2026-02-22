import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '@/lib/axios';
import type { CustomerVehicle, CreateCustomerVehicleDto, UpdateCustomerVehicleDto } from '@/types/servis';

export function useCustomerVehicles(params?: {
  page?: number;
  limit?: number;
  search?: string;
  cariId?: string;
}) {
  const { page = 1, limit = 50, search, cariId } = params || {};
  return useQuery({
    queryKey: ['customer-vehicles', page, limit, search, cariId],
    queryFn: async () => {
      const response = await axios.get('/customer-vehicle', {
        params: { page, limit, search, cariId },
      });
      const data = response.data?.data ?? response.data;
      return Array.isArray(data) ? data : data?.items ?? [];
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function useCustomerVehicle(id: string | null) {
  return useQuery({
    queryKey: ['customer-vehicle', id],
    queryFn: async () => {
      const response = await axios.get(`/customer-vehicle/${id}`);
      return response.data as CustomerVehicle;
    },
    enabled: !!id,
  });
}

export function useCreateCustomerVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (dto: CreateCustomerVehicleDto) => {
      const response = await axios.post('/customer-vehicle', dto);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-vehicles'] });
    },
  });
}

export function useUpdateCustomerVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, dto }: { id: string; dto: UpdateCustomerVehicleDto }) => {
      const response = await axios.patch(`/customer-vehicle/${id}`, dto);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-vehicles'] });
    },
  });
}

export function useDeleteCustomerVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`/customer-vehicle/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-vehicles'] });
    },
  });
}
