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
} from '@mui/material';

const HIDDEN = new Set(['passwordHash']);

function cellStr(v: unknown): string {
  if (v == null) return '';
  if (typeof v === 'object') {
    try {
      return JSON.stringify(v);
    } catch {
      return String(v);
    }
  }
  return String(v);
}

export function B2bAdminAutoTable({
  rows,
}: {
  rows: Record<string, unknown>[];
}) {
  if (!rows.length) {
    return (
      <Typography color="var(--muted-foreground)" variant="body2">
        Kayıt bulunamadı.
      </Typography>
    );
  }
  const keys = Object.keys(rows[0]).filter((k) => !HIDDEN.has(k));

  return (
    <TableContainer
      component={Paper}
      variant="outlined"
      sx={{ borderColor: 'var(--border)', bgcolor: 'var(--card)' }}
    >
      <Table size="small">
        <TableHead>
          <TableRow>
            {keys.map((k) => (
              <TableCell key={k} sx={{ fontWeight: 700, color: 'var(--foreground)' }}>
                {k}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, i) => (
            <TableRow key={i} hover>
              {keys.map((k) => (
                <TableCell
                  key={k}
                  sx={{
                    color: 'var(--foreground)',
                    maxWidth: 280,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
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
