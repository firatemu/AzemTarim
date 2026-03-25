'use client';

import { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Paper,
  Chip,
  Stack,
  Divider,
  Collapse,
  IconButton,
  Grid,
} from '@mui/material';
import {
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
  FilterList as FilterListIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { ProductCard } from '@/components/ProductCard';
import { AdvertisementCarousel } from '@/components/AdvertisementCarousel';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useDebounce } from '@/hooks/use-debounce';

type Product = {
  id: string;
  name: string;
  stockCode: string;
  brand?: string;
  category?: string;
  listPrice: number;
  finalPrice: number;
  imageUrl?: string;
  minOrderQuantity: number;
  isAvailable: boolean;
};

type FilterGroup = {
  id: string;
  label: string;
  options: Array<{ id: string; label: string; count: number }>;
  selected: string[];
};

export default function CatalogPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 500);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [availabilityOnly, setAvailabilityOnly] = useState(false);
  const [expandedFilters, setExpandedFilters] = useState(true);

  // Fetch products
  const { data: products = [], isLoading, refetch } = useQuery({
    queryKey: ['b2b-catalog', { debouncedSearch, selectedBrands, selectedCategories, availabilityOnly }],
    queryFn: async () => {
      const params: any = { limit: 100 };
      if (debouncedSearch) params.search = debouncedSearch;
      if (selectedBrands.length > 0) params.brands = selectedBrands.join(',');
      if (selectedCategories.length > 0) params.categories = selectedCategories.join(',');
      if (availabilityOnly) params.availability = true;

      const res = await axios.get<{ data: Product[] }>('/b2b/catalog/products', { params });
      return res.data.data || [];
    },
  });

  // Fetch filters
  const { data: filters } = useQuery({
    queryKey: ['b2b-catalog-filters'],
    queryFn: async () => {
      const res = await axios.get('/b2b/catalog/filters');
      return res.data;
    },
  });

  const brandFilters: FilterGroup = {
    id: 'brands',
    label: 'Markalar',
    options: filters?.brands || [],
    selected: selectedBrands,
  };

  const categoryFilters: FilterGroup = {
    id: 'categories',
    label: 'Kategoriler',
    options: filters?.categories || [],
    selected: selectedCategories,
  };

  const handleBrandToggle = (brandId: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brandId)
        ? prev.filter((id) => id !== brandId)
        : [...prev, brandId]
    );
  };

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleClearFilters = () => {
    setSearch('');
    setSelectedBrands([]);
    setSelectedCategories([]);
    setAvailabilityOnly(false);
  };

  const hasActiveFilters = search || selectedBrands.length > 0 || selectedCategories.length > 0 || availabilityOnly;

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Advertisements */}
      <AdvertisementCarousel location="homepage" />

      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Ürün Katalogu
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            id="b2b-catalog-search"
            placeholder="Ürün, stok kodu ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
            sx={{ minWidth: 280, maxWidth: 400 }}
          />
          <Button
            variant="outlined"
            startIcon={<FilterListIcon />}
            onClick={() => setExpandedFilters(!expandedFilters)}
            sx={{ display: { xs: 'none', md: 'flex' } }}
          >
            Filtreler {hasActiveFilters && `(${(selectedBrands.length + selectedCategories.length + (availabilityOnly ? 1 : 0))})`}
          </Button>
          {hasActiveFilters && (
            <Button
              size="small"
              startIcon={<ClearIcon />}
              onClick={handleClearFilters}
            >
              Filtreleri Temizle
            </Button>
          )}
        </Box>
      </Box>

      {/* Content */}
      <Grid container spacing={3}>
        {/* Sidebar Filters */}
        <Grid size={{ xs: 12, md: 3 }}>
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              display: { xs: expandedFilters ? 'block' : 'none', md: 'block' },
            }}
          >
            {/* Mobile Filter Toggle */}
            <Box
              sx={{
                display: { xs: 'flex', md: 'none' },
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2,
              }}
            >
              <Typography variant="h6">Filtreler</Typography>
              <IconButton size="small" onClick={() => setExpandedFilters(!expandedFilters)}>
                {expandedFilters ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Box>

            <Collapse in={expandedFilters}>
              {/* Availability Filter */}
              <Box sx={{ mb: 3 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={availabilityOnly}
                      onChange={(e) => setAvailabilityOnly(e.target.checked)}
                    />
                  }
                  label="Sadece Stoktakiler"
                />
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Brand Filter */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                  Markalar
                </Typography>
                <FormGroup>
                  {brandFilters.options.map((option) => (
                    <FormControlLabel
                      key={option.id}
                      control={
                        <Checkbox
                          checked={selectedBrands.includes(option.id)}
                          onChange={() => handleBrandToggle(option.id)}
                          size="small"
                        />
                      }
                      label={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', pr: 1 }}>
                          <Typography variant="body2">{option.label}</Typography>
                          <Chip label={option.count} size="small" sx={{ height: 18 }} />
                        </Box>
                      }
                    />
                  ))}
                </FormGroup>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Category Filter */}
              <Box>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                  Kategoriler
                </Typography>
                <FormGroup>
                  {categoryFilters.options.map((option) => (
                    <FormControlLabel
                      key={option.id}
                      control={
                        <Checkbox
                          checked={selectedCategories.includes(option.id)}
                          onChange={() => handleCategoryToggle(option.id)}
                          size="small"
                        />
                      }
                      label={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', pr: 1 }}>
                          <Typography variant="body2">{option.label}</Typography>
                          <Chip label={option.count} size="small" sx={{ height: 18 }} />
                        </Box>
                      }
                    />
                  ))}
                </FormGroup>
              </Box>
            </Collapse>
          </Paper>
        </Grid>

        {/* Product Grid */}
        <Grid size={{ xs: 12, md: 9 }}>
          {isLoading ? (
            <Box display="flex" justifyContent="center" py={8}>
              Yükleniyor...
            </Box>
          ) : products.length === 0 ? (
            <Paper
              variant="outlined"
              sx={{
                p: 6,
                textAlign: 'center',
              }}
            >
              <Typography variant="h6" color="textSecondary" gutterBottom>
                Ürün bulunamadı
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Filtrelerinizi değiştirerek tekrar deneyin
              </Typography>
              <Button
                variant="outlined"
                onClick={handleClearFilters}
                sx={{ mt: 2 }}
              >
                Filtreleri Temizle
              </Button>
            </Paper>
          ) : (
            <>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                {products.length} ürün bulundu
              </Typography>
              <Grid container spacing={2}>
                {products.map((product) => (
                  <Grid size={{ xs: 6, sm: 4, md: 4 }} key={product.id}>
                    <ProductCard
                      {...product}
                      showAddButton={true}
                    />
                  </Grid>
                ))}
              </Grid>
            </>
          )}
        </Grid>
      </Grid>
    </Container>
  );
}
