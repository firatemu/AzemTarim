'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, AlertCircle, LogIn, Mail, Lock, Sparkles, Shield, Zap, CheckCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Kullanıcı adı veya e-posta gereklidir';
    }

    if (!formData.password) {
      newErrors.password = 'Şifre gereklidir';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.otomuhasebe.com';
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Giriş işlemi başarısız oldu');
      }

      // Token'ları localStorage'a kaydet
      if (data.accessToken) {
        localStorage.setItem('accessToken', data.accessToken);
      }
      if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken);
      }

      // Kullanıcı bilgilerini kaydet
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      // Kullanıcı dashboard'una yönlendir
      window.location.href = '/dashboard';
    } catch (error: any) {
      setErrors({ submit: error.message || 'Bir hata oluştu. Lütfen tekrar deneyin.' });
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-teal-50" />
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-cyan-50 via-blue-50 to-teal-50">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute inset-0 bg-gradient-to-br from-cyan-400/20 via-blue-400/20 to-teal-400/20 animate-gradient-shift"
          style={{
            backgroundSize: '400% 400%',
            animation: 'gradient-shift 20s ease infinite',
          }}
        />
        
        {/* Floating Particles */}
        {[...Array(25)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-gradient-to-br from-cyan-400/30 to-blue-400/30 blur-sm"
            style={{
              width: `${Math.random() * 80 + 40}px`,
              height: `${Math.random() * 80 + 40}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${Math.random() * 10 + 10}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}

        {/* Geometric Shapes */}
        <div className="absolute top-20 right-20 w-72 h-72 bg-gradient-to-br from-cyan-300/20 to-blue-300/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-gradient-to-br from-teal-300/20 to-cyan-300/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 py-12 px-4">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-8 animate-fade-in">
            <Link href="/" className="inline-block mb-4 group">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-600 via-blue-600 to-teal-600 bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300">
                OtoMuhasebe
              </h1>
            </Link>
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="w-6 h-6 text-cyan-500 animate-pulse" />
              <h2 className="text-4xl font-bold text-gray-900">Giriş Yap</h2>
              <Sparkles className="w-6 h-6 text-teal-500 animate-pulse" style={{ animationDelay: '0.5s' }} />
            </div>
            <p className="text-lg text-gray-600">
              Hesabınıza giriş yaparak devam edin
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 md:p-10 border border-white/50 animate-slide-up">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Username/Email */}
              <div className="group">
                <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-2">
                  Kullanıcı Adı veya E-posta *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-cyan-500" />
                  <input
                    type="text"
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300 placeholder:text-gray-400 ${
                      errors.username ? 'border-red-400 bg-red-50' : 'border-gray-300 group-hover:border-cyan-400'
                    }`}
                    placeholder="Kullanıcı adı veya e-posta"
                    autoComplete="username"
                  />
                </div>
                {errors.username && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1 animate-fade-in">
                    <AlertCircle className="w-4 h-4" />
                    {errors.username}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="group">
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  Şifre *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className={`w-full pl-10 pr-12 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 placeholder:text-gray-400 ${
                      errors.password ? 'border-red-400 bg-red-50' : 'border-gray-300 group-hover:border-blue-400'
                    }`}
                    placeholder="Şifrenizi girin"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-500 transition-colors"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1 animate-fade-in">
                    <AlertCircle className="w-4 h-4" />
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 group cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.rememberMe}
                    onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                    className="w-5 h-5 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500 cursor-pointer"
                  />
                  <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">Beni hatırla</span>
                </label>
                <Link
                  href="/sifre-sifirla"
                  className="text-sm text-cyan-600 hover:text-cyan-700 font-semibold hover:underline transition-colors"
                >
                  Şifremi unuttum
                </Link>
              </div>

              {/* Submit Error */}
              {errors.submit && (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 animate-fade-in">
                  <p className="text-sm text-red-600 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    {errors.submit}
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-cyan-600 via-blue-600 to-teal-600 text-white py-4 rounded-xl font-bold text-lg hover:from-cyan-700 hover:via-blue-700 hover:to-teal-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Giriş yapılıyor...
                  </>
                ) : (
                  <>
                    Giriş Yap
                    <LogIn className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              {/* Sign Up Link */}
              <p className="text-center text-sm text-gray-600">
                Hesabınız yok mu?{' '}
                <Link href="/kayit" className="text-cyan-600 font-semibold hover:text-cyan-700 hover:underline transition-colors">
                  Üye olun
                </Link>
              </p>
            </form>
          </div>

          {/* Features */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in">
            <div className="bg-white/60 backdrop-blur-lg rounded-xl p-4 border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-center gap-2 text-sm font-semibold text-gray-700">
                <Shield className="w-5 h-5 text-green-500" />
                <span>Güvenli Giriş</span>
              </div>
            </div>
            <div className="bg-white/60 backdrop-blur-lg rounded-xl p-4 border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-center gap-2 text-sm font-semibold text-gray-700">
                <Zap className="w-5 h-5 text-yellow-500" />
                <span>Hızlı Erişim</span>
              </div>
            </div>
            <div className="bg-white/60 backdrop-blur-lg rounded-xl p-4 border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-center gap-2 text-sm font-semibold text-gray-700">
                <CheckCircle className="w-5 h-5 text-blue-500" />
                <span>SSL Şifreli</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-20px) translateX(10px); }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-gradient-shift {
          animation: gradient-shift 20s ease infinite;
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        .animate-slide-up {
          animation: slide-up 0.8s ease-out;
        }
      `}</style>
    </div>
  );
}
