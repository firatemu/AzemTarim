import React from 'react';
import ReportPortfolioClient from './ReportPortfolioClient';
import { Box, Typography } from '@mui/material';

export const metadata = {
    title: 'Portföy Raporu',
    description: 'Çek / Senet portföy analizi ve raporlaması',
};

export default function ReportPortfolioPage() {
    return (
        <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto' }}>
            <Typography variant="h4" fontWeight="600" mb={3}>
                Portföy Analizi
            </Typography>
            <ReportPortfolioClient />
        </Box>
    );
}
