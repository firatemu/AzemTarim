'use client';

import React, { useEffect, useState } from 'react';
import { Box, TextField, Autocomplete, CircularProgress } from '@mui/material';
import axios from '@/lib/axios';

export type AssignmentUser = {
  id: string;
  fullName: string | null;
  email: string | null;
};

type WorkOrderAssignmentFormProps = {
  technicianId: string | null;
  onChange: (technicianId: string | null) => void;
  disabled?: boolean;
};

export default function WorkOrderAssignmentForm({
  technicianId,
  onChange,
  disabled = false,
}: WorkOrderAssignmentFormProps) {
  const [users, setUsers] = useState<AssignmentUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get('/work-orders/assignment-users');
        const data = Array.isArray(res.data) ? res.data : res.data?.data ?? [];
        setUsers(data);
      } catch {
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const selectedTechnician = users.find((u) => u.id === technicianId) ?? null;

  const getOptionLabel = (u: AssignmentUser) =>
    [u.fullName || u.email || u.id].filter(Boolean).join(' - ') || u.id;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2 }}>
        <CircularProgress size={24} />
        <span>Personel yükleniyor...</span>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Autocomplete
        options={users}
        getOptionLabel={getOptionLabel}
        value={selectedTechnician}
        onChange={(_, v) => onChange(v?.id ?? null)}
        renderInput={(params) => (
          <TextField {...params} label="Teknisyen" disabled={disabled} />
        )}
      />
    </Box>
  );
}
