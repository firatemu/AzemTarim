'use client';

import React, { useState } from 'react';
import { Box, Card, CardContent, Typography, Button, Chip, Grid, Divider, Paper, Stack, Tooltip, Alert as MuiAlert } from '@mui/material';
import { useCheck, useCheckEndorsements, useCheckCollections, useDeleteCheck, useUpdateCheck, useCheckAction } from '@/hooks/use-checks';
import { CheckBill, CheckBillType, CheckBillStatus, PortfolioType } from '@/types/check-bill';
import { STATUS_LABEL, STATUS_MUI_COLOR, TYPE_LABEL, PORTFOLIO_LABEL } from '@/lib/labels';
import { formatAmount, formatDate, isOverdue } from '@/lib/format';
import { useRouter } from 'next/navigation';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PaymentsIcon from '@mui/icons-material/Payments';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import PrintIcon from '@mui/icons-material/Print';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import UndoIcon from '@mui/icons-material/Undo';
import BlockIcon from '@mui/icons-material/Block';
import GavelIcon from '@mui/icons-material/Gavel';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import Alert from '@mui/material/Alert';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { DeleteConfirmDialog, CheckStatusActionDialog, CheckEditDialog } from '@/components/checks/CheckDialogs';
import { useSnackbar } from 'notistack';

export default function CheckDetailClient({ checkId }: { checkId: string }) {
    const router = useRouter();
    const { enqueueSnackbar } = useSnackbar();
    const { data: check, isLoading } = useCheck(checkId);
    const { data: endorsements, isLoading: endorsementsLoading } = useCheckEndorsements(checkId);
    const { data: collections, isLoading: collectionsLoading } = useCheckCollections(checkId);

    const deleteCheck = useDeleteCheck();
    const updateCheck = useUpdateCheck();
    const checkAction = useCheckAction();

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [actionDialog, setActionDialog] = useState<{ open: boolean; targetStatus: CheckBillStatus | null }>({ open: false, targetStatus: null });

    if (isLoading) return <Typography>Yükleniyor...</Typography>;
    if (!check) return <Typography>Evrak bulunamadı.</Typography>;

    const handleDelete = async () => {
        try {
            await deleteCheck.mutateAsync(checkId);
            enqueueSnackbar('Evrak başarıyla silindi.', { variant: 'success' });
            router.push('/checks');
        } catch {
            enqueueSnackbar('Silme işlemi başarısız oldu.', { variant: 'error' });
        } finally {
            setDeleteDialogOpen(false);
        }
    };

    const handleEdit = async (data: Parameters<typeof updateCheck.mutateAsync>[0]['data']) => {
        try {
            await updateCheck.mutateAsync({ id: checkId, data });
            enqueueSnackbar('Evrak güncellendi.', { variant: 'success' });
            setEditDialogOpen(false);
        } catch {
            enqueueSnackbar('Güncelleme başarısız oldu.', { variant: 'error' });
        }
    };

    const handleStatusAction = async (notes: string) => {
        if (!actionDialog.targetStatus) return;
        try {
            await checkAction.mutateAsync({
                checkBillId: checkId,
                newStatus: actionDialog.targetStatus,
                date: new Date().toISOString().split('T')[0],
                transactionAmount: Number(check.amount),
                notes: notes || undefined,
            });
            enqueueSnackbar('Evrak durumu güncellendi.', { variant: 'success' });
        } catch (err: any) {
            enqueueSnackbar(err?.response?.data?.message ?? 'İşlem başarısız oldu.', { variant: 'error' });
        } finally {
            setActionDialog({ open: false, targetStatus: null });
        }
    };

    const openAction = (status: CheckBillStatus) => setActionDialog({ open: true, targetStatus: status });

    const collectionColumns: GridColDef[] = [
        { field: 'collectionDate', headerName: 'Tarih', width: 130, valueFormatter: (value) => formatDate(value) },
        { field: 'collectedAmount', headerName: 'Tutar', width: 150, align: 'right', headerAlign: 'right', valueFormatter: (value) => formatAmount(value) },
        { field: 'paymentLocation', headerName: 'Kasa / Banka', width: 250, valueGetter: (value: any, row: any) => row.cashbox?.name || row.bankAccount?.name || '-' },
    ];

    const endorsementColumns: GridColDef[] = [
        { field: 'sequence', headerName: 'Sıra', width: 70 },
        { field: 'endorsedAt', headerName: 'Tarih', width: 120, valueFormatter: (value) => formatDate(value) },
        { field: 'fromAccount', headerName: 'Çıkış', width: 200, valueGetter: (value: any) => value?.title || '-' },
        { field: 'toAccount', headerName: 'Varış', width: 200, valueGetter: (value: any) => value?.title || '-' },
    ];

    return (
        <Box display="flex" flexDirection="column" gap={3}>
            {/* Action Bar */}
            <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
                <Button startIcon={<ArrowBackIcon />} onClick={() => router.back()}>
                    Geri Dön
                </Button>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                    <Tooltip title="Makbuz Yazdır">
                        <Button variant="outlined" startIcon={<PrintIcon />} onClick={() => window.open(`/checks/${checkId}/receipt`, '_blank')}>
                            Makbuz
                        </Button>
                    </Tooltip>

                    {/* Sadece portföy veya kısmi ödemede düzenlenebilir */}
                    {[CheckBillStatus.IN_PORTFOLIO, CheckBillStatus.PARTIAL_PAID].includes(check.status) && (
                        <Button variant="outlined" startIcon={<EditIcon />} onClick={() => setEditDialogOpen(true)}>
                            Düzenle
                        </Button>
                    )}

                    {/* Tahsilat Ekle */}
                    {[CheckBillStatus.IN_PORTFOLIO, CheckBillStatus.PARTIAL_PAID].includes(check.status) && (
                        <Button variant="contained" color="success" startIcon={<PaymentsIcon />} onClick={() => router.push(`/checks/${checkId}/collection`)}>
                            Tahsilat Ekle
                        </Button>
                    )}

                    {/* İade Et */}
                    {[CheckBillStatus.IN_PORTFOLIO, CheckBillStatus.IN_BANK_COLLECTION, CheckBillStatus.IN_BANK_GUARANTEE, CheckBillStatus.ENDORSED, CheckBillStatus.COLLECTED].includes(check.status) && (
                        <Button variant="outlined" color="warning" startIcon={<UndoIcon />} onClick={() => openAction(CheckBillStatus.RETURNED)}>
                            İade Et
                        </Button>
                    )}

                    {/* Portföye Al (İade edilmişse) */}
                    {check.status === CheckBillStatus.RETURNED && (
                        <Button variant="outlined" color="info" startIcon={<AccountBalanceIcon />} onClick={() => openAction(CheckBillStatus.IN_PORTFOLIO)}>
                            Portföye Al
                        </Button>
                    )}

                    {/* Karşılıksız */}
                    {check.status === CheckBillStatus.COLLECTED && (
                        <Button variant="outlined" color="error" startIcon={<BlockIcon />} onClick={() => openAction(CheckBillStatus.WITHOUT_COVERAGE)}>
                            Karşılıksız
                        </Button>
                    )}

                    {/* Protesto */}
                    {check.status === CheckBillStatus.WITHOUT_COVERAGE && (
                        <Button variant="outlined" color="error" startIcon={<GavelIcon />} onClick={() => openAction(CheckBillStatus.PROTESTED)}>
                            Protesto
                        </Button>
                    )}

                    {/* Sil — sadece portföyde olanlar silinebilir */}
                    {check.status === CheckBillStatus.IN_PORTFOLIO && (
                        <Button variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={() => setDeleteDialogOpen(true)}>
                            Sil
                        </Button>
                    )}
                </Stack>
            </Box>

            {check.isProtested && (
                <Alert severity="error" variant="filled">
                    Bu evrak PROTESTO edilmiştir. Protesto Tarihi: {formatDate(check.protestedAt)}
                </Alert>
            )}

            <Grid container spacing={3}>
                <Grid size={{ xs: 12 }}>
                    <Card variant="outlined">
                        <CardContent>
                            <Grid container spacing={3}>
                                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                    <Typography variant="body2" color="text.secondary">Tür / Portföy</Typography>
                                    <Typography variant="body1" fontWeight="500">
                                        {TYPE_LABEL[check.type]} / {PORTFOLIO_LABEL[check.portfolioType]}
                                    </Typography>
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                    <Typography variant="body2" color="text.secondary">Vade / Durum</Typography>
                                    <Box display="flex" alignItems="center" gap={1}>
                                        <Typography variant="body1" fontWeight="500" color={isOverdue(check.dueDate) && check.status === CheckBillStatus.IN_PORTFOLIO ? 'error' : 'inherit'}>
                                            {formatDate(check.dueDate)}
                                        </Typography>
                                        <Chip label={STATUS_LABEL[check.status]} color={STATUS_MUI_COLOR[check.status]} size="small" />
                                    </Box>
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                    <Typography variant="body2" color="text.secondary">Tutar</Typography>
                                    <Typography variant="h6" color="primary">{formatAmount(check.amount)}</Typography>
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                    <Typography variant="body2" color="text.secondary">Kalan Tutar</Typography>
                                    <Typography variant="h6" color="secondary">{formatAmount(check.remainingAmount)}</Typography>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, md: 8 }}>
                    <Card variant="outlined">
                        <CardContent>
                            <Typography variant="h6" gutterBottom>Evrak Bilgileri</Typography>
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Typography variant="body2" color="text.secondary">Düzenleyen (Cari)</Typography>
                                    <Typography variant="body1">{check.account?.title}</Typography>
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Typography variant="body2" color="text.secondary">Banka / Şube</Typography>
                                    <Typography variant="body1">{check.bank || '-'} / {check.branch || '-'}</Typography>
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Typography variant="body2" color="text.secondary">Çek/Senet No</Typography>
                                    <Typography variant="body1">{check.checkNo || '-'}</Typography>
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Typography variant="body2" color="text.secondary">Seri No</Typography>
                                    <Typography variant="body1">{check.serialNo || '-'}</Typography>
                                </Grid>
                                <Grid size={{ xs: 12 }}>
                                    <Typography variant="body2" color="text.secondary">Notlar</Typography>
                                    <Typography variant="body1">{check.notes || '-'}</Typography>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>

                    <Box mt={3}>
                        <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}>
                            <AccountBalanceWalletIcon fontSize="small" /> Ciro / Hareket Geçmişi
                        </Typography>
                        <Box sx={{ height: 300, width: '100%' }}>
                            <DataGrid
                                rows={endorsements || []}
                                columns={endorsementColumns}
                                loading={endorsementsLoading}
                                density="compact"
                                disableRowSelectionOnClick
                                hideFooter
                                localeText={{ noRowsLabel: 'Ciro kaydı bulunmamaktadır.' }}
                            />
                        </Box>
                    </Box>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                    <Card variant="outlined" sx={{ height: '100%' }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}>
                                <PaymentsIcon fontSize="small" /> Tahsilat Geçmişi
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            <Box sx={{ minHeight: 400, width: '100%' }}>
                                <DataGrid
                                    rows={collections || []}
                                    columns={collectionColumns}
                                    loading={collectionsLoading}
                                    disableRowSelectionOnClick
                                    hideFooter
                                    localeText={{ noRowsLabel: 'Tahsilat kaydı bulunmamaktadır.' }}
                                />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Dialoglar */}
            <DeleteConfirmDialog
                open={deleteDialogOpen}
                title="Evrak Silinecek"
                description={`"${check.checkNo || 'Bu evrak'}" numaralı kaydı kalıcı olarak silmek istediğinizden emin misiniz?`}
                loading={deleteCheck.isPending}
                onCancel={() => setDeleteDialogOpen(false)}
                onConfirm={handleDelete}
            />

            <CheckEditDialog
                open={editDialogOpen}
                check={check as CheckBill}
                loading={updateCheck.isPending}
                onCancel={() => setEditDialogOpen(false)}
                onConfirm={handleEdit}
            />

            <CheckStatusActionDialog
                open={actionDialog.open}
                check={check as CheckBill}
                targetStatus={actionDialog.targetStatus}
                loading={checkAction.isPending}
                onCancel={() => setActionDialog({ open: false, targetStatus: null })}
                onConfirm={handleStatusAction}
            />
        </Box>
    );
}

