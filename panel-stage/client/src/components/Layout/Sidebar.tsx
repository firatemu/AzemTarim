'use client';

import { useAuthStore } from '@/stores/authStore';
import { useTabStore } from '@/stores/tabStore';
import {
  AccountBalance,
  AccountBalanceWallet,
  Assessment,
  Assignment,
  AttachMoney,
  Badge,
  Build,
  CalendarMonth,
  Close,
  CloudUpload,
  CloudDownload,
  Dashboard,
  Delete,
  Description,
  DirectionsCar,
  Engineering,
  ExpandLess,
  ExpandMore,
  Inventory,
  LocalShipping,
  Logout,
  Notifications,
  Payment,
  People,
  PointOfSale,
  PushPin,
  Receipt,
  ReceiptLong,
  Search,
  Settings,
  ShoppingCart,
  TrendingDown,
  TrendingUp,
  Tv,
  Warehouse,
} from '@mui/icons-material';
import {
  Box,
  Collapse,
  Divider,
  Drawer,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  TextField,
  Toolbar,
  Typography,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import React, { useEffect, useMemo, useState } from 'react';

export const SIDEBAR_WIDTH = 280;

const palette = {
  gradient: 'radial-gradient(circle at -10% 0%, #3a4b7f 0%, #1c2641 48%, #11182b 100%)',
  headerGradient: 'linear-gradient(135deg, #445893 0%, #2c3a63 55%, #1b2541 100%)',
  textPrimary: '#eef2ff',
  textSecondary: 'rgba(226, 232, 255, 0.65)',
  iconBg: 'rgba(255,255,255,0.15)',
  iconBgActive: 'rgba(255,255,255,0.25)',
  itemHover: 'rgba(255,255,255,0.08)',
  itemBorder: 'rgba(255,255,255,0.08)',
  itemSelectedBorder: 'rgba(140,168,255,0.5)',
  itemSelectedBg: 'linear-gradient(135deg, #5d73f5 0%, #465bd4 55%, #2f3f8f 100%)',
  submenuBg: 'linear-gradient(145deg, rgba(80,96,161,0.58) 0%, rgba(35,46,86,0.85) 100%)',
  submenuBorder: 'rgba(132,159,255,0.32)',
  searchBg: 'rgba(10,18,33,0.65)',
  searchBorder: 'rgba(140,168,255,0.4)',
};

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Dashboard, path: '/dashboard', color: '#667eea', bgColor: '#f0f4ff' },
  {
    id: 'stok',
    label: 'Stok Yönetimi',
    icon: Inventory,
    color: '#06b6d4',
    bgColor: '#ecfeff',
    subItems: [
      { id: 'stok-malzeme-listesi', label: 'Malzeme Listesi', icon: Inventory, path: '/stok/malzeme-listesi', color: '#06b6d4' },
      { id: 'stok-malzeme-hareketleri', label: 'Malzeme Hareketleri', icon: Assessment, path: '/stok/malzeme-hareketleri', color: '#06b6d4' },
      { id: 'stok-urun-eslestirme', label: 'Ürün Eşleştirme', icon: Settings, path: '/stok/urun-eslestirme', color: '#8b5cf6' },
      { id: 'stok-kategori-yonetimi', label: 'Kategori Yönetimi', icon: Assessment, path: '/stok/kategori-yonetimi', color: '#06b6d4' },
      { id: 'stok-marka-yonetimi', label: 'Marka Yönetimi', icon: DirectionsCar, path: '/stok/marka-yonetimi', color: '#06b6d4' },
      { id: 'arac-yonetimi', label: 'Araç Yönetimi', icon: DirectionsCar, path: '/arac', color: '#10b981' },
      { id: 'stok-birim-setleri', label: 'Birim Setleri Yönetimi', icon: Settings, path: '/stok/birim-setleri', color: '#06b6d4' },
      { id: 'stok-satis-fiyatlari', label: 'Satış Fiyatları', icon: AttachMoney, path: '/stok/satis-fiyatlari', color: '#ef4444' },
      { id: 'stok-alis-fiyatlari', label: 'Satın Alma Fiyatları', icon: AttachMoney, path: '/stok/satin-alma-fiyatlari', color: '#0ea5e9' },
      { id: 'stok-toplu-satis-guncelle', label: 'Toplu Satış Fiyat Güncelleme', icon: AttachMoney, path: '/stok/toplu-satis-fiyat-guncelle', color: '#22c55e' },
      { id: 'stok-maliyet', label: 'Maliyetlendirme', icon: AttachMoney, path: '/stok/maliyet', color: '#9333ea' },
    ],
  },
  {
    id: 'cari',
    label: 'Cari Yönetimi',
    icon: People,
    color: '#8b5cf6',
    bgColor: '#f5f3ff',
    subItems: [
      { id: 'cari-liste', label: 'Cari Listesi', icon: People, path: '/cari', color: '#8b5cf6' },
      { id: 'cari-fatura-kapatma', label: 'Fatura Kapatma & Ekstre', icon: AccountBalance, path: '/cari/fatura-kapatma', color: '#0891b2' },
      { id: 'cari-vade-analiz', label: 'Vade Analizi', icon: CalendarMonth, path: '/vade-analiz', color: '#667eea' },
    ],
  },
  {
    id: 'fatura',
    label: 'Fatura',
    icon: Receipt,
    color: '#ec4899',
    bgColor: '#fdf2f8',
    subItems: [
      { id: 'fatura-satis', label: 'Satış Faturaları', icon: PointOfSale, path: '/fatura/satis', color: '#8b5cf6' },
      { id: 'fatura-alis', label: 'Satın Alma Faturaları', icon: ShoppingCart, path: '/fatura/alis', color: '#f59e0b' },
      { id: 'fatura-iade-satis', label: 'Satış İade Faturaları', icon: TrendingDown, path: '/fatura/iade/satis', color: '#ef4444' },
      { id: 'fatura-iade-alis', label: 'Satınalma İade Faturaları', icon: TrendingUp, path: '/fatura/iade/alis', color: '#06b6d4' },
      { id: 'fatura-arsiv', label: 'Fatura Arşivi', icon: Assessment, path: '/fatura/arsiv', color: '#ef4444' },
      { id: 'fatura-gelen-efatura', label: 'Gelen E-Faturalar', icon: CloudDownload, path: '/efatura/gelen', color: '#0ea5e9' },
    ],
  },
  {
    id: 'servis',
    label: 'Servis Yönetimi',
    icon: Build,
    color: '#ef4444',
    bgColor: '#fef2f2',
    subItems: [
      { id: 'servis-is-emirleri', label: 'İş Emirleri', icon: Assignment, path: '/servis/is-emirleri', color: '#ef4444' },
      { id: 'servis-atolye-panosu', label: 'Atölye Panosu', icon: Dashboard, path: '/servis/atolye-panosu', color: '#f59e0b' },
      { id: 'servis-araclar', label: 'Araçlar', icon: DirectionsCar, path: '/servis/araclar', color: '#3b82f6' },
      { id: 'servis-teknisyenler', label: 'Teknisyenler', icon: Engineering, path: '/servis/teknisyenler', color: '#8b5cf6' },
      { id: 'servis-bakim-hatirlatmalari', label: 'Bakım Hatırlatmaları', icon: Notifications, path: '/servis/bakim-hatirlatmalari', color: '#10b981' },
      { id: 'servis-bekleme-salonu', label: 'Bekleme Salonu', icon: Tv, path: '/bekleme-salonu', color: '#0891b2' },
    ],
  },
  {
    id: 'teklif',
    label: 'Teklif',
    icon: Description,
    color: '#f59e0b',
    bgColor: '#fffbeb',
    subItems: [
      { id: 'teklif-satis', label: 'Satış Teklifleri', icon: PointOfSale, path: '/teklif/satis', color: '#f59e0b' },
      { id: 'teklif-satin-alma', label: 'Satın Alma Teklifleri', icon: ShoppingCart, path: '/teklif/satin-alma', color: '#10b981' },
    ],
  },
  {
    id: 'siparis',
    label: 'Sipariş',
    icon: ShoppingCart,
    color: '#0891b2',
    bgColor: '#ecfeff',
    subItems: [
      { id: 'siparis-satis', label: 'Satış Siparişleri', icon: PointOfSale, path: '/siparis/satis', color: '#0891b2' },
      { id: 'siparis-satin-alma', label: 'Satın Alma Siparişleri', icon: ShoppingCart, path: '/siparis/satin-alma', color: '#06b6d4' },
    ],
  },
  {
    id: 'satis-irsaliyesi',
    label: 'Satış İrsaliyesi',
    icon: LocalShipping,
    color: '#8b5cf6',
    bgColor: '#f5f3ff',
    subItems: [
      { id: 'satis-irsaliyesi-liste', label: 'Satış İrsaliyeleri', icon: ReceiptLong, path: '/satis-irsaliyesi', color: '#8b5cf6' },
    ],
  },
  {
    id: 'satin-alma-irsaliyesi',
    label: 'Satın Alma İrsaliyesi',
    icon: LocalShipping,
    color: '#06b6d4',
    bgColor: '#ecfeff',
    subItems: [
      { id: 'satin-alma-irsaliyesi-liste', label: 'Satın Alma İrsaliyeleri', icon: ReceiptLong, path: '/satin-alma-irsaliyesi', color: '#06b6d4' },
    ],
  },
  { id: 'tahsilat', label: 'Tahsilat & Ödeme', icon: Payment, path: '/tahsilat', color: '#10b981', bgColor: '#ecfdf5' },
  { id: 'kasa', label: 'Kasa', icon: AccountBalance, path: '/kasa', color: '#f59e0b', bgColor: '#fffbeb' },
  {
    id: 'banka',
    label: 'Banka İşlemleri',
    icon: AccountBalanceWallet,
    color: '#0891b2',
    bgColor: '#ecfeff',
    subItems: [
      { id: 'banka-gelen-havale', label: 'Gelen Havale', icon: TrendingUp, path: '/banka-havale/gelen', color: '#10b981' },
      { id: 'banka-giden-havale', label: 'Giden Havale', icon: TrendingDown, path: '/banka-havale/giden', color: '#ef4444' },
      { id: 'banka-silinen', label: 'Silinen Kayıtlar', icon: Delete, path: '/banka-havale/silinen', color: '#6b7280' },
    ],
  },
  {
    id: 'bordro',
    label: 'Bordro (Çek/Senet)',
    icon: Assignment,
    color: '#7c3aed',
    bgColor: '#faf5ff',
    subItems: [
      { id: 'bordro-cek', label: 'Çek Yönetimi', icon: Payment, path: '/bordro/cek', color: '#7c3aed' },
      { id: 'bordro-senet', label: 'Senet Yönetimi', icon: Description, path: '/bordro/senet', color: '#6366f1' },
      { id: 'cek-senet-kasasi', label: 'Çek/Senet Kasası', icon: AccountBalanceWallet, path: '/cek-senet-kasasi', color: '#f59e0b' },
      { id: 'bordro-takvim', label: 'Vade Takvimi', icon: CalendarMonth, path: '/bordro/vade-takvim', color: '#f59e0b' },
      { id: 'bordro-silinen', label: 'Silinen Kayıtlar', icon: Delete, path: '/bordro/silinen', color: '#6b7280' },
    ],
  },
  {
    id: 'ik',
    label: 'İnsan Kaynakları',
    icon: Badge,
    path: '/ik/personel',
    color: '#d946ef',
    bgColor: '#fdf4ff',
  },
  {
    id: 'depo',
    label: 'Depo/Raf Yönetimi',
    icon: Warehouse,
    color: '#3b82f6',
    bgColor: '#eff6ff',
    subItems: [
      { id: 'depo-depolar', label: 'Depo Yönetimi', icon: Warehouse, path: '/depo/depolar', color: '#6366f1' },
      { id: 'depo-put-away', label: 'Put-Away İşlemi', icon: TrendingUp, path: '/depo/islemler/put-away', color: '#10b981' },
      { id: 'depo-transfer', label: 'Transfer İşlemi', icon: TrendingDown, path: '/depo/islemler/transfer', color: '#f59e0b' },
      { id: 'depo-siparis-hazirlama', label: 'Sipariş Hazırlama', icon: Assignment, path: '/siparis/hazirlama-listesi', color: '#f59e0b' },
      { id: 'depo-sayim', label: 'Stok Sayım', icon: Inventory, path: '/sayim', color: '#14b8a6' },
      { id: 'depo-raporlar', label: 'Depo Raporları', icon: Assessment, path: '/depo/raporlar', color: '#14b8a6' },
    ],
  },
  { id: 'masraf', label: 'Masraf', icon: AttachMoney, path: '/masraf', color: '#ef4444', bgColor: '#fef2f2' },
  { id: 'raporlama', label: 'Raporlama', icon: Assessment, path: '/raporlama', color: '#14b8a6', bgColor: '#f0fdfa' },
  {
    id: 'veri-aktarim',
    label: 'Veri Aktarımı',
    icon: CloudUpload,
    color: '#8b5cf6',
    bgColor: '#f5f3ff',
    subItems: [
      { id: 'veri-aktarim-cari-hesap', label: 'Cari Hesap Aktarımı', icon: People, path: '/veri-aktarim/cari-hesap-aktarim', color: '#8b5cf6' },
      { id: 'veri-aktarim-malzeme', label: 'Malzeme Aktarımı', icon: Inventory, path: '/veri-aktarim/malzeme-aktarim', color: '#06b6d4' },
      { id: 'veri-aktarim-satis-fiyat', label: 'Satış Fiyat Aktarımı', icon: AttachMoney, path: '/veri-aktarim/satis-fiyat-aktarim', color: '#ef4444' },
      { id: 'veri-aktarim-satin-alma-fiyat', label: 'Satın Alma Fiyat Aktarımı', icon: AttachMoney, path: '/veri-aktarim/satin-alma-fiyat-aktarim', color: '#0ea5e9' },
    ],
  },
  {
    id: 'ayarlar',
    label: 'Ayarlar',
    icon: Settings,
    color: '#6b7280',
    bgColor: '#f9fafb',
    subItems: [
      { id: 'ayarlar-numara-sablonlari', label: 'Numara Şablonları', icon: Settings, path: '/ayarlar/numara-sablonlari', color: '#6b7280' },
    ],
  },
];

interface SidebarProps {
  open: boolean;
  pinned: boolean;
  onClose: () => void;
  onTogglePin: () => void;
}

export default function Sidebar({ open, pinned, onClose, onTogglePin }: SidebarProps) {
  const { addTab, setActiveTab, activeTab } = useTabStore();
  const { user } = useAuthStore();
  const router = useRouter();
  const [openSubMenu, setOpenSubMenu] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleMenuClick = (item: any) => {
    if (item.subItems) {
      setOpenSubMenu((current) => (current === item.id ? null : item.id));
      return;
    }

    addTab({
      id: item.id,
      label: item.label,
      path: item.path,
    });
    setActiveTab(item.id);
    router.push(item.path);
    if (!pinned) {
      onClose();
    }
  };

  const handleSubMenuClick = (_parentItem: any, subItem: any) => {
    addTab({
      id: subItem.id,
      label: subItem.label,
      path: subItem.path,
    });
    setActiveTab(subItem.id);
    router.push(subItem.path);
    if (!pinned) {
      onClose();
    }
  };

  const filteredMenuItems = useMemo(() => {
    if (!searchTerm) return menuItems;

    const searchLower = searchTerm.toLowerCase();
    return menuItems.filter((item) => {
      if (item.label.toLowerCase().includes(searchLower)) {
        return true;
      }

      if (item.subItems) {
        return item.subItems.some((subItem: any) => subItem.label.toLowerCase().includes(searchLower));
      }

      return false;
    });
  }, [searchTerm]);

  useEffect(() => {
    if (!searchTerm) {
      return;
    }

    filteredMenuItems.forEach((item) => {
      if (item.subItems) {
        const hasMatchingSubItem = item.subItems.some((subItem: any) =>
          subItem.label.toLowerCase().includes(searchTerm.toLowerCase())
        );
        if (hasMatchingSubItem) {
          setOpenSubMenu(item.id);
        }
      }
    });
  }, [searchTerm, filteredMenuItems]);

  useEffect(() => {
    if (!open) {
      setOpenSubMenu(null);
      setSearchTerm('');
    }
  }, [open]);

  const drawerVariant = pinned ? 'permanent' : 'temporary';

  return (
    <Drawer
      anchor="left"
      variant={drawerVariant}
      open={pinned ? true : open}
      onClose={pinned ? undefined : onClose}
      ModalProps={pinned ? undefined : { keepMounted: true }}
      transitionDuration={pinned ? undefined : { enter: 250, exit: 200 }}
      sx={{
        '& .MuiDrawer-paper': {
          width: SIDEBAR_WIDTH,
          boxSizing: 'border-box',
          background: palette.gradient,
          color: palette.textPrimary,
          borderRight: 'none',
          position: pinned ? 'relative' : 'fixed',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      <Toolbar
        sx={{
          background: palette.headerGradient,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          py: 1.5,
          px: 2,
          boxShadow: 'inset 0 -1px 0 rgba(255,255,255,0.08)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 42,
              height: 42,
              borderRadius: 2,
              bgcolor: 'rgba(255,255,255,0.18)',
              boxShadow: '0 12px 24px rgba(13,18,32,0.45)',
            }}
          >
            <DirectionsCar sx={{ fontSize: 24, color: palette.textPrimary }} />
          </Box>
          <Box>
            <Typography variant="subtitle1" noWrap fontWeight="bold" sx={{ lineHeight: 1.2 }}>
              Yedek Parça
            </Typography>
            <Typography variant="caption" sx={{ color: palette.textSecondary, fontSize: '0.7rem' }}>
              Otomasyon v1.0
            </Typography>
          </Box>
        </Box>
        <IconButton
          onClick={pinned ? onTogglePin : onClose}
          size="small"
          sx={{
            color: palette.textPrimary,
            bgcolor: 'rgba(255,255,255,0.14)',
            '&:hover': {
              bgcolor: 'rgba(255,255,255,0.25)',
            },
          }}
        >
          {pinned ? (
            <PushPin sx={{ transform: 'rotate(45deg)' }} fontSize="small" />
          ) : (
            <Close fontSize="small" />
          )}
        </IconButton>
      </Toolbar>
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)' }} />

      <Box sx={{ px: 2, pt: 2 }}>
        <TextField
          size="small"
          fullWidth
          placeholder="Menüde ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ color: palette.textSecondary, fontSize: 20 }} />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              color: palette.textPrimary,
              bgcolor: palette.searchBg,
              '& fieldset': {
                borderColor: palette.searchBorder,
              },
              '&:hover fieldset': {
                borderColor: 'rgba(148,177,255,0.6)',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#a7baff',
                boxShadow: '0 0 0 2px rgba(113,135,230,0.35)',
              },
            },
            '& .MuiOutlinedInput-input': {
              fontSize: '0.875rem',
              '&::placeholder': {
                color: palette.textSecondary,
                opacity: 1,
              },
            },
          }}
        />
      </Box>

      <List sx={{ px: 1.5, pt: 1, flexGrow: 1, overflowY: 'auto' }}>
        {filteredMenuItems.length === 0 && searchTerm ? (
          <Box sx={{ px: 2, py: 3, textAlign: 'center' }}>
            <Typography variant="caption" sx={{ color: palette.textSecondary }}>
              "{searchTerm}" için sonuç bulunamadı
            </Typography>
          </Box>
        ) : (
          filteredMenuItems.map((item) => {
            const isActive = activeTab === item.id;
            const hasSubMenu = !!item.subItems;
            const isOpen = openSubMenu === item.id;

            return (
              <React.Fragment key={item.id}>
                <ListItem disablePadding sx={{ mb: 0.75 }}>
                  <ListItemButton
                    onClick={() => handleMenuClick(item)}
                    sx={{
                      borderRadius: 2.5,
                      mb: 0.4,
                      px: 1.5,
                      py: 1.05,
                      transition: 'all 0.22s ease-out',
                      background: isActive ? palette.itemSelectedBg : 'rgba(255,255,255,0.035)',
                      border: isActive ? `1px solid ${palette.itemSelectedBorder}` : `1px solid ${palette.itemBorder}`,
                      boxShadow: isActive ? '0 14px 24px rgba(38,53,102,0.35)' : 'none',
                      '&:hover': {
                        background: isActive ? palette.itemSelectedBg : palette.itemHover,
                        borderColor: palette.itemSelectedBorder,
                        transform: 'translateX(3px)',
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 44 }}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 34,
                          height: 34,
                          borderRadius: 2,
                          bgcolor: isActive ? palette.iconBgActive : palette.iconBg,
                          transition: 'all 0.22s ease-out',
                        }}
                      >
                        <item.icon sx={{ color: palette.textPrimary, fontSize: 21 }} />
                      </Box>
                    </ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      sx={{
                        '& .MuiListItemText-primary': {
                          fontWeight: isActive ? 600 : 500,
                          fontSize: '0.95rem',
                          color: isActive ? palette.textPrimary : palette.textSecondary,
                          letterSpacing: '0.01em',
                        },
                      }}
                    />
                    {hasSubMenu && (isOpen ? <ExpandLess sx={{ color: palette.textPrimary }} /> : <ExpandMore sx={{ color: palette.textPrimary }} />)}
                  </ListItemButton>
                </ListItem>

                {hasSubMenu && (
                  <Collapse in={isOpen} timeout={180} unmountOnExit>
                    <Box
                      sx={{
                        bgcolor: palette.submenuBg,
                        borderRadius: 2.5,
                        mx: 1,
                        mb: 1,
                        px: 1,
                        py: 1,
                        border: `1px solid ${palette.submenuBorder}`,
                        boxShadow: '0 12px 18px rgba(14,21,37,0.45)',
                      }}
                    >
                      <List component="div" disablePadding>
                        {item.subItems
                          ?.filter((subItem: any) =>
                            !searchTerm || subItem.label.toLowerCase().includes(searchTerm.toLowerCase())
                          )
                          .map((subItem: any) => {
                            const isSubActive = activeTab === subItem.id;

                            return (
                              <ListItem key={subItem.id} disablePadding sx={{ pl: 1 }}>
                                <ListItemButton
                                  onClick={() => handleSubMenuClick(item, subItem)}
                                  sx={{
                                    borderRadius: 1.75,
                                    mb: 0.35,
                                    py: 0.85,
                                    px: 1.15,
                                    transition: 'all 0.18s ease-out',
                                    bgcolor: isSubActive ? 'rgba(255,255,255,0.14)' : 'transparent',
                                    '&:hover': {
                                      bgcolor: 'rgba(255,255,255,0.18)',
                                      transform: 'translateX(4px)',
                                    },
                                  }}
                                >
                                  <ListItemIcon sx={{ minWidth: 34 }}>
                                    <Box
                                      sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: 26,
                                        height: 26,
                                        borderRadius: 1.5,
                                        bgcolor: isSubActive ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.12)',
                                      }}
                                    >
                                      <subItem.icon sx={{ color: palette.textPrimary, fontSize: 17 }} />
                                    </Box>
                                  </ListItemIcon>
                                  <ListItemText
                                    primary={subItem.label}
                                    sx={{
                                      '& .MuiListItemText-primary': {
                                        fontWeight: isSubActive ? 600 : 500,
                                        fontSize: '0.87rem',
                                        color: palette.textPrimary,
                                      },
                                    }}
                                  />
                                </ListItemButton>
                              </ListItem>
                            );
                          })}
                      </List>
                    </Box>
                  </Collapse>
                )}
              </React.Fragment>
            );
          })
        )}
      </List>

      <Box sx={{ px: 2.2, pb: 3 }}>
        <Box
          sx={{
            bgcolor: 'rgba(9,15,28,0.65)',
            borderRadius: 3,
            border: '1px solid rgba(129,154,224,0.28)',
            px: 2,
            py: 1.6,
            boxShadow: '0 16px 30px rgba(9,14,25,0.55)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1.5,
          }}
        >
          <Box>
            <Typography variant="body2" sx={{ color: palette.textPrimary, fontWeight: 600 }}>
              {user?.fullName || 'Kullanıcı'}
            </Typography>
            <Typography variant="caption" sx={{ color: palette.textSecondary }}>
              {user?.role || 'Rol bilgisi'}
            </Typography>
          </Box>
          <IconButton
            size="small"
            sx={{
              color: palette.textPrimary,
              border: '1px solid rgba(120,146,234,0.45)',
              bgcolor: 'rgba(92,118,222,0.22)',
              '&:hover': {
                bgcolor: 'rgba(92,118,222,0.35)',
              },
            }}
          >
            <Logout fontSize="small" />
          </IconButton>
        </Box>
      </Box>
    </Drawer>
  );
}
