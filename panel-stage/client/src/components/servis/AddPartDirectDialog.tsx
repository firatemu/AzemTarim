'use client';

import React, { useState, useEffect } from 'react';
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
  Typography,
} from '@mui/material';
import type { CreateWorkOrderItemDto } from '@/types/servis';

interface AddPartDirectDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateWorkOrderItemDto) => Promise<void>;
  workOrderId: string;
  workOrderNo?: string;
  stoklar: { id: string; stokKodu?: string; stokAdi?: string }[];
}

export default function AddPartDirectDialog({
  open,
  onClose,
  onSubmit,
  workOrderId,
  workOrderNo,
  stoklar,
}: AddPartDirectDialogProps) {
  const [stokId, setStokId] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setStokId('');
      setQuantity(1);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const selectedStok = stoklar.find((s) => s.id === stokId);
    if (!stokId || !selectedStok || quantity < 1) return;
    setLoading(true);
    try {
      await onSubmit({
        workOrderId,
        type: 'PART',
        description: `${selectedStok.stokKodu || ''} - ${selectedStok.stokAdi || ''}`.trim() || selectedStok.id,
        stokId,
        quantity,
        unitPrice: 0,
        taxRate: 20,
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const selectedStok = stoklar.find((s) => s.id === stokId);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          Parça Ekle {workOrderNo && `- İş Emri ${workOrderNo}`}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Stoktan seçerek iş emrine parça ekleyin. Parçalar temin edildi olarak işaretlenecektir.
            </Typography>
            <Autocomplete
              options={stoklar}
              getOptionLabel={(s) => `${s.stokKodu || ''} - ${s.stokAdi || s.id}`.trim() || s.id}
              value={selectedStok ?? null}
              onChange={(_, v) => setStokId(v?.id ?? '')}
              renderInput={(params) => (
                <TextField {...params} label="Stok" required />
              )}
            />
            <TextField
              label="Miktar"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
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
          <Button type="submit" variant="contained" disabled={loading || !stokId}>
            {loading ? <CircularProgress size={24} /> : 'Ekle'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
