'use client';

import React, { Suspense } from 'react';
import { CircularProgress, Box } from '@mui/material';
import { SatisFaturaForm } from '../../yeni/page';
import MainLayout from '@/components/Layout/MainLayout';
import { useParams, useRouter } from 'next/navigation';

export default function SatisFaturaDuzenlePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  return (
    <Box sx={{ pb: 4 }}>
      <Suspense fallback={
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      }>
        <SatisFaturaForm faturaId={id} onBack={() => router.push('/invoice/sales')} />
      </Suspense>
    </Box>
  );
}
