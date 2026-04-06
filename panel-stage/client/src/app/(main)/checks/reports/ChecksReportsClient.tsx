'use client';

import React from 'react';
import Link from 'next/link';
import {
    Box,
    Typography,
    Stack,
    CircularProgress,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Chip,
    Button,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
    useCheckBillReportBankPosition,
    useCheckBillReportProtest,
    useCheckBillReportRiskExposure,
    useCheckBillReportReconciliation,
} from '@/hooks/use-checks';
import { STATUS_LABEL } from '@/lib/labels';
import { formatAmount } from '@/lib/format';
import { CheckBillStatus } from '@/types/check-bill';
import StandardCard from '@/components/common/StandardCard';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export default function ChecksReportsClient() {
    const bank = useCheckBillReportBankPosition();
    const protest = useCheckBillReportProtest();
    const risk = useCheckBillReportRiskExposure();
    const recon = useCheckBillReportReconciliation();

    return (
        <Box sx={{ pb: 4 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1} sx={{ mb: 2 }}>
                <Typography variant="h6" fontWeight={800} color="var(--foreground)">
                    Çek / Senet raporları
                </Typography>
                <Button component={Link} href="/checks" startIcon={<ArrowBackIcon />} variant="outlined" size="small" sx={{ borderRadius: 2 }}>
                    Listeye dön
                </Button>
            </Stack>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Özet KPI’lar tüm portföy içindir; tablolar check-bill-reports API uçlarından yüklenir.
            </Typography>

            <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                    <StandardCard>
                        <Typography variant="subtitle2" fontWeight={800} gutterBottom>
                            Banka pozisyonu (durum bazlı)
                        </Typography>
                        {bank.isLoading ? (
                            <CircularProgress size={24} />
                        ) : (
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Durum</TableCell>
                                        <TableCell align="right">Adet</TableCell>
                                        <TableCell align="right">Kalan tutar</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {(bank.data?.byStatus ?? []).map((row) => (
                                        <TableRow key={row.status}>
                                            <TableCell>
                                                <Chip
                                                    size="small"
                                                    label={STATUS_LABEL[row.status as CheckBillStatus] ?? row.status}
                                                />
                                            </TableCell>
                                            <TableCell align="right">{row._count}</TableCell>
                                            <TableCell align="right">
                                                {formatAmount(Number(row._sum?.remainingAmount ?? 0))}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </StandardCard>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                    <StandardCard>
                        <Typography variant="subtitle2" fontWeight={800} gutterBottom>
                            Mutabakat özeti
                        </Typography>
                        {recon.isLoading ? (
                            <CircularProgress size={24} />
                        ) : (
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Durum</TableCell>
                                        <TableCell align="right">Kayıt</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {((recon.data as { status: string; _count: number }[] | undefined) ?? []).map(
                                        (row) => (
                                            <TableRow key={row.status}>
                                                <TableCell>{row.status}</TableCell>
                                                <TableCell align="right">{row._count}</TableCell>
                                            </TableRow>
                                        )
                                    )}
                                </TableBody>
                            </Table>
                        )}
                    </StandardCard>
                </Grid>

                <Grid size={{ xs: 12 }}>
                    <StandardCard>
                        <Typography variant="subtitle2" fontWeight={800} gutterBottom>
                            Protesto takibi (son kayıtlar)
                        </Typography>
                        {protest.isLoading ? (
                            <CircularProgress size={24} />
                        ) : (
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Tarih</TableCell>
                                        <TableCell>Not</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {(Array.isArray(protest.data) ? protest.data : []).slice(0, 20).map((row: any) => (
                                        <TableRow key={row.id}>
                                            <TableCell>{row.protestDate ? String(row.protestDate) : '—'}</TableCell>
                                            <TableCell>{row.notes ?? '—'}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </StandardCard>
                </Grid>

                <Grid size={{ xs: 12 }}>
                    <StandardCard>
                        <Typography variant="subtitle2" fontWeight={800} gutterBottom>
                            Risk limiti / maruziyet
                        </Typography>
                        {risk.isLoading ? (
                            <CircularProgress size={24} />
                        ) : (
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Cari</TableCell>
                                        <TableCell align="right">Limit</TableCell>
                                        <TableCell align="right">Maruziyet</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {(Array.isArray(risk.data) ? risk.data : []).map((row: any) => (
                                        <TableRow key={row.id}>
                                            <TableCell>{row.account?.title ?? row.accountId}</TableCell>
                                            <TableCell align="right">{formatAmount(Number(row.limitAmount ?? 0))}</TableCell>
                                            <TableCell align="right">{formatAmount(Number(row.currentExposure ?? 0))}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </StandardCard>
                </Grid>
            </Grid>
        </Box>
    );
}
