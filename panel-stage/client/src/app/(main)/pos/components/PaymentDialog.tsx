'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Box,
  Grid,
  Select,
  MenuItem,
  Divider,
  InputAdornment,
  IconButton,
  Alert,
  AlertTitle,
} from '@mui/material';
import { Close, Warning } from '@mui/icons-material';
import { usePosStore } from '@/stores/posStore';
import type { PosPayment } from '@/app/(main)/pos/types/pos.types';

function mapUiCodeToPosPayment(code: string): Pick<PosPayment, 'method' | 'label'> {
  switch (code) {
    case 'NAKIT':
      return { method: 'cash', label: 'Nakit' };
    case 'KREDI_KARTI':
      return { method: 'credit_card', label: 'Kredi Kartı' };
    case 'BANKA_HAVALESI':
      return { method: 'transfer', label: 'Banka Havale' };
    case 'CEK':
      return { method: 'other', label: 'Çek' };
    case 'SENET':
      return { method: 'other', label: 'Senet' };
    case 'HEDIYE_KARTI':
      return { method: 'other', label: 'Hediye Kartı' };
    case 'KREDI_HESABI':
      return { method: 'other', label: 'Kredi Hesabı' };
    default:
      return { method: 'other', label: code || 'Diğer' };
  }
}

export default function PaymentDialog() {
  const {
    paymentDialogOpen,
    setPaymentDialogOpen,
    cartTotals,
    payments,
    remaining,
    addPayment,
    removePayment,
    clearPayments,
  } = usePosStore();

  const cartTotal = cartTotals.grandTotal;

  const [paymentMethod, setPaymentMethod] = useState('');
  const [amount, setAmount] = useState('');
  const [cashboxId, setCashboxId] = useState('');
  const [bankAccountId, setBankAccountId] = useState('');
  const [giftCardId, setGiftCardId] = useState('');
  const [error, setError] = useState('');

  const handleAddPayment = () => {
    // Önceki hataları temizle
    setError('');

    if (!amount || parseFloat(amount) <= 0) {
      setError('Lütfen geçerli bir tutar girin.');
      return;
    }

    const paymentAmount = parseFloat(amount);
    const currentTotalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
    const newTotalPaid = currentTotalPaid + paymentAmount;

    // Ödenen tutar sepet toplamından fazla olamaz kontrolü
    if (newTotalPaid > cartTotal) {
      setError(`Ödenen tutar (₺${newTotalPaid.toFixed(2)}) sepet toplamından (₺${cartTotal.toFixed(2)}) büyük olamaz!`);
      return;
    }

    const { method, label } = mapUiCodeToPosPayment(paymentMethod);
    const payment: PosPayment = {
      method,
      label,
      amount: paymentAmount,
      ...(cashboxId && { cashboxId }),
      ...(bankAccountId && { bankAccountId }),
      ...(giftCardId && { giftCardId }),
    };

    addPayment(payment);

    // Reset form
    setPaymentMethod('');
    setAmount('');
    setCashboxId('');
    setBankAccountId('');
    setGiftCardId('');

    // Close dialog if remaining amount is 0
    if (cartTotal - newTotalPaid <= 0) {
      setPaymentDialogOpen(false);
    }
  };

  const handleClose = () => {
    setPaymentDialogOpen(false);
    setPaymentMethod('');
    setAmount('');
    setCashboxId('');
    setBankAccountId('');
    setGiftCardId('');
    setError('');
  };

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <Dialog open={paymentDialogOpen} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Ödeme Ekle
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert 
            severity="warning" 
            sx={{ 
              mb: 2, 
              borderRadius: 2,
              borderLeft: '6px solid #f57c00',
              '& .MuiAlert-icon': {
                fontSize: '32px'
              },
              '& .MuiAlert-message': {
                py: 1
              }
            }}
            icon={<Warning sx={{ fontSize: '32px' }} />}
          >
            <AlertTitle sx={{ fontWeight: 'bold', fontSize: '1rem', mb: 0.5 }}>
              ⚠️ Uyarı
            </AlertTitle>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              {error}
            </Typography>
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" gutterBottom>
            Kalan Tutar: ₺{remaining.toFixed(2)}
          </Typography>
        </Box>

        <Grid container spacing={2}>
          {/* Payment Method */}
          <Grid size={{ xs: 12 }}>
            <Select
              fullWidth
              size="medium"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as string)}
              displayEmpty
            >
              <MenuItem value="NAKIT">Nakit</MenuItem>
              <MenuItem value="KREDI_KARTI">Kredi Kartı</MenuItem>
              <MenuItem value="BANKA_HAVALESI">Banka Havaleyi</MenuItem>
              <MenuItem value="CEK">Çek</MenuItem>
              <MenuItem value="SENET">Senet</MenuItem>
              <MenuItem value="HEDIYE_KARTI">Hediye Kartı</MenuItem>
              <MenuItem value="KREDI_HESABI">Kredi Hesabı</MenuItem>
            </Select>
          </Grid>

          {/* Amount */}
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              size="medium"
              type="number"
              label="Tutar"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start">₺</InputAdornment>,
              }}
            />
          </Grid>

          {/* Conditional fields based on payment method */}
          {paymentMethod === 'NAKIT' && (
            <Grid size={{ xs: 12 }}>
              <Select
                fullWidth
                size="medium"
                value={cashboxId}
                onChange={(e) => setCashboxId(e.target.value as string)}
                displayEmpty
              >
                <MenuItem value="">Kasa Seçin</MenuItem>
                {/* Will load kasas dynamically */}
              </Select>
            </Grid>
          )}

          {paymentMethod === 'BANKA_HAVALESI' && (
            <Grid size={{ xs: 12 }}>
              <Select
                fullWidth
                size="medium"
                value={bankAccountId}
                onChange={(e) => setBankAccountId(e.target.value as string)}
                displayEmpty
              >
                <MenuItem value="">Banka Hesabı Seçin</MenuItem>
                {/* Will load bank accounts dynamically */}
              </Select>
            </Grid>
          )}

          {paymentMethod === 'HEDIYE_KARTI' && (
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                size="medium"
                label="Hediye Kart ID"
                value={giftCardId}
                onChange={(e) => setGiftCardId(e.target.value)}
              />
            </Grid>
          )}
        </Grid>

        <Divider sx={{ my: 2 }} />

        {/* Payment History */}
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" gutterBottom>
            Ödeme Geçmişi:
          </Typography>
          {payments.map((payment, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                p: 1,
                bgcolor: 'action.hover',
                borderRadius: 1,
                mb: 1,
              }}
            >
              <Box>
                <Typography variant="caption">{payment.label}</Typography>
                <Typography variant="body1">₺{payment.amount.toFixed(2)}</Typography>
              </Box>
              <IconButton size="small" onClick={() => removePayment(index)}>
                <Close />
              </IconButton>
            </Box>
          ))}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} size="large">
          İptal
        </Button>
        <Button
          onClick={handleAddPayment}
          variant="contained"
          size="large"
          disabled={!amount || parseFloat(amount) <= 0}
          color="primary"
        >
          Ekle
        </Button>
        <Button
          onClick={() => {
            setPaymentDialogOpen(false);
            clearPayments();
          }}
          variant="outlined"
          size="large"
          color="error"
        >
          Temizle
        </Button>
      </DialogActions>
    </Dialog>
  );
}
