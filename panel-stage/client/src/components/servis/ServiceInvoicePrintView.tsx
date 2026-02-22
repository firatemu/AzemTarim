'use client';

import React, { forwardRef } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import type { ServiceInvoice, WorkOrderItem } from '@/types/servis';

interface ServiceInvoicePrintViewProps {
  invoice: {
    invoiceNo: string;
    issueDate: string;
    subtotal: number;
    taxAmount: number;
    grandTotal: number;
    cari?: { unvan?: string; cariKodu?: string };
    workOrder?: {
      workOrderNo?: string;
      customerVehicle?: { plaka?: string; aracMarka?: string; aracModel?: string };
      items?: WorkOrderItem[];
    };
  };
}

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(Number(n));
const formatDate = (d: string) => new Date(d).toLocaleDateString('tr-TR');

const ServiceInvoicePrintView = forwardRef<HTMLDivElement, ServiceInvoicePrintViewProps>(
  ({ invoice }, ref) => {
    const items = invoice.workOrder?.items ?? [];

    return (
      <Box ref={ref} sx={{ p: 3, maxWidth: 210, fontFamily: 'system-ui', fontSize: 12 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, borderBottom: '2px solid #000', pb: 1 }}>
          SERVİS FATURASI
        </Typography>
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Fatura No
          </Typography>
          <Typography variant="body1" fontWeight={600}>
            {invoice.invoiceNo}
          </Typography>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1 }}>
            Fatura Tarihi
          </Typography>
          <Typography variant="body1">{formatDate(invoice.issueDate)}</Typography>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1 }}>
            İş Emri
          </Typography>
          <Typography variant="body1">{invoice.workOrder?.workOrderNo ?? '-'}</Typography>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1 }}>
            Araç
          </Typography>
          <Typography variant="body1">
            {invoice.workOrder?.customerVehicle
              ? `${invoice.workOrder.customerVehicle.plaka} - ${invoice.workOrder.customerVehicle.aracMarka} ${invoice.workOrder.customerVehicle.aracModel}`
              : '-'}
          </Typography>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1 }}>
            Müşteri
          </Typography>
          <Typography variant="body1" fontWeight={600}>
            {invoice.cari?.unvan ?? invoice.cari?.cariKodu ?? '-'}
          </Typography>
        </Box>

        <Typography variant="subtitle2" fontWeight={600} sx={{ mt: 2, mb: 1 }}>
          Fatura Kalemleri
        </Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, fontSize: 11 }}>Tip</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: 11 }}>Açıklama</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: 11 }}>Stok</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: 11 }} align="right">
                Miktar
              </TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: 11 }} align="right">
                Birim Fiyat
              </TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: 11 }} align="right">
                Toplam
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item: WorkOrderItem) => (
              <TableRow key={item.id}>
                <TableCell sx={{ fontSize: 11 }}>{item.type === 'LABOR' ? 'İşçilik' : 'Parça'}</TableCell>
                <TableCell sx={{ fontSize: 11 }}>{item.description}</TableCell>
                <TableCell sx={{ fontSize: 11 }}>
                  {item.stok ? `${item.stok.stokKodu} - ${item.stok.stokAdi}` : '-'}
                </TableCell>
                <TableCell sx={{ fontSize: 11 }} align="right">
                  {item.quantity}
                </TableCell>
                <TableCell sx={{ fontSize: 11 }} align="right">
                  {formatCurrency(item.unitPrice)}
                </TableCell>
                <TableCell sx={{ fontSize: 11 }} align="right">
                  {formatCurrency(item.totalPrice)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #ccc' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="body2">Ara Toplam</Typography>
            <Typography variant="body2" fontWeight={600}>
              {formatCurrency(invoice.subtotal)}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="body2">KDV</Typography>
            <Typography variant="body2" fontWeight={600}>
              {formatCurrency(invoice.taxAmount)}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
            <Typography variant="body1" fontWeight={700}>
              Genel Toplam
            </Typography>
            <Typography variant="body1" fontWeight={700}>
              {formatCurrency(invoice.grandTotal)}
            </Typography>
          </Box>
        </Box>
      </Box>
    );
  }
);

ServiceInvoicePrintView.displayName = 'ServiceInvoicePrintView';
export default ServiceInvoicePrintView;
