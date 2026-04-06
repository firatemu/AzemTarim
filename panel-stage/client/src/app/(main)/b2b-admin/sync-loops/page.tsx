'use client';

import React from 'react';
import {
    Box,
    Typography,
    Paper,
    Chip,
    IconButton,
    Tooltip,
    useTheme,
    Button,
    alpha,
} from '@mui/material';
import {
    Refresh as RefreshIcon,
    Sync as SyncIcon,
    Update as UpdateIcon,
    Person as PersonIcon,
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import StandardPage from '@/components/common/StandardPage';
import axios from '@/lib/axios';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

export default function SyncLoopsPage() {
    const theme = useTheme();

    const { data: loops = [], isLoading, refetch } = useQuery({
        queryKey: ['b2b-sync-loops'],
        queryFn: async () => {
            const res = await axios.get('/b2b-admin/products/sync/loops');
            return res.data;
        },
    });

    const columns: GridColDef[] = [
        {
            field: 'syncType',
            headerName: 'Döngü Tipi',
            flex: 1,
            renderCell: (params: GridRenderCellParams) => {
                const typeMap: Record<string, string> = {
                    PRODUCTS: 'Ürün Senkronizasyonu',
                    PRICES: 'Fiyat Senkronizasyonu',
                    STOCK: 'Stok Senkronizasyonu',
                    ACCOUNT_MOVEMENTS: 'Cari Hareketler',
                    FULL: 'Tam Senkronizasyon',
                };
                const val = params.value as string;
                return (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box
                            sx={{
                                width: 32,
                                height: 32,
                                borderRadius: '8px',
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <SyncIcon sx={{ color: theme.palette.primary.main, fontSize: 18 }} />
                        </Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {typeMap[val] || val}
                        </Typography>
                    </Box>
                );
            },
        },
        {
            field: 'lastRunAt',
            headerName: 'Son Çalışma Zamanı',
            flex: 1,
            renderCell: (params: GridRenderCellParams) => {
                const val = params.value as string;
                return (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <UpdateIcon sx={{ color: 'text.secondary', fontSize: 16 }} />
                        <Typography variant="body2">
                            {val ? format(new Date(val), 'dd MMMM yyyy HH:mm', { locale: tr }) : 'Hiç çalışmadı'}
                        </Typography>
                    </Box>
                );
            },
        },
        {
            field: 'lastUser',
            headerName: 'Başlatan Kullanıcı',
            flex: 1,
            renderCell: (params: GridRenderCellParams) => {
                const user = params.value as any;
                return (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PersonIcon sx={{ color: 'text.secondary', fontSize: 16 }} />
                        <Typography variant="body2" sx={{ color: user?.fullName ? 'text.primary' : 'text.disabled' }}>
                            {user?.fullName || 'Sistem / Otomatik'}
                        </Typography>
                    </Box>
                );
            },
        },
        {
            field: 'status',
            headerName: 'Durum',
            width: 150,
            renderCell: () => (
                <Chip
                    label="Yayında"
                    size="small"
                    color="success"
                    variant="filled"
                    sx={{ fontWeight: 600, fontSize: '0.7rem' }}
                />
            ),
        },
        {
            field: 'actions',
            headerName: 'İşlemler',
            width: 100,
            sortable: false,
            align: 'right',
            headerAlign: 'right',
            renderCell: () => (
                <Tooltip title="Yenile">
                    <IconButton size="small" color="primary" onClick={() => refetch()}>
                        <RefreshIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            ),
        },
    ];

    return (
        <StandardPage
            title="Senkronizasyon Döngüleri"
            breadcrumbs={[{ label: 'B2B Admin', href: '/b2b-admin' }, { label: 'Döngüler' }]}
            headerActions={
                <Button
                    startIcon={<RefreshIcon />}
                    onClick={() => refetch()}
                    variant="contained"
                    size="small"
                    sx={{ borderRadius: 2 }}
                >
                    Listeyi Güncelle
                </Button>
            }
        >
            <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary">
                    Ürün, fiyat ve stok senkronizasyonlarının son çalışma zamanlarını ve başlatan kullanıcıları buradan takip edebilirsiniz.
                </Typography>
            </Box>

            <Paper
                sx={{
                    height: 600,
                    width: '100%',
                    p: 0,
                    borderRadius: 3,
                    overflow: 'hidden',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                }}
            >
                <DataGrid
                    rows={loops}
                    columns={columns}
                    loading={isLoading}
                    disableRowSelectionOnClick
                    getRowId={(row: any) => row.syncType}
                    rowHeight={60}
                    sx={{
                        border: 'none',
                        '& .MuiDataGrid-columnHeaders': {
                            bgcolor: alpha(theme.palette.primary.main, 0.02),
                            borderBottom: `1px solid ${theme.palette.divider}`,
                            '& .MuiDataGrid-columnHeaderTitle': {
                                fontWeight: 700,
                                color: theme.palette.text.primary,
                            }
                        },
                        '& .MuiDataGrid-cell': {
                            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.05)}`,
                        },
                        '& .MuiDataGrid-row:hover': {
                            bgcolor: alpha(theme.palette.primary.main, 0.01),
                        },
                    }}
                />
            </Paper>
        </StandardPage>
    );
}
