import React from 'react';
import PayrollDetailClient from './PayrollDetailClient';
import { Box, Typography } from '@mui/material';

export const metadata = {
    title: 'Bordro Detayı',
    description: 'Bordro ve İçerisindeki Evrakların Yönetimi',
};

// Next.js params is a Promise in Next.js 15+
export default async function PayrollDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    return (
        <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto' }}>
            <Typography variant="h4" fontWeight="600" mb={3}>
                Bordro Detayı
            </Typography>
            <PayrollDetailClient journalId={id} />
        </Box>
    );
}
