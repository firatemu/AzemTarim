import React from 'react';
import CheckDetailClient from './CheckDetailClient';
import { Box, Typography } from '@mui/material';

export const metadata = {
    title: 'Evrak Detayı',
    description: 'Çek veya Senet detaylı görünümü',
};

export default async function CheckDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    return (
        <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto' }}>
            <Typography variant="h4" fontWeight="600" mb={3}>
                Evrak Detayı
            </Typography>
            <CheckDetailClient checkId={id} />
        </Box>
    );
}
