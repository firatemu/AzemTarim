'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Switch,
  FormControlLabel,
  Alert,
  Snackbar,
  CircularProgress,
  Divider,
  Card,
  CardContent,
  Stack,
  alpha,
  useTheme,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Info as InfoIcon,
  ToggleOn as ToggleOnIcon,
  Rule as RuleIcon,
  Assessment as AssessmentIcon,
  Description as DescriptionIcon,
  Inventory as InventoryIcon,
  AccountBalance as BankIcon,
  Payments as CashIcon,
  ContactPage as ContactIcon,
} from '@mui/icons-material';
import StandardPage from '@/components/common/StandardPage';
import {
  getAllParameters,
  SystemParameter,
  setParameterAsBoolean,
} from '@/services/systemParameterService';
import CheckBillSettingsSection from '@/components/settings/CheckBillSettingsSection';

interface ParameterDefinition {
  key: string;
  label: string;
  description: string;
  category: string;
  defaultValue: boolean;
  icon?: React.ReactNode;
}

const PARAMETER_DEFINITIONS: ParameterDefinition[] = [
  {
    key: 'AUTO_COSTING_ON_PURCHASE_INVOICE',
    label: 'Otomatik Maliyetlendirme',
    description: 'Satın alma faturaları kaydedildiğinde veya silindiğinde otomatik olarak maliyetlendirme servisi çalışır.',
    category: 'FATURA',
    defaultValue: true,
    icon: <AssessmentIcon />
  },
  {
    key: 'AUTO_APPROVE_INVOICE',
    label: 'Faturaları Otomatik Onayla',
    description: 'Yeni oluşturulan faturaların durumunu otomatik olarak \'Onaylandı\' yapar. Kapalı olduğunda \'Taslak\' olarak kaydedilir.',
    category: 'FATURA',
    defaultValue: false,
    icon: <DescriptionIcon />
  },
  {
    key: 'NEGATIVE_STOCK_CONTROL',
    label: 'Negatif Stok Kontrolü',
    description: 'Satış faturası kaydedilirken stok kontrolü yapılır. Açık olduğunda, mevcut stoktan fazla satış yapılamaz.',
    category: 'STOK',
    defaultValue: false,
    icon: <InventoryIcon />
  },
  {
    key: 'NEGATIVE_BANK_BALANCE_CONTROL',
    label: 'Negatif Banka Bakiyesi Kontrolü',
    description: 'Banka işlemlerinde bakiye kontrolü yapılır. Açık olduğunda, mevcut bakiyeden fazla çıkış yapılamaz.',
    category: 'BANKA',
    defaultValue: true,
    icon: <BankIcon />
  },
  {
    key: 'ALLOW_NEGATIVE_CASH_BALANCE',
    label: 'Negatif Kasa Bakiyesi İzni',
    description: 'Kasa işlemlerinde bakiye kontrolü yapılır. Açık olduğunda, kasa bakiyesi eksiye düşebilir.',
    category: 'KASA',
    defaultValue: false,
    icon: <CashIcon />
  },
  {
    key: 'CARI_RISK_CONTROL',
    label: 'Cari Risk Limiti Kontrolü',
    description: 'Aktif olduğunda, tanımlanan risk limitini aşacak satış veya ödeme işlemi oluşturulamaz.',
    category: 'CARİ',
    defaultValue: false,
    icon: <ContactIcon />
  },
];

export default function ParametrelerPage() {
  const theme = useTheme();
  const [parameters, setParameters] = useState<SystemParameter[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  useEffect(() => {
    fetchParameters();
  }, []);

  const fetchParameters = async () => {
    try {
      setLoading(true);
      const data = await getAllParameters();
      setParameters(data);
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Parametreler yüklenirken hata oluştu', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleParameterChange = async (key: string, value: boolean) => {
    try {
      setSaving((prev) => ({ ...prev, [key]: true }));

      const definition = PARAMETER_DEFINITIONS.find((d) => d.key === key);
      if (!definition) throw new Error('Parametre tanımı bulunamadı');

      await setParameterAsBoolean(key, value, definition.description, definition.category);

      setParameters((prev) => {
        const existing = prev.find((p) => p.key === key);
        if (existing) {
          return prev.map((p) => (p.key === key ? { ...p, value } : p));
        } else {
          return [
            ...prev,
            {
              id: '',
              key,
              value,
              description: definition.description,
              category: definition.category,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ];
        }
      });

      showSnackbar('Parametre başarıyla güncellendi', 'success');
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Parametre güncellenirken hata oluştu', 'error');
    } finally {
      setSaving((prev) => ({ ...prev, [key]: false }));
    }
  };

  const getParameterValue = (key: string, defaultValue: boolean): boolean => {
    const param = parameters.find((p) => p.key === key);
    if (!param) return defaultValue;
    return param.value === true || param.value === 'true' || param.value === 1;
  };

  const groupedParameters = PARAMETER_DEFINITIONS.reduce((acc, def) => {
    if (!acc[def.category]) {
      acc[def.category] = [];
    }
    acc[def.category].push(def);
    return acc;
  }, {} as Record<string, ParameterDefinition[]>);

  if (loading) {
    return (
      <StandardPage title="Yükleniyor...">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress size={40} thickness={4} />
        </Box>
      </StandardPage>
    );
  }

  return (
    <StandardPage
      title="Sistem Parametreleri"
      breadcrumbs={[{ label: 'Ayarlar', href: '/settings' }, { label: 'Parametreler' }]}
    >
      <Box sx={{ mb: 4 }}>
        <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 800 }}>
          Uygulama genelindeki işleyiş kurallarını, otomatik kontrolleri ve limitleri buradan yönetebilirsiniz.
          Değişiklikler anında tüm sisteme yansıtılacaktır.
        </Typography>
      </Box>

      {Object.entries(groupedParameters).map(([category, defs]) => (
        <Box key={category} sx={{ mb: 6 }}>
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
            <Box sx={{ width: 8, height: 24, bgcolor: 'primary.main', borderRadius: 1 }} />
            <Typography variant="h6" sx={{ fontWeight: 900, textTransform: 'uppercase', letterSpacing: 0.5, color: 'text.primary', fontSize: '1rem' }}>
              {category} AYARLARI
            </Typography>
          </Stack>
          <Divider sx={{ mb: 3 }} />

          <Stack spacing={2}>
            {defs.map((def) => {
              const currentValue = getParameterValue(def.key, def.defaultValue);
              const isSaving = saving[def.key] || false;

              return (
                <Card
                  key={def.key}
                  variant="outlined"
                  sx={{
                    borderRadius: 4,
                    transition: 'all 0.2s',
                    '&:hover': { borderColor: 'primary.main', bgcolor: alpha(theme.palette.primary.main, 0.01) }
                  }}
                >
                  <CardContent sx={{ p: '24px !important' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                      <Box sx={{
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        color: 'primary.main',
                        display: 'flex'
                      }}>
                        {def.icon || <RuleIcon />}
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                            {def.label}
                          </Typography>
                          {isSaving && <CircularProgress size={16} />}
                        </Stack>
                        <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 700 }}>
                          {def.description}
                        </Typography>
                      </Box>
                      <Box sx={{ pl: 2, borderLeft: '1px solid', borderColor: 'divider' }}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={currentValue}
                              onChange={(e) => handleParameterChange(def.key, e.target.checked)}
                              disabled={isSaving}
                              color="primary"
                            />
                          }
                          label={
                            <Typography variant="caption" sx={{ fontWeight: 800, color: currentValue ? 'primary.main' : 'text.disabled' }}>
                              {currentValue ? 'AKTİF' : 'PASİF'}
                            </Typography>
                          }
                          labelPlacement="bottom"
                        />
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              );
            })}
          </Stack>
        </Box>
      ))}

      <Box id="cek-senet" sx={{ scrollMarginTop: 96 }}>
        <CheckBillSettingsSection embedInParametersPage showIntro={false} />
      </Box>

      {PARAMETER_DEFINITIONS.length === 0 && (
        <Paper variant="outlined" sx={{ p: 6, textAlign: 'center', borderRadius: 4, borderStyle: 'dashed' }}>
          <SettingsIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
          <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 600 }}>
            Henüz tanımlı bir parametre bulunmamaktadır.
          </Typography>
        </Paper>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} sx={{ borderRadius: 2, fontWeight: 700 }}>{snackbar.message}</Alert>
      </Snackbar>
    </StandardPage>
  );
}
