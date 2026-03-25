'use client';

import { Box, Typography, Stack, Divider } from '@mui/material';

interface PriceBreakdownProps {
  listPrice: number;
  classDiscount?: number;
  campaignDiscount?: number;
  finalPrice: number;
  currency?: string;
}

export function PriceBreakdown({
  listPrice,
  classDiscount = 0,
  campaignDiscount = 0,
  finalPrice,
  currency = '₺',
}: PriceBreakdownProps) {
  const totalDiscount = classDiscount + campaignDiscount;

  return (
    <Box sx={{ bgcolor: 'background.paper', borderRadius: 2, p: 2 }}>
      <Stack spacing={1}>
        {listPrice > finalPrice && (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="textSecondary">
                Liste Fiyatı
              </Typography>
              <Typography variant="body2" sx={{ textDecoration: 'line-through' }}>
                {listPrice.toFixed(2)} {currency}
              </Typography>
            </Box>

            {totalDiscount > 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="textSecondary">
                  İndirim
                </Typography>
                <Typography variant="body2" sx={{ color: 'success.main' }}>
                  -{totalDiscount.toFixed(2)} {currency}
                </Typography>
              </Box>
            )}

            <Divider />
          </>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Toplam
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
            {finalPrice.toFixed(2)} {currency}
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}

// Compact version for product cards
interface PriceDisplayProps {
  listPrice: number;
  finalPrice: number;
  currency?: string;
}

export function PriceDisplay({ listPrice, finalPrice, currency = '₺' }: PriceDisplayProps) {
  const hasDiscount = finalPrice < listPrice;
  const discountPercent = hasDiscount
    ? ((listPrice - finalPrice) / listPrice * 100).toFixed(0)
    : null;

  return (
    <Box>
      {hasDiscount && (
        <Typography
          variant="caption"
          component="div"
          sx={{ textDecoration: 'line-through', color: 'text.secondary' }}
        >
          {listPrice.toFixed(2)} {currency}
        </Typography>
      )}
      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
          {finalPrice.toFixed(2)} {currency}
        </Typography>
        {hasDiscount && (
          <Typography
            variant="caption"
            sx={{ color: 'success.main', fontWeight: 600 }}
          >
            %{discountPercent} indirim
          </Typography>
        )}
      </Box>
    </Box>
  );
}
