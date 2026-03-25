'use client';

import React, { useState } from 'react';
import { Box, Button, TextField, MenuItem, Tabs, Tab, Chip, IconButton, Tooltip, Stack } from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { useChecks, useDeleteCheck, useCheckAction } from '@/hooks/use-checks';
import { CheckBill, CheckBillType, CheckBillStatus, PortfolioType } from '@/types/check-bill';
import { STATUS_LABEL, STATUS_MUI_COLOR } from '@/lib/labels';
import { formatAmount, formatDate, isOverdue } from '@/lib/format';
import { useRouter } from 'next/navigation';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import UndoIcon from '@mui/icons-material/Undo';
import PaymentsIcon from '@mui/icons-material/Payments';
import EditIcon from '@mui/icons-material/Edit';
import { DeleteConfirmDialog, CheckStatusActionDialog } from '@/components/checks/CheckDialogs';
import { useSnackbar } from 'notistack';

export default function ChecksClient() {
    const router = useRouter();
    const { enqueueSnackbar } = useSnackbar();
    const [search, setSearch] = useState('');
    const [portfolioType, setPortfolioType] = useState<PortfolioType>(PortfolioType.CREDIT);
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [selectedCheck, setSelectedCheck] = useState<CheckBill | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [actionDialog, setActionDialog] = useState<{ open: boolean; targetStatus: CheckBillStatus | null }>({ open: false, targetStatus: null });

    const { data: checks, isLoading } = useChecks({
        search: search.length >= 3 ? search : undefined,
        portfolioType,
        status: statusFilter ? (statusFilter as CheckBillStatus) : undefined,
    });

    const deleteCheck = useDeleteCheck();
    const checkAction = useCheckAction();

    const handleTabChange = (event: React.SyntheticEvent, newValue: PortfolioType) => {
        setPortfolioType(newValue);
    };

    const handleDeleteConfirm = async () => {
        if (!selectedCheck) return;
        try {
            await deleteCheck.mutateAsync(selectedCheck.id);
            enqueueSnackbar('Evrak silindi.', { variant: 'success' });
        } catch {
            enqueueSnackbar('Silme başarısız.', { variant: 'error' });
        } finally {
            setDeleteDialogOpen(false);
            setSelectedCheck(null);
        }
    };

    const handleActionConfirm = async (notes: string) => {
        if (!selectedCheck || !actionDialog.targetStatus) return;
        try {
            await checkAction.mutateAsync({
                checkBillId: selectedCheck.id,
                newStatus: actionDialog.targetStatus,
                date: new Date().toISOString().split('T')[0],
                transactionAmount: Number(selectedCheck.amount),
                notes: notes || undefined,
            });
            enqueueSnackbar('Evrak durumu güncellendi.', { variant: 'success' });
        } catch (err: any) {
            enqueueSnackbar(err?.response?.data?.message ?? 'İşlem hatalı.', { variant: 'error' });
        } finally {
            setActionDialog({ open: false, targetStatus: null });
            setSelectedCheck(null);
        }
    };

    const columns: GridColDef[] = [
        {
            field: 'type',
            headerName: 'Tip',
            width: 100,
            valueGetter: (value: CheckBillType) => value === CheckBillType.CHECK ? 'Çek' : 'Senet'
        },
        {
            field: 'checkNo',
            headerName: 'Çek/Senet No',
            width: 140,
            renderCell: (params: GridRenderCellParams) => (
                <Button
                    variant="text"
                    color="primary"
                    onClick={() => router.push(`/checks/${params.row.id}`)}
                    sx={{ fontWeight: 'bold' }}
                >
                    {params.value || 'N/A'}
                </Button>
            ),
        },
        {
            field: 'account',
            headerName: 'Cari',
            width: 250,
            valueGetter: (value: any, row: any) => row.account?.title || '-',
        },
        {
            field: 'bank',
            headerName: 'Banka/Şube',
            width: 180,
            valueGetter: (value: string, row: any) => row.bank ? `${row.bank} / ${row.branch || '-'}` : '-',
        },
        {
            field: 'dueDate',
            headerName: 'Vade Tarihi',
            width: 150,
            renderCell: (params) => {
                const overdue = isOverdue(params.value) && params.row.status === CheckBillStatus.IN_PORTFOLIO;
                return (
                    <Box display="flex" alignItems="center" gap={1}>
                        {formatDate(params.value)}
                        {overdue && <WarningAmberIcon color="error" fontSize="small" titleAccess="Vadesi Geçmiş" />}
                    </Box>
                );
            }
        },
        {
            field: 'amount',
            headerName: 'Tutar',
            width: 150,
            align: 'right',
            headerAlign: 'right',
            renderCell: (params) => (
                <Box textAlign="right">
                    <Box>{formatAmount(params.value)}</Box>
                    {params.row.remainingAmount !== params.value && (
                        <Box fontSize="0.75rem" color="text.secondary">
                            Kalan: {formatAmount(params.row.remainingAmount)}
                        </Box>
                    )}
                </Box>
            ),
        },
        {
            field: 'status',
            headerName: 'Durum',
            width: 150,
            renderCell: (params) => (
                <Chip
                    label={STATUS_LABEL[params.value as CheckBillStatus]}
                    size="small"
                    color={STATUS_MUI_COLOR[params.value as CheckBillStatus] || 'default'}
                />
            )
        },
        {
            field: 'actions',
            headerName: 'İşlemler',
            width: 160,
            sortable: false,
            renderCell: (params) => {
                const row = params.row as CheckBill;
                return (
                    <Stack direction="row" spacing={0.5}>
                        <Tooltip title="Görüntüle">
                            <IconButton size="small" color="primary" onClick={() => router.push(`/checks/${row.id}`)}>
                                <VisibilityIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                        {row.status === CheckBillStatus.IN_PORTFOLIO && (
                            <Tooltip title="Tahsilat Ekle">
                                <IconButton size="small" color="success" onClick={() => router.push(`/checks/${row.id}/collection`)}>
                                    <PaymentsIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        )}
                        {[CheckBillStatus.IN_PORTFOLIO, CheckBillStatus.IN_BANK_COLLECTION, CheckBillStatus.ENDORSED, CheckBillStatus.COLLECTED].includes(row.status) && (
                            <Tooltip title="İade Et">
                                <IconButton size="small" color="warning" onClick={() => { setSelectedCheck(row); setActionDialog({ open: true, targetStatus: CheckBillStatus.RETURNED }); }}>
                                    <UndoIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        )}
                        {row.status === CheckBillStatus.IN_PORTFOLIO && (
                            <Tooltip title="Sil">
                                <IconButton size="small" color="error" onClick={() => { setSelectedCheck(row); setDeleteDialogOpen(true); }}>
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        )}
                    </Stack>
                );
            },
        },
    ];

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Tabs value={portfolioType} onChange={handleTabChange}>
                    <Tab label="Alacak (Müşteri) Evrakları" value={PortfolioType.CREDIT} />
                    <Tab label="Borç (Firma) Evrakları" value={PortfolioType.DEBIT} />
                </Tabs>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => router.push('/checks/new')}
                >
                    Yeni Evrak
                </Button>
            </Box>

            <Box display="flex" gap={2} mb={3}>
                <TextField
                    size="small"
                    placeholder="No veya Cari Ara..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    sx={{ width: 300, bgcolor: 'background.paper' }}
                />
                <TextField
                    select
                    size="small"
                    label="Durum"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    sx={{ width: 200, bgcolor: 'background.paper' }}
                >
                    <MenuItem value="">Tümü</MenuItem>
                    {Object.keys(STATUS_LABEL).map((key) => (
                        <MenuItem key={key} value={key}>
                            {STATUS_LABEL[key as CheckBillStatus]}
                        </MenuItem>
                    ))}
                </TextField>
            </Box>

            <Box sx={{ height: 600, width: '100%', bg: 'background.paper', borderRadius: 1 }}>
                <DataGrid
                    rows={checks || []}
                    columns={columns}
                    loading={isLoading}
                    checkboxSelection
                    disableRowSelectionOnClick
                    pageSizeOptions={[20, 50, 100]}
                    initialState={{
                        pagination: { paginationModel: { pageSize: 20 } },
                        sorting: { sortModel: [{ field: 'dueDate', sort: 'asc' }] },
                    }}
                />
            </Box>

            <DeleteConfirmDialog
                open={deleteDialogOpen}
                title="Evrak Silinecek"
                description={`"${selectedCheck?.checkNo || 'Bu evrak'}" kaydı silinecek. Devam etmek istiyor musunuz?`}
                loading={deleteCheck.isPending}
                onCancel={() => { setDeleteDialogOpen(false); setSelectedCheck(null); }}
                onConfirm={handleDeleteConfirm}
            />
            <CheckStatusActionDialog
                open={actionDialog.open}
                check={selectedCheck}
                targetStatus={actionDialog.targetStatus}
                loading={checkAction.isPending}
                onCancel={() => { setActionDialog({ open: false, targetStatus: null }); setSelectedCheck(null); }}
                onConfirm={handleActionConfirm}
            />
        </Box>
    );
}
