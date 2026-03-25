import React from 'react';
import PayrollWizardClient from './PayrollWizardClient';
import { Box, Typography } from '@mui/material';

export const metadata = {
    title: 'Yeni Bordro',
    description: 'Sihirbaz ile yeni çek/senet bordrosu oluşturma',
};

export default function NewPayrollPage() {
    return (
        <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
            <Typography variant="h4" fontWeight="600" mb={3}>
                Yeni Bordro Oluştur
            </Typography>
            <PayrollWizardClient />
        </Box>
    );
}
