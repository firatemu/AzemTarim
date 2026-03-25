 'use client';

import React from 'react';
import { Paper, Box } from '@mui/material';

interface StandardCardProps {
  children: React.ReactNode;
  sx?: Record<string, any>;
  /** MUI spacing unit bazlı padding (örn: 3 -> 24px) */
  padding?: number;
}

/**
 * Tutarlı yüzey dili için standardize edilmiş kart.
 * Tokenlar: var(--card), var(--border), var(--radius), var(--shadow-sm)
 */
export default function StandardCard({
  children,
  sx,
  padding = 3,
}: StandardCardProps) {
  return (
    <Paper
      sx={{
        backgroundColor: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        boxShadow: 'var(--shadow-sm)',
        backgroundImage: 'none',
        p: padding,
        ...(sx ?? {}),
      }}
    >
      <Box>{children}</Box>
    </Paper>
  );
}

