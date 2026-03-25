'use client';

import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    List,
    ListItemButton,
    ListItemText,
    Divider
} from '@mui/material';
import { usePosStore } from '@/stores/posStore';

export default function VariantDialog() {
    const {
        variantDialogOpen,
        setVariantDialogOpen,
        selectedProductForVariant,
        addToCart
    } = usePosStore();

    if (!selectedProductForVariant) return null;

    const handleVariantSelect = (variant: any) => {
        addToCart({
            productId: (selectedProductForVariant as any).id,
            name: (selectedProductForVariant as any).name,
            quantity: 1,
            unitPrice: parseFloat(variant.salePrice || variant.satisFiyati || (selectedProductForVariant as any).salePrice || 0),
            vatRate: (selectedProductForVariant as any).vatRate || 20,
            variantId: variant.id,
            variantName: variant.name || variant.title
        });
        setVariantDialogOpen(false);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY',
        }).format(amount);
    };

    return (
        <Dialog
            open={variantDialogOpen}
            onClose={() => setVariantDialogOpen(false)}
            fullWidth
            maxWidth="xs"
            PaperProps={{
                sx: {
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: 'var(--shadow-2xl)',
                    overflow: 'hidden'
                }
            }}
        >
            <DialogTitle sx={{
                bgcolor: 'var(--accent)',
                color: 'white',
                fontWeight: 900,
                textAlign: 'center',
                py: 3
            }}>
                Varyant Seçimi
                <Typography variant="body2" sx={{ opacity: 0.8, mt: 0.5, fontWeight: 600 }}>
                    {(selectedProductForVariant as any).name}
                </Typography>
            </DialogTitle>

            <DialogContent sx={{ p: 0 }}>
                <List sx={{ pt: 1, pb: 2 }}>
                    {((selectedProductForVariant as any).productVariants || []).map((variant: any, index: number) => (
                        <React.Fragment key={variant.id}>
                            <ListItemButton
                                onClick={() => handleVariantSelect(variant)}
                                sx={{
                                    py: 2,
                                    px: 3,
                                    '&:hover': {
                                        bgcolor: 'color-mix(in srgb, var(--primary) 5%, transparent)',
                                        '& .variant-price': { color: 'var(--primary)' }
                                    }
                                }}
                            >
                                <ListItemText
                                    primary={
                                        <Typography sx={{ fontWeight: 800, color: 'var(--text)' }}>
                                            {variant.name || variant.title || `Seçenek ${index + 1}`}
                                        </Typography>
                                    }
                                    secondary={
                                        variant.sku ? <Typography variant="caption" sx={{ fontWeight: 600 }}>SKU: {variant.sku}</Typography> : null
                                    }
                                />
                                <Typography
                                    className="variant-price"
                                    sx={{
                                        fontWeight: 900,
                                        color: 'var(--muted-foreground)',
                                        transition: 'all 0.2s',
                                        fontSize: '1.1rem'
                                    }}
                                >
                                    {formatCurrency(parseFloat(variant.salePrice || variant.satisFiyati || (selectedProductForVariant as any).salePrice || 0))}
                                </Typography>
                            </ListItemButton>
                            {index < (selectedProductForVariant as any).productVariants.length - 1 && <Divider />}
                        </React.Fragment>
                    ))}
                </List>
            </DialogContent>

            <DialogActions sx={{ p: 2, bgcolor: 'var(--background)' }}>
                <Button
                    fullWidth
                    onClick={() => setVariantDialogOpen(false)}
                    sx={{
                        fontWeight: 800,
                        color: 'var(--muted-foreground)',
                        '&:hover': { bgcolor: 'color-mix(in srgb, var(--text) 6%, transparent)' }
                    }}
                >
                    İptal
                </Button>
            </DialogActions>
        </Dialog>
    );
}
