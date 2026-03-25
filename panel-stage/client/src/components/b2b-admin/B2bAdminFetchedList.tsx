'use client';

import { extractListRows } from '@/lib/b2b-admin-helpers';
import axios from '@/lib/axios';
import { Alert, CircularProgress } from '@mui/material';
import { useEffect, useState } from 'react';
import StandardPage from '@/components/common/StandardPage';
import { B2bAdminAutoTable } from './B2bAdminAutoTable';

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
            'Veri yüklenemedi (B2B lisansı / oturum kontrolü).',
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
      {loading && <CircularProgress size={32} sx={{ display: 'block', my: 2 }} />}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {!loading && !error && <B2bAdminAutoTable rows={rows} />}
    </StandardPage>
  );
}
