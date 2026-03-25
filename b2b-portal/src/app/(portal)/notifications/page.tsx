'use client';

import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Typography,
} from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { b2bFetch } from '@/lib/b2b-fetch';

type NotifRow = {
  id: string;
  message: string;
  type: string;
  isRead: boolean;
  orderId: string | null;
  createdAt: string;
};

export default function NotificationsPage() {
  const qc = useQueryClient();

  const list = useQuery({
    queryKey: ['b2b', 'notifications'],
    queryFn: async () => {
      const r = await b2bFetch('notifications?pageSize=50&page=1');
      if (!r.ok) throw new Error('Bildirimler yuklenemedi');
      return r.json() as Promise<{
        data: NotifRow[];
        meta: { total: number };
      }>;
    },
  });

  const markAll = useMutation({
    mutationFn: async () => {
      const r = await b2bFetch('notifications/read-all', { method: 'PATCH' });
      if (!r.ok) throw new Error('Islem basarisiz');
      return r.json();
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['b2b', 'notifications'] }),
  });

  const markOne = useMutation({
    mutationFn: async (id: string) => {
      const r = await b2bFetch(`notifications/${id}/read`, { method: 'PATCH' });
      if (!r.ok) throw new Error('Okundu isaretlenemedi');
      return r.json();
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['b2b', 'notifications'] }),
  });

  const handleNotificationClick = async (n: NotifRow) => {
    if (!n.isRead) {
      await markOne.mutateAsync(n.id);
    }
    if (n.orderId) {
      window.location.href = `/orders/${n.orderId}`;
    }
  };

  if (list.isLoading) {
    return <CircularProgress sx={{ display: 'block', mx: 'auto', my: 4 }} />;
  }
  if (list.isError) {
    return (
      <Alert severity="error">
        Bildirimler acilamadi. <Link href="/dashboard">Panele don</Link>
      </Alert>
    );
  }

  return (
    <Box sx={{ pb: 4 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
          flexWrap: 'wrap',
          gap: 1,
        }}
      >
        <Typography variant="h6" fontWeight={700}>
          Bildirimler
        </Typography>
        <Button
          size="small"
          variant="outlined"
          disabled={markAll.isPending}
          onClick={() => markAll.mutate()}
        >
          Tumunu okundu isaretle
        </Button>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Toplam: {list.data?.meta?.total ?? 0}
      </Typography>
      <List dense sx={{ bgcolor: 'background.paper', borderRadius: 1 }}>
        {(list.data?.data ?? []).map((n) => (
          <ListItem
            key={n.id}
            divider
            onClick={() => handleNotificationClick(n)}
            sx={{
              cursor: 'pointer',
              bgcolor: n.isRead ? 'inherit' : 'action.hover',
              '&:hover': {
                bgcolor: 'action.selected',
              },
            }}
            secondaryAction={
              !n.isRead ? (
                <Button
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    markOne.mutate(n.id);
                  }}
                  disabled={markOne.isPending}
                >
                  Okundu
                </Button>
              ) : null
            }
          >
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography fontWeight={n.isRead ? 400 : 700}>{n.message}</Typography>
                  {!n.isRead && (
                    <Chip label="Yeni" size="small" color="primary" sx={{ height: 22 }} />
                  )}
                  {n.orderId && (
                    <Chip label="Siparişe Git" size="small" variant="outlined" />
                  )}
                </Box>
              }
              secondary={
                <Typography variant="caption" color="text.secondary">
                  {new Date(n.createdAt).toLocaleString('tr-TR')} — {n.type}
                  {n.orderId && ` — Sipariş: ${n.orderId.slice(0, 8)}…`}
                </Typography>
              }
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
}
