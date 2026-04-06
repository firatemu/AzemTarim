'use client';

import { extractListRows } from '@/lib/b2b-admin-helpers';
import axios from '@/lib/axios';
import { Alert, CircularProgress, Box, alpha, useTheme, Typography, Container, Stack } from '@mui/material';
import { useEffect, useState } from 'react';
import StandardPage from '@/components/common/StandardPage';
import { B2bAdminAutoTable } from './B2bAdminAutoTable';
import { Sync as SyncIcon, Info as InfoIcon } from '@mui/icons-material';

type Breadcrumb = { label: string; href?: string };

export function B2bAdminFetchedList({
  title,
  endpoint,
  breadcrumbs,
}: {
  title: string;
  endpoint: string;
  breadcrumbs: Breadcrumb[];
}) {
  const theme = useTheme();
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancel = false;
    setLoading(true);
    setError(null);
    axios
      .get(endpoint)
      .then((res) => {
        if (!cancel) setRows(extractListRows(res.data));
      })
      .catch((e) => {
        if (!cancel) {
          setError(
            e?.response?.data?.message ||
            e?.message ||
            'Veri yüklenemedi. Lütfen B2B lisansınızı ve oturum durumunuzu kontrol edin.',
          );
        }
      })
      .finally(() => {
        if (!cancel) setLoading(false);
      });
    return () => {
      cancel = true;
    };
  }, [endpoint]);

  return (
    <StandardPage title={title} breadcrumbs={breadcrumbs}>
      {loading ? (
        <Box
          sx={{
            height: 400,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            opacity: 0.6
          }}
        >
          <CircularProgress
            size={40}
            thickness={5}
            sx={{
              color: 'primary.main',
              '& .MuiCircularProgress-circle': { strokeLinecap: 'round' }
            }}
          />
          <Typography variant="body2" sx={{ fontWeight: 800, color: 'text.secondary', letterSpacing: 0.5 }}>
            VERİLER ÇEKİLİYOR...
          </Typography>
        </Box>
      ) : error ? (
        <Container maxWidth="sm">
          <Alert
            severity="error"
            variant="outlined"
            icon={<InfoIcon />}
            sx={{
              mt: 4,
              borderRadius: 4,
              bgcolor: alpha(theme.palette.error.main, 0.02),
              borderWidth: 2,
              '& .MuiAlert-message': { fontWeight: 600 }
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 900, mb: 0.5 }}>HATA OLUŞTU</Typography>
            {error}
          </Alert>
        </Container>
      ) : (
        <Stack spacing={3}>
          {rows.length > 0 && (
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800, px: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <SyncIcon sx={{ fontSize: 14 }} /> SİSTEMDE TOPLAM {rows.length} KAYIT BULUNDU
            </Typography>
          )}
          <B2bAdminAutoTable rows={rows} />
        </Stack>
      )}
    </StandardPage>
  );
}
