'use client';

import { Drawer, Box, Typography, IconButton, SxProps, Theme } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

interface B2bDrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  width?: number | string;
  sx?: SxProps<Theme>;
}

export function B2bDrawer({
  open,
  onClose,
  title,
  children,
  width = 600,
  sx,
}: B2bDrawerProps) {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width,
          maxWidth: '95vw',
          height: '100vh',
          ...sx,
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 2,
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Content */}
        <Box
          sx={{
            flex: 1,
            overflow: 'auto',
            p: 2,
          }}
        >
          {children}
        </Box>
      </Box>
    </Drawer>
  );
}

// Drawer with action buttons at the bottom
interface B2bDrawerWithActionsProps extends B2bDrawerProps {
  actions?: React.ReactNode;
  loading?: boolean;
}

export function B2bDrawerWithActions({
  open,
  onClose,
  title,
  children,
  actions,
  width = 600,
  loading = false,
  sx,
}: B2bDrawerWithActionsProps) {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={loading ? undefined : onClose}
      PaperProps={{
        sx: {
          width,
          maxWidth: '95vw',
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          ...sx,
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
        <IconButton onClick={onClose} size="small" disabled={loading}>
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Content */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          p: 2,
        }}
      >
        {children}
      </Box>

      {/* Actions */}
      {actions && (
        <Box
          sx={{
            p: 2,
            borderTop: 1,
            borderColor: 'divider',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 1,
          }}
        >
          {actions}
        </Box>
      )}
    </Drawer>
  );
}
