'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Check, AlertCircle, User, Mail, Phone, Building2, Lock, MapPin, FileText, Sparkles } from 'lucide-react';

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    firstName: '',
    lastName: '',
    acceptTerms: false,
  });

  // Fatura bilgileri
  const [companyType, setCompanyType] = useState<'LIMITED' | 'SAHIS'>('LIMITED');
  const [invoiceData, setInvoiceData] = useState({
    taxNumber: '',
    tcKimlikNo: '',
    invoiceCompanyName: '',
    taxOffice: '',
    city: '',
    district: '',
    address: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = 'E-posta gereklidir';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Geçerli bir e-posta adresi girin';
    }

    if (!formData.password) {
      newErrors.password = 'Şifre gereklidir';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Şifre en az 8 karakter olmalıdır';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Şifreler eşleşmiyor';
    }

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Ad gereklidir';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Soyad gereklidir';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Telefon numarası gereklidir';
    }

    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'Kullanım koşullarını kabul etmelisiniz';
    }

    // Fatura bilgileri validasyonu
    if (companyType === 'LIMITED') {
      if (!invoiceData.taxNumber || invoiceData.taxNumber.length !== 10) {
        newErrors.taxNumber = 'Vergi numarası 10 haneli olmalıdır';
      }
      if (!invoiceData.invoiceCompanyName) {
        newErrors.invoiceCompanyName = 'Şirket unvanı zorunludur';
      }
    } else {
      // Şahıs firması için ad ve soyad zorunlu
      if (!formData.firstName || !formData.firstName.trim()) {
        newErrors.firstName = 'Ad zorunludur';
      }
      if (!formData.lastName || !formData.lastName.trim()) {
        newErrors.lastName = 'Soyad zorunludur';
      }
      if (!invoiceData.tcKimlikNo || invoiceData.tcKimlikNo.length !== 11) {
        newErrors.tcKimlikNo = 'TC kimlik numarası 11 haneli olmalıdır';
      }
    }

    if (!invoiceData.taxOffice) {
      newErrors.taxOffice = 'Vergi dairesi zorunludur';
    }
    if (!invoiceData.city) {
      newErrors.city = 'İl zorunludur';
    }
    if (!invoiceData.district) {
      newErrors.district = 'İlçe zorunludur';
    }
    if (!invoiceData.address) {
      newErrors.address = 'Adres zorunludur';
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
      const response = await fetch(`${apiUrl}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          username: formData.email.split('@')[0],
          fullName: `${formData.firstName} ${formData.lastName}`.trim(),
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          // Fatura bilgileri
          invoiceData: {
            companyType,
            companyName: companyType === 'LIMITED' ? invoiceData.invoiceCompanyName : undefined,
            taxNumber: companyType === 'LIMITED' ? invoiceData.taxNumber : undefined,
            firstName: companyType === 'SAHIS' ? formData.firstName : undefined,
            lastName: companyType === 'SAHIS' ? formData.lastName : undefined,
            tcKimlikNo: companyType === 'SAHIS' ? invoiceData.tcKimlikNo : undefined,
            taxOffice: invoiceData.taxOffice,
            city: invoiceData.city,
            district: invoiceData.district,
            address: invoiceData.address,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Kayıt işlemi başarısız oldu');
      }

      if (data.accessToken) {
        localStorage.setItem('accessToken', data.accessToken);
      }
      if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken);
      }
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }

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
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-gradient-to-br from-cyan-400/30 to-blue-400/30 blur-sm"
            style={{
              width: `${Math.random() * 100 + 50}px`,
              height: `${Math.random() * 100 + 50}px`,
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
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8 animate-fade-in">
            <Link href="/" className="inline-block mb-4 group">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-600 via-blue-600 to-teal-600 bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300">
                OtoMuhasebe
              </h1>
            </Link>
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="w-6 h-6 text-cyan-500 animate-pulse" />
              <h2 className="text-4xl font-bold text-gray-900">Hesap Oluşturun</h2>
              <Sparkles className="w-6 h-6 text-teal-500 animate-pulse" style={{ animationDelay: '0.5s' }} />
            </div>
            <p className="text-lg text-gray-600">
              14 gün ücretsiz deneme ile başlayın. Kredi kartı gerektirmez.
            </p>
          </div>

          {/* Main Card */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 md:p-10 border border-white/50 animate-slide-up">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Kişisel Bilgiler */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Kişisel Bilgiler</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="group">
                    <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700 mb-2">
                      Ad *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-cyan-500" />
                      <input
                        type="text"
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300 placeholder:text-gray-400 ${
                          errors.firstName ? 'border-red-400 bg-red-50' : 'border-gray-300 group-hover:border-cyan-400'
                        }`}
                        placeholder="Adınız"
                      />
                    </div>
                    {errors.firstName && (
                      <p className="mt-2 text-sm text-red-600 flex items-center gap-1 animate-fade-in">
                        <AlertCircle className="w-4 h-4" />
                        {errors.firstName}
                      </p>
                    )}
                  </div>

                  <div className="group">
                    <label htmlFor="lastName" className="block text-sm font-semibold text-gray-700 mb-2">
                      Soyad *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-500" />
                      <input
                        type="text"
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 placeholder:text-gray-400 ${
                          errors.lastName ? 'border-red-400 bg-red-50' : 'border-gray-300 group-hover:border-blue-400'
                        }`}
                        placeholder="Soyadınız"
                      />
                    </div>
                    {errors.lastName && (
                      <p className="mt-2 text-sm text-red-600 flex items-center gap-1 animate-fade-in">
                        <AlertCircle className="w-4 h-4" />
                        {errors.lastName}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* İletişim Bilgileri */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-teal-500 rounded-lg">
                    <Mail className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">İletişim Bilgileri</h3>
                </div>
                <div className="space-y-4">
                  <div className="group">
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                      E-posta Adresi *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-500" />
                      <input
                        type="email"
                        id="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 placeholder:text-gray-400 ${
                          errors.email ? 'border-red-400 bg-red-50' : 'border-gray-300 group-hover:border-blue-400'
                        }`}
                        placeholder="ornek@email.com"
                      />
                    </div>
                    {errors.email && (
                      <p className="mt-2 text-sm text-red-600 flex items-center gap-1 animate-fade-in">
                        <AlertCircle className="w-4 h-4" />
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div className="group">
                    <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                      Telefon Numarası *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-teal-500" />
                      <input
                        type="tel"
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-300 placeholder:text-gray-400 ${
                          errors.phone ? 'border-red-400 bg-red-50' : 'border-gray-300 group-hover:border-teal-400'
                        }`}
                        placeholder="05XX XXX XX XX"
                      />
                    </div>
                    {errors.phone && (
                      <p className="mt-2 text-sm text-red-600 flex items-center gap-1 animate-fade-in">
                        <AlertCircle className="w-4 h-4" />
                        {errors.phone}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Fatura Bilgileri */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-lg">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Fatura Bilgileri</h3>
                </div>
                
                {/* Önemli Uyarı */}
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-5 mb-6 animate-fade-in">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-amber-500 rounded-lg flex-shrink-0">
                      <AlertCircle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-amber-900 mb-2">
                        ⚠️ Önemli: Fatura Bilgileri
                      </p>
                      <p className="text-sm text-amber-800 leading-relaxed">
                        Lütfen aşağıdaki bilgileri doğru ve eksiksiz girin. Bu bilgiler kullanılarak size fatura kesilecek ve 
                        <strong className="font-semibold"> E-fatura</strong> ile <strong className="font-semibold">E-arşiv</strong> gönderimleri bu bilgiler üzerinden yapılacaktır.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Şirket Tipi Seçimi */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Şirket Tipi *
                    </label>
                    <div className="flex gap-4">
                      <label className="flex-1 group cursor-pointer">
                        <input
                          type="radio"
                          name="companyType"
                          value="LIMITED"
                          checked={companyType === 'LIMITED'}
                          onChange={(e) => setCompanyType(e.target.value as 'LIMITED' | 'SAHIS')}
                          className="sr-only"
                        />
                        <div className={`p-4 border-2 rounded-xl transition-all duration-300 ${
                          companyType === 'LIMITED' 
                            ? 'border-cyan-500 bg-gradient-to-br from-cyan-50 to-blue-50 shadow-lg' 
                            : 'border-gray-300 hover:border-cyan-300'
                        }`}>
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              companyType === 'LIMITED' ? 'border-cyan-500' : 'border-gray-300'
                            }`}>
                              {companyType === 'LIMITED' && <div className="w-3 h-3 bg-cyan-500 rounded-full" />}
                            </div>
                            <Building2 className={`w-5 h-5 ${companyType === 'LIMITED' ? 'text-cyan-500' : 'text-gray-400'}`} />
                            <span className={`font-semibold ${companyType === 'LIMITED' ? 'text-cyan-700' : 'text-gray-600'}`}>
                              Limited Şirket
                            </span>
                          </div>
                        </div>
                      </label>
                      <label className="flex-1 group cursor-pointer">
                        <input
                          type="radio"
                          name="companyType"
                          value="SAHIS"
                          checked={companyType === 'SAHIS'}
                          onChange={(e) => setCompanyType(e.target.value as 'LIMITED' | 'SAHIS')}
                          className="sr-only"
                        />
                        <div className={`p-4 border-2 rounded-xl transition-all duration-300 ${
                          companyType === 'SAHIS' 
                            ? 'border-teal-500 bg-gradient-to-br from-teal-50 to-cyan-50 shadow-lg' 
                            : 'border-gray-300 hover:border-teal-300'
                        }`}>
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              companyType === 'SAHIS' ? 'border-teal-500' : 'border-gray-300'
                            }`}>
                              {companyType === 'SAHIS' && <div className="w-3 h-3 bg-teal-500 rounded-full" />}
                            </div>
                            <User className={`w-5 h-5 ${companyType === 'SAHIS' ? 'text-teal-500' : 'text-gray-400'}`} />
                            <span className={`font-semibold ${companyType === 'SAHIS' ? 'text-teal-700' : 'text-gray-600'}`}>
                              Şahıs Firması
                            </span>
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Limited Şirket Alanları */}
                  {companyType === 'LIMITED' && (
                    <div className="space-y-4 animate-fade-in">
                      <div className="group">
                        <label htmlFor="invoiceCompanyName" className="block text-sm font-semibold text-gray-700 mb-2">
                          Şirket Unvanı *
                        </label>
                        <div className="relative">
                          <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-cyan-500" />
                          <input
                            type="text"
                            id="invoiceCompanyName"
                            value={invoiceData.invoiceCompanyName}
                            onChange={(e) => setInvoiceData({ ...invoiceData, invoiceCompanyName: e.target.value })}
                            className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300 placeholder:text-gray-400 ${
                              errors.invoiceCompanyName ? 'border-red-400 bg-red-50' : 'border-gray-300 group-hover:border-cyan-400'
                            }`}
                            placeholder="Şirket unvanınızı girin"
                          />
                        </div>
                        {errors.invoiceCompanyName && (
                          <p className="mt-2 text-sm text-red-600 flex items-center gap-1 animate-fade-in">
                            <AlertCircle className="w-4 h-4" />
                            {errors.invoiceCompanyName}
                          </p>
                        )}
                      </div>

                      <div className="group">
                        <label htmlFor="taxNumber" className="block text-sm font-semibold text-gray-700 mb-2">
                          Vergi Numarası *
                        </label>
                        <div className="relative">
                          <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-500" />
                          <input
                            type="text"
                            id="taxNumber"
                            value={invoiceData.taxNumber}
                            onChange={(e) => setInvoiceData({ ...invoiceData, taxNumber: e.target.value.replace(/\D/g, '') })}
                            maxLength={10}
                            className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 placeholder:text-gray-400 ${
                              errors.taxNumber ? 'border-red-400 bg-red-50' : 'border-gray-300 group-hover:border-blue-400'
                            }`}
                            placeholder="10 haneli vergi numaranızı girin"
                          />
                        </div>
                        {errors.taxNumber && (
                          <p className="mt-2 text-sm text-red-600 flex items-center gap-1 animate-fade-in">
                            <AlertCircle className="w-4 h-4" />
                            {errors.taxNumber}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Şahıs Firması Alanları */}
                  {companyType === 'SAHIS' && (
                    <div className="space-y-4 animate-fade-in">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="group">
                          <label htmlFor="invoiceFirstName" className="block text-sm font-semibold text-gray-700 mb-2">
                            Ad *
                          </label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-teal-500" />
                            <input
                              type="text"
                              id="invoiceFirstName"
                              value={formData.firstName}
                              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                              className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-300 placeholder:text-gray-400 ${
                                errors.firstName ? 'border-red-400 bg-red-50' : 'border-gray-300 group-hover:border-teal-400'
                              }`}
                              placeholder="Adınız"
                            />
                          </div>
                          {errors.firstName && (
                            <p className="mt-2 text-sm text-red-600 flex items-center gap-1 animate-fade-in">
                              <AlertCircle className="w-4 h-4" />
                              {errors.firstName}
                            </p>
                          )}
                        </div>

                        <div className="group">
                          <label htmlFor="invoiceLastName" className="block text-sm font-semibold text-gray-700 mb-2">
                            Soyad *
                          </label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-cyan-500" />
                            <input
                              type="text"
                              id="invoiceLastName"
                              value={formData.lastName}
                              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                              className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300 placeholder:text-gray-400 ${
                                errors.lastName ? 'border-red-400 bg-red-50' : 'border-gray-300 group-hover:border-cyan-400'
                              }`}
                              placeholder="Soyadınız"
                            />
                          </div>
                          {errors.lastName && (
                            <p className="mt-2 text-sm text-red-600 flex items-center gap-1 animate-fade-in">
                              <AlertCircle className="w-4 h-4" />
                              {errors.lastName}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="group">
                        <label htmlFor="tcKimlikNo" className="block text-sm font-semibold text-gray-700 mb-2">
                          TC Kimlik Numarası *
                        </label>
                        <div className="relative">
                          <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-teal-500" />
                          <input
                            type="text"
                            id="tcKimlikNo"
                            value={invoiceData.tcKimlikNo}
                            onChange={(e) => setInvoiceData({ ...invoiceData, tcKimlikNo: e.target.value.replace(/\D/g, '') })}
                            maxLength={11}
                            className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-300 placeholder:text-gray-400 ${
                              errors.tcKimlikNo ? 'border-red-400 bg-red-50' : 'border-gray-300 group-hover:border-teal-400'
                            }`}
                            placeholder="11 haneli TC kimlik numaranızı girin"
                          />
                        </div>
                        {errors.tcKimlikNo && (
                          <p className="mt-2 text-sm text-red-600 flex items-center gap-1 animate-fade-in">
                            <AlertCircle className="w-4 h-4" />
                            {errors.tcKimlikNo}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Ortak Alanlar */}
                  <div className="space-y-4 pt-4 border-t border-gray-200">
                    <div className="group">
                      <label htmlFor="taxOffice" className="block text-sm font-semibold text-gray-700 mb-2">
                        Vergi Dairesi *
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-500" />
                        <input
                          type="text"
                          id="taxOffice"
                          value={invoiceData.taxOffice}
                          onChange={(e) => setInvoiceData({ ...invoiceData, taxOffice: e.target.value })}
                          className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 placeholder:text-gray-400 ${
                            errors.taxOffice ? 'border-red-400 bg-red-50' : 'border-gray-300 group-hover:border-blue-400'
                          }`}
                          placeholder="Örn: Kadıköy Vergi Dairesi"
                        />
                      </div>
                      {errors.taxOffice && (
                        <p className="mt-2 text-sm text-red-600 flex items-center gap-1 animate-fade-in">
                          <AlertCircle className="w-4 h-4" />
                          {errors.taxOffice}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="group">
                        <label htmlFor="city" className="block text-sm font-semibold text-gray-700 mb-2">
                          İl *
                        </label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-cyan-500" />
                          <input
                            type="text"
                            id="city"
                            value={invoiceData.city}
                            onChange={(e) => setInvoiceData({ ...invoiceData, city: e.target.value })}
                            className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300 placeholder:text-gray-400 ${
                              errors.city ? 'border-red-400 bg-red-50' : 'border-gray-300 group-hover:border-cyan-400'
                            }`}
                            placeholder="İl"
                          />
                        </div>
                        {errors.city && (
                          <p className="mt-2 text-sm text-red-600 flex items-center gap-1 animate-fade-in">
                            <AlertCircle className="w-4 h-4" />
                            {errors.city}
                          </p>
                        )}
                      </div>

                      <div className="group">
                        <label htmlFor="district" className="block text-sm font-semibold text-gray-700 mb-2">
                          İlçe *
                        </label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-teal-500" />
                          <input
                            type="text"
                            id="district"
                            value={invoiceData.district}
                            onChange={(e) => setInvoiceData({ ...invoiceData, district: e.target.value })}
                            className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-300 placeholder:text-gray-400 ${
                              errors.district ? 'border-red-400 bg-red-50' : 'border-gray-300 group-hover:border-teal-400'
                            }`}
                            placeholder="İlçe"
                          />
                        </div>
                        {errors.district && (
                          <p className="mt-2 text-sm text-red-600 flex items-center gap-1 animate-fade-in">
                            <AlertCircle className="w-4 h-4" />
                            {errors.district}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="group">
                      <label htmlFor="address" className="block text-sm font-semibold text-gray-700 mb-2">
                        Adres *
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-4 w-5 h-5 text-blue-500" />
                        <textarea
                          id="address"
                          value={invoiceData.address}
                          onChange={(e) => setInvoiceData({ ...invoiceData, address: e.target.value })}
                          rows={3}
                          className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 placeholder:text-gray-400 resize-none ${
                            errors.address ? 'border-red-400 bg-red-50' : 'border-gray-300 group-hover:border-blue-400'
                          }`}
                          placeholder="Tam adres bilginizi girin"
                        />
                      </div>
                      {errors.address && (
                        <p className="mt-2 text-sm text-red-600 flex items-center gap-1 animate-fade-in">
                          <AlertCircle className="w-4 h-4" />
                          {errors.address}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Güvenlik */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
                    <Lock className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Güvenlik</h3>
                </div>
                <div className="space-y-4">
                  <div className="group">
                    <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                      Şifre *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-500" />
                      <input
                        type="password"
                        id="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 placeholder:text-gray-400 ${
                          errors.password ? 'border-red-400 bg-red-50' : 'border-gray-300 group-hover:border-blue-400'
                        }`}
                        placeholder="En az 8 karakter"
                      />
                    </div>
                    {errors.password && (
                      <p className="mt-2 text-sm text-red-600 flex items-center gap-1 animate-fade-in">
                        <AlertCircle className="w-4 h-4" />
                        {errors.password}
                      </p>
                    )}
                  </div>

                  <div className="group">
                    <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                      Şifre Tekrar *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-cyan-500" />
                      <input
                        type="password"
                        id="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300 placeholder:text-gray-400 ${
                          errors.confirmPassword ? 'border-red-400 bg-red-50' : 'border-gray-300 group-hover:border-cyan-400'
                        }`}
                        placeholder="Şifrenizi tekrar girin"
                      />
                    </div>
                    {errors.confirmPassword && (
                      <p className="mt-2 text-sm text-red-600 flex items-center gap-1 animate-fade-in">
                        <AlertCircle className="w-4 h-4" />
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Terms */}
              <div>
                <label className="flex items-start gap-3 group cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.acceptTerms}
                    onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
                    className="mt-1 w-5 h-5 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500 cursor-pointer"
                  />
                  <span className="text-sm text-gray-600 leading-relaxed">
                    <Link href="/kullanim-kosullari" className="text-cyan-600 hover:text-cyan-700 font-semibold hover:underline transition-colors">
                      Kullanım koşullarını
                    </Link>{' '}
                    ve{' '}
                    <Link href="/gizlilik-politikasi" className="text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-colors">
                      gizlilik politikasını
                    </Link>{' '}
                    okudum ve kabul ediyorum. *
                  </span>
                </label>
                {errors.acceptTerms && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1 animate-fade-in">
                    <AlertCircle className="w-4 h-4" />
                    {errors.acceptTerms}
                  </p>
                )}
              </div>

              {errors.submit && (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 animate-fade-in">
                  <p className="text-sm text-red-600 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    {errors.submit}
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-cyan-600 via-blue-600 to-teal-600 text-white py-4 rounded-xl font-bold text-lg hover:from-cyan-700 hover:via-blue-700 hover:to-teal-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Kayıt Olunuyor...
                  </>
                ) : (
                  <>
                    Hesap Oluştur
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              <p className="text-center text-sm text-gray-600">
                Zaten hesabınız var mı?{' '}
                <Link href="/giris" className="text-cyan-600 font-semibold hover:text-cyan-700 hover:underline transition-colors">
                  Giriş yapın
                </Link>
              </p>
            </form>
          </div>

          {/* Features */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in">
            <div className="bg-white/60 backdrop-blur-lg rounded-xl p-4 border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-center gap-2 text-sm font-semibold text-gray-700">
                <Check className="w-5 h-5 text-green-500" />
                <span>14 Gün Ücretsiz Deneme</span>
              </div>
            </div>
            <div className="bg-white/60 backdrop-blur-lg rounded-xl p-4 border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-center gap-2 text-sm font-semibold text-gray-700">
                <Check className="w-5 h-5 text-green-500" />
                <span>Kredi Kartı Gerektirmez</span>
              </div>
            </div>
            <div className="bg-white/60 backdrop-blur-lg rounded-xl p-4 border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-center gap-2 text-sm font-semibold text-gray-700">
                <Check className="w-5 h-5 text-green-500" />
                <span>Anında Aktivasyon</span>
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
