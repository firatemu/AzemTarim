 'use client';

import React from 'react';
import { Box } from '@mui/material';
import PageContainer from './PageContainer';

interface StandardPageProps {
  children: React.ReactNode;
  title?: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
  headerActions?: React.ReactNode;
}

/**
 * Yeni sayfalarda (POS hariç) önerilen üst seviye iskelet.
 * Renk token + padding + zemin davranışını PageContainer ile standardize eder.
 */
export default function StandardPage({
  children,
  title,
  breadcrumbs,
  maxWidth = 'xl',
  headerActions,
}: StandardPageProps) {
  return (
    <PageContainer title={title} breadcrumbs={breadcrumbs} maxWidth={maxWidth}>
      {headerActions && <Box sx={{ mb: 3 }}>{headerActions}</Box>}
      {children}
    </PageContainer>
  );
}

