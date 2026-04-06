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
  Chip,
  Stack,
  Menu,
  ListItemIcon,
  Paper,
  Divider,
  InputAdornment,
  Tooltip,
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
  Search,
  Refresh,
  AutoAwesome,
  Info,
  MoreHoriz,
  ToggleOn,
  ToggleOff,
  Straighten,
  FitnessCenter,
  WaterDrop,
  SquareFoot,
  Tag,
} from '@mui/icons-material';
import { StandardPage } from '@/components/common';
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

// ─── Constants ────────────────────────────────────────────────────────────────

const SYSTEM_SET_ICONS: Record<string, React.ReactNode> = {
  Uzunluk: <Straighten sx={{ fontSize: 18 }} />,
  Ağırlık: <FitnessCenter sx={{ fontSize: 18 }} />,
  Hacim: <WaterDrop sx={{ fontSize: 18 }} />,
  Alan: <SquareFoot sx={{ fontSize: 18 }} />,
  Adet: <Tag sx={{ fontSize: 18 }} />,
  Ambalaj: <Scale sx={{ fontSize: 18 }} />,
};

const EMPTY_UNIT: Unit = {
  name: '',
  code: '',
  conversionRate: 1,
  isBaseUnit: false,
  isDivisible: true,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getSetIcon(name: string): React.ReactNode {
  return SYSTEM_SET_ICONS[name] ?? <Scale sx={{ fontSize: 18 }} />;
}

// ─── Stats Card Component ──────────────────────────────────────────────────────

interface StatsCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  gradient?: string;
}

function StatsCard({ title, value, icon, color, bgColor, gradient }: StatsCardProps) {
  return (
    <Card
      elevation={0}
      sx={{
        border: '1px solid',
        borderColor: 'var(--border)',
        borderRadius: 2,
        height: '100%',
        transition: 'transform 0.2s, box-shadow 0.2s',
        background: gradient || 'background.paper',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
        },
      }}
    >
      <CardContent sx={{ p: '20px !important' }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="subtitle2" color="text.secondary" fontWeight={600} gutterBottom>
              {title}
            </Typography>
            <Typography variant="h5" fontWeight="bold" sx={{ color: 'text.primary', letterSpacing: '-0.5px' }}>
              {value}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              birim seti
            </Typography>
          </Box>
          <Box
            sx={{
              background: bgColor,
              color,
              borderRadius: 2,
              p: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

// ─── UnitSet Card Component ────────────────────────────────────────────────────

interface UnitSetCardProps {
  unitSet: UnitSet;
  onEdit: (u: UnitSet) => void;
  onDelete: (id: string, name: string) => void;
}

function UnitSetCard({ unitSet, onEdit, onDelete }: UnitSetCardProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleToggle = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const menuActions = [
    {
      id: 'edit',
      label: 'Düzenle',
      icon: <Edit fontSize="small" />,
      onClick: () => { handleClose(); onEdit(unitSet); },
      disabled: unitSet.isSystem,
    },
    {
      id: 'delete',
      label: 'Sil',
      icon: <Delete fontSize="small" />,
      onClick: () => { handleClose(); onDelete(unitSet.id, unitSet.name); },
      disabled: unitSet.isSystem,
    },
  ];

  const baseUnit = unitSet.units.find(u => u.isBaseUnit);
  const subUnits = unitSet.units.filter(u => !u.isBaseUnit);
  const icon = getSetIcon(unitSet.name);

  return (
    <Card
      elevation={0}
      sx={{
        border: '1px solid',
        borderColor: 'var(--border)',
        borderRadius: 2,
        height: '100%',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
        },
      }}
    >
      <CardContent sx={{ p: '20px !important' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 0 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2,
                background: unitSet.isSystem
                  ? 'linear-gradient(135deg, #64748b 0%, #475569 100%)'
                  : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                flexShrink: 0,
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              }}
            >
              {icon}
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="h6" fontWeight={700} noWrap sx={{ color: 'text.primary' }}>
                {unitSet.name}
              </Typography>
              {unitSet.description && (
                <Typography variant="caption" color="text.secondary" noWrap display="block" sx={{ mt: 0.25 }}>
                  {unitSet.description}
                </Typography>
              )}
            </Box>
          </Box>

          <Stack direction="row" spacing={0.5} alignItems="center">
            {unitSet.isSystem ? (
              <Chip
                icon={<Lock sx={{ fontSize: '13px !important' }} />}
                label="SİSTEM"
                size="small"
                sx={{
                  height: 24,
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #64748b 0%, #475569 100%)',
                  color: 'white',
                  borderRadius: 1,
                }}
              />
            ) : (
              <Chip
                icon={<Business sx={{ fontSize: '13px !important' }} />}
                label="ÖZEL"
                size="small"
                sx={{
                  height: 24,
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white',
                  borderRadius: 1,
                }}
              />
            )}
            <IconButton
              size="small"
              onClick={handleToggle}
              sx={{
                bgcolor: open ? 'var(--secondary)' : 'transparent',
                color: open ? 'var(--secondary-foreground)' : 'text.secondary',
                '&:hover': { bgcolor: 'var(--secondary)', color: 'var(--secondary-foreground)' },
                transition: 'all 0.2s ease',
              }}
            >
              <MoreHoriz fontSize="small" />
            </IconButton>
          </Stack>
        </Box>

        <Divider sx={{ mb: 2, borderColor: 'var(--border)' }} />

        {/* Ana Birim */}
        <Box sx={{ mb: subUnits.length > 0 ? 2 : 0 }}>
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              display: 'block',
              mb: 1,
            }}
          >
            Ana Birim
          </Typography>
          <Chip
            label={`${baseUnit?.name ?? '–'} · ${baseUnit?.code ?? '–'}`}
            size="medium"
            sx={{
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              color: 'white',
              fontWeight: 700,
              fontSize: '0.8rem',
              borderRadius: 1,
              px: 1,
            }}
          />
        </Box>

        {/* Alt Birimler */}
        {subUnits.length > 0 && (
          <Box>
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                display: 'block',
                mb: 1,
              }}
            >
              Alt Birimler ({subUnits.length})
            </Typography>
            <Stack spacing={1}>
              {subUnits.map((unit, idx) => (
                <Paper
                  key={unit.id ?? idx}
                  variant="outlined"
                  sx={{
                    px: 2,
                    py: 1.25,
                    bgcolor: unit.isDivisible
                      ? 'linear-gradient(90deg, color-mix(in srgb, var(--chart-3) 8%, transparent) 0%, transparent 100%)'
                      : 'var(--muted)',
                    borderRadius: 1.5,
                    border: '1px solid',
                    borderColor: unit.isDivisible ? 'color-mix(in srgb, var(--chart-3) 30%, transparent)' : 'var(--border)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    '&:hover': {
                      borderColor: 'var(--primary)',
                      bgcolor: 'color-mix(in srgb, var(--primary) 8%, transparent)',
                    },
                  }}
                >
                  <Box>
                    <Typography variant="body2" fontWeight={600} sx={{ color: 'text.primary' }}>
                      {unit.name}
                      <Typography component="span" variant="caption" sx={{ color: 'text.secondary', ml: 0.5 }}>
                        ({unit.code})
                      </Typography>
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.25 }}>
                      1 {baseUnit?.name} = <strong>{unit.conversionRate}</strong> {unit.name}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: unit.isDivisible ? 'var(--chart-3)' : 'text.disabled',
                      flexShrink: 0,
                      ml: 1.5,
                    }}
                  />
                </Paper>
              ))}
            </Stack>
          </Box>
        )}
      </CardContent>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={(e) => e.stopPropagation()}
        PaperProps={{
          elevation: 8,
          sx: {
            minWidth: 200,
            mt: 1,
            borderRadius: 1,
            border: '1px solid var(--border)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
            overflow: 'visible',
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
              borderTop: '1px solid var(--border)',
              borderLeft: '1px solid var(--border)',
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ px: 1.5, py: 1 }}>
          {menuActions.map((action) => (
            <MenuItem
              key={action.id}
              onClick={action.onClick}
              disabled={action.disabled}
              sx={{
                px: 1.5,
                py: 1,
                borderRadius: 1,
                my: 0.25,
                color: action.id === 'delete' ? 'var(--destructive)' : 'var(--foreground)',
                '&:hover': {
                  bgcolor: action.id === 'delete' ? 'var(--destructive)' : 'var(--secondary)',
                },
                '&.Mui-disabled': { opacity: 0.5 },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>
                {action.icon}
              </ListItemIcon>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {action.label}
              </Typography>
            </MenuItem>
          ))}
        </Box>
      </Menu>
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

  const addUnit = () => setUnits((prev) => [...prev, { ...EMPTY_UNIT }]);

  const removeUnit = (idx: number) => {
    const wasBase = units[idx].isBaseUnit;
    const next = units.filter((_, i) => i !== idx);
    if (wasBase && next.length > 0 && !next.some((u) => u.isBaseUnit)) {
      next[0].isBaseUnit = true;
      next[0].conversionRate = 1;
    }
    setUnits(next);
  };

  const updateUnit = (idx: number, field: keyof Unit, value: any) => {
    setUnits((prev) =>
      prev.map((u, i) => {
        if (i !== idx) {
          if (field === 'isBaseUnit' && value) return { ...u, isBaseUnit: false };
          return u;
        }
        const updated = { ...u, [field]: value };
        if (field === 'isBaseUnit' && value) updated.conversionRate = 1;
        return updated;
      }),
    );
  };

  const validate = (): string | null => {
    if (!formData.name.trim()) return 'Birim seti adı zorunludur.';
    if (units.length === 0) return 'En az bir birim tanımlanmalıdır.';
    const baseCount = units.filter((u) => u.isBaseUnit).length;
    if (baseCount !== 1) return 'Tam olarak bir ana birim seçilmelidir.';
    for (let i = 0; i < units.length; i++) {
      const u = units[i];
      if (!u.name.trim()) return `Satır ${i + 1}: Birim adı zorunludur.`;
      if (!u.code) return `Satır ${i + 1}: GİB kodu seçimi zorunludur.`;
      if (u.conversionRate <= 0) return `Satır ${i + 1}: Katsayı 0'dan büyük olmalıdır.`;
    }
    return null;
  };

  const handleSave = async () => {
    const err = validate();
    if (err) {
      setValidationError(err);
      return;
    }
    setValidationError(null);
    setSaving(true);

    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      units: units.map((u) => ({
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
      setValidationError(Array.isArray(msg) ? msg.join(' ') : msg ?? 'İşlem başarısız oldu.');
    } finally {
      setSaving(false);
    }
  };

  const baseUnit = units.find((u) => u.isBaseUnit);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'var(--border)',
          boxShadow: '0 16px 48px rgba(0, 0, 0, 0.15)',
          overflow: 'hidden',
        },
      }}
    >
      <Box sx={{
        background: 'linear-gradient(135deg, var(--primary) 0%, #8b5cf6 100%)',
        px: 3,
        py: 2.5,
      }}>
        <DialogTitle sx={{ fontWeight: 800, p: 0, color: 'var(--primary-foreground)' }}>
          {editingSet ? 'Birim Setini Düzenle' : 'Yeni Birim Seti Oluştur'}
        </DialogTitle>
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', mt: 0.5, display: 'block' }}>
          {editingSet ? 'Mevcut birim setinin bilgilerini güncelleyin' : 'Yeni bir birim seti oluşturun'}
        </Typography>
      </Box>

      <DialogContent sx={{ pt: 3 }}>
        <Grid container spacing={2.5}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Birim Seti Adı *"
              value={formData.name}
              onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
              placeholder="Örn: Ambalaj Birimleri"
              error={!!validationError && !formData.name.trim()}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Açıklama"
              value={formData.description}
              onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
              placeholder="İsteğe bağlı açıklama..."
            />
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, mt: 1 }}>
              <Typography variant="h6" fontWeight={700}>
                Birimler ve Dönüşümler
              </Typography>
              <Button
                startIcon={<Add />}
                onClick={addUnit}
                variant="outlined"
                size="small"
                sx={{
                  borderRadius: 2,
                  fontWeight: 600,
                  textTransform: 'none',
                  px: 2,
                  borderColor: 'var(--primary)',
                  color: 'var(--primary)',
                  '&:hover': {
                    bgcolor: 'color-mix(in srgb, var(--primary) 10%, transparent)',
                    borderColor: 'var(--primary)',
                  },
                }}
              >
                Birim Ekle
              </Button>
            </Box>

            <TableContainer
              component={Paper}
              variant="outlined"
              sx={{ borderRadius: 2, overflow: 'hidden', borderColor: 'var(--border)', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
            >
              <Table size="small">
                <TableHead sx={{ bgcolor: 'linear-gradient(135deg, var(--primary) 0%, #8b5cf6 100%)' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, py: 2, color: 'white' }}>Birim Adı *</TableCell>
                    <TableCell sx={{ fontWeight: 700, py: 2, color: 'white' }}>GİB Kodu *</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, py: 2, color: 'white' }}>Katsayı</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, py: 2, color: 'white' }}>Ana</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, py: 2, color: 'white' }}>Ondalık</TableCell>
                    <TableCell width="50" />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {units.map((unit, idx) => (
                    <TableRow
                      key={idx}
                      sx={{
                        background: unit.isBaseUnit
                          ? 'linear-gradient(90deg, color-mix(in srgb, var(--primary) 8%, transparent) 0%, transparent 100%)'
                          : 'transparent',
                        '&:hover': {
                          background: unit.isBaseUnit
                            ? 'linear-gradient(90deg, color-mix(in srgb, var(--primary) 12%, transparent) 0%, transparent 100%)'
                            : 'var(--muted)',
                        },
                      }}
                    >
                      <TableCell>
                        <TextField
                          size="small"
                          fullWidth
                          value={unit.name}
                          onChange={(e) => updateUnit(idx, 'name', e.target.value)}
                          placeholder="Ad"
                          error={!!validationError && !unit.name.trim()}
                        />
                      </TableCell>
                      <TableCell>
                        <Select
                          size="small"
                          fullWidth
                          value={unit.code ?? ''}
                          onChange={(e) => updateUnit(idx, 'code', e.target.value as string)}
                          error={!!validationError && !unit.code}
                        >
                          {GIB_BIRIM_KODLARI.map((c) => (
                            <MenuItem key={c.kod} value={c.kod}>
                              {c.kod} - {c.ad}
                            </MenuItem>
                          ))}
                        </Select>
                      </TableCell>
                      <TableCell align="right">
                        <TextField
                          type="number"
                          size="small"
                          value={unit.conversionRate}
                          onChange={(e) => updateUnit(idx, 'conversionRate', parseFloat(e.target.value) || 0)}
                          disabled={unit.isBaseUnit}
                          sx={{ width: 80 }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={() => updateUnit(idx, 'isBaseUnit', !unit.isBaseUnit)}
                          color={unit.isBaseUnit ? 'primary' : 'default'}
                        >
                          {unit.isBaseUnit ? <CheckCircle /> : <RadioButtonUnchecked />}
                        </IconButton>
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={() => updateUnit(idx, 'isDivisible', !unit.isDivisible)}
                          color={unit.isDivisible ? 'info' : 'default'}
                        >
                          {unit.isDivisible ? <ToggleOn /> : <ToggleOff />}
                        </IconButton>
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => removeUnit(idx)}
                          disabled={units.length === 1}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {baseUnit && (
              <Alert
                severity="info"
                sx={{
                  mt: 2,
                  borderRadius: 2,
                  fontWeight: 500,
                  '& .MuiAlert-message': { py: 0.75 },
                }}
              >
                Tüm çevrim hesaplamaları ana birim <strong>"{baseUnit.name}"</strong> (katsayı: 1) üzerinden yapılır.
              </Alert>
            )}
          </Grid>
        </Grid>

        {validationError && (
          <Alert severity="error" sx={{ mt: 3, borderRadius: 2, fontWeight: 500 }}>
            {validationError}
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 3, bgcolor: 'var(--muted)', gap: 1.5 }}>
        <Button
          onClick={onClose}
          disabled={saving}
          sx={{
            borderRadius: 2,
            fontWeight: 600,
            px: 3,
            color: 'text.secondary',
            '&:hover': { bgcolor: 'var(--border)' },
          }}
        >
          İptal
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={saving || !formData.name || units.length === 0}
          startIcon={saving ? <CircularProgress size={18} /> : <Save />}
          sx={{
            borderRadius: 2,
            fontWeight: 700,
            px: 3,
            background: 'linear-gradient(135deg, var(--primary) 0%, #8b5cf6 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
              boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
            },
            '&:disabled': {
              background: 'var(--muted)',
            },
          }}
        >
          {saving ? 'Kaydediliyor...' : editingSet ? 'Güncelle' : 'Oluştur'}
        </Button>
      </DialogActions>
      <Box sx={{
        background: 'var(--muted)',
        px: 3,
        py: 2,
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        borderTop: '1px solid var(--border)',
      }}>
        <Info sx={{ fontSize: 18, color: 'var(--primary)' }} />
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          Ana birim katsayısı her zaman 1'dir. Diğer birimler ana birime göre hesaplanır.
        </Typography>
      </Box>
    </Dialog>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function BirimSetleriPage() {
  const [unitSets, setUnitSets] = useState<UnitSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSet, setEditingSet] = useState<UnitSet | null>(null);

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

  useEffect(() => {
    fetchUnitSets();
  }, [fetchUnitSets]);

  const filteredSets = unitSets.filter((s) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      return s.name.toLowerCase().includes(q) || s.units.some((u) => u.name.toLowerCase().includes(q));
    }
    return true;
  });

  const systemCount = unitSets.filter((s) => s.isSystem).length;
  const tenantCount = unitSets.filter((s) => !s.isSystem).length;

  const handleSaved = () => {
    setDialogOpen(false);
    setEditingSet(null);
    setSnackbar({
      open: true,
      message: editingSet ? 'Birim seti güncellendi.' : 'Yeni birim seti oluşturuldu.',
      severity: 'success',
    });
    fetchUnitSets();
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`"${name}" birim setini silmek istediğinizden emin misiniz?`)) return;
    try {
      await axios.delete(`/unit-sets/${id}`);
      setSnackbar({ open: true, message: 'Birim seti silindi.', severity: 'success' });
      fetchUnitSets();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Silme işlemi başarısız.');
    }
  };

  return (
    <StandardPage
      title="Birim Setleri"
      subtitle="Ürünler için ölçü birimlerini ve dönüşüm oranlarını yönetin"
      headerActions={
        <Stack direction="row" spacing={1.5}>
          <Tooltip title="Yenile">
            <IconButton
              onClick={fetchUnitSets}
              disabled={loading}
              sx={{
                width: 40,
                height: 40,
                bgcolor: 'var(--muted)',
                border: '1px solid',
                borderColor: 'var(--border)',
                borderRadius: 2,
                '&:hover': {
                  bgcolor: 'var(--secondary)',
                  borderColor: 'var(--primary)',
                },
              }}
            >
              {loading ? <CircularProgress size={20} /> : <Refresh fontSize="small" />}
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => {
              setEditingSet(null);
              setDialogOpen(true);
            }}
            sx={{
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              color: 'white',
              borderRadius: 2,
              px: 3,
              fontWeight: 700,
              textTransform: 'none',
              boxShadow: '0 4px 16px rgba(99, 102, 241, 0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                boxShadow: '0 6px 20px rgba(99, 102, 241, 0.4)',
                transform: 'translateY(-1px)',
              },
              transition: 'all 0.2s ease',
            }}
          >
            Yeni Birim Seti
          </Button>
        </Stack>
      }
    >
      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <StatsCard
            title="Toplam"
            value={unitSets.length}
            icon={<Scale />}
            color="white"
            bgColor="rgba(255,255,255,0.2)"
            gradient="linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <StatsCard
            title="Sistem"
            value={systemCount}
            icon={<Lock />}
            color="white"
            bgColor="rgba(255,255,255,0.2)"
            gradient="linear-gradient(135deg, #64748b 0%, #475569 100%)"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <StatsCard
            title="Özel"
            value={tenantCount}
            icon={<Business />}
            color="white"
            bgColor="rgba(255,255,255,0.2)"
            gradient="linear-gradient(135deg, #10b981 0%, #059669 100%)"
          />
        </Grid>
      </Grid>

      {/* Search Bar */}
      <Paper
        variant="outlined"
        sx={{
          mb: 3,
          p: 2,
          borderRadius: 2,
          borderColor: 'var(--border)',
          background: 'linear-gradient(135deg, var(--muted) 0%, rgba(99, 102, 241, 0.03) 100%)',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Search sx={{ color: 'text.disabled', fontSize: 20 }} />
        <TextField
          fullWidth
          placeholder="Birim seti veya birim ara..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          InputProps={{
            disableUnderline: true,
            sx: { bgcolor: 'transparent', '& input': { py: 0.5 } },
          }}
          variant="standard"
        />
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 16 }}>
          <CircularProgress size={48} sx={{ color: 'var(--primary)' }} />
        </Box>
      ) : filteredSets.length === 0 ? (
        <Card
          elevation={0}
          sx={{
            py: 12,
            textAlign: 'center',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'var(--border)',
          }}
        >
          <AutoAwesome sx={{ fontSize: 80, color: 'text.disabled', mb: 3, opacity: 0.3 }} />
          <Typography variant="h6" color="text.secondary">
            {search ? 'Arama sonucu bulunamadı' : 'Kayıtlı birim seti bulunmuyor'}
          </Typography>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {filteredSets.map((unitSet) => (
            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={unitSet.id}>
              <UnitSetCard unitSet={unitSet} onEdit={(u) => { setEditingSet(u); setDialogOpen(true); }} onDelete={handleDelete} />
            </Grid>
          ))}
        </Grid>
      )}

      <UnitSetDialog open={dialogOpen} editingSet={editingSet} onClose={() => { setDialogOpen(false); setEditingSet(null); }} onSaved={handleSaved} />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
      >
        <Alert severity={snackbar.severity} sx={{ borderRadius: 2, fontWeight: 500 }}>{snackbar.message}</Alert>
      </Snackbar>
    </StandardPage>
  );
}
