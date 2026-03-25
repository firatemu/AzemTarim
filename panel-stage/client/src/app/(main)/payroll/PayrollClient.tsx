'use client';

import React, { useState } from 'react';
import { Box, Button, TextField, MenuItem, InputAdornment, Card, CardContent, Typography, Grid, Paper, Stack, Chip, IconButton, Tooltip } from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams, GridActionsCellItem } from '@mui/x-data-grid';
import { useJournals } from '@/hooks/use-journals';
import { JournalType } from '@/types/check-bill';
import { JOURNAL_TYPE_LABEL, JOURNAL_TYPE_DESCRIPTION } from '@/lib/labels';
import { formatAmount, formatDate } from '@/lib/format';
import { useRouter } from 'next/navigation';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import RefreshIcon from '@mui/icons-material/Refresh';
import DownloadIcon from '@mui/icons-material/Download';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import StandardPage from '@/components/common/StandardPage';

const AVAILABLE_TYPES = [
    JournalType.CUSTOMER_DOCUMENT_ENTRY,
    JournalType.CUSTOMER_DOCUMENT_EXIT,
    JournalType.OWN_DOCUMENT_ENTRY,
    JournalType.BANK_COLLECTION_ENDORSEMENT,
    JournalType.BANK_GUARANTEE_ENDORSEMENT,
    JournalType.ACCOUNT_DOCUMENT_ENDORSEMENT
];

export default function PayrollClient() {
    const router = useRouter();
    const [search, setSearch] = useState('');
    const [type, setType] = useState<string>('');

    // Fetch logic with react-query
    const { data: journals, isLoading } = useJournals({
        search: search.length >= 3 ? search : undefined,
        type: type ? (type as JournalType) : undefined,
    });

    const columns: GridColDef[] = [
        {
            field: 'journalNo',
            headerName: 'Bordro No',
            width: 140,
            renderCell: (params: GridRenderCellParams) => (
                <Button
                    variant="text"
                    color="primary"
                    onClick={() => router.push(`/payroll/${params.row.id}`)}
                    sx={{ fontWeight: 'bold' }}
                >
                    {params.value}
                </Button>
            ),
        },
        {
            field: 'type',
            headerName: 'Tür',
            width: 200,
            valueGetter: (value: any) => JOURNAL_TYPE_LABEL[value as JournalType] || value,
        },
        {
            field: 'date',
            headerName: 'Tarih',
            width: 120,
            valueGetter: (value: string) => formatDate(value),
        },
        {
            field: 'account',
            headerName: 'Cari / Banka',
            width: 250,
            valueGetter: (value: any, row: any) => row.account?.title || row.bankAccount?.name || '-',
        },
        {
            field: 'documentCount',
            headerName: 'Evrak Sayısı',
            width: 120,
            align: 'center',
            headerAlign: 'center',
        },
        {
            field: 'totalAmount',
            headerName: 'Toplam Tutar',
            width: 150,
            align: 'right',
            headerAlign: 'right',
            valueGetter: (value: number) => formatAmount(value),
        },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'İşlemler',
            width: 100,
            getActions: (params) => [
                <GridActionsCellItem
                    key="view"
                    icon={<VisibilityIcon />}
                    label="Görüntüle"
                    onClick={() => router.push(`/payroll/${params.row.id}`)}
                    showInMenu
                />
            ],
        },
    ];

    const handleRefresh = () => {
        // useJournals uses react-query, so we could trigger a refetch if needed
        // but typically search/type state changes trigger it automatically
    };

    return (
        <StandardPage
            title="Bordro Yönetimi"
        >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Box sx={{
                    width: 40, height: 40, borderRadius: 2,
                    background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white'
                }}>
                    <ReceiptLongIcon />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'var(--foreground)', lineHeight: 1.2 }}>
                    Bordro Listesi
                </Typography>
            </Box>

            {/* KPI Metrics Strip */}
            <Paper variant="outlined" sx={{ mb: 2, p: 1.5, display: 'flex', flexWrap: 'wrap', gap: 0, bgcolor: 'var(--card)', borderColor: 'var(--border)', borderRadius: 'var(--radius)' }}>
                <Box sx={{ flex: '1 1 120px', px: 1.5, borderRight: '1px solid var(--border)' }}>
                    <Typography variant="caption" color="var(--muted-foreground)" sx={{ fontWeight: 600, textTransform: 'uppercase' }}>Toplam Bordro</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>{journals?.length || 0}</Typography>
                </Box>
                <Box sx={{ flex: '1 1 120px', px: 1.5, borderRight: '1px solid var(--border)' }}>
                    <Typography variant="caption" color="var(--muted-foreground)" sx={{ fontWeight: 600, textTransform: 'uppercase' }}>Bu Ay</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>0</Typography>
                </Box>
                <Box sx={{ flex: '1 1 120px', px: 1.5, borderRight: '1px solid var(--border)' }}>
                    <Typography variant="caption" color="var(--muted-foreground)" sx={{ fontWeight: 600, textTransform: 'uppercase' }}>Bekleyen Tahsilat</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'var(--primary)' }}>₺ 0,00</Typography>
                </Box>
                <Box sx={{ flex: '1 1 120px', px: 1.5 }}>
                    <Typography variant="caption" color="var(--muted-foreground)" sx={{ fontWeight: 600, textTransform: 'uppercase' }}>Toplam Tutar</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {formatAmount(journals?.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0) || 0)}
                    </Typography>
                </Box>
            </Paper>

            {/* Quick Actions (Dashboard layout per user request, but minimalist) */}
            <Box mb={3}>
                <Typography variant="subtitle2" mb={1.5} color="var(--muted-foreground)" fontWeight={600}>HIZLI İŞLEMLER</Typography>
                <Grid container spacing={1.5}>
                    {AVAILABLE_TYPES.map(t => (
                        <Grid size={{ xs: 12, sm: 4, md: 2 }} key={t}>
                            <Card
                                variant="outlined"
                                sx={{
                                    cursor: 'pointer',
                                    height: '100%',
                                    borderColor: 'var(--border)',
                                    bgcolor: 'var(--card)',
                                    borderRadius: 'var(--radius)',
                                    '&:hover': { borderColor: 'var(--primary)', bgcolor: 'rgba(var(--primary-rgb), 0.04)' },
                                    transition: 'all 0.2s ease'
                                }}
                                onClick={() => router.push(`/payroll/new?type=${t}`)}
                            >
                                <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                                    <Typography variant="caption" color="var(--primary)" fontWeight="bold" sx={{ display: 'block', mb: 0.5 }}>
                                        {JOURNAL_TYPE_LABEL[t].split(' ')[0]}
                                    </Typography>
                                    <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.8rem', lineHeight: 1.2 }}>
                                        {JOURNAL_TYPE_LABEL[t]}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Box>

            {/* Toolbar */}
            <Paper variant="outlined" sx={{ mb: 2, bgcolor: 'var(--card)', borderColor: 'var(--border)', borderRadius: 'var(--radius)' }}>
                <Box sx={{ p: 2, display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'center' }}>
                    <TextField
                        id="payroll-search"
                        size="small"
                        placeholder="Bordro No veya Cari Ara..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon sx={{ color: 'var(--muted-foreground)' }} />
                                </InputAdornment>
                            ),
                        }}
                        sx={{
                            width: 300,
                            '& .MuiOutlinedInput-root': { bgcolor: 'var(--background)', borderRadius: 2 }
                        }}
                    />
                    <TextField
                        id="payroll-type"
                        select
                        size="small"
                        label="İşlem Türü"
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        sx={{
                            width: 200,
                            '& .MuiOutlinedInput-root': { bgcolor: 'var(--background)', borderRadius: 2 }
                        }}
                    >
                        <MenuItem value="">Tümü</MenuItem>
                        {Object.keys(JOURNAL_TYPE_LABEL).map((key) => (
                            <MenuItem key={key} value={key}>
                                {JOURNAL_TYPE_LABEL[key as JournalType]}
                            </MenuItem>
                        ))}
                    </TextField>

                    <Stack direction="row" spacing={1}>
                        <Chip label="Bugün" size="small" variant="outlined" sx={{ borderRadius: 1.5, fontWeight: 500, cursor: 'pointer', '&:hover': { bgcolor: 'var(--muted)' } }} />
                        <Chip label="Bu Hafta" size="small" variant="outlined" sx={{ borderRadius: 1.5, fontWeight: 500, cursor: 'pointer', '&:hover': { bgcolor: 'var(--muted)' } }} />
                        <Chip label="Bu Ay" size="small" variant="outlined" sx={{ borderRadius: 1.5, fontWeight: 500, cursor: 'pointer', '&:hover': { bgcolor: 'var(--muted)' } }} />
                    </Stack>

                    <Box sx={{ flexGrow: 1 }} />

                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                            variant="outlined"
                            size="small"
                            startIcon={<RefreshIcon />}
                            onClick={handleRefresh}
                            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, bgcolor: 'var(--background)', color: 'var(--foreground)', borderColor: 'var(--border)' }}
                        >
                            Yenile
                        </Button>
                        <Button
                            variant="outlined"
                            size="small"
                            startIcon={<DownloadIcon />}
                            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, bgcolor: 'var(--background)', color: 'var(--foreground)', borderColor: 'var(--border)' }}
                        >
                            Excel
                        </Button>
                    </Box>
                </Box>
            </Paper>

            {/* DataGrid Wrapper */}
            <Paper variant="outlined" sx={{ overflow: 'hidden', bgcolor: 'var(--card)', borderColor: 'var(--border)', borderRadius: 'var(--radius)' }}>
                <DataGrid
                    rows={journals || []}
                    columns={columns}
                    loading={isLoading}
                    disableRowSelectionOnClick
                    pageSizeOptions={[25, 50, 100]}
                    initialState={{
                        pagination: { paginationModel: { pageSize: 25 } },
                        sorting: { sortModel: [{ field: 'date', sort: 'desc' }] },
                    }}
                    sx={{
                        border: 'none',
                        '& .MuiDataGrid-columnHeaders': {
                            bgcolor: 'var(--muted)',
                            color: 'var(--muted-foreground)',
                            fontWeight: 700,
                            borderBottom: '1px solid var(--border)'
                        },
                        '& .MuiDataGrid-cell': {
                            borderBottom: '1px solid var(--border)'
                        },
                        '& .MuiDataGrid-row:hover': {
                            bgcolor: 'rgba(var(--primary-rgb), 0.02)'
                        }
                    }}
                />
            </Paper>
        </StandardPage>
    );
}
