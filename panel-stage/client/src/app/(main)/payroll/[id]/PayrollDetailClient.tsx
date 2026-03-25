'use client';

import React, { useState } from 'react';
import { Box, Card, CardContent, Typography, Button, IconButton, Chip, Grid, Divider, Tooltip, Stack } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useJournal } from '@/hooks/use-journals';
import { useDeleteJournal } from '@/hooks/use-journals';
import { CheckBillType, CheckBillStatus, PortfolioType } from '@/types/check-bill';
import { JOURNAL_TYPE_LABEL, STATUS_LABEL, STATUS_MUI_COLOR, PORTFOLIO_LABEL } from '@/lib/labels';
import { formatAmount, formatDate, isOverdue } from '@/lib/format';
import { useRouter } from 'next/navigation';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PrintIcon from '@mui/icons-material/Print';
import PaymentsIcon from '@mui/icons-material/Payments';
import DeleteIcon from '@mui/icons-material/Delete';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { DeleteConfirmDialog } from '@/components/checks/CheckDialogs';
import { useSnackbar } from 'notistack';

export default function PayrollDetailClient({ journalId }: { journalId: string }) {
    const router = useRouter();
    const { enqueueSnackbar } = useSnackbar();
    const { data: journal, isLoading } = useJournal(journalId);
    const deleteJournal = useDeleteJournal();
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const handleDeleteJournal = async () => {
        try {
            await deleteJournal.mutateAsync(journalId);
            enqueueSnackbar('Bordro silindi.', { variant: 'success' });
            router.push('/payroll');
        } catch {
            enqueueSnackbar('Silme başarısız oldu.', { variant: 'error' });
        } finally {
            setDeleteDialogOpen(false);
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
            field: 'portfolioType',
            headerName: 'Portföy',
            width: 100,
            renderCell: (params) => (
                <Chip
                    label={PORTFOLIO_LABEL[params.value as PortfolioType]}
                    size="small"
                    color={params.value === PortfolioType.CREDIT ? 'primary' : 'secondary'}
                    variant="outlined"
                />
            )
        },
        { field: 'checkNo', headerName: 'Çek/Senet No', width: 140 },
        {
            field: 'bank',
            headerName: 'Banka/Şube',
            width: 180,
            valueGetter: (value: any, row: any) => row.bank ? `${row.bank} / ${row.branch || '-'}` : '-',
        },
        {
            field: 'dueDate',
            headerName: 'Vade Tarihi',
            width: 130,
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
            width: 140,
            align: 'right',
            headerAlign: 'right',
            renderCell: (params) => (
                <Box textAlign="right">
                    <Typography variant="body2">{formatAmount(params.value)}</Typography>
                    {params.row.remainingAmount !== params.value && (
                        <Typography variant="caption" color="text.secondary">
                            Kalan: {formatAmount(params.row.remainingAmount)}
                        </Typography>
                    )}
                </Box>
            ),
        },
        {
            field: 'status',
            headerName: 'Durum',
            width: 140,
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
            width: 140,
            sortable: false,
            renderCell: (params) => <RowActions row={params.row} journalId={journalId} />
        }
    ];

    if (isLoading) return <Typography>Yükleniyor...</Typography>;
    if (!journal) return <Typography>Bordro bulunamadı.</Typography>;

    return (
        <Box display="flex" flexDirection="column" gap={3}>
            {/* Action Bar */}
            <Box display="flex" justifyContent="space-between" alignItems="center">
                <Button startIcon={<ArrowBackIcon />} onClick={() => router.back()}>
                    Geri Dön
                </Button>
                <Stack direction="row" spacing={1}>
                    <Button variant="outlined" startIcon={<PrintIcon />} onClick={() => window.open(`/payroll/print/${journalId}`, '_blank')}>
                        Bordro Yazdır
                    </Button>
                    <Button variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={() => setDeleteDialogOpen(true)}>
                        Bordronu Sil
                    </Button>
                </Stack>
            </Box>

            {/* Dashboard / Summary Bar */}
            <Card variant="outlined">
                <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid size={{ xs: 12, md: 3 }}>
                            <Box display="flex" alignItems="center" gap={1.5}>
                                <Chip label={JOURNAL_TYPE_LABEL[journal.type]} size="small" color="primary" />
                                <Typography variant="subtitle1" fontWeight="bold">{journal.journalNo}</Typography>
                            </Box>
                            <Typography variant="caption" color="text.secondary">Tarih: {formatDate(journal.date)}</Typography>
                        </Grid>

                        <Grid size={{ xs: 12, md: 4 }}>
                            <Typography variant="caption" color="text.secondary" display="block" sx={{ letterSpacing: 1, fontWeight: 700 }}>CARİ / MUHATTAP</Typography>
                            <Typography variant="body1" fontWeight="medium">
                                {journal.account?.title || journal.bankAccount?.name || journal.cashbox?.name || '-'}
                            </Typography>
                        </Grid>

                        <Grid size={{ xs: 4, md: 2 }}>
                            <Typography variant="caption" color="text.secondary" display="block" sx={{ letterSpacing: 1, fontWeight: 700 }}>EVRAK</Typography>
                            <Typography variant="body2" fontWeight="medium">{journal.documentCount || journal.checkBills?.length || 0} Adet</Typography>
                        </Grid>

                        <Grid size={{ xs: 8, md: 3 }} sx={{ textAlign: 'right' }}>
                            <Typography variant="caption" color="text.secondary" display="block" sx={{ letterSpacing: 1, fontWeight: 700 }}>TOPLAM TUTAR</Typography>
                            <Typography variant="h5" color="primary" fontWeight="800">
                                {formatAmount(journal.totalAmount || 0)}
                            </Typography>
                        </Grid>
                    </Grid>
                    {journal.notes && (
                        <Box mt={2} pt={1} borderTop="1px dashed #eee">
                            <Typography variant="caption" color="text.secondary">Not: {journal.notes}</Typography>
                        </Box>
                    )}
                </CardContent>
            </Card>

            {/* Document List */}
            <Card variant="outlined">
                <CardContent>
                    <Typography variant="h6" gutterBottom>Bordro Evrakları</Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Box sx={{ minHeight: 400, width: '100%' }}>
                        <DataGrid
                            rows={journal.checkBills || []}
                            columns={columns}
                            disableRowSelectionOnClick
                            hideFooterPagination
                        />
                    </Box>
                </CardContent>
            </Card>

            {/* Timeline Placeholder */}
            <Card variant="outlined">
                <CardContent>
                    <Typography variant="h6" gutterBottom>İşlem Geçmişi</Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Typography variant="body2" color="text.secondary">Henüz bu bordroda geçmiş kayıt gösterimi tamamlanmadı.</Typography>
                </CardContent>
            </Card>

            <DeleteConfirmDialog
                open={deleteDialogOpen}
                title="Bordro Silinecek"
                description={`"${journal.journalNo}" bordrosu ve portföydeki bağlı evraklar silinecek. Bu işlem geri alınamaz.`}
                loading={deleteJournal.isPending}
                onCancel={() => setDeleteDialogOpen(false)}
                onConfirm={handleDeleteJournal}
            />
        </Box>
    );
}

function RowActions({ row, journalId }: { row: any; journalId: string }) {
    const router = useRouter();

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
            <Tooltip title="Bordro Makbuzu">
                <IconButton size="small" color="inherit" onClick={() => window.open(`/payroll/print/${journalId}`, '_blank')}>
                    <PrintIcon fontSize="small" />
                </IconButton>
            </Tooltip>
        </Stack>
    );
}
