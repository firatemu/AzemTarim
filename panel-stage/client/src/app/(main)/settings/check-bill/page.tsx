import React from 'react';
import SettingsClient from './SettingsClient';
import { Box, Typography } from '@mui/material';

export const metadata = {
    title: 'Çek / Senet Ayarları',
    description: 'Modül bazlı yapılandırmalar',
};

export default function SettingsPage() {
    return (
        <Box sx={{ p: 3, maxWidth: 900, mx: 'auto' }}>
            <Typography variant="h4" fontWeight="600" mb={3}>
                Çek / Senet Ayarları
            </Typography>
            <SettingsClient />
        </Box>
    );
}
