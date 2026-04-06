'use client';

import React, { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Alert,
  Snackbar,
  CircularProgress,
  TextField,
  alpha,
  useTheme,
} from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  GridActionsCellItem,
} from '@mui/x-data-grid';
import {
  Add,
  Edit,
  Delete,
  Discount,
} from '@mui/icons-material';
import axios from '@/lib/axios';
import { StandardPage, StandardCard } from '@/components/common';

interface DiscountGroup {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export default function B2bDiscountGroupsPage() {
  const theme = useTheme();
  const [groups, setGroups] = useState<DiscountGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [editingGroup, setEditingGroup] = useState<DiscountGroup | null>(null);
  const [deletingGroup, setDeletingGroup] = useState<DiscountGroup | null>(null);
  const [groupName, setGroupName] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const fetchGroups = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get('/b2b-admin/discount-groups');
      setGroups(res.data);
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'İskonto grupları yüklenemedi', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const showSnackbar = (message: string, severity: 'success' | 'error' = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleOpenAdd = () => {
    setEditingGroup(null);
    setGroupName('');
    setOpenDialog(true);
  };

  const handleOpenEdit = (group: DiscountGroup) => {
    setEditingGroup(group);
    setGroupName(group.name);
    setOpenDialog(true);
  };

  const handleOpenDelete = (group: DiscountGroup) => {
    setDeletingGroup(group);
    setOpenDeleteDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingGroup(null);
    setGroupName('');
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setDeletingGroup(null);
  };

  const handleSave = async () => {
    if (!groupName.trim()) {
      showSnackbar('Grup adı zorunludur', 'error');
      return;
    }

    try {
      setSaving(true);
      if (editingGroup) {
        await axios.patch(`/b2b-admin/discount-groups/${editingGroup.id}`, {
          name: groupName.trim(),
        });
        showSnackbar('İskonto grubu güncellendi');
      } else {
        await axios.post('/b2b-admin/discount-groups', {
          name: groupName.trim(),
        });
        showSnackbar('İskonto grubu oluşturuldu');
      }
      handleCloseDialog();
      fetchGroups();
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'İşlem başarısız', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingGroup) return;

    try {
      setDeleting(true);
      await axios.delete(`/b2b-admin/discount-groups/${deletingGroup.id}`);
      showSnackbar('İskonto grubu silindi');
      handleCloseDeleteDialog();
      fetchGroups();
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Silme işlemi başarısız', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const columns: GridColDef<DiscountGroup>[] = [
    {
      field: 'name',
      headerName: 'Grup Adı',
      flex: 1,
      minWidth: 200,
      renderCell: (params: GridRenderCellParams<DiscountGroup>) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.warning.main, 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Discount sx={{ fontSize: 18, color: 'warning.main' }} />
          </Box>
          <Typography variant="body2" fontWeight={700}>
            {params.value}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'createdAt',
      headerName: 'Oluşturma Tarihi',
      width: 140,
      renderCell: (params: GridRenderCellParams<DiscountGroup>) => (
        <Typography variant="body2" color="text.secondary">
          {new Date(params.value).toLocaleDateString('tr-TR')}
        </Typography>
      ),
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'İşlemler',
      width: 100,
      getActions: (params) => [
        <GridActionsCellItem
          key="edit"
          icon={<Edit fontSize="small" />}
          label="Düzenle"
          onClick={() => handleOpenEdit(params.row)}
          showInMenu={false}
        />,
        <GridActionsCellItem
          key="delete"
          icon={<Delete fontSize="small" />}
          label="Sil"
          onClick={() => handleOpenDelete(params.row)}
          showInMenu={false}
          sx={{ color: 'error.main' }}
        />,
      ],
    },
  ];

  return (
    <StandardPage
      title="İskonto Grupları"
      breadcrumbs={[
        { label: 'B2B Yönetimi', href: '/b2b-admin' },
        { label: 'İskonto Grupları' },
      ]}
      headerActions={
        <Button
          variant="contained"
          size="small"
          startIcon={<Add />}
          onClick={handleOpenAdd}
          sx={{
            borderRadius: 2,
            fontWeight: 600,
            textTransform: 'none',
            boxShadow: 'none',
          }}
        >
          Yeni Grup
        </Button>
      }
    >
      {/* Summary Card */}
      <StandardCard sx={{ mb: 2, p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.warning.main, 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Discount sx={{ fontSize: 24, color: 'warning.main' }} />
          </Box>
          <Box>
            <Typography variant="h5" fontWeight={800}>
              {groups.length}
            </Typography>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              Toplam Grup
            </Typography>
          </Box>
        </Box>
      </StandardCard>

      {/* DataGrid */}
      <StandardCard padding={0}>
        <Box sx={{ height: 500, width: '100%' }}>
          <DataGrid
            rows={groups}
            columns={columns}
            getRowId={(row) => row.id}
            loading={loading}
            disableRowSelectionOnClick
            pageSizeOptions={[25, 50, 100]}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 25 },
              },
            }}
            slots={{
              loadingOverlay: () => (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    gap: 1.5,
                  }}
                >
                  <CircularProgress size={24} />
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Yükleniyor...
                  </Typography>
                </Box>
              ),
              noRowsOverlay: () => (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    gap: 1,
                  }}
                >
                  <Discount sx={{ fontSize: 48, color: 'text.disabled', opacity: 0.5 }} />
                  <Typography variant="body2" color="text.secondary">
                    Henüz iskonto grubu yok
                  </Typography>
                </Box>
              ),
            }}
            sx={{
              border: 'none',
              '& .MuiDataGrid-columnHeaders': {
                bgcolor: alpha(theme.palette.primary.main, 0.04),
                '& .MuiDataGrid-columnHeaderTitle': {
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  color: 'text.secondary',
                  textTransform: 'uppercase',
                  letterSpacing: 0.05,
                },
              },
              '& .MuiDataGrid-cell': {
                borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
              },
            }}
          />
        </Box>
      </StandardCard>

      {/* Add/Edit Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, pb: 2 }}>
          {editingGroup ? 'İskonto Grubu Düzenle' : 'Yeni İskonto Grubu'}
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              İskonto grubu adını girin:
            </Typography>
            <TextField
              autoFocus
              fullWidth
              size="small"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Örn: Toptancılar, Bayiler, VIP..."
              sx={{
                '& .MuiInputBase-root': {
                  borderRadius: 2,
                },
              }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, bgcolor: alpha(theme.palette.action.disabled, 0.03) }}>
          <Button
            onClick={handleCloseDialog}
            disabled={saving}
            sx={{
              borderRadius: 2,
              fontWeight: 600,
              textTransform: 'none',
            }}
          >
            İptal
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving || !groupName.trim()}
            startIcon={saving ? <CircularProgress size={16} /> : null}
            sx={{
              borderRadius: 2,
              fontWeight: 700,
              textTransform: 'none',
            }}
          >
            {editingGroup ? 'Güncelle' : 'Oluştur'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, bgcolor: alpha(theme.palette.error.main, 0.05) }}>
          Silme Onayı
        </DialogTitle>
        <DialogContent dividers>
          <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
            Bu işlem geri alınamaz!
          </Alert>
          <Typography variant="body2" color="text.secondary">
            <strong>{deletingGroup?.name}</strong> grubunu silmek istediğinizden emin misiniz?
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
            Not: Bu gruba atanmış müşteri varsa silinemez.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, bgcolor: alpha(theme.palette.action.disabled, 0.03) }}>
          <Button
            onClick={handleCloseDeleteDialog}
            disabled={deleting}
            sx={{
              borderRadius: 2,
              fontWeight: 600,
              textTransform: 'none',
            }}
          >
            İptal
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDelete}
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={16} /> : <Delete />}
            sx={{
              borderRadius: 2,
              fontWeight: 700,
              textTransform: 'none',
            }}
          >
            Sil
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </StandardPage>
  );
}
