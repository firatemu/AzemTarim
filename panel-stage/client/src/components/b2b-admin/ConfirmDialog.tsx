'use client';

import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from '@mui/material';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmText = 'Onayla',
  cancelText = 'İptal',
  confirmColor = 'primary',
  onConfirm,
  onCancel,
  loading = false,
}: ConfirmDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3 },
      }}
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{message}</DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onCancel} disabled={loading}>
          {cancelText}
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color={confirmColor}
          disabled={loading}
          autoFocus
        >
          {loading ? 'İşleniyor...' : confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// Convenience components for common use cases
interface DeleteConfirmDialogProps {
  open: boolean;
  itemName: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export function DeleteConfirmDialog({
  open,
  itemName,
  onConfirm,
  onCancel,
  loading = false,
}: DeleteConfirmDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      title="Silme İşlemini Onayla"
      message={`"${itemName}" öğesini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`}
      confirmText="Sil"
      cancelText="İptal"
      confirmColor="error"
      onConfirm={onConfirm}
      onCancel={onCancel}
      loading={loading}
    />
  );
}
