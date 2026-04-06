'use client';

import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  alpha,
  useTheme,
  Box,
} from '@mui/material';

const HIDDEN = new Set(['id', 'tenantId', 'deletedAt', 'createdAt', 'updatedAt', 'passwordHash', 'erpAccountId']);

function cellStr(v: unknown): string {
  if (v == null) return '—';
  if (typeof v === 'boolean') return v ? 'EVET' : 'HAYIR';
  if (typeof v === 'object') {
    try {
      return JSON.stringify(v);
    } catch {
      return String(v);
    }
  }
  return String(v);
}

// Convert camelCase to Title Case for headers
function formatHeader(key: string): string {
  const result = key.replace(/([A-Z])/g, ' $1');
  return result.charAt(0).toUpperCase() + result.slice(1).toUpperCase();
}

export function B2bAdminAutoTable({
  rows,
}: {
  rows: Record<string, unknown>[];
}) {
  const theme = useTheme();

  if (!rows.length) {
    return (
      <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', borderRadius: 4, bgcolor: alpha(theme.palette.action.disabledBackground, 0.05) }}>
        <Typography color="text.secondary" variant="body2" sx={{ fontWeight: 700 }}>
          Henüz herhangi bir kayıt bulunamadı.
        </Typography>
      </Paper>
    );
  }

  const keys = Object.keys(rows[0]).filter((k) => !HIDDEN.has(k));

  return (
    <TableContainer
      component={Paper}
      variant="outlined"
      sx={{
        borderRadius: 4,
        overflow: 'hidden',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.03)}`
      }}
    >
      <Table size="medium">
        <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.04) }}>
          <TableRow>
            {keys.map((k) => (
              <TableCell
                key={k}
                sx={{
                  fontWeight: 900,
                  color: 'text.secondary',
                  fontSize: '0.75rem',
                  letterSpacing: 1,
                  py: 2,
                  borderBottom: '1px solid',
                  borderColor: 'divider'
                }}
              >
                {formatHeader(k)}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, i) => (
            <TableRow key={i} hover sx={{ '&:last-child td': { border: 0 } }}>
              {keys.map((k) => (
                <TableCell
                  key={k}
                  sx={{
                    color: 'text.primary',
                    fontWeight: k === 'name' || k === 'title' ? 800 : 500,
                    maxWidth: 320,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    py: 2,
                    fontSize: '0.875rem'
                  }}
                  title={cellStr(row[k])}
                >
                  {cellStr(row[k])}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
