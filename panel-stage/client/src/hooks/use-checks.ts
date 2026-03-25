import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '../lib/axios';
import { QK } from '../lib/query-keys';
import { CheckBill, CheckBillFilters, CheckBillCollection, CheckBillEndorsement } from '../types/check-bill';

export function useChecks(filters?: CheckBillFilters) {
    return useQuery({
        queryKey: QK.checks(filters),
        queryFn: async () => {
            const cleanFilters: Record<string, string> = {};
            if (filters) {
                Object.entries(filters).forEach(([key, val]) => {
                    if (val !== undefined && val !== null && val !== '') {
                        if (Array.isArray(val)) {
                            val.forEach(v => { cleanFilters[`${key}[]`] = String(v) });
                        } else {
                            cleanFilters[key] = String(val);
                        }
                    }
                });
            }
            const params = new URLSearchParams(cleanFilters);
            const res = await axios.get<CheckBill[]>(`/checks-promissory-notes?${params.toString()}`);
            return res.data;
        },
    });
}

export function useCheck(id: string) {
    return useQuery({
        queryKey: QK.check(id),
        queryFn: async () => {
            const res = await axios.get<CheckBill>(`/checks-promissory-notes/${id}`);
            return res.data;
        },
        enabled: !!id,
    });
}

export function useCheckEndorsements(id: string) {
    return useQuery({
        queryKey: QK.checkEndorsements(id),
        queryFn: async () => {
            const res = await axios.get<CheckBillEndorsement[]>(`/checks-promissory-notes/endorsements/${id}`);
            return res.data;
        },
        enabled: !!id,
    });
}

export function useCheckCollections(id: string) {
    return useQuery({
        queryKey: QK.checkCollections(id),
        queryFn: async () => {
            const res = await axios.get<CheckBillCollection[]>(`/checks-promissory-notes/collections/${id}`);
            return res.data;
        },
        enabled: !!id,
    });
}

export function useDeleteCheck() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const res = await axios.delete(`/checks-promissory-notes/${id}`);
            return res.data;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: QK.checks() });
        },
    });
}

export function useUpdateCheck() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: { checkNo?: string; bank?: string; branch?: string; accountNo?: string; dueDate?: string; notes?: string; amount?: number } }) => {
            const res = await axios.put(`/checks-promissory-notes/${id}`, data);
            return res.data;
        },
        onSuccess: (_, { id }) => {
            qc.invalidateQueries({ queryKey: QK.check(id) });
            qc.invalidateQueries({ queryKey: QK.checks() });
        },
    });
}

export function useCheckAction() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (payload: { checkBillId: string; newStatus: string; date: string; transactionAmount: number; notes?: string; cashboxId?: string; bankAccountId?: string }) => {
            const res = await axios.post('/checks-promissory-notes/action', payload);
            return res.data;
        },
        onSuccess: (data) => {
            qc.invalidateQueries({ queryKey: QK.checks() });
            if (data?.id) qc.invalidateQueries({ queryKey: QK.check(data.id) });
        },
    });
}
