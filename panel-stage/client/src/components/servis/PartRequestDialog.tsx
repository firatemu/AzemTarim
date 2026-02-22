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
  Box,
  CircularProgress,
} from '@mui/material';
import type { CreatePartRequestDto } from '@/types/servis';

interface PartRequestDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreatePartRequestDto) => Promise<void>;
  workOrderId: string;
  stoklar: { id: string; stokKodu?: string; stokAdi?: string }[];
}

const initialForm: CreatePartRequestDto = {
  workOrderId: '',
  description: '',
  stokId: undefined,
  requestedQty: 1,
};

export default function PartRequestDialog({
  open,
  onClose,
  onSubmit,
  workOrderId,
  stoklar,
}: PartRequestDialogProps) {
  const [form, setForm] = useState<CreatePartRequestDto>({ ...initialForm, workOrderId });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setForm({ ...initialForm, workOrderId });
  }, [workOrderId, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.description || form.requestedQty < 1) return;
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
        <DialogTitle>Yeni Parça Talebi</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Açıklama"
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              required
              fullWidth
            />
            <Autocomplete
              options={stoklar}
              getOptionLabel={(s) => `${s.stokKodu || ''} - ${s.stokAdi || s.id}`.trim() || s.id}
              value={selectedStok ?? null}
              onChange={(_, v) => setForm((p) => ({ ...p, stokId: v?.id }))}
              renderInput={(params) => (
                <TextField {...params} label="Stok (Opsiyonel)" />
              )}
            />
            <TextField
              label="Talep Edilen Miktar"
              type="number"
              value={form.requestedQty}
              onChange={(e) =>
                setForm((p) => ({ ...p, requestedQty: parseInt(e.target.value, 10) || 1 }))
              }
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
            {loading ? <CircularProgress size={24} /> : 'Ekle'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
