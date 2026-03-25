'use client';

import React, { useMemo } from 'react';
import { Box, Card, CardContent, Typography, Grid, Table, TableBody, TableCell, TableHead, TableRow, LinearProgress, Chip } from '@mui/material';
import { useChecks } from '@/hooks/use-checks';
import { CheckBillStatus } from '@/types/check-bill';
import { STATUS_LABEL, STATUS_MUI_COLOR } from '@/lib/labels';
import { formatAmount } from '@/lib/format';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';

export default function ReportPortfolioClient() {
    const { data: checks, isLoading } = useChecks();

    const chartData = useMemo(() => {
        if (!checks) return [];

        const grouped = checks.reduce((acc, curr) => {
            // Aggregate by status (IN_PORTFOLIO, COLLECTED, etc.)
            const status = curr.status;
            if (!acc[status]) {
                acc[status] = { status, count: 0, amount: 0 };
            }
            acc[status].count += 1;
            acc[status].amount += curr.amount;
            return acc;
        }, {} as Record<string, { status: CheckBillStatus; count: number; amount: number }>);

        const dataArray = Object.values(grouped).sort((a, b) => b.amount - a.amount);

        // Total calculation for percentage
        const totalAmount = dataArray.reduce((sum, item) => sum + item.amount, 0);

        return dataArray.map(item => ({
            ...item,
            label: STATUS_LABEL[item.status],
            color: getThemeColorByName(STATUS_MUI_COLOR[item.status]),
            percentage: totalAmount > 0 ? (item.amount / totalAmount) * 100 : 0
        }));

    }, [checks]);

    const totalPortfolioAmount = chartData.reduce((sum, d) => sum + d.amount, 0);

    if (isLoading) return <Typography>Rapor yükleniyor...</Typography>;
    if (!checks || checks.length === 0) return <Typography>Raporlanacak kayıt bulunamadı.</Typography>;

    return (
        <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 5 }}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>Portföy Dağılımı</Typography>
                        <Box sx={{ height: 400, width: '100%', position: 'relative' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={chartData}
                                        dataKey="amount"
                                        nameKey="label"
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={80}
                                        outerRadius={140}
                                        stroke="none"
                                    >
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip
                                        formatter={(value: number) => formatAmount(value)}
                                        contentStyle={{ borderRadius: 8, borderColor: '#e0e0e0' }}
                                    />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                            <Box
                                position="absolute"
                                top="45%"
                                left="0"
                                width="100%"
                                textAlign="center"
                                sx={{ pointerEvents: 'none' }}
                            >
                                <Typography variant="body2" color="text.secondary">Toplam Hacim</Typography>
                                <Typography variant="h6" fontWeight="bold">{formatAmount(totalPortfolioAmount)}</Typography>
                            </Box>
                        </Box>
                    </CardContent>
                </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 7 }}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>Durum Dağılım Tablosu</Typography>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Durum</TableCell>
                                    <TableCell align="center">Evrak Sayısı</TableCell>
                                    <TableCell align="right">Toplam Tutar</TableCell>
                                    <TableCell width="25%">Oran</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {chartData.map((row) => (
                                    <TableRow key={row.status}>
                                        <TableCell>
                                            <Chip
                                                label={row.label}
                                                size="small"
                                                color={STATUS_MUI_COLOR[row.status] || 'default'}
                                                variant="outlined"
                                            />
                                        </TableCell>
                                        <TableCell align="center">{row.count}</TableCell>
                                        <TableCell align="right">{formatAmount(row.amount)}</TableCell>
                                        <TableCell>
                                            <Box display="flex" alignItems="center" gap={1}>
                                                <LinearProgress
                                                    variant="determinate"
                                                    value={row.percentage}
                                                    color={STATUS_MUI_COLOR[row.status] === 'default' ? 'inherit' : STATUS_MUI_COLOR[row.status] as any}
                                                    sx={{ flexGrow: 1, borderRadius: 4, height: 6 }}
                                                />
                                                <Typography variant="caption">{row.percentage.toFixed(1)}%</Typography>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );
}

// Minimal helper to get actual hex value for pie chart colors matching MUI variants
function getThemeColorByName(colorName: string): string {
    switch (colorName) {
        case 'primary': return '#3f51b5';
        case 'secondary': return '#f50057';
        case 'success': return '#4caf50';
        case 'error': return '#f44336';
        case 'warning': return '#ff9800';
        case 'info': return '#2196f3';
        default: return '#9e9e9e';
    }
}
