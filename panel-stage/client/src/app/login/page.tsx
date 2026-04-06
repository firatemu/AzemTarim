'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  Checkbox,
  FormControlLabel,
  CircularProgress,
  Link,
  Divider,
  Grid,
} from '@mui/material';
import {
  Person,
  Lock,
  Visibility,
  VisibilityOff,
  ArrowForwardRounded,
  BusinessCenter,
  Assessment,
  Settings,
  Support,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import axios from '@/lib/axios';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [mounted, setMounted] = useState(false);

  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('/auth/login', {
        username,
        password,
      });

      const { user, accessToken, refreshToken } = response.data;
      setAuth(user, accessToken, refreshToken);

      const slimUser = {
        id: user?.id,
        email: user?.email,
        username: user?.username,
        fullName: user?.fullName,
        role: user?.role != null ? String(user.role) : undefined,
        tenantId: user?.tenantId ?? null,
      };

      await fetch('/api/auth/cookies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accessToken,
          refreshToken,
          tenantId: user.tenantId,
          user: slimUser,
        }),
      });

      router.push('/menu');
    } catch (err: unknown) {
      const ax = err as { response?: { status?: number; data?: { message?: string } } };
      const status = ax.response?.status;
      const msg = ax.response?.data?.message;
      if (status === 503) {
        setError(msg || 'API sunucusuna bağlanılamadı. Backend çalışıyor mu?');
      } else {
        setError(msg || 'Giriş başarısız');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: '#0F172A',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      />
    );
  }

  const features = [
    { icon: <BusinessCenter />, title: 'Fatura Yönetimi', desc: 'E-Fatura ve E-İrsaliye entegrasyonu' },
    { icon: <Assessment />, title: 'Raporlama', desc: 'Detaylı finansal raporlar ve analizler' },
    { icon: <Settings />, title: 'Stok Takibi', desc: 'Gerçek zamanlı envanter yönetimi' },
    { icon: <Support />, title: '7/24 Destek', desc: 'Uzman ekibimizle her zaman yanınızdayız' },
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        bgcolor: '#F8FAFC',
      }}
    >
      {/* Sol Panel - Kurumsal Banner */}
      <Box
        sx={{
          display: { xs: 'none', lg: 'flex' },
          flex: '0 0 48%',
          bgcolor: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background Pattern */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            opacity: 0.03,
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        {/* Gradient Overlay */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.4) 100%)',
          }}
        />

        {/* Content */}
        <Box
          sx={{
            position: 'relative',
            zIndex: 1,
            p: { lg: 5, xl: 6 },
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          {/* Logo & Title */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  bgcolor: '#3B82F6',
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 24px rgba(59, 130, 246, 0.3)',
                }}
              >
                <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700 }}>
                  Ö
                </Typography>
              </Box>
              <Typography
                variant="h6"
                sx={{
                  color: '#FFFFFF',
                  fontWeight: 700,
                  letterSpacing: '-0.02em',
                }}
              >
                OtoMuhasebe
              </Typography>
            </Box>

            <Typography
              variant="h4"
              sx={{
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '1.75rem',
                lineHeight: 1.2,
                mb: 2,
                letterSpacing: '-0.02em',
              }}
            >
              Kurumsal
              <br />
              <Box component="span" sx={{ color: '#3B82F6' }}>
                Çözümler
              </Box>
              <br />
              Platformu
            </Typography>

            <Typography
              variant="body2"
              sx={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '0.875rem',
                lineHeight: 1.6,
                maxWidth: 320,
              }}
            >
              Türkiye'nin en kapsamlı ERP çözümü ile işletmenizi dijital geleceğe taşıyın.
            </Typography>
          </Box>

          {/* Feature Cards */}
          <Box sx={{ mt: 5 }}>
            <Grid container spacing={2}>
              {features.map((feature, index) => (
                <Grid item xs={6} key={index}>
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: 'rgba(255, 255, 255, 0.05)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: 2,
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        bgcolor: 'rgba(255, 255, 255, 0.1)',
                        transform: 'translateY(-2px)',
                        borderColor: 'rgba(59, 130, 246, 0.3)',
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: 1.5,
                        bgcolor: 'rgba(59, 130, 246, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 1.5,
                        color: '#3B82F6',
                      }}
                    >
                      {feature.icon}
                    </Box>
                    <Typography
                      variant="caption"
                      sx={{
                        color: '#FFFFFF',
                        fontWeight: 600,
                        mb: 0.5,
                        fontSize: '0.8rem',
                        display: 'block',
                      }}
                    >
                      {feature.title}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'rgba(255, 255, 255, 0.5)',
                        lineHeight: 1.4,
                        display: 'block',
                        fontSize: '0.7rem',
                      }}
                    >
                      {feature.desc}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Bottom Info */}
          <Box
            sx={{
              pt: 3,
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: 'rgba(255, 255, 255, 0.4)',
                display: 'block',
                mb: 0.5,
                fontSize: '0.7rem',
              }}
            >
              Güvenli bağlantı · 256-bit SSL şifreleme
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '0.7rem' }}
            >
              © {new Date().getFullYear()} OtoMuhasebe ERP
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Sağ Panel - Login Form */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: { xs: 2, sm: 3, md: 4 },
          position: 'relative',
        }}
      >
        {/* Mobile Logo */}
        <Box
          sx={{
            display: { lg: 'none' },
            position: 'absolute',
            top: 24,
            left: 24,
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Box
            sx={{
              width: 40,
              height: 40,
              bgcolor: '#3B82F6',
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700 }}>
              Ö
            </Typography>
          </Box>
          <Typography
            variant="h6"
            sx={{
              color: '#1E293B',
              fontWeight: 700,
            }}
          >
            OtoMuhasebe
          </Typography>
        </Box>

        {/* Form Container */}
        <Box
          sx={{
            width: '100%',
            maxWidth: 380,
          }}
        >
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h5"
              sx={{
                color: '#1E293B',
                fontWeight: 700,
                fontSize: { xs: '1.5rem', sm: '1.75rem' },
                mb: 1.5,
                letterSpacing: '-0.02em',
              }}
            >
              Hoş geldiniz
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: '#64748B',
                fontSize: '0.9rem',
              }}
            >
              Hesabınıza giriş yaparak yönetim paneline erişin
            </Typography>
          </Box>

          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 3,
                borderRadius: 2,
                bgcolor: '#FEF2F2',
                color: '#991B1B',
                border: '1px solid #FECACA',
                '& .MuiAlert-icon': {
                  color: '#DC2626',
                },
              }}
            >
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              {/* Username Field */}
              <Box>
                <Typography
                  component="label"
                  sx={{
                    display: 'block',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: '#334155',
                    mb: 1,
                  }}
                >
                  Kullanıcı Adı veya E-posta
                </Typography>
                <TextField
                  fullWidth
                  placeholder="ornek@firma.com"
                  variant="outlined"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={loading}
                  autoComplete="username"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person sx={{ color: '#94A3B8', fontSize: 18 }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: '#FFFFFF',
                      borderRadius: 2,
                      transition: 'all 0.2s ease',
                      '& fieldset': {
                        borderColor: '#E2E8F0',
                        borderWidth: 1.5,
                      },
                      '&:hover': {
                        '& fieldset': {
                          borderColor: '#CBD5E1',
                        },
                      },
                      '&.Mui-focused': {
                        '& fieldset': {
                          borderColor: '#3B82F6',
                          borderWidth: 2,
                        },
                      },
                    },
                    '& .MuiInputBase-input': {
                      py: 1.25,
                      fontSize: '0.9rem',
                      fontWeight: 500,
                      color: '#1E293B',
                    },
                    '& .MuiInputLabel-root': {
                      color: '#64748B',
                      fontWeight: 500,
                    },
                  }}
                />
              </Box>

              {/* Password Field */}
              <Box>
                <Typography
                  component="label"
                  sx={{
                    display: 'block',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: '#334155',
                    mb: 1,
                  }}
                >
                  Şifre
                </Typography>
                <TextField
                  fullWidth
                  placeholder="••••••••"
                  type={showPassword ? 'text' : 'password'}
                  variant="outlined"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  autoComplete="current-password"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock sx={{ color: '#94A3B8', fontSize: 18 }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          aria-label={showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
                          sx={{ color: '#94A3B8' }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: '#FFFFFF',
                      borderRadius: 2,
                      transition: 'all 0.2s ease',
                      '& fieldset': {
                        borderColor: '#E2E8F0',
                        borderWidth: 1.5,
                      },
                      '&:hover': {
                        '& fieldset': {
                          borderColor: '#CBD5E1',
                        },
                      },
                      '&.Mui-focused': {
                        '& fieldset': {
                          borderColor: '#3B82F6',
                          borderWidth: 2,
                        },
                      },
                    },
                    '& .MuiInputBase-input': {
                      py: 1.25,
                      fontSize: '0.9rem',
                      fontWeight: 500,
                      color: '#1E293B',
                    },
                  }}
                />
              </Box>

              {/* Remember & Forgot */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      sx={{
                        color: '#CBD5E1',
                        '&.Mui-checked': {
                          color: '#3B82F6',
                        },
                        '& .MuiSvgIcon-root': {
                          borderRadius: 1.5,
                        },
                      }}
                    />
                  }
                  label={
                    <Typography
                      variant="body2"
                      sx={{ color: '#475569', fontWeight: 500, fontSize: '0.875rem' }}
                    >
                      Beni hatırla
                    </Typography>
                  }
                />
                <Link
                  href="/forgot-password"
                  sx={{
                    color: '#3B82F6',
                    textDecoration: 'none',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    transition: 'color 0.2s ease',
                    '&:hover': {
                      color: '#2563EB',
                      textDecoration: 'underline',
                    },
                  }}
                >
                  Şifremi unuttum?
                </Link>
              </Box>

              {/* Submit Button */}
              <Button
                fullWidth
                variant="contained"
                size="medium"
                type="submit"
                disabled={loading || !username || !password}
                endIcon={
                  loading ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : (
                    <ArrowForwardRounded />
                  )
                }
                sx={{
                  py: 1.5,
                  mt: 0.5,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  bgcolor: '#3B82F6',
                  boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: '#2563EB',
                    boxShadow: '0 6px 20px rgba(59, 130, 246, 0.5)',
                    transform: 'translateY(-1px)',
                  },
                  '&:active': {
                    transform: 'translateY(0)',
                  },
                  '&:disabled': {
                    bgcolor: '#CBD5E1',
                    boxShadow: 'none',
                  },
                }}
              >
                {loading ? 'Giriş yapılıyor...' : 'Giriş yap'}
              </Button>
            </Box>
          </form>

          {/* Footer */}
          <Box
            sx={{
              mt: 4,
              pt: 3,
              borderTop: '1px solid #E2E8F0',
              textAlign: 'center',
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: '#94A3B8',
                display: 'block',
                mb: 0.5,
                fontWeight: 500,
                fontSize: '0.75rem',
              }}
            >
              ERP Çözüm Ortağınız
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: '#CBD5E1', fontSize: '0.75rem' }}
            >
              Yardıma mı ihtiyacınız var?{' '}
              <Link
                href="#"
                sx={{
                  color: '#3B82F6',
                  textDecoration: 'none',
                  fontWeight: 600,
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                }}
              >
                Destek ekibiyle iletişime geçin
              </Link>
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
