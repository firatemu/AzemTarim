'use client';

import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Box } from '@mui/material';

interface PriceBreakdownProps {
  listPrice: number;
  classDiscount?: number;
  classDiscountRate?: number;
  campaignDiscount?: number;
  campaignDiscountRate?: number;
  finalPrice: number;
  currency?: string;
  showRates?: boolean;
}

export function PriceBreakdown({
  listPrice,
  classDiscount = 0,
  classDiscountRate = 0,
  campaignDiscount = 0,
  campaignDiscountRate = 0,
  finalPrice,
  currency = '₺',
  showRates = true,
}: PriceBreakdownProps) {
  const totalDiscount = classDiscount + campaignDiscount;

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 600 }}>Fiyat Kalemi</TableCell>
            <TableCell align="right" sx={{ fontWeight: 600 }}>Tutar</TableCell>
            {showRates && <TableCell align="right" sx={{ fontWeight: 600 }}>İndirim %</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell>Liste Fiyatı</TableCell>
            <TableCell align="right">
              {listPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {currency}
            </TableCell>
            <TableCell />
          </TableRow>

          {classDiscount > 0 && (
            <TableRow hover>
              <TableCell sx={{ pl: 4 }}>Müşteri Sınıfı İndirimi</TableCell>
              <TableCell align="right" sx={{ color: 'success.main' }}>
                -{classDiscount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {currency}
              </TableCell>
              {showRates && (
                <TableCell align="right" sx={{ color: 'success.main' }}>
                  %{classDiscountRate}
                </TableCell>
              )}
            </TableRow>
          )}

          {campaignDiscount > 0 && (
            <TableRow hover>
              <TableCell sx={{ pl: 4 }}>Kampanya İndirimi</TableCell>
              <TableCell align="right" sx={{ color: 'success.main' }}>
                -{campaignDiscount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {currency}
              </TableCell>
              {showRates && (
                <TableCell align="right" sx={{ color: 'success.main' }}>
                  %{campaignDiscountRate}
                </TableCell>
              )}
            </TableRow>
          )}

          {totalDiscount > 0 && (
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Toplam İndirim</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600, color: 'success.main' }}>
                -{totalDiscount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {currency}
              </TableCell>
              <TableCell />
            </TableRow>
          )}

          <TableRow sx={{ backgroundColor: 'action.hover' }}>
            <TableCell sx={{ fontWeight: 700, fontSize: '1.1rem' }}>
              Toplam
            </TableCell>
            <TableCell align="right" sx={{ fontWeight: 700, fontSize: '1.1rem', color: 'primary.main' }}>
              {finalPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {currency}
            </TableCell>
            <TableCell />
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
}

interface PriceBreakdownCompactProps {
  listPrice: number;
  finalPrice: number;
  discount?: number;
  currency?: string;
}

export function PriceBreakdownCompact({
  listPrice,
  finalPrice,
  discount,
  currency = '₺',
}: PriceBreakdownCompactProps) {
  const discountPercent = discount
    ? ((discount / listPrice) * 100).toFixed(1)
    : null;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Typography
        variant="body2"
        sx={{ textDecoration: 'line-through', color: 'text.secondary' }}
      >
        {listPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {currency}
      </Typography>
      {discount && (
        <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 600 }}>
          %{discountPercent}
        </Typography>
      )}
      <Typography variant="body1" sx={{ fontWeight: 700, color: 'primary.main' }}>
        {finalPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {currency}
      </Typography>
    </Box>
  );
}
