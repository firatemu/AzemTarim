'use client';

import { B2bAdminNav } from '@/components/b2b-admin/B2bAdminNav';
import { Box } from '@mui/material';

export default function B2bAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Box sx={{ pb: 4 }}>
      <B2bAdminNav />
      {children}
    </Box>
  );
}
