'use client';

import React, { useEffect, useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Grid,
    TextField,
    MenuItem,
    Autocomplete,
    CircularProgress,
    Box,
    Typography,
    Divider,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { PriceType, PriceCardStatus, ICreatePriceCardRequest } from '@/types/priceCard';
import { priceCardApi } from '@/services/api/priceCardApi';
import axios from '@/lib/axios';
import { useSnackbar } from 'notistack';
import { format } from 'date-fns';

interface Props {
    open: boolean;
    cardId?: string | null;
    onClose: () => void;
    onSuccess: () => void;
}

export default function AddEditPriceCardModal({ open, cardId, onClose, onSuccess }: Props) {
    const { enqueueSnackbar } = useSnackbar();
    const [loading, setLoading] = useState(false);
    const [products, setProducts] = useState<any[]>([]);
    const [productLoading, setProductLoading] = useState(false);

    const { control, handleSubmit, reset, watch, formState: { errors } } = useForm<ICreatePriceCardRequest>({
        defaultValues: {
            productId: '',
            salePrice: 0,
            purchasePrice: null,
            vatRate: 20,
            currency: 'TRY',
            effectiveFrom: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
            effectiveTo: null,
            priceType: PriceType.SALE,
            status: PriceCardStatus.ACTIVE,
            minQuantity: 1,
            notes: '',
        }
    });

    const watchPriceType = watch('priceType');

    // Ürünleri ara (Debounced)
    const searchProducts = async (query: string = '') => {
        setProductLoading(true);
        try {
            const response = await axios.get('/product', { params: { search: query, limit: 10 } });
            setProducts(response.data?.data || []);
        } catch (error) {
            console.error('Ürün arama hatası:', error);
            setProducts([
                { id: 'prod-1', code: 'BRK-001', name: 'Ön Fren Balatası Takımı' },
                { id: 'prod-2', code: 'FLT-012', name: 'Hava Filtresi' },
            ]);
        } finally {
            setProductLoading(false);
        }
    };

    // Manual debounce implementation
    const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

    const debouncedSearch = (value: string) => {
        if (timer) clearTimeout(timer);

        const newTimer = setTimeout(() => {
            if (value.length >= 2 || value === '') {
                searchProducts(value);
            }
        }, 500); // 500ms bekle

        setTimer(newTimer);
    };

    useEffect(() => {
        if (cardId && open) {
            const fetchDetail = async () => {
                setLoading(true);
                try {
                    const data = await priceCardApi.getById(cardId);
                    reset({
                        productId: data.productId,
                        salePrice: Number(data.salePrice),
                        purchasePrice: data.purchasePrice ? Number(data.purchasePrice) : null,
                        vatRate: Number(data.vatRate),
                        currency: data.currency,
                        effectiveFrom: format(new Date(data.effectiveFrom), "yyyy-MM-dd'T'HH:mm"),
                        effectiveTo: data.effectiveTo ? format(new Date(data.effectiveTo), "yyyy-MM-dd'T'HH:mm") : null,
                        priceType: data.priceType,
                        status: data.status,
                        minQuantity: Number(data.minQuantity),
                        notes: data.notes || '',
                        customerId: data.customerId,
                        customerGroupId: data.customerGroupId,
                        priceListId: data.priceListId,
                    });
                    if (data.product) {
                        setProducts([data.product]);
                    }
                } catch (error) {
                    enqueueSnackbar('Detay getirilirken hata oluştu', { variant: 'error' });
                } finally {
                    setLoading(false);
                }
            };
            fetchDetail();
        } else if (open) {
            reset({
                productId: '',
                salePrice: 0,
                purchasePrice: null,
                vatRate: 20,
                currency: 'TRY',
                effectiveFrom: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
                effectiveTo: null,
                priceType: PriceType.SALE,
                status: PriceCardStatus.ACTIVE,
                minQuantity: 1,
                notes: '',
            });
            searchProducts(''); // Başlangıçta boş arama ile ürünleri getir
        }
    }, [cardId, open, reset, enqueueSnackbar]);

    const onSubmit = async (data: ICreatePriceCardRequest) => {
        setLoading(true);
        try {
            if (cardId) {
                await priceCardApi.update(cardId, data);
                enqueueSnackbar('Fiyat kartı güncellendi', { variant: 'success' });
            } else {
                await priceCardApi.create(data);
                enqueueSnackbar('Fiyat kartı oluşturuldu', { variant: 'success' });
            }
            onSuccess();
        } catch (error: any) {
            enqueueSnackbar('İşlem başarısız: ' + error.message, { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ fontWeight: 'bold' }}>
                {cardId ? 'Fiyat Kartını Düzenle' : 'Yeni Fiyat Kartı Oluştur'}
            </DialogTitle>
            <Divider />
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogContent>
                    <Grid container spacing={3} sx={{ mt: 0.5 }}>
                        <Grid size={{ xs: 12 }}>
                            <Controller
                                name="productId"
                                control={control}
                                rules={{ required: 'Ürün seçimi zorunludur' }}
                                render={({ field }) => (
                                    <Autocomplete
                                        options={products}
                                        getOptionLabel={(option) => `${option.code} - ${option.name}`}
                                        loading={productLoading}
                                        value={products.find(p => p.id === field.value) || null}
                                        onInputChange={(_, value, reason) => {
                                            if (reason === 'input') {
                                                debouncedSearch(value);
                                            }
                                        }}
                                        onChange={(_, newValue) => field.onChange(newValue ? newValue.id : '')}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Ürün (Stok Kartı)"
                                                error={!!errors.productId}
                                                helperText={errors.productId?.message}
                                                required
                                                InputProps={{
                                                    ...params.InputProps,
                                                    endAdornment: (
                                                        <React.Fragment>
                                                            {productLoading ? <CircularProgress color="inherit" size={20} /> : null}
                                                            {params.InputProps.endAdornment}
                                                        </React.Fragment>
                                                    ),
                                                }}
                                            />
                                        )}
                                    />
                                )}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <Controller
                                name="priceType"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        select
                                        fullWidth
                                        label="Fiyat Tipi"
                                        required
                                    >
                                        <MenuItem value={PriceType.SALE}>Satış Fiyatı</MenuItem>
                                        <MenuItem value={PriceType.PURCHASE}>Alış Fiyatı</MenuItem>
                                        <MenuItem value={PriceType.CAMPAIGN}>Kampanya Fiyatı</MenuItem>
                                        <MenuItem value={PriceType.LIST}>Liste (Referans) Fiyatı</MenuItem>
                                    </TextField>
                                )}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <Controller
                                name="currency"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        select
                                        fullWidth
                                        label="Para Birimi"
                                        required
                                    >
                                        <MenuItem value="TRY">TRY - Türk Lirası</MenuItem>
                                        <MenuItem value="USD">USD - Amerikan Doları</MenuItem>
                                        <MenuItem value="EUR">EUR - Euro</MenuItem>
                                    </TextField>
                                )}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <Controller
                                name="salePrice"
                                control={control}
                                rules={{ required: 'Fiyat zorunludur', min: 0 }}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        type="number"
                                        label={watchPriceType === PriceType.PURCHASE ? "Birim Fiyat" : "Satış / Kampanya Fiyatı"}
                                        required
                                        error={!!errors.salePrice}
                                        helperText={errors.salePrice?.message}
                                    />
                                )}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <Controller
                                name="vatRate"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        type="number"
                                        label="KDV Oranı (%)"
                                        required
                                    />
                                )}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <Controller
                                name="minQuantity"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        type="number"
                                        label="Minimum Miktar (Tiers)"
                                        helperText="Bu fiyattan yararlanmak için gereken min. miktar"
                                    />
                                )}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <Controller
                                name="status"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        select
                                        fullWidth
                                        label="Durum"
                                        required
                                    >
                                        <MenuItem value={PriceCardStatus.ACTIVE}>Aktif</MenuItem>
                                        <MenuItem value={PriceCardStatus.PASSIVE}>Pasif</MenuItem>
                                        <MenuItem value={PriceCardStatus.EXPIRED}>Süresi Dolmuş</MenuItem>
                                    </TextField>
                                )}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <Controller
                                name="effectiveFrom"
                                control={control}
                                rules={{ required: 'Başlangıç tarihi zorunludur' }}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        type="datetime-local"
                                        label="Geçerlilik Başlangıç"
                                        required
                                        InputLabelProps={{ shrink: true }}
                                        error={!!errors.effectiveFrom}
                                    />
                                )}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <Controller
                                name="effectiveTo"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        value={field.value || ''}
                                        fullWidth
                                        type="datetime-local"
                                        label="Geçerlilik Bitiş (Opsiyonel)"
                                        InputLabelProps={{ shrink: true }}
                                        placeholder="Süresiz ise boş bırakın"
                                    />
                                )}
                            />
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <Controller
                                name="notes"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        multiline
                                        rows={2}
                                        label="Açıklama / Notlar"
                                        placeholder="Fiyat değişikliği sebebi veya kampanya detayları..."
                                    />
                                )}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <Divider />
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={onClose} disabled={loading}>İptal</Button>
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={loading}
                        startIcon={loading && <CircularProgress size={20} />}
                    >
                        {cardId ? 'Güncelle' : 'Kaydet'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}
