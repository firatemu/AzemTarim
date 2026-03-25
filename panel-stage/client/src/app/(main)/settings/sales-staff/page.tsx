'use client';

import React, { useState, useEffect, useCallback, memo } from 'react';
import {
    Box,
    Button,
    Paper,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Switch,
    FormControlLabel,
    IconButton,
    Tooltip,
    Chip,
    Alert,
    Snackbar,
    Grid,
} from '@mui/material';
import {
    DataGrid,
    GridColDef,
    GridRenderCellParams,
} from '@mui/x-data-grid';
import {
    Add,
    Edit,
    Delete,
    Person,
} from '@mui/icons-material';
import MainLayout from '@/components/Layout/MainLayout';
import axios from '@/lib/axios';

interface SatisElemani {
    id: string;
    fullName: string;
    phone: string;
    email: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

interface SatisElemaniFormProps {
    open: boolean;
    initialData: Partial<SatisElemani>;
    isEditing: boolean;
    onClose: () => void;
    onSubmit: (data: Partial<SatisElemani>) => void;
}

const SatisElemaniDialog = memo(({ open, initialData, isEditing, onClose, onSubmit }: SatisElemaniFormProps) => {
    const [formData, setFormData] = useState(initialData);

    useEffect(() => {
        setFormData(initialData);
    }, [initialData]);

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    if (!open) return null;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle component="div">{isEditing ? 'Satış Elemanı Düzenle' : 'Yeni Satış Elemanı'}</DialogTitle>
            <DialogContent>
                <Box sx={{ mt: 2 }}>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12 }}>
                            <TextField
                                fullWidth
                                label="Ad Soyad"
                                value={formData.fullName || ''}
                                onChange={(e) => handleChange('fullName', e.target.value)}
                                required
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                fullWidth
                                label="Telefon"
                                value={formData.phone || ''}
                                onChange={(e) => handleChange('phone', e.target.value)}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                fullWidth
                                label="E-posta"
                                value={formData.email || ''}
                                onChange={(e) => handleChange('email', e.target.value)}
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={formData.isActive !== false}
                                        onChange={(e) => handleChange('isActive', e.target.checked)}
                                    />
                                }
                                label="Aktif"
                            />
                        </Grid>
                    </Grid>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>İptal</Button>
                <Button
                    onClick={() => onSubmit(formData)}
                    variant="contained"
                    disabled={!formData.fullName}
                >
                    {isEditing ? 'Güncelle' : 'Kaydet'}
                </Button>
            </DialogActions>
        </Dialog>
    );
});

SatisElemaniDialog.displayName = 'SatisElemaniDialog';

export default function SatisElemanlariPage() {
    const [data, setData] = useState<SatisElemani[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<Partial<SatisElemani>>({});
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const response = await axios.get('/sales-agent');
            setData(response.data);
        } catch (error) {
            setSnackbar({ open: true, message: 'Veriler yüklenirken hata oluştu', severity: 'error' });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleOpenDialog = (item?: SatisElemani) => {
        if (item) {
            setEditingId(item.id);
            setFormData(item);
        } else {
            setEditingId(null);
            setFormData({ isActive: true });
        }
        setDialogOpen(true);
    };

    const handleSubmit = async (submitData: Partial<SatisElemani>) => {
        try {
            if (editingId) {
                await axios.patch(`/sales-agent/${editingId}`, submitData);
                setSnackbar({ open: true, message: 'Güncellendi', severity: 'success' });
            } else {
                await axios.post('/sales-agent', submitData);
                setSnackbar({ open: true, message: 'Kaydedildi', severity: 'success' });
            }
            setDialogOpen(false);
            fetchData();
        } catch (error) {
            setSnackbar({ open: true, message: 'İşlem başarısız', severity: 'error' });
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Silmek istediğinize emin misiniz?')) return;
        try {
            await axios.delete(`/sales-agent/${id}`);
            setSnackbar({ open: true, message: 'Silindi', severity: 'success' });
            fetchData();
        } catch (error) {
            setSnackbar({ open: true, message: 'Silme işlemi başarısız', severity: 'error' });
        }
    };

    const columns: GridColDef[] = [
        { field: 'fullName', headerName: 'Ad Soyad', flex: 1 },
        { field: 'phone', headerName: 'Telefon', width: 150 },
        { field: 'email', headerName: 'E-posta', width: 200 },
        {
            field: 'isActive',
            headerName: 'Durum',
            width: 100,
            renderCell: (params) => (
                <Chip
                    label={params.value ? 'Aktif' : 'Pasif'}
                    color={params.value ? 'success' : 'default'}
                    size="small"
                />
            )
        },
        {
            field: 'actions',
            headerName: 'İşlemler',
            width: 120,
            sortable: false,
            renderCell: (params) => (
                <Box>
                    <IconButton size="small" onClick={() => handleOpenDialog(params.row)}>
                        <Edit fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDelete(params.row.id)}>
                        <Delete fontSize="small" />
                    </IconButton>
                </Box>
            )
        }
    ];

    return (
        <MainLayout>
            <Box sx={{ p: 3 }}>
                <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Person color="primary" />
                        Satış Elemanları
                    </Typography>
                    <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()}>
                        Yeni Ekle
                    </Button>
                </Box>

                <Paper sx={{ height: 600, width: '100%' }}>
                    <DataGrid rows={data} columns={columns} loading={loading} disableRowSelectionOnClick />
                </Paper>

                <SatisElemaniDialog
                    open={dialogOpen}
                    initialData={formData}
                    isEditing={!!editingId}
                    onClose={() => setDialogOpen(false)}
                    onSubmit={handleSubmit}
                />

                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={3000}
                    onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                >
                    <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
                </Snackbar>
            </Box>
        </MainLayout>
    );
}
