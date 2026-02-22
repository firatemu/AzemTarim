'use client';

import React, { forwardRef } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import type { WorkOrder } from '@/types/servis';

interface WorkOrderPrintViewProps {
  workOrder: WorkOrder;
}

const formatDate = (d: string) => new Date(d).toLocaleDateString('tr-TR');

const WorkOrderPrintView = forwardRef<HTMLDivElement, WorkOrderPrintViewProps>(
  ({ workOrder }, ref) => {
    const items = workOrder.items ?? [];
    const partRequests = workOrder.partRequests ?? [];

    return (
      <Box ref={ref} sx={{ p: 3, maxWidth: 210, fontFamily: 'system-ui', fontSize: 12 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, borderBottom: '2px solid #000', pb: 1 }}>
          İŞ EMRİ
        </Typography>
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary">
            İş Emri No
          </Typography>
          <Typography variant="body1" fontWeight={600}>
            {workOrder.workOrderNo}
          </Typography>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1 }}>
            Tarih
          </Typography>
          <Typography variant="body1">{formatDate(workOrder.createdAt)}</Typography>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1 }}>
            Araç
          </Typography>
          <Typography variant="body1">
            {workOrder.customerVehicle
              ? `${workOrder.customerVehicle.plaka} - ${workOrder.customerVehicle.aracMarka} ${workOrder.customerVehicle.aracModel}`
              : '-'}
          </Typography>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1 }}>
            Müşteri
          </Typography>
          <Typography variant="body1" fontWeight={600}>
            {workOrder.cari?.unvan ?? workOrder.cari?.cariKodu ?? '-'}
          </Typography>
          {workOrder.description && (
            <>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1 }}>
                Açıklama
              </Typography>
              <Typography variant="body1">{workOrder.description}</Typography>
            </>
          )}
        </Box>

        <Typography variant="subtitle2" fontWeight={600} sx={{ mt: 2, mb: 1 }}>
          İş Kalemleri
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
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell sx={{ fontSize: 11 }}>{item.type === 'LABOR' ? 'İşçilik' : 'Parça'}</TableCell>
                <TableCell sx={{ fontSize: 11 }}>{item.description}</TableCell>
                <TableCell sx={{ fontSize: 11 }}>{item.stok ? `${item.stok.stokKodu} - ${item.stok.stokAdi}` : '-'}</TableCell>
                <TableCell sx={{ fontSize: 11 }} align="right">
                  {item.quantity}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {partRequests.length > 0 && (
          <>
            <Typography variant="subtitle2" fontWeight={600} sx={{ mt: 2, mb: 1 }}>
              Parça Talepleri
            </Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, fontSize: 11 }}>Açıklama</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: 11 }}>Stok</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: 11 }} align="right">
                    Miktar
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: 11 }}>Durum</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {partRequests.map((pr) => (
                  <TableRow key={pr.id}>
                    <TableCell sx={{ fontSize: 11 }}>{pr.description}</TableCell>
                    <TableCell sx={{ fontSize: 11 }}>
                      {pr.stok ? `${pr.stok.stokKodu} - ${pr.stok.stokAdi}` : '-'}
                    </TableCell>
                    <TableCell sx={{ fontSize: 11 }} align="right">
                      {pr.requestedQty}
                    </TableCell>
                    <TableCell sx={{ fontSize: 11 }}>{pr.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        )}

      </Box>
    );
  }
);

WorkOrderPrintView.displayName = 'WorkOrderPrintView';
export default WorkOrderPrintView;
