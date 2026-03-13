'use client';

import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    IconButton,
    Tooltip,
    Typography,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { priceCardApi } from '@/services/api/priceCardApi';
import { IPriceCard, PriceCardStatus, PriceType } from '@/types/priceCard';
import { useSnackbar } from 'notistack';
import AddEditPriceCardModal from './AddEditPriceCardModal';
import { formatCurrency, formatDate } from '@/utils/formatters';

export default function PriceCardClient() {
    const { enqueueSnackbar } = useSnackbar();

    const [rows, setRows] = useState<IPriceCard[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [totalRows, setTotalRows] = useState(0);
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);

    // Modal State
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

    const fetchCards = async () => {
        setLoading(true);
        try {
            const response = await priceCardApi.getAll({ page: page + 1, limit: pageSize });
            setRows(response.data);
            setTotalRows(response.meta.total);
        } catch (error: any) {
            enqueueSnackbar('Fiyat kartları getirilirken hata oluştu: ' + error.message, { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCards();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, pageSize]);

    const handleDelete = async (id: string) => {
        if (!window.confirm('Bu fiyat kartını silmek istediğinize emin misiniz?')) return;
        try {
            setLoading(true);
            await priceCardApi.delete(id);
            enqueueSnackbar('Fiyat kartı başarıyla silindi', { variant: 'success' });
            fetchCards();
        } catch (error: any) {
            enqueueSnackbar('Silinirken hata oluştu: ' + error.message, { variant: 'error' });
            setLoading(false);
        }
    };

    const getStatusChip = (status: PriceCardStatus) => {
        const map = {
            [PriceCardStatus.ACTIVE]: { label: 'Aktif', color: 'success' },
            [PriceCardStatus.PASSIVE]: { label: 'Pasif', color: 'default' },
            [PriceCardStatus.EXPIRED]: { label: 'Süresi Doldu', color: 'error' },
        };
        const conf = map[status] || map[PriceCardStatus.PASSIVE];
        return <Chip label={conf.label} color={conf.color as any} size="small" variant="outlined" />;
    };

    const getTypeChip = (type: PriceType) => {
        const map = {
            [PriceType.SALE]: { label: 'Satış', color: 'primary' },
            [PriceType.PURCHASE]: { label: 'Alış', color: 'secondary' },
            [PriceType.CAMPAIGN]: { label: 'Kampanya', color: 'warning' },
            [PriceType.LIST]: { label: 'Liste(Referans)', color: 'info' },
        };
        const conf = map[type] || { label: 'Bilinmeyen', color: 'default' };
        return <Chip label={conf.label} color={conf.color as any} size="small" />;
    };

    const columns: GridColDef[] = [
        {
            field: 'product',
            headerName: 'Stok Kodu / Adı',
            flex: 1.5,
            minWidth: 200,
            renderCell: (params: GridRenderCellParams) => {
                const p = params.row.product;
                return (
                    <Box>
                        <Typography variant="body2" fontWeight="bold">{p?.code}</Typography>
                        <Typography variant="caption" color="text.secondary">{p?.name}</Typography>
                    </Box>
                );
            },
        },
        {
            field: 'priceType',
            headerName: 'Fiyat Tipi',
            width: 120,
            renderCell: (params) => getTypeChip(params.row.priceType),
        },
        {
            field: 'salePrice',
            headerName: 'Fiyat (Satış/Kampanya)',
            width: 160,
            renderCell: (params) => (
                <Typography variant="body2" fontWeight="medium" color="success.main">
                    {formatCurrency(Number(params.value || 0))} {params.row.currency}
                </Typography>
            ),
        },
        {
            field: 'effectiveFrom',
            headerName: 'Geçerlilik Başlangıç',
            width: 150,
            renderCell: (params) => (
                <Typography variant="body2">
                    {formatDate(params.value, 'DD.MM.YYYY HH:mm')}
                </Typography>
            ),
        },
        {
            field: 'effectiveTo',
            headerName: 'Bitiş Tarihi',
            width: 150,
            renderCell: (params) => {
                if (!params.value) return <Chip label="Süresiz" size="small" variant="outlined" />;
                return (
                    <Typography variant="body2" color="error.main">
                        {formatDate(params.value, 'DD.MM.YYYY HH:mm')}
                    </Typography>
                );
            },
        },
        {
            field: 'target',
            headerName: 'Hedef Kitle',
            width: 150,
            renderCell: (params) => {
                const { customerId, customerGroupId, priceListId } = params.row;
                if (customerId) return <Chip label="Müşteriye Özel" size="small" color="primary" variant="outlined" />;
                if (customerGroupId) return <Chip label="Grup İndirimi" size="small" color="secondary" variant="outlined" />;
                if (priceListId) return <Chip label="Fiyat Listesi" size="small" color="info" variant="outlined" />;
                return <Chip label="Genel Fiyat" size="small" color="default" />;
            },
        },
        {
            field: 'status',
            headerName: 'Durum',
            width: 130,
            renderCell: (params) => getStatusChip(params.row.status),
        },
        {
            field: 'actions',
            headerName: 'İşlemler',
            width: 120,
            sortable: false,
            align: 'right',
            renderCell: (params: GridRenderCellParams) => (
                <Box>
                    <Tooltip title="Düzenle">
                        <IconButton
                            size="small"
                            color="primary"
                            onClick={() => {
                                setSelectedCardId(params.row.id);
                                setModalOpen(true);
                            }}
                        >
                            <EditIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Sil">
                        <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(params.row.id)}
                        >
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Box>
            ),
        },
    ];

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Box>
                    <Typography variant="h4" fontWeight="bold">
                        Fiyat Kartları (Price Cards)
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Satış, Kampanya, Musteri veya Listeye Özel Fiyat Tanımları
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        variant="outlined"
                        onClick={fetchCards}
                        startIcon={<RefreshIcon />}
                    >
                        Yenile
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={() => {
                            setSelectedCardId(null);
                            setModalOpen(true);
                        }}
                    >
                        Yeni Fiyat Kartı
                    </Button>
                </Box>
            </Box>

            <Card elevation={3} sx={{ borderRadius: 2 }}>
                <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
                    <DataGrid
                        rows={rows}
                        columns={columns}
                        loading={loading}
                        rowCount={totalRows}
                        paginationModel={{ page, pageSize }}
                        onPaginationModelChange={(model) => {
                            setPage(model.page);
                            setPageSize(model.pageSize);
                        }}
                        pageSizeOptions={[10, 25, 50]}
                        paginationMode="server"
                        disableRowSelectionOnClick
                        autoHeight
                        sx={{
                            border: 'none',
                            '& .MuiDataGrid-cell': {
                                borderBottom: '1px solid #f0f0f0',
                            },
                            '& .MuiDataGrid-columnHeaders': {
                                backgroundColor: '#f8fafc',
                                borderBottom: '2px solid #e2e8f0',
                            },
                        }}
                    />
                </CardContent>
            </Card>

            {modalOpen && (
                <AddEditPriceCardModal
                    open={modalOpen}
                    cardId={selectedCardId}
                    onClose={() => setModalOpen(false)}
                    onSuccess={() => {
                        setModalOpen(false);
                        fetchCards();
                    }}
                />
            )}
        </Box>
    );
}
