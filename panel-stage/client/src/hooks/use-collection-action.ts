import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '../lib/axios';
import { QK } from '../lib/query-keys';

interface CollectionActionDto {
    checkBillId: string;
    transactionAmount: number;
    date: string;
    newStatus: string;
    cashboxId?: string;
    bankAccountId?: string;
    notes?: string;
}

export function useCollectionAction(journalId?: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (dto: CollectionActionDto) => {
            const res = await axios.post('/checks-promissory-notes/action', dto);
            return res.data;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: QK.journals() });
            if (journalId) {
                qc.invalidateQueries({ queryKey: QK.journal(journalId) });
            }
            qc.invalidateQueries({ queryKey: QK.checks() });
        },
    });
}
