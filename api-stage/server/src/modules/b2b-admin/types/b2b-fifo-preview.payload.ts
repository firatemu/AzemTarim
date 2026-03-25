/** Admin FIFO önizleme API gövdesi (JSON / xlsx / pdf kaynak) */
export interface B2bFifoPreviewPayload {
  customer: { id: string; name: string; email: string; vatDays: number };
  asOf: string;
  vatDays: number;
  summary: {
    totalDebit: string;
    totalCredit: string;
    balance: string;
    overdueAmount: string;
    oldestOverdueDate: string | null;
    pastDueMovementCount: number;
  };
  movements: {
    id: string;
    date: string;
    type: string;
    debit: string;
    credit: string;
    dueDate: string | null;
    remainingInvoiceDebit: string | null;
    isPastDue: boolean;
  }[];
}
