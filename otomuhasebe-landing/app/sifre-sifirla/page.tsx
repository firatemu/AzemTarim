'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, AlertCircle, Mail, Sparkles, CheckCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!email.trim()) {
      newErrors.email = 'E-posta gereklidir';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Geçerli bir e-posta adresi girin';
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
      const response = await fetch(`${apiUrl}/api/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setSuccess(true);
      } else {
        const data = await response.json();
        throw new Error(data.message || 'Bir hata oluştu');
      }
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
              <h2 className="text-4xl font-bold text-gray-900">Şifre Sıfırla</h2>
              <Sparkles className="w-6 h-6 text-teal-500 animate-pulse" style={{ animationDelay: '0.5s' }} />
            </div>
            <p className="text-lg text-gray-600">
              {success ? 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi' : 'Şifrenizi sıfırlamak için e-posta adresinizi girin'}
            </p>
          </div>

          {/* Success Message */}
          {success ? (
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 md:p-10 border border-white/50 animate-slide-up">
              <div className="text-center">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">E-posta Gönderildi</h3>
                <p className="text-gray-600 mb-6">
                  Şifre sıfırlama bağlantısı <strong>{email}</strong> adresine gönderildi.
                  Lütfen e-posta kutunuzu kontrol edin.
                </p>
                <Link
                  href="/giris"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-cyan-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Giriş Sayfasına Dön
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          ) : (
            /* Form Card */
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 md:p-10 border border-white/50 animate-slide-up">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email */}
                <div className="group">
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                    E-posta Adresi *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-cyan-500" />
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300 placeholder:text-gray-400 ${errors.email ? 'border-red-400 bg-red-50' : 'border-gray-300 group-hover:border-cyan-400'
                        }`}
                      placeholder="E-posta adresinizi girin"
                      autoComplete="email"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1 animate-fade-in">
                      <AlertCircle className="w-4 h-4" />
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-cyan-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Gönderiliyor...
                    </>
                  ) : (
                    <>
                      Şifre Sıfırlama Bağlantısı Gönder
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>

                {/* Submit Error */}
                {errors.submit && (
                  <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 animate-fade-in">
                    <p className="text-sm text-red-600 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5" />
                      {errors.submit}
                    </p>
                  </div>
                )}

                {/* Back to Login */}
                <div className="text-center">
                  <Link
                    href="/giris"
                    className="text-sm text-cyan-600 hover:text-cyan-700 font-semibold hover:underline transition-colors"
                  >
                    ← Giriş sayfasına dön
                  </Link>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
