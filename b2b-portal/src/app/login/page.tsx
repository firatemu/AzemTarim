'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  Alert,
  Box,
  Button,
  Container,
  Dialog,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  TextField,
  Typography,
  IconButton,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { useSnackbar } from 'notistack';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Close as CloseIcon } from '@mui/icons-material';
import { getClientB2bDomain } from '@/lib/b2b-domain';
import { b2bFetch } from '@/lib/b2b-fetch';

const schema = z.object({
  domain: z.string().min(1, 'Domain gerekli'),
  email: z.string().email(),
  password: z.string().min(1),
});

type Form = z.infer<typeof schema>;

type PopupAdvertisement = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  link?: string;
  location: 'LOGIN_POPUP';
  isActive: boolean;
};

export default function LoginPage() {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const [banner, setBanner] = useState<string | null>(null);
  const [popupAd, setPopupAd] = useState<PopupAdvertisement | null>(null);
  const host = typeof window !== 'undefined' ? window.location.hostname : '';
  const defaultDomain = host === 'localhost' || host === '127.0.0.1' ? '' : host;

  // Check for login popup on mount
  useEffect(() => {
    const checkPopup = async () => {
      // Check if already shown this session
      if (typeof window !== 'undefined') {
        const alreadyShown = sessionStorage.getItem('b2b_popup_shown');
        if (alreadyShown) return;
      }

      try {
        const r = await b2bFetch('advertisements/popup');
        if (r.ok) {
          const data = await r.json() as PopupAdvertisement | null;
          if (data?.isActive) {
            setPopupAd(data);
            // Mark as shown
            if (typeof window !== 'undefined') {
              sessionStorage.setItem('b2b_popup_shown', 'true');
            }
          }
        }
      } catch {
        // Silently fail - popup is optional
      }
    };

    checkPopup();
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { domain: defaultDomain, email: '', password: '' },
  });

  const checkCart = async () => {
    try {
      const r = await b2bFetch('cart');
      if (r.ok) {
        const j = (await r.json()) as { items?: unknown[] };
        if (Array.isArray(j.items) && j.items.length > 0) {
          setBanner('Sepetinizde urun var; sepete gitmek icin panele gecin.');
        }
      }
    } catch {
      /* ignore */
    }
  };

  const onSubmit = async (data: Form) => {
    setBanner(null);
    const r = await fetch('/api/b2b/login', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'x-b2b-domain': data.domain.trim().toLowerCase(),
      },
      body: JSON.stringify(data),
    });
    if (!r.ok) {
      const t = await r.text();
      enqueueSnackbar(t || 'Giris basarisiz', { variant: 'error' });
      return;
    }
    enqueueSnackbar('Giris basarili', { variant: 'success' });
    await checkCart();
    router.push('/dashboard');
  };

  return (
    <>
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Paper elevation={0} variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            B2B Giriş
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Domain: üretimde{' '}
            <code>{getClientB2bDomain() || 'hostname'}</code>
            {host === 'localhost' ? ' — localhost için aşağıya kayıtlı B2B domain yazın.' : ''}
          </Typography>
          {banner ? <Alert severity="info" sx={{ mb: 2 }}>{banner}</Alert> : null}
          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={2}>
              <TextField
                id="b2b-login-domain"
                label="B2B domain"
                placeholder="ornek.bayi.com"
                fullWidth
                {...register('domain')}
                error={!!errors.domain}
                helperText={errors.domain?.message}
              />
              <TextField
                id="b2b-login-email"
                label="E-posta"
                type="email"
                fullWidth
                autoComplete="email"
                {...register('email')}
                error={!!errors.email}
                helperText={errors.email?.message}
              />
              <TextField
                id="b2b-login-password"
                label="Şifre"
                type="password"
                fullWidth
                autoComplete="current-password"
                {...register('password')}
                error={!!errors.password}
                helperText={errors.password?.message}
              />
              <Button type="submit" variant="contained" disabled={isSubmitting} size="large">
                Giriş
              </Button>
            </Stack>
          </Box>
        </Paper>
      </Container>

      {/* Login Popup Advertisement */}
      <Dialog
        open={!!popupAd}
        onClose={() => setPopupAd(null)}
        maxWidth="md"
        PaperProps={{
          sx: {
            borderRadius: 2,
            position: 'relative',
          },
        }}
      >
        <IconButton
          onClick={() => setPopupAd(null)}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            bgcolor: 'background.paper',
            zIndex: 1,
          }}
        >
          <CloseIcon />
        </IconButton>
        <DialogContent sx={{ p: 0 }}>
          {popupAd && (
            <Box
              component="a"
              href={popupAd.link || '#'}
              target={popupAd.link ? '_blank' : undefined}
              rel={popupAd.link ? 'noopener noreferrer' : undefined}
              sx={{ textDecoration: 'none', display: 'block' }}
              onClick={(e) => {
                if (!popupAd.link) e.preventDefault();
                setPopupAd(null);
              }}
            >
              <Box
                component="img"
                src={popupAd.imageUrl}
                alt={popupAd.title}
                sx={{
                  width: '100%',
                  maxWidth: 600,
                  height: 'auto',
                  display: 'block',
                }}
              />
              <Box sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={700} gutterBottom color="text.primary">
                  {popupAd.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {popupAd.description}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
