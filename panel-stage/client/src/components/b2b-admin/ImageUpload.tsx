'use client';

import { useState, useCallback } from 'react';
import { Box, Paper, IconButton, Typography, alpha } from '@mui/material';
import { CloudUpload as CloudUploadIcon, Delete as DeleteIcon, Image as ImageIcon } from '@mui/icons-material';

interface ImageUploadProps {
  value?: string | null;
  onChange: (file: File | null) => void;
  accept?: string;
  maxSize?: number; // in bytes
  aspectRatio?: string;
  height?: number | string;
  disabled?: boolean;
}

export function ImageUpload({
  value,
  onChange,
  accept = 'image/*',
  maxSize = 5 * 1024 * 1024, // 5MB
  aspectRatio = '16/9',
  height = 200,
  disabled = false,
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(value || null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = useCallback((file: File | null) => {
    setError(null);

    if (!file) {
      setPreview(null);
      onChange(null);
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Sadece resim dosyaları yüklenebilir');
      return;
    }

    // Validate file size
    if (file.size > maxSize) {
      setError(`Dosya boyutu çok büyük (maksimum ${Math.round(maxSize / 1024 / 1024)}MB)`);
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
      onChange(file);
    };
    reader.readAsDataURL(file);
  }, [maxSize, onChange]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (disabled) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [disabled, handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    handleFileSelect(file);
  }, [handleFileSelect]);

  const handleRemove = useCallback(() => {
    handleFileSelect(null);
  }, [handleFileSelect]);

  return (
    <Box>
      <Paper
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        sx={{
          height,
          border: '2px dashed',
          borderColor: isDragging ? 'primary.main' : error ? 'error.main' : 'divider',
          bgcolor: isDragging ? alpha('#1976d2', 0.05) : 'background.paper',
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: disabled ? 'not-allowed' : 'pointer',
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.2s',
          '&:hover': !disabled ? {
            borderColor: 'primary.main',
            bgcolor: alpha('#1976d2', 0.05),
          } : {},
        }}
      >
        {preview ? (
          <>
            <Box
              component="img"
              src={preview}
              alt="Preview"
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
            {!disabled && (
              <IconButton
                onClick={handleRemove}
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  bgcolor: 'error.main',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'error.dark',
                  },
                }}
              >
                <DeleteIcon />
              </IconButton>
            )}
          </>
        ) : (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 1,
              color: 'text.secondary',
            }}
          >
            {isDragging ? (
              <ImageIcon sx={{ fontSize: 48, color: 'primary.main' }} />
            ) : (
              <CloudUploadIcon sx={{ fontSize: 48 }} />
            )}
            <Typography variant="body2" align="center">
              {isDragging ? 'Bırakın' : 'Resmi sürükleyin veya'}
            </Typography>
            <Typography
              variant="button"
              sx={{
                color: 'primary.main',
                fontWeight: 600,
                textDecoration: 'underline',
              }}
            >
              dosya seçin
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Maksimum {Math.round(maxSize / 1024 / 1024)}MB
            </Typography>
          </Box>
        )}

        <input
          type="file"
          accept={accept}
          onChange={handleInputChange}
          disabled={disabled}
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            opacity: 0,
            cursor: disabled ? 'not-allowed' : 'pointer',
          }}
        />
      </Paper>

      {error && (
        <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
          {error}
        </Typography>
      )}
    </Box>
  );
}
