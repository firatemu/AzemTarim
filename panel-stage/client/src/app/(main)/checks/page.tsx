import React from 'react';
import ChecksClient from './ChecksClient';
import { Box, Typography } from '@mui/material';

export const metadata = {
    title: 'Çek ve Senet Yönetimi',
    description: 'Portföydeki tüm çek ve senetlerin takibi',
};

export default function ChecksPage() {
    return (
        <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto' }}>
            <Typography variant="h4" fontWeight="600" mb={3}>
                Çek ve Senet Yönetimi
            </Typography>
            <ChecksClient />
        </Box>
    );
}
