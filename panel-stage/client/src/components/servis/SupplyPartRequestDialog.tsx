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
  Typography,
} from '@mui/material';
import type { PartRequest } from '@/types/servis';

interface SupplyPartRequestDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (suppliedQty: number, stokId: string) => Promise<void>;
  partRequest: PartRequest | null;
  stoklar: { id: string; stokKodu?: string; stokAdi?: string }[];
}

export default function SupplyPartRequestDialog({
  open,
  onClose,
  onSubmit,
  partRequest,
  stoklar,
}: SupplyPartRequestDialogProps) {
  const [stokId, setStokId] = useState('');
  const [suppliedQty, setSuppliedQty] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (partRequest) {
      setStokId(partRequest.stokId ?? '');
      setSuppliedQty(partRequest.requestedQty);
    }
  }, [partRequest, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stokId || suppliedQty < 1) return;
    setLoading(true);
    try {
      await onSubmit(suppliedQty, stokId);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const selectedStok = stoklar.find((s) => s.id === stokId);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Parça Tedarik Et</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            {partRequest && (
              <Typography variant="body2" color="text.secondary">
                {partRequest.description} - Talep: {partRequest.requestedQty} adet
              </Typography>
            )}
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
              label="Tedarik Edilen Miktar"
              type="number"
              value={suppliedQty}
              onChange={(e) => setSuppliedQty(parseInt(e.target.value, 10) || 1)}
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
            {loading ? <CircularProgress size={24} /> : 'Tedarik Et'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
