'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQuery, useMutation } from '@tanstack/react-query';
import axios from '@/lib/axios';
import { useSnackbar } from 'notistack';

import {
    Grid,
    TextField,
    Button,
    MenuItem,
    FormControlLabel,
    Switch,
    Box,
    Card,
    CardContent,
    Typography,
} from '@mui/material';
import StandardPage from '@/components/common/StandardPage';

const customerSchema = z.object({
    erpAccountId: z.string().optional(),
    name: z.string().min(3, 'Müşteri ünvanı en az 3 karakter olmalıdır'),
    email: z.string().email('Geçerli bir e-posta giriniz'),
    password: z.string().optional(),
    customerClassId: z.string().optional().nullable(),
    discountGroupId: z.string().optional().nullable(),
    salespersonId: z.string().optional().nullable(),
    vatDays: z.coerce.number().min(0).default(30),
    city: z.string().optional().nullable(),
    district: z.string().optional().nullable(),
    customerGrade: z.string().optional().nullable(),
    erpNum: z.coerce.number().optional().nullable(),
    canUseVirtualPos: z.boolean().default(true),
    blockOrderOnRisk: z.boolean().default(false),
    isActive: z.boolean().default(true),
});

type CustomerFormValues = z.infer<typeof customerSchema>;

export default function NewB2bCustomerPage() {
    const { enqueueSnackbar } = useSnackbar();
    const router = useRouter();

    // Veritabanından dropdown verilerini çek
    const { data: customerClasses } = useQuery({
        queryKey: ['b2b-customer-classes'],
        queryFn: async () => {
            const res = await axios.get('/b2b-admin/customer-classes?limit=100');
            return res.data.data || [];
        },
    });

    const { data: discounts } = useQuery({
        queryKey: ['b2b-discounts'],
        queryFn: async () => {
            const res = await axios.get('/b2b-admin/discounts?limit=100');
            return res.data.data || [];
        },
    });

    const { data: salespersons } = useQuery({
        queryKey: ['b2b-salespersons'],
        queryFn: async () => {
            const res = await axios.get('/b2b-admin/salespersons?limit=100');
            return res.data.data || [];
        },
    });

    const {
        control,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<CustomerFormValues>({
        resolver: zodResolver(customerSchema) as any,
        defaultValues: {
            erpAccountId: '',
            name: '',
            email: '',
            password: '',
            vatDays: 30,
            city: '',
            district: '',
            customerGrade: '',
            canUseVirtualPos: true,
            blockOrderOnRisk: false,
            isActive: true,
            customerClassId: '',
            discountGroupId: '',
            salespersonId: '',
            erpNum: '' as any,
        },
    });

    const mutation = useMutation({
        mutationFn: async (data: CustomerFormValues) => {
            // Boş stringleri null/undefined'a çevir
            const payload = {
                ...data,
                customerClassId: data.customerClassId || undefined,
                discountGroupId: data.discountGroupId || undefined,
                salespersonId: data.salespersonId || undefined,
            };
            const res = await axios.post('/b2b-admin/customers', payload);
            return res.data;
        },
        onSuccess: () => {
            enqueueSnackbar('Müşteri başarıyla eklendi', { variant: 'success' });
            router.push('/b2b-admin/customers');
        },
        onError: (err: any) => {
            enqueueSnackbar(err?.response?.data?.message || 'Müşteri eklenirken hata oluştu', { variant: 'error' });
        },
    });

    const onSubmit: SubmitHandler<CustomerFormValues> = (data) => {
        mutation.mutate(data);
    };

    return (
        <StandardPage
            title="Yeni Müşteri Ekle"
            breadcrumbs={[
                { label: 'B2B Yönetimi', href: '/b2b-admin' },
                { label: 'Müşteriler', href: '/b2b-admin/customers' },
                { label: 'Yeni Ekle' },
            ]}
        >
            <Card>
                <CardContent>
                    <Box component="form" onSubmit={handleSubmit((data: any) => mutation.mutate(data))} noValidate>
                        <Grid container spacing={3}>
                            {/* Sol Sütun - Temel Bilgiler */}
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Typography variant="h6" sx={{ mb: 2 }}>Temel Bilgiler</Typography>

                                <Controller
                                    name="erpAccountId"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            label="Cari Kodu"
                                            fullWidth
                                            margin="normal"
                                            helperText="Boş bırakılırsa sistem otomatik atar"
                                        />
                                    )}
                                />

                                <Controller
                                    name="name"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            label="Cari Ünvan *"
                                            fullWidth
                                            margin="normal"
                                            error={!!errors.name}
                                            helperText={errors.name?.message}
                                        />
                                    )}
                                />

                                <Controller
                                    name="email"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            label="E-posta *"
                                            type="email"
                                            fullWidth
                                            margin="normal"
                                            error={!!errors.email}
                                            helperText={errors.email?.message}
                                        />
                                    )}
                                />

                                <Controller
                                    name="password"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            label="Parola"
                                            type="password"
                                            fullWidth
                                            margin="normal"
                                            helperText="Boş bırakılırsa geçici parola üretilir"
                                        />
                                    )}
                                />

                                <Controller
                                    name="erpNum"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            label="ERP Referans Numarası (Opsiyonel)"
                                            type="number"
                                            fullWidth
                                            margin="normal"
                                        />
                                    )}
                                />
                            </Grid>

                            {/* Sağ Sütun - Ticari ve Adres Bilgileri */}
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Typography variant="h6" sx={{ mb: 2 }}>Ticari ve Adres Detayları</Typography>

                                <Grid container spacing={2}>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <Controller
                                            name="customerClassId"
                                            control={control}
                                            render={({ field }) => (
                                                <TextField
                                                    {...field}
                                                    select
                                                    label="Müşteri Sınıfı"
                                                    fullWidth
                                                    margin="normal"
                                                >
                                                    <MenuItem value="">-- Sınıf Seçin --</MenuItem>
                                                    {customerClasses?.map((c: any) => (
                                                        <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                                                    ))}
                                                </TextField>
                                            )}
                                        />
                                    </Grid>

                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <Controller
                                            name="discountGroupId"
                                            control={control}
                                            render={({ field }) => (
                                                <TextField
                                                    {...field}
                                                    select
                                                    label="İskonto Grubu"
                                                    fullWidth
                                                    margin="normal"
                                                >
                                                    <MenuItem value="">-- İskonto Grubu Seçin --</MenuItem>
                                                    {discounts?.map((d: any) => (
                                                        <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>
                                                    ))}
                                                </TextField>
                                            )}
                                        />
                                    </Grid>

                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <Controller
                                            name="salespersonId"
                                            control={control}
                                            render={({ field }) => (
                                                <TextField
                                                    {...field}
                                                    select
                                                    label="Plasiyer (Sorumlu Personel)"
                                                    fullWidth
                                                    margin="normal"
                                                >
                                                    <MenuItem value="">-- Plasiyer Seçin --</MenuItem>
                                                    {salespersons?.map((s: any) => (
                                                        <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
                                                    ))}
                                                </TextField>
                                            )}
                                        />
                                    </Grid>

                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <Controller
                                            name="customerGrade"
                                            control={control}
                                            render={({ field }) => (
                                                <TextField
                                                    {...field}
                                                    label="Müşteri Derecesi (Örn: A, B, C)"
                                                    fullWidth
                                                    margin="normal"
                                                />
                                            )}
                                        />
                                    </Grid>

                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <Controller
                                            name="city"
                                            control={control}
                                            render={({ field }) => (
                                                <TextField {...field} label="İl" fullWidth margin="normal" />
                                            )}
                                        />
                                    </Grid>

                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <Controller
                                            name="district"
                                            control={control}
                                            render={({ field }) => (
                                                <TextField {...field} label="İlçe" fullWidth margin="normal" />
                                            )}
                                        />
                                    </Grid>

                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <Controller
                                            name="vatDays"
                                            control={control}
                                            render={({ field }) => (
                                                <TextField
                                                    {...field}
                                                    label="Vade (Gün)"
                                                    type="number"
                                                    fullWidth
                                                    margin="normal"
                                                    error={!!errors.vatDays}
                                                    helperText={errors.vatDays?.message}
                                                />
                                            )}
                                        />
                                    </Grid>
                                </Grid>

                                <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    <Controller
                                        name="isActive"
                                        control={control}
                                        render={({ field: { value, onChange } }) => (
                                            <FormControlLabel
                                                control={<Switch checked={value} onChange={onChange} />}
                                                label="Aktif Müşteri"
                                            />
                                        )}
                                    />
                                    <Controller
                                        name="canUseVirtualPos"
                                        control={control}
                                        render={({ field: { value, onChange } }) => (
                                            <FormControlLabel
                                                control={<Switch checked={value} onChange={onChange} color="success" />}
                                                label="Sanal POS Kullanabilir"
                                            />
                                        )}
                                    />
                                    <Controller
                                        name="blockOrderOnRisk"
                                        control={control}
                                        render={({ field: { value, onChange } }) => (
                                            <FormControlLabel
                                                control={<Switch checked={value} onChange={onChange} color="error" />}
                                                label="Risk Uyarısında Sipariş/Sepet Engelle"
                                            />
                                        )}
                                    />
                                </Box>

                            </Grid>
                        </Grid>

                        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                            <Button variant="outlined" onClick={() => router.back()}>
                                İptal
                            </Button>
                            <Button type="submit" variant="contained" disabled={isSubmitting}>
                                Kaydet
                            </Button>
                        </Box>
                    </Box>
                </CardContent>
            </Card>
        </StandardPage>
    );
}
