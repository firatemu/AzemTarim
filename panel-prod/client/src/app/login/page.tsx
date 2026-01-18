'use client';

// Force dynamic rendering to prevent caching
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Container,
  LinearProgress,
  InputAdornment,
  IconButton,
  Fade,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  DirectionsCar,
  Person,
  Lock,
  Visibility,
  VisibilityOff,
  LoginOutlined,
  Security,
  Speed,
  Business,
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
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { setAuth } = useAuthStore();

  // Prevent hydration mismatch from browser extensions
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
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Giriş başarısız');
    } finally {
      setLoading(false);
    }
  };

  // Prevent hydration mismatch - render only after mount
  if (!mounted) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 30%, #334155 60%, #475569 100%)',
          backgroundSize: '400% 400%',
          animation: 'gradient-shift 15s ease infinite',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          '@keyframes gradient-shift': {
            '0%': { backgroundPosition: '0% 50%' },
            '50%': { backgroundPosition: '100% 50%' },
            '100%': { backgroundPosition: '0% 50%' },
          },
        }}
      />
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 30%, #334155 60%, #475569 100%)',
        backgroundSize: '400% 400%',
        animation: 'gradient-shift 15s ease infinite',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        '@keyframes gradient-shift': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
      }}
    >
      {/* Floating Particles */}
      {[...Array(20)].map((_, i) => (
        <Box
          key={i}
          sx={{
            position: 'absolute',
            width: Math.random() * 4 + 2,
            height: Math.random() * 4 + 2,
            borderRadius: '50%',
            background: alpha('#fff', 0.3),
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `float ${Math.random() * 3 + 3}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 2}s`,
            '@keyframes float': {
              '0%, 100%': { transform: 'translateY(0px) translateX(0px)' },
              '50%': { transform: `translateY(${Math.random() * 30 - 15}px) translateX(${Math.random() * 30 - 15}px)` },
            },
          }}
        />
      ))}

      <Container maxWidth="sm">
        <Fade in={mounted} timeout={800}>
          <Card
            sx={{
              borderRadius: 4,
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              overflow: 'hidden',
              backdropFilter: 'blur(20px)',
              background: alpha('#fff', 0.95),
              border: `1px solid ${alpha('#fff', 0.3)}`,
            }}
          >
            {loading && <LinearProgress />}
            
            {/* Header Section */}
            <Box
              sx={{
                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 30%, #334155 60%, #475569 100%)',
                backgroundSize: '400% 400%',
                animation: 'gradient-shift 15s ease infinite',
                p: 4,
                textAlign: 'center',
                color: 'white',
                position: 'relative',
                overflow: 'hidden',
                '@keyframes gradient-shift': {
                  '0%': { backgroundPosition: '0% 50%' },
                  '50%': { backgroundPosition: '100% 50%' },
                  '100%': { backgroundPosition: '0% 50%' },
                },
              }}
            >
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 90,
                  height: 90,
                  borderRadius: '50%',
                  bgcolor: alpha('#fff', 0.25),
                  mb: 2,
                  backdropFilter: 'blur(10px)',
                  border: `2px solid ${alpha('#fff', 0.3)}`,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                  animation: 'float 6s ease-in-out infinite',
                  '@keyframes float': {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-10px)' },
                  },
                }}
              >
                <DirectionsCar sx={{ fontSize: 55, color: 'white' }} />
              </Box>
              <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>
                Oto Muhasebe PRODUCTION
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.95, fontWeight: 500 }}>
                Hoş Geldiniz
              </Typography>
            </Box>

            <CardContent sx={{ p: 4 }}>
              {error && (
                <Fade in={!!error}>
                  <Alert 
                    severity="error" 
                    sx={{ 
                      mb: 3,
                      borderRadius: 2,
                      '& .MuiAlert-icon': {
                        fontSize: 24,
                      }
                    }}
                  >
                    {error}
                  </Alert>
                </Fade>
              )}

              <form onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  label="Kullanıcı Adı veya E-posta"
                  variant="outlined"
                  margin="normal"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person sx={{ color: '#2563eb' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      transition: 'all 0.3s ease',
                      '&:hover fieldset': {
                        borderColor: '#2563eb',
                        borderWidth: 2,
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#2563eb',
                        borderWidth: 2,
                      },
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#2563eb',
                    },
                  }}
                />
                <TextField
                  fullWidth
                  label="Şifre"
                  type={showPassword ? 'text' : 'password'}
                  variant="outlined"
                  margin="normal"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock sx={{ color: '#06b6d4' }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          sx={{ color: '#06b6d4' }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      transition: 'all 0.3s ease',
                      '&:hover fieldset': {
                        borderColor: '#06b6d4',
                        borderWidth: 2,
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#06b6d4',
                        borderWidth: 2,
                      },
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#06b6d4',
                    },
                  }}
                />
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  type="submit"
                  disabled={loading}
                  startIcon={<LoginOutlined />}
                  sx={{
                    mt: 3,
                    py: 1.5,
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 50%, #10b981 100%)',
                    backgroundSize: '400% 400%',
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    textTransform: 'none',
                    boxShadow: '0 4px 15px rgba(37, 99, 235, 0.4)',
                    transition: 'all 0.3s ease',
                    animation: 'gradient-shift 15s ease infinite',
                    '@keyframes gradient-shift': {
                      '0%': { backgroundPosition: '0% 50%' },
                      '50%': { backgroundPosition: '100% 50%' },
                      '100%': { backgroundPosition: '0% 50%' },
                    },
                    '&:hover': {
                      background: 'linear-gradient(135deg, #1d4ed8 0%, #0891b2 50%, #059669 100%)',
                      boxShadow: '0 6px 20px rgba(37, 99, 235, 0.6)',
                      transform: 'translateY(-2px)',
                    },
                    '&:disabled': {
                      background: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 50%, #10b981 100%)',
                      opacity: 0.7,
                    },
                  }}
                >
                  {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
                </Button>
              </form>

              {/* Feature Badges */}
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mt: 4, flexWrap: 'wrap' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                  <Security sx={{ fontSize: 18, color: '#2563eb' }} />
                  <Typography variant="caption" fontWeight={500}>
                    Güvenli
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                  <Speed sx={{ fontSize: 18, color: '#06b6d4' }} />
                  <Typography variant="caption" fontWeight={500}>
                    Hızlı
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                  <Business sx={{ fontSize: 18, color: '#10b981' }} />
                  <Typography variant="caption" fontWeight={500}>
                    Profesyonel
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ textAlign: 'center', mt: 3, color: 'text.secondary' }}>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  © 2024 Oto Muhasebe • Tüm hakları saklıdır
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Fade>
      </Container>
    </Box>
  );
}
