import React from 'react';
import PayrollClient from './PayrollClient';
import { Box, Typography } from '@mui/material';

export const metadata = {
    title: 'Bordro Yönetimi',
    description: 'Çek ve Senet bordro kayıtları listesi',
};

export default function PayrollPage() {
    return <PayrollClient />;
}
