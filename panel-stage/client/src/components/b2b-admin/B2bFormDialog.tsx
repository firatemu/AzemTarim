'use client';

import { ReactNode } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Box,
} from '@mui/material';
import { UseFormReturn, FieldValues } from 'react-hook-form';

interface B2bFormDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  onSubmit: () => void;
  form: UseFormReturn<FieldValues>;
  submitText?: string;
  cancelText?: string;
  loading?: boolean;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
}

export function B2bFormDialog({
  open,
  onClose,
  title,
  children,
  onSubmit,
  form,
  submitText = 'Kaydet',
  cancelText = 'İptal',
  loading = false,
  maxWidth = 'md',
  fullWidth = true,
}: B2bFormDialogProps) {
  const {
    formState: { isSubmitting },
  } = form;

  return (
    <Dialog
      open={open}
      onClose={loading || isSubmitting ? undefined : onClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      PaperProps={{
        sx: { borderRadius: 3 },
      }}
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent dividers>{children}</DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button
          onClick={onClose}
          disabled={loading || isSubmitting}
          color="inherit"
        >
          {cancelText}
        </Button>
        <Button
          onClick={onSubmit}
          variant="contained"
          disabled={loading || isSubmitting}
          startIcon={(loading || isSubmitting) && <CircularProgress size={16} />}
        >
          {loading || isSubmitting ? 'Kaydediliyor...' : submitText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// Wrapper for form fields with consistent spacing
interface FormFieldWrapperProps {
  children: ReactNode;
  label?: string;
  required?: boolean;
  error?: boolean;
  helperText?: string;
}

export function FormFieldWrapper({
  children,
  label,
  required,
  error,
  helperText,
}: FormFieldWrapperProps) {
  return (
    <Box sx={{ mb: 2 }}>
      {label && (
        <Box
          sx={{
            mb: 0.5,
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
          }}
        >
          <Box
            component="span"
            sx={{
              fontSize: '0.875rem',
              fontWeight: 500,
              color: 'text.primary',
            }}
          >
            {label}
          </Box>
          {required && (
            <Box component="span" sx={{ color: 'error.main' }}>
              *
            </Box>
          )}
        </Box>
      )}
      {children}
      {helperText && (
        <Box
          sx={{
            mt: 0.5,
            fontSize: '0.75rem',
            color: error ? 'error.main' : 'text.secondary',
          }}
        >
          {helperText}
        </Box>
      )}
    </Box>
  );
}
