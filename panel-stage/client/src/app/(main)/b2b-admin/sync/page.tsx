'use client';

import StandardPage from '@/components/common/StandardPage';
import axios from '@/lib/axios';
import { Alert, Button, CircularProgress, Paper, Typography } from '@mui/material';
import { useCallback, useState } from 'react';

export default function B2bAdminSyncPage() {
  const [data, setData] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    axios
      .get('/b2b/sync/status')
      .then((r) => setData(JSON.stringify(r.data, null, 2)))
      .catch((e) =>
        setError(
          e?.response?.data?.message || e?.message || 'Senkron durumu alınamadı.',
        ),
      )
      .finally(() => setLoading(false));
  }, []);

  return (
    <StandardPage
      title="B2B senkron"
      breadcrumbs={[
        { label: 'B2B Yönetimi', href: '/b2b-admin' },
        { label: 'Senkron' },
      ]}
    >
      <Typography variant="body2" color="var(--muted-foreground)" sx={{ mb: 2 }}>
        Uç: <code>/api/b2b/sync/status</code> — tam senkron tetikleme için backend Swagger
        üzerinden <code>POST /api/b2b/sync/trigger</code> kullanılabilir.
      </Typography>
      <Button variant="contained" size="small" onClick={load} sx={{ mb: 2 }}>
        Durumu yenile
      </Button>
      {loading && <CircularProgress size={28} sx={{ display: 'block', mb: 2 }} />}
      {error && <Alert severity="error">{error}</Alert>}
      {data && !error && (
        <Paper
          variant="outlined"
          sx={{
            p: 2,
            borderColor: 'var(--border)',
            bgcolor: 'var(--card)',
            overflow: 'auto',
          }}
        >
          <pre
            style={{
              margin: 0,
              fontSize: 12,
              fontFamily: 'ui-monospace, monospace',
              color: 'var(--foreground)',
            }}
          >
            {data}
          </pre>
        </Paper>
      )}
    </StandardPage>
  );
}
