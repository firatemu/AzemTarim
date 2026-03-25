import React from 'react';
import CollectionClient from './CollectionClient';
import { Box, Typography } from '@mui/material';

export const metadata = {
    title: 'Tahsilat İşlemi',
    description: 'Çek veya Senet için tahsilat girişi',
};

export default async function CollectionPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    return (
        <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
            <Typography variant="h4" fontWeight="600" mb={3}>
                Tahsilat İşlemi
            </Typography>
            <CollectionClient checkId={id} />
        </Box>
    );
}
