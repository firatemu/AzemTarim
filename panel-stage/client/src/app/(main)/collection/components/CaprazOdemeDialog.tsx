import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    Grid,
    TextField,
    Autocomplete,
    InputAdornment,
    Alert,
    IconButton,
    Divider,
} from '@mui/material';
import { SwapHoriz, Close, Person, CalendarToday, CurrencyLira, Description } from '@mui/icons-material';
import { Cari, CaprazOdemeFormData } from '../types';

interface CaprazOdemeDialogProps {
    open: boolean;
    onClose: () => void;
    onSubmit: () => void;
    formData: CaprazOdemeFormData;
    setFormData: (data: CaprazOdemeFormData) => void;
    cariler: Cari[];
    loading: boolean;
    submitting: boolean;
    carilerError: boolean;
}

const CaprazOdemeDialog: React.FC<CaprazOdemeDialogProps> = ({
    open,
    onClose,
    onSubmit,
    formData,
    setFormData,
    cariler,
    loading,
    submitting,
    carilerError,
}) => {
    const [errors, setErrors] = React.useState<Record<string, string>>({});

    const handleChange = (field: keyof CaprazOdemeFormData, value: any) => {
        if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
        setFormData({ ...formData, [field]: value });
    };

    const handleSubmit = () => {
        const newErrors: Record<string, string> = {};
        const tutarNum = typeof formData.tutar === 'string' ? parseFloat(formData.tutar) : formData.tutar;

        if (!formData.tahsilatCariId) newErrors.tahsilatCariId = 'Borçlu cari seçimi zorunludur';
        if (!formData.odemeCariId) newErrors.odemeCariId = 'Alacaklı cari seçimi zorunludur';
        if (Number.isNaN(tutarNum) || tutarNum <= 0) newErrors.tutar = 'Tutar 0\'dan büyük olmalıdır';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        onSubmit();
    };

    const numberInputSx = {
        '& input[type=number]': { MozAppearance: 'textfield' },
        '& input[type=number]::-webkit-outer-spin-button': { WebkitAppearance: 'none', margin: 0 },
        '& input[type=number]::-webkit-inner-spin-button': { WebkitAppearance: 'none', margin: 0 },
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: { borderRadius: 3, boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)' }
            }}
        >
            <DialogTitle component="div" sx={{
                bgcolor: '#7c3aed',
                color: 'white',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
                pb: 2
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <SwapHoriz fontSize="medium" />
                    <Box>
                        <Typography variant="h6" fontWeight={600}>Çapraz Ödeme Tahsilat</Typography>
                        <Typography variant="caption" sx={{ opacity: 0.8, display: 'block' }}>
                            Cari hesaplar arası virman işlemi
                        </Typography>
                    </Box>
                </Box>
                <IconButton onClick={onClose} sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
                    <Close />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ mt: 3 }}>
                <Grid container spacing={3}>
                    {/* Bilgilendirme */}
                    <Grid size={12}>
                        <Alert
                            severity="info"
                            icon={<SwapHoriz fontSize="inherit" />}
                            sx={{
                                mb: 1,
                                borderRadius: 2,
                                '& .MuiAlert-message': { width: '100%' }
                            }}
                        >
                            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                                Nasıl Çalışır?
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                Bu işlemle, seçilen <strong>Tahsilat Cari</strong> hesabından para çıkarak <strong>Ödeme Cari</strong> hesabına aktarılır.
                                Kasa veya banka bakiyesi etkilenmez.
                            </Typography>
                        </Alert>
                    </Grid>

                    {/* Cari Seçimleri */}
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Autocomplete
                            options={Array.isArray(cariler) ? cariler : []}
                            getOptionLabel={(option) => `${option.cariKodu} - ${option.unvan}`}
                            renderOption={(props, option) => (
                                <li {...props} key={option.id}>
                                    {option.cariKodu} - {option.unvan}
                                </li>
                            )}

                            isOptionEqualToValue={(option, value) => option.id === value.id}
                            value={cariler.find(c => c.id === formData.tahsilatCariId) || null}
                            onChange={(_, newValue) => handleChange('tahsilatCariId', newValue?.id || '')}
                            loading={loading}
                            disabled={loading || cariler.length === 0}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Borçlu Cari (Para Çıkan)"
                                    required
                                    error={!loading && formData.tahsilatCariId === ''}
                                    helperText={!formData.tahsilatCariId ? "Borçlanacak cariyi seçin" : ""}
                                    InputProps={{
                                        ...params.InputProps,
                                        startAdornment: (
                                            <>
                                                <InputAdornment position="start">
                                                    <Person color="action" />
                                                </InputAdornment>
                                                {params.InputProps.startAdornment}
                                            </>
                                        ),
                                    }}
                                />
                            )}
                        />
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                        <Autocomplete
                            options={Array.isArray(cariler) ? cariler.filter(c => c.id !== formData.tahsilatCariId) : []}
                            getOptionLabel={(option) => `${option.cariKodu} - ${option.unvan}`}
                            renderOption={(props, option) => (
                                <li {...props} key={option.id}>
                                    {option.cariKodu} - {option.unvan}
                                </li>
                            )}

                            isOptionEqualToValue={(option, value) => option.id === value.id}
                            value={cariler.find(c => c.id === formData.odemeCariId) || null}
                            onChange={(_, newValue) => handleChange('odemeCariId', newValue?.id || '')}
                            loading={loading}
                            disabled={loading || cariler.length === 0 || !formData.tahsilatCariId}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Alacaklı Cari (Para Giren)"
                                    required
                                    error={!loading && formData.odemeCariId === '' && !!formData.tahsilatCariId}
                                    helperText={!formData.odemeCariId ? "Alacaklanacak cariyi seçin" : ""}
                                    InputProps={{
                                        ...params.InputProps,
                                        startAdornment: (
                                            <>
                                                <InputAdornment position="start">
                                                    <Person color="action" />
                                                </InputAdornment>
                                                {params.InputProps.startAdornment}
                                            </>
                                        ),
                                    }}
                                />
                            )}
                        />
                    </Grid>

                    {/* Tutar ve Tarih */}
                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                            fullWidth
                            label="İşlem Tutarı"
                            type="number"
                            required
                            value={formData.tutar}
                            onChange={(e) => handleChange('tutar', e.target.value === '' ? '' : parseFloat(e.target.value) || 0)}
                            error={!!errors.tutar}
                            helperText={errors.tutar || 'Tutar 0\'dan büyük olmalıdır'}
                            InputProps={{
                                startAdornment: <InputAdornment position="start"><CurrencyLira /></InputAdornment>,
                            }}
                            sx={numberInputSx}
                        />
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                            fullWidth
                            label="İşlem Tarihi"
                            type="date"
                            required
                            value={formData.tarih}
                            onChange={(e) => handleChange('tarih', e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            InputProps={{
                                startAdornment: <InputAdornment position="start"><CalendarToday /></InputAdornment>,
                            }}
                        />
                    </Grid>

                    {/* Açıklama */}
                    <Grid size={12}>
                        <TextField
                            fullWidth
                            label="Açıklama"
                            multiline
                            rows={3}
                            value={formData.aciklama}
                            onChange={(e) => handleChange('aciklama', e.target.value)}
                            placeholder="İşlem hakkında notlar..."
                            InputProps={{
                                startAdornment: <InputAdornment position="start" sx={{ mt: 1.5 }}><Description /></InputAdornment>,
                            }}
                        />
                    </Grid>

                    {/* Hata Mesajları */}
                    {carilerError && (
                        <Grid size={12}>
                            <Alert severity="error">Cariler yüklenirken bir hata oluştu.</Alert>
                        </Grid>
                    )}
                </Grid>
            </DialogContent>

            <Divider />

            <DialogActions sx={{ p: 3, bgcolor: 'var(--muted)' }}>
                <Button onClick={onClose} disabled={submitting} sx={{ color: 'text.secondary' }}>
                    İptal
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={submitting}
                    startIcon={<SwapHoriz />}
                    sx={{
                        bgcolor: '#8b5cf6',
                        px: 4,
                        py: 1,
                        '&:hover': { bgcolor: '#7c3aed' },
                        boxShadow: '0 4px 6px rgba(139, 92, 246, 0.25)'
                    }}
                >
                    {submitting ? 'İşleniyor...' : 'Virmanı Tamamla'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default CaprazOdemeDialog;
