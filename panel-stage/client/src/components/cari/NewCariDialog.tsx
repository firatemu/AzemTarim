import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    IconButton,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import axios from '@/lib/axios';
import { getDistricts } from '@/lib/cities';
import CariForm from '../CariForm';
import { CariFormData, initialCariFormData } from './types';

interface NewCariDialogProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    showSnackbar: (message: string, severity: 'success' | 'error' | 'info' | 'warning') => void;
}

export default function NewCariDialog({ open, onClose, onSuccess, showSnackbar }: NewCariDialogProps) {
    const [formData, setFormData] = useState<CariFormData>(initialCariFormData);
    const [selectedCity, setSelectedCity] = useState('İstanbul');
    const [satisElemanlari, setSatisElemanlari] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Memoize districts to prevent unnecessary re-renders
    const availableDistricts = useMemo(() => getDistricts(selectedCity), [selectedCity]);

    // Fetch sales representatives once on mount
    useEffect(() => {
        const fetchSatisElemanlari = async () => {
            try {
                const response = await axios.get('/sales-agents');
                setSatisElemanlari(response.data || []);
            } catch (error) {
                console.error('Satış elemanları yüklenirken hata:', error);
            }
        };
        fetchSatisElemanlari();
    }, []);

    // Reset form and fetch next code when dialog opens
    useEffect(() => {
        if (open) {
            const initForm = async () => {
                let nextCode = '';
                try {
                    const response = await axios.get('/code-templates/next-code/CUSTOMER');
                    nextCode = response.data.nextCode || '';
                } catch (error) {
                    console.log('Otomatik kod alınamadı, boş bırakılacak');
                }

                setFormData({
                    ...initialCariFormData,
                    cariKodu: nextCode || '',
                });
                setSelectedCity('İstanbul');
            };
            initForm();
        }
    }, [open]);

    const handleCityChange = useCallback((city: string) => {
        setSelectedCity(city);
        const districts = getDistricts(city);
        setFormData(prev => ({ ...prev, il: city, ilce: districts[0] || 'Merkez' }));
    }, []);

    const handleFormChange = useCallback((field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    }, []);

    const prepareDataToSend = (data: CariFormData) => {
        if (!data.unvan || !data.unvan.trim()) {
            console.error('Validation error: unvan is missing');
            return null; // Or throw error
        }

        const dataToSend: any = {
            code: data.cariKodu?.trim() || undefined,
            title: data.unvan.trim(),
            type: data.tip || 'MUSTERI',
            companyType: data.sirketTipi || 'KURUMSAL',
            taxNumber: data.vergiNo || undefined,
            taxOffice: data.vergiDairesi || undefined,
            nationalId: data.tcKimlikNo || undefined,
            fullName: data.isimSoyisim || undefined,
            isActive: data.aktif ?? true,
            salesAgentId: data.satisElemaniId || undefined,
            contactName: data.yetkili || undefined,
            phone: data.telefon || undefined,
            email: data.email || undefined,
            website: data.webSite || undefined,
            fax: data.faks || undefined,
            country: data.ulke || 'Türkiye',
            city: data.il || undefined,
            district: data.ilce || undefined,
            address: data.adres || undefined,
            creditLimit: Number(data.riskLimiti) || 0,
            creditStatus: data.riskDurumu || 'NORMAL',
            collateralAmount: Number(data.teminatTutar) || 0,
            dueDays: Number(data.vadeGun) || 0,
            currency: data.paraBirimi || 'TRY',
            bankInfo: data.bankaBilgileri || undefined,
            sector: data.sektor || undefined,
            customCode1: data.ozelKod1 || undefined,
            customCode2: data.ozelKod2 || undefined,
        };

        // Şahıs şirketi değilse TC ve isim-soyisim temizle
        if (data.sirketTipi !== 'SAHIS') {
            dataToSend.nationalId = undefined;
            dataToSend.fullName = undefined;
        } else {
            dataToSend.taxNumber = undefined;
            dataToSend.taxOffice = undefined;
        }

        // Boş risk değerleri
        if (!dataToSend.creditLimit) dataToSend.creditLimit = 0;
        if (!dataToSend.collateralAmount) dataToSend.collateralAmount = 0;

        // code temizliği
        if (!dataToSend.code || !dataToSend.code.trim()) {
            dataToSend.code = undefined;
        } else {
            dataToSend.code = dataToSend.code.trim();
        }

        // Boş alanları temizle
        const nullableFields = ['phone', 'email', 'contactName', 'taxNumber', 'taxOffice', 'nationalId', 'fullName', 'address', 'website', 'fax', 'sector', 'customCode1', 'customCode2', 'bankInfo', 'salesAgentId'];
        nullableFields.forEach(field => {
            if (dataToSend[field] !== undefined && (dataToSend[field] === '' || dataToSend[field] === null)) {
                dataToSend[field] = undefined;
            }
        });

        // İlişkili tabloları temizle ve map'le
        if (data.yetkililer) {
            dataToSend.contacts = data.yetkililer.map((y: any) => ({
                fullName: y.adSoyad,
                title: y.unvan,
                phone: y.telefon,
                email: y.email,
                extension: y.dahili,
                isDefault: y.varsayilan,
                notes: y.notlar,
            }));
        }

        if (data.ekAdresler) {
            dataToSend.addresses = data.ekAdresler.map((a: any) => ({
                title: a.baslik,
                type: a.tip || 'OTHER',
                address: a.adres,
                city: a.il,
                district: a.ilce,
                postalCode: a.postaKodu,
                isDefault: a.varsayilan,
            }));
        }

        if (data.tedarikciBankalar) {
            dataToSend.banks = data.tedarikciBankalar.map((b: any) => ({
                bankName: b.bankaAdi,
                branchName: b.subeAdi,
                branchCode: b.subeKodu,
                accountNumber: b.hesapNo,
                iban: b.iban,
                currency: b.paraBirimi || 'TRY',
                notes: b.aciklama,
            }));
        }

        return dataToSend;
    };

    const handleAdd = async () => {
        try {
            if (!formData.unvan || !formData.unvan.trim()) {
                showSnackbar('Ünvan boş olamaz', 'error');
                return;
            }

            setLoading(true);
            const dataToSend = prepareDataToSend(formData);

            await axios.post('/accounts', dataToSend);
            showSnackbar('Cari başarıyla eklendi', 'success');
            onSuccess();
            onClose();
        } catch (error: any) {
            showSnackbar(error.response?.data?.message || 'Cari eklenemedi', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 'var(--radius)',
                    border: '1px solid var(--border)',
                    bgcolor: 'var(--card)',
                    backgroundImage: 'none',
                },
            }}
        >
            <DialogTitle component="div" sx={{
                bgcolor: 'var(--secondary)',
                color: 'var(--secondary-foreground)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontWeight: 700,
                fontSize: '1.125rem',
            }}>
                Yeni Cari Ekle
                <IconButton size="small" onClick={onClose} sx={{ color: 'var(--secondary-foreground)' }}>
                    <Close />
                </IconButton>
            </DialogTitle>
            <DialogContent sx={{ bgcolor: 'var(--background)' }}>
                <CariForm
                    data={formData}
                    onChange={handleFormChange}
                    onCityChange={handleCityChange}
                    availableDistricts={availableDistricts}
                    satisElemanlari={satisElemanlari}
                />
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
                <Button
                    onClick={onClose}
                    sx={{
                        textTransform: 'none',
                        fontWeight: 600,
                        color: 'var(--muted-foreground)',
                        '&:hover': {
                            bgcolor: 'var(--muted)',
                        },
                    }}
                >
                    İptal
                </Button>
                <Button
                    variant="contained"
                    onClick={handleAdd}
                    disabled={loading}
                    sx={{
                        bgcolor: 'var(--secondary)',
                        color: 'var(--secondary-foreground)',
                        textTransform: 'none',
                        fontWeight: 600,
                        '&:hover': {
                            bgcolor: 'var(--secondary-hover)',
                        },
                    }}
                >
                    {loading ? 'Kaydediliyor...' : 'Kaydet'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
