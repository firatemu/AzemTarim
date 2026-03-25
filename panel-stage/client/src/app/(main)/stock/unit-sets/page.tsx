'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  Grid,
  Card,
  CardContent,
  Paper,
  MenuItem,
  CircularProgress,
  Alert,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Chip,
  Stack,
  Divider,
  Tabs,
  Tab,
  InputAdornment,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Scale,
  Save,
  Cancel,
  CheckCircle,
  RadioButtonUnchecked,
  Lock,
  Business,
  Straighten,
  FitnessCenter,
  WaterDrop,
  SquareFoot,
  Tag,
  ToggleOn,
  ToggleOff,
  Info,
  Search,
  Refresh,
} from '@mui/icons-material';
import MainLayout from '@/components/Layout/MainLayout';
import axios from '@/lib/axios';
import { GIB_BIRIM_KODLARI } from '@/constants/birim-codes';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Unit {
  id?: string;
  name: string;
  code?: string;
  conversionRate: number;
  isBaseUnit: boolean;
  isDivisible: boolean;
}

interface UnitSet {
  id: string;
  name: string;
  description?: string;
  isSystem: boolean;
  tenantId: string | null;
  units: Unit[];
  createdAt?: string;
  updatedAt?: string;
}

type TabValue = 'all' | 'system' | 'tenant';

// ─── Constants ────────────────────────────────────────────────────────────────

const SYSTEM_SET_ICONS: Record<string, React.ReactNode> = {
  Uzunluk: <Straighten sx={{ fontSize: 18 }} />,
  Agirlik: <FitnessCenter sx={{ fontSize: 18 }} />,
  Ağırlık: <FitnessCenter sx={{ fontSize: 18 }} />,
  Hacim: <WaterDrop sx={{ fontSize: 18 }} />,
  Alan: <SquareFoot sx={{ fontSize: 18 }} />,
  Adet: <Tag sx={{ fontSize: 18 }} />,
};

const CATEGORY_COLORS: Record<string, string> = {
  Uzunluk: '#2563eb',
  Agirlik: '#7c3aed',
  Ağırlık: '#7c3aed',
  Hacim: '#0891b2',
  Alan: '#059669',
  Adet: '#d97706',
};

const DEFAULT_COLOR = '#64748b';

const EMPTY_UNIT: Unit = {
  name: '',
  code: '',
  conversionRate: 1,
  isBaseUnit: false,
  isDivisible: true,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getSetColor(name: string): string {
  return CATEGORY_COLORS[name] ?? DEFAULT_COLOR;
}

function getSetIcon(name: string): React.ReactNode {
  return SYSTEM_SET_ICONS[name] ?? <Scale sx={{ fontSize: 18 }} />;
}

// ─── Reusable Badges ──────────────────────────────────────────────────────────

function SystemBadge() {
  return (
    <Chip
      icon={<Lock sx={{ fontSize: '13px !important' }} />}
      label="Sistem"
      size="small"
      sx={{
        height: 22, fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.04em',
        bgcolor: 'color-mix(in srgb, var(--primary) 8%, transparent)',
        color: 'var(--primary)',
        border: '1px solid color-mix(in srgb, var(--primary) 25%, transparent)',
        '& .MuiChip-icon': { color: 'var(--primary)' },
      }}
    />
  );
}

function TenantBadge() {
  return (
    <Chip
      icon={<Business sx={{ fontSize: '13px !important' }} />}
      label="Özel"
      size="small"
      sx={{
        height: 22, fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.04em',
        bgcolor: 'color-mix(in srgb, var(--chart-2) 10%, transparent)',
        color: 'var(--chart-2)',
        border: '1px solid color-mix(in srgb, var(--chart-2) 25%, transparent)',
        '& .MuiChip-icon': { color: 'var(--chart-2)' },
      }}
    />
  );
}

// ─── UnitSet Card ─────────────────────────────────────────────────────────────

interface UnitSetCardProps {
  unitSet: UnitSet;
  onEdit: (u: UnitSet) => void;
  onDelete: (id: string, name: string) => void;
}

function UnitSetCard({ unitSet, onEdit, onDelete }: UnitSetCardProps) {
  const baseUnit = unitSet.units.find(u => u.isBaseUnit);
  const subUnits = unitSet.units.filter(u => !u.isBaseUnit);
  const color = getSetColor(unitSet.name);
  const icon = getSetIcon(unitSet.name);

  return (
    <Card
      sx={{
        height: '100%', display: 'flex', flexDirection: 'column',
        border: '1px solid var(--border)', borderTop: `3px solid ${color}`,
        boxShadow: 'none', borderRadius: 2,
        transition: 'box-shadow 0.2s, transform 0.2s',
        '&:hover': { boxShadow: '0 4px 20px rgba(0,0,0,0.09)', transform: 'translateY(-2px)' },
        bgcolor: 'var(--card)',
      }}
    >
      <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
            <Box sx={{
              width: 34, height: 34, borderRadius: 1.5,
              bgcolor: `${color}18`, display: 'flex', alignItems: 'center',
              justifyContent: 'center', color, flexShrink: 0,
            }}>
              {icon}
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="subtitle1" fontWeight={700} noWrap
                sx={{ color: 'var(--foreground)', lineHeight: 1.2, letterSpacing: '-0.01em' }}>
                {unitSet.name}
              </Typography>
              {unitSet.description && (
                <Typography variant="caption" color="text.secondary" noWrap display="block">
                  {unitSet.description}
                </Typography>
              )}
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0, ml: 1 }}>
            {unitSet.isSystem ? <SystemBadge /> : <TenantBadge />}
            {!unitSet.isSystem && (
              <>
                <Tooltip title="Düzenle">
                  <IconButton size="small" onClick={() => onEdit(unitSet)}
                    sx={{ color: 'var(--muted-foreground)', '&:hover': { color: 'var(--primary)', bgcolor: 'color-mix(in srgb,var(--primary) 8%,transparent)' } }}>
                    <Edit sx={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Sil">
                  <IconButton size="small" onClick={() => onDelete(unitSet.id, unitSet.name)}
                    sx={{ color: 'var(--muted-foreground)', '&:hover': { color: 'var(--destructive)', bgcolor: 'color-mix(in srgb,var(--destructive) 8%,transparent)' } }}>
                    <Delete sx={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>
              </>
            )}
          </Box>
        </Box>

        <Divider sx={{ mb: 1.5 }} />

        {/* Ana Birim */}
        <Box sx={{ mb: subUnits.length > 0 ? 1.5 : 0 }}>
          <Typography variant="caption"
            sx={{ color: 'var(--muted-foreground)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', mb: 0.5 }}>
            Ana Birim
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Chip
              label={`${baseUnit?.name ?? '–'}  ·  ${baseUnit?.code ?? '–'}`}
              size="small"
              sx={{ bgcolor: `${color}12`, color, border: `1px solid ${color}30`, fontWeight: 700, fontSize: '0.75rem' }}
            />
            {baseUnit && (
              <Tooltip title={baseUnit.isDivisible ? 'Ondalık girişe izin verilir (ör: 1.5 m)' : 'Yalnızca tam sayı girişine izin verilir'}>
                <Chip
                  label={baseUnit.isDivisible ? 'Bölünebilir' : 'Tam sayı'}
                  size="small"
                  sx={{
                    height: 20, fontSize: '0.68rem', fontWeight: 600,
                    bgcolor: baseUnit.isDivisible
                      ? 'color-mix(in srgb, var(--chart-2) 10%, transparent)'
                      : 'color-mix(in srgb, var(--muted-foreground) 10%, transparent)',
                    color: baseUnit.isDivisible ? 'var(--chart-2)' : 'var(--muted-foreground)',
                  }}
                />
              </Tooltip>
            )}
          </Box>
        </Box>

        {/* Alt Birimler */}
        {subUnits.length > 0 && (
          <Box>
            <Typography variant="caption"
              sx={{ color: 'var(--muted-foreground)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', mb: 0.75 }}>
              Alt Birimler ({subUnits.length})
            </Typography>
            <Stack spacing={0.75}>
              {subUnits.map((unit, idx) => (
                <Paper key={unit.id ?? idx} variant="outlined"
                  sx={{ px: 1.5, py: 1, bgcolor: 'var(--background)', borderRadius: 1.5, border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="body2" fontWeight={600} sx={{ color: 'var(--foreground)', lineHeight: 1.2 }}>
                      {unit.name}
                      <Typography component="span" variant="caption" sx={{ color: 'var(--muted-foreground)', ml: 0.5 }}>
                        ({unit.code})
                      </Typography>
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'var(--muted-foreground)' }}>
                      1 {baseUnit?.name} = <strong>{unit.conversionRate}</strong> {unit.name}
                    </Typography>
                  </Box>
                  <Tooltip title={unit.isDivisible ? 'Ondalık izinli' : 'Yalnızca tam sayı'}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: unit.isDivisible ? 'var(--chart-2)' : 'var(--muted-foreground)', flexShrink: 0, ml: 1 }} />
                  </Tooltip>
                </Paper>
              ))}
            </Stack>
          </Box>
        )}

        {/* Sistem kilidi */}
        {unitSet.isSystem && (
          <Box sx={{ mt: 2, p: 1.25, bgcolor: 'color-mix(in srgb,var(--muted-foreground) 6%,transparent)', borderRadius: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Lock sx={{ fontSize: 13, color: 'var(--muted-foreground)' }} />
            <Typography variant="caption" sx={{ color: 'var(--muted-foreground)', lineHeight: 1.3 }}>
              Sistem tarafından yönetilir. Değiştirilemez.
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Create / Edit Dialog ─────────────────────────────────────────────────────

interface UnitSetDialogProps {
  open: boolean;
  editingSet: UnitSet | null;
  onClose: () => void;
  onSaved: () => void;
}

function UnitSetDialog({ open, editingSet, onClose, onSaved }: UnitSetDialogProps) {
  const [saving, setSaving] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [units, setUnits] = useState<Unit[]>([]);

  // Formu sıfırla / doldur
  useEffect(() => {
    if (!open) return;
    if (editingSet) {
      setFormData({ name: editingSet.name, description: editingSet.description ?? '' });
      setUnits(editingSet.units.map(u => ({ ...u })));
    } else {
      setFormData({ name: '', description: '' });
      setUnits([{ ...EMPTY_UNIT, isBaseUnit: true, code: 'ADET', conversionRate: 1, isDivisible: false }]);
    }
    setValidationError(null);
  }, [open, editingSet]);

  // ── Birim satır işlemleri ─────────────────────────────────────────────────

  const addUnit = () =>
    setUnits(prev => [...prev, { ...EMPTY_UNIT }]);

  const removeUnit = (idx: number) => {
    const wasBase = units[idx].isBaseUnit;
    const next = units.filter((_, i) => i !== idx);
    if (wasBase && next.length > 0 && !next.some(u => u.isBaseUnit)) {
      next[0].isBaseUnit = true;
      next[0].conversionRate = 1;
    }
    setUnits(next);
  };

  const updateUnit = (idx: number, field: keyof Unit, value: any) => {
    setUnits(prev => prev.map((u, i) => {
      if (i !== idx) {
        // Başka satırın isBaseUnit'ini kapat
        if (field === 'isBaseUnit' && value) return { ...u, isBaseUnit: false };
        return u;
      }
      const updated = { ...u, [field]: value };
      if (field === 'isBaseUnit' && value) updated.conversionRate = 1;
      return updated;
    }));
  };

  // ── Validation ─────────────────────────────────────────────────────────────

  const validate = (): string | null => {
    if (!formData.name.trim()) return 'Birim seti adı zorunludur.';
    if (units.length === 0) return 'En az bir birim tanımlanmalıdır.';
    const baseCount = units.filter(u => u.isBaseUnit).length;
    if (baseCount !== 1) return 'Tam olarak bir ana birim seçilmelidir.';
    for (let i = 0; i < units.length; i++) {
      const u = units[i];
      if (!u.name.trim()) return `Satır ${i + 1}: Birim adı zorunludur.`;
      if (!u.code) return `Satır ${i + 1}: GİB kodu seçimi zorunludur.`;
      if (u.conversionRate <= 0) return `Satır ${i + 1}: Katsayı 0'dan büyük olmalıdır.`;
    }
    return null;
  };

  // ── Kaydet ────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    const err = validate();
    if (err) { setValidationError(err); return; }
    setValidationError(null);
    setSaving(true);

    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      units: units.map(u => ({
        name: u.name.trim(),
        code: u.code,
        conversionRate: u.isBaseUnit ? 1 : u.conversionRate,
        isBaseUnit: u.isBaseUnit,
        isDivisible: u.isDivisible,
      })),
    };

    try {
      if (editingSet) {
        await axios.put(`/unit-sets/${editingSet.id}`, payload);
      } else {
        await axios.post('/unit-sets', payload);
      }
      onSaved();
    } catch (err: any) {
      const msg = err.response?.data?.message;
      setValidationError(Array.isArray(msg) ? msg.join(' ') : (msg ?? 'İşlem başarısız oldu.'));
    } finally {
      setSaving(false);
    }
  };

  const baseUnit = units.find(u => u.isBaseUnit);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2.5, bgcolor: 'var(--card)' } }}
    >
      {/* ── Başlık ── */}
      <DialogTitle sx={{ bgcolor: 'var(--primary)', color: 'var(--primary-foreground)', py: 2.5, px: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Scale sx={{ fontSize: 20 }} />
        <Typography component="span" variant="h6" fontWeight={700} sx={{ flexGrow: 1 }}>
          {editingSet ? 'Birim Setini Düzenle' : 'Yeni Birim Seti Oluştur'}
        </Typography>
        <TenantBadge />
      </DialogTitle>

      <DialogContent sx={{ pt: 3, pb: 1 }}>
        <Grid container spacing={2.5}>

          {/* Set Adı */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Birim Seti Adı *"
              value={formData.name}
              onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
              placeholder="Örn: Ambalaj Birimleri"
              error={!!validationError && !formData.name.trim()}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
            />
          </Grid>

          {/* Açıklama */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Açıklama (isteğe bağlı)"
              value={formData.description}
              onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
              placeholder="Kısa açıklama..."
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
            />
          </Grid>

          {/* Birimler Tablosu */}
          <Grid size={{ xs: 12 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
              <Typography variant="subtitle1" fontWeight={700} sx={{ color: 'var(--foreground)' }}>
                Birimler
              </Typography>
              <Button
                startIcon={<Add />}
                onClick={addUnit}
                variant="outlined"
                size="small"
                sx={{ borderRadius: 1.5, textTransform: 'none', fontWeight: 600 }}
              >
                Birim Ekle
              </Button>
            </Box>

            <TableContainer component={Paper} variant="outlined"
              sx={{ borderRadius: 1.5, border: '1px solid var(--border)', boxShadow: 'none' }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: 'color-mix(in srgb,var(--muted-foreground) 8%,transparent)' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.8rem', width: '30%' }}>Birim Adı *</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.8rem', width: '30%' }}>GİB Kodu *</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.8rem', width: '15%' }}>Katsayı</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.8rem', width: '10%' }}>
                      <Tooltip title="Ana birim: dönüşüm hesaplamalarının referans noktası. Katsayısı her zaman 1'dir.">
                        <span>Ana</span>
                      </Tooltip>
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.8rem', width: '10%' }}>
                      <Tooltip title="Bölünebilir: ondalıklı miktar girişine izin verir (ör: 1.5 kg). Kapalıysa yalnızca tam sayı kabul edilir.">
                        <span>Ondalık</span>
                      </Tooltip>
                    </TableCell>
                    <TableCell sx={{ width: '5%' }} />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {units.map((unit, idx) => (
                    <TableRow
                      key={idx}
                      sx={{ bgcolor: unit.isBaseUnit ? 'color-mix(in srgb,var(--primary) 4%,transparent)' : 'transparent' }}
                    >
                      {/* Ad */}
                      <TableCell>
                        <TextField
                          size="small" fullWidth
                          value={unit.name}
                          onChange={e => updateUnit(idx, 'name', e.target.value)}
                          placeholder="Metre, Kilogram..."
                          error={!!validationError && !unit.name.trim()}
                          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                        />
                      </TableCell>

                      {/* GİB Kodu */}
                      <TableCell>
                        <Select
                          size="small"
                          fullWidth
                          displayEmpty
                          value={unit.code ?? ''}
                          onChange={(e) => updateUnit(idx, 'code', e.target.value as string)}
                          error={!!validationError && !unit.code}
                          renderValue={(selected: unknown) => {
                            if (!selected) return <span style={{ color: 'var(--muted-foreground)' }}>Seçiniz...</span>;
                            const found = GIB_BIRIM_KODLARI.find(c => c.kod === selected);
                            return found ? `${found.kod} — ${found.ad}` : String(selected);
                          }}
                          MenuProps={{ PaperProps: { sx: { maxHeight: 280 } } }}
                          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 }, borderRadius: 1 }}
                        >
                          {[
                            { kod: '', ad: 'Seçiniz...' },
                            ...GIB_BIRIM_KODLARI
                          ].map(c => (
                            <MenuItem key={c.kod || 'empty'} value={c.kod} disabled={c.kod === ''}>
                              {c.kod ? `${c.kod} — ${c.ad}` : c.ad}
                            </MenuItem>
                          ))}
                        </Select>
                      </TableCell>

                      {/* Katsayı */}
                      <TableCell align="right">
                        <TextField
                          type="number" size="small" fullWidth
                          value={unit.conversionRate}
                          onChange={e => updateUnit(idx, 'conversionRate', parseFloat(e.target.value) || 0)}
                          inputProps={{ min: 0.0001, step: 0.001 }}
                          disabled={unit.isBaseUnit}
                          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                        />
                      </TableCell>

                      {/* Ana Birim Toggle */}
                      <TableCell align="center">
                        <Tooltip title={unit.isBaseUnit ? 'Ana birim (referans)' : 'Ana birim yap'}>
                          <IconButton
                            size="small"
                            onClick={() => updateUnit(idx, 'isBaseUnit', !unit.isBaseUnit)}
                            sx={{ color: unit.isBaseUnit ? 'var(--primary)' : 'var(--muted-foreground)' }}
                          >
                            {unit.isBaseUnit ? <CheckCircle /> : <RadioButtonUnchecked />}
                          </IconButton>
                        </Tooltip>
                      </TableCell>

                      {/* Bölünebilir Toggle */}
                      <TableCell align="center">
                        <Tooltip title={unit.isDivisible ? 'Ondalık açık — kapat' : 'Ondalık kapalı — aç'}>
                          <IconButton
                            size="small"
                            onClick={() => updateUnit(idx, 'isDivisible', !unit.isDivisible)}
                            sx={{ color: unit.isDivisible ? 'var(--chart-2)' : 'var(--muted-foreground)' }}
                          >
                            {unit.isDivisible
                              ? <ToggleOn sx={{ fontSize: 24 }} />
                              : <ToggleOff sx={{ fontSize: 24 }} />
                            }
                          </IconButton>
                        </Tooltip>
                      </TableCell>

                      {/* Sil */}
                      <TableCell align="right">
                        <Tooltip title="Satırı sil">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => removeUnit(idx)}
                            disabled={units.length === 1}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}

                  {units.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} align="center"
                        sx={{ py: 4, color: 'var(--muted-foreground)', fontStyle: 'italic', fontSize: '0.85rem' }}>
                        Henüz birim eklenmedi. "Birim Ekle" butonunu kullanın.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Referans gösterge */}
            {baseUnit && (
              <Box sx={{ mt: 1.5, p: 1.5, bgcolor: 'color-mix(in srgb,var(--chart-2) 8%,transparent)', borderRadius: 1.5, border: '1px solid color-mix(in srgb,var(--chart-2) 25%,transparent)', display: 'flex', gap: 1 }}>
                <Info sx={{ fontSize: 15, color: 'var(--chart-2)', mt: 0.15, flexShrink: 0 }} />
                <Typography variant="caption" sx={{ color: 'var(--foreground)', fontWeight: 500, lineHeight: 1.45 }}>
                  Tüm çevrim hesaplamaları ana birim <strong>"{baseUnit.name}"</strong> üzerinden yapılır.
                  Diğer birimlerin katsayısı <em>"1 {baseUnit.name} = X birim"</em> mantığıyla girilmelidir.
                </Typography>
              </Box>
            )}

            {/* Bölünebilirlik açıklaması */}
            <Box sx={{ mt: 1, display: 'flex', gap: 2.5, flexWrap: 'wrap' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'var(--chart-2)' }} />
                <Typography variant="caption" color="text.secondary">Ondalık açık → 1.5 kg gibi giriş yapılabilir</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'var(--muted-foreground)' }} />
                <Typography variant="caption" color="text.secondary">Ondalık kapalı → yalnızca tam sayı (adet gibi)</Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        {/* Validation hatası */}
        {validationError && (
          <Alert severity="error" sx={{ mt: 2 }} onClose={() => setValidationError(null)}>
            {validationError}
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, bgcolor: 'var(--background)', borderTop: '1px solid var(--border)' }}>
        <Button
          onClick={onClose}
          startIcon={<Cancel />}
          variant="outlined"
          disabled={saving}
          sx={{ borderRadius: 1.5, textTransform: 'none', px: 3 }}
        >
          Vazgeç
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <Save />}
          disabled={saving || !formData.name || units.length === 0 || units.filter(u => u.isBaseUnit).length !== 1}
          sx={{
            bgcolor: 'var(--primary)', color: 'var(--primary-foreground)',
            borderRadius: 1.5, textTransform: 'none', px: 3, fontWeight: 600,
            boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
            '&:hover': { bgcolor: 'var(--primary)', boxShadow: '0 4px 14px rgba(0,0,0,0.18)' },
          }}
        >
          {saving ? 'Kaydediliyor...' : (editingSet ? 'Güncelle' : 'Oluştur')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function BirimSetleriPage() {
  const [unitSets, setUnitSets] = useState<UnitSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabValue>('all');
  const [search, setSearch] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSet, setEditingSet] = useState<UnitSet | null>(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchUnitSets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get('/unit-sets');
      setUnitSets(Array.isArray(res.data) ? res.data : []);
      setError(null);
    } catch {
      setError('Birim setleri yüklenemedi. Lütfen sayfayı yenileyin.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUnitSets(); }, [fetchUnitSets]);

  // ── Filtrelenmiş veriler ────────────────────────────────────────────────────

  const filteredSets = unitSets.filter(s => {
    if (activeTab === 'system' && !s.isSystem) return false;
    if (activeTab === 'tenant' && s.isSystem) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const nameMatch = s.name.toLowerCase().includes(q);
      const unitMatch = s.units.some(u => u.name.toLowerCase().includes(q) || (u.code ?? '').toLowerCase().includes(q));
      return nameMatch || unitMatch;
    }
    return true;
  });

  const systemCount = unitSets.filter(s => s.isSystem).length;
  const tenantCount = unitSets.filter(s => !s.isSystem).length;
  const totalUnits = unitSets.reduce((acc, s) => acc + s.units.length, 0);

  // ── Dialog handlers ────────────────────────────────────────────────────────

  const openCreate = () => { setEditingSet(null); setDialogOpen(true); };
  const openEdit = (unitSet: UnitSet) => {
    if (unitSet.isSystem) return;
    setEditingSet(unitSet);
    setDialogOpen(true);
  };
  const handleDialogClose = () => { setDialogOpen(false); setEditingSet(null); };
  const handleSaved = () => {
    setDialogOpen(false);
    setEditingSet(null);
    setSnackbar({ open: true, message: editingSet ? 'Birim seti güncellendi.' : 'Yeni birim seti oluşturuldu.', severity: 'success' });
    fetchUnitSets();
  };

  // ── Silme ─────────────────────────────────────────────────────────────────

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`"${name}" birim setini silmek istediğinizden emin misiniz?\n\nBu işlem geri alınamaz.`)) return;
    try {
      await axios.delete(`/unit-sets/${id}`);
      setSnackbar({ open: true, message: 'Birim seti silindi.', severity: 'success' });
      fetchUnitSets();
    } catch (err: any) {
      const msg = err.response?.data?.message;
      setSnackbar({ open: true, message: Array.isArray(msg) ? msg.join(' ') : (msg ?? 'Silme işlemi başarısız.'), severity: 'error' });
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <MainLayout>

      {/* Sayfa Başlığı */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={700}
            sx={{ color: 'var(--foreground)', letterSpacing: '-0.02em', mb: 0.5 }}>
            Birim Setleri
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Sistem birimleri tüm kullanıcılar tarafından paylaşılır. Özel birimler yalnızca işletmenize aittir.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Yenile">
            <IconButton onClick={fetchUnitSets} disabled={loading}
              sx={{ border: '1px solid var(--border)', borderRadius: 1.5 }}>
              <Refresh fontSize="small" />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={openCreate}
            sx={{
              bgcolor: 'var(--primary)', color: 'var(--primary-foreground)',
              px: 3, py: 1.1, borderRadius: 2, fontWeight: 600, textTransform: 'none',
              boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
              '&:hover': { bgcolor: 'var(--primary)', boxShadow: '0 4px 14px rgba(0,0,0,0.16)' },
            }}
          >
            Yeni Birim Seti
          </Button>
        </Box>
      </Box>

      {/* Hata */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>{error}</Alert>
      )}

      {/* İstatistikler */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        {[
          { label: 'Toplam Set', value: unitSets.length, color: 'var(--foreground)' },
          { label: 'Sistem', value: systemCount, color: 'var(--primary)' },
          { label: 'Özel', value: tenantCount, color: 'var(--chart-2)' },
          { label: 'Toplam Birim', value: totalUnits, color: 'var(--muted-foreground)' },
        ].map(stat => (
          <Paper key={stat.label} variant="outlined"
            sx={{ px: 2.5, py: 1.5, borderRadius: 2, border: '1px solid var(--border)', bgcolor: 'var(--card)', minWidth: 100 }}>
            <Typography variant="h5" fontWeight={800} sx={{ color: stat.color, lineHeight: 1 }}>
              {loading ? '–' : stat.value}
            </Typography>
            <Typography variant="caption" color="text.secondary" fontWeight={500}>
              {stat.label}
            </Typography>
          </Paper>
        ))}
      </Box>

      {/* Filtreler (Tab + Arama) */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          sx={{
            borderBottom: '1px solid var(--border)', flexGrow: 1,
            '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, fontSize: '0.875rem', minWidth: 'auto', px: 2 },
          }}
        >
          <Tab value="all" label="Tümü" />
          <Tab value="system" label={`Sistem (${systemCount})`} />
          <Tab value="tenant" label={`Özel (${tenantCount})`} />
        </Tabs>

        <TextField
          size="small"
          placeholder="Birim ara..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          InputProps={{
            startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment>,
          }}
          sx={{ minWidth: 220, '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
        />
      </Box>

      {/* İçerik */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}>
          <CircularProgress />
        </Box>
      ) : filteredSets.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center', border: '2px dashed var(--border)', borderRadius: 3, bgcolor: 'var(--card)' }}>
          <Scale sx={{ fontSize: 56, color: 'var(--muted-foreground)', mb: 2 }} />
          <Typography variant="h6" sx={{ color: 'var(--foreground)', mb: 1 }}>
            {search ? `"${search}" için sonuç bulunamadı` : activeTab === 'tenant' ? 'Henüz özel birim seti eklenmemiş' : 'Birim seti bulunamadı'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {search
              ? 'Arama teriminizi değiştirmeyi deneyin.'
              : activeTab === 'tenant'
                ? 'Kendi birim setinizi oluşturmak için butonu kullanın.'
                : 'Sistem birim setleri otomatik olarak yüklenir.'}
          </Typography>
          {!search && activeTab !== 'system' && (
            <Button variant="contained" startIcon={<Add />} onClick={openCreate}
              sx={{ bgcolor: 'var(--primary)', color: 'var(--primary-foreground)', textTransform: 'none', fontWeight: 600 }}>
              İlk Birim Setini Oluştur
            </Button>
          )}
        </Paper>
      ) : (
        <Grid container spacing={2.5}>
          {filteredSets.map(unitSet => (
            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={unitSet.id}>
              <UnitSetCard unitSet={unitSet} onEdit={openEdit} onDelete={handleDelete} />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Create / Edit Dialog */}
      <UnitSetDialog
        open={dialogOpen}
        editingSet={editingSet}
        onClose={handleDialogClose}
        onSaved={handleSaved}
      />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar(s => ({ ...s, open: false }))}
          sx={{ minWidth: 300 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </MainLayout>
  );
}