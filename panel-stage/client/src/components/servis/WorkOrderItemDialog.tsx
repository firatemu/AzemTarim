'use client';

import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Autocomplete,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  CircularProgress,
} from '@mui/material';
import type { WorkOrderItem, CreateWorkOrderItemDto, WorkOrderItemType } from '@/types/servis';

interface WorkOrderItemDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateWorkOrderItemDto) => Promise<void>;
  item?: WorkOrderItem | null;
  workOrderId: string;
  stoklar: { id: string; stokKodu?: string; stokAdi?: string }[];
}

const initialForm: CreateWorkOrderItemDto = {
  workOrderId: '',
  type: 'LABOR',
  description: '',
  stokId: undefined,
  quantity: 1,
  unitPrice: 0,
  taxRate: 20,
};

export default function WorkOrderItemDialog({
  open,
  onClose,
  onSubmit,
  item,
  workOrderId,
  stoklar,
}: WorkOrderItemDialogProps) {
  const [form, setForm] = useState<CreateWorkOrderItemDto>({ ...initialForm, workOrderId });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (item) {
      setForm({
        workOrderId: item.workOrderId,
        type: item.type,
        description: item.description,
        stokId: item.stokId ?? undefined,
        quantity: item.quantity,
        unitPrice: 0,
        taxRate: 20,
      });
    } else {
      setForm({ ...initialForm, workOrderId });
    }
  }, [item, workOrderId, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.description || form.quantity < 1) return;
    if (form.type === 'PART' && !form.stokId) return;
    setLoading(true);
    try {
      await onSubmit(form);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const selectedStok = stoklar.find((s) => s.id === form.stokId);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>{item ? 'Kalem Düzenle' : 'Yeni Kalem Ekle'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Tip</InputLabel>
              <Select
                value={form.type}
                label="Tip"
                onChange={(e) => setForm((p) => ({ ...p, type: e.target.value as WorkOrderItemType }))}
              >
                <MenuItem value="LABOR">İşçilik</MenuItem>
                <MenuItem value="PART">Parça</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Açıklama"
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              required
              fullWidth
            />
            {form.type === 'PART' && (
              <Autocomplete
                options={stoklar}
                getOptionLabel={(s) => `${s.stokKodu || ''} - ${s.stokAdi || s.id}`.trim() || s.id}
                value={selectedStok ?? null}
                onChange={(_, v) => setForm((p) => ({ ...p, stokId: v?.id }))}
                renderInput={(params) => (
                  <TextField {...params} label="Stok" required={form.type === 'PART'} />
                )}
              />
            )}
            <TextField
              label="Miktar"
              type="number"
              value={form.quantity}
              onChange={(e) => setForm((p) => ({ ...p, quantity: parseInt(e.target.value, 10) || 1 }))}
              inputProps={{ min: 1 }}
              required
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} disabled={loading}>
            İptal
          </Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : item ? 'Güncelle' : 'Ekle'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
