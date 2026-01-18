'use client';

import { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function PricingPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Kullanıcı giriş yapmış mı kontrol et
    const accessToken = localStorage.getItem('accessToken');
    setIsAuthenticated(!!accessToken);
  }, []);
  const plans = [
    {
      name: 'BASIC',
      annualPrice: '₺2,870',
      features: ['1 Kullanıcı', '1 Yıl', '1 Şirket', '100 Fatura/ay', 'Temel raporlar', 'Email destek', '7/24 Erişim'],
      popular: false,
    },
    {
      name: 'PROFESSIONAL',
      annualPrice: '₺5,750',
      features: ['1 Kullanıcı', '1 Yıl', '3 Şirket', 'Sınırsız fatura', 'Gelişmiş raporlar', 'E-arşiv entegrasyonu', 'Öncelikli destek', 'API erişimi'],
      popular: true,
    },
    {
      name: 'ENTERPRISE',
      annualPrice: 'Özel Fiyat',
      features: ['1 Kullanıcı', '1 Yıl', 'Sınırsız şirket', 'API erişimi', 'Özel entegrasyonlar', 'Dedicated hesap yöneticisi', 'SLA garantisi', 'Özel eğitim'],
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen">
      <section className="bg-gradient-to-br from-blue-600 to-purple-800 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Fiyatlandırma</h1>
          <p className="text-xl text-blue-100">İhtiyacınıza uygun planı seçin</p>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-gray-600">Tüm paketler 1 kullanıcı, 1 yıllık bedelli</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan, idx) => (
              <div
                key={idx}
                className={`p-8 rounded-lg border-2 ${plan.popular ? 'border-blue-600 shadow-xl scale-105' : 'border-gray-200'}`}
              >
                {plan.popular && (
                  <div className="bg-blue-600 text-white text-center py-1 rounded-t-lg -mt-8 -mx-8 mb-4">
                    En Popüler
                  </div>
                )}
                <h3 className="text-2xl font-bold mb-4">{plan.name}</h3>
                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold">{plan.annualPrice}</span>
                    {plan.annualPrice !== 'Özel Fiyat' && (
                      <span className="text-gray-600">/yıl</span>
                    )}
                  </div>
                  {plan.annualPrice !== 'Özel Fiyat' && (
                    <div className="mt-2 text-sm text-gray-500">
                      1 kullanıcı için
                    </div>
                  )}
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-500" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => {
                    if (isAuthenticated) {
                      // Giriş yapmışsa ödeme sayfasına yönlendir (satın alma)
                      router.push(`/odeme?plan=${plan.name}&type=annual`);
                    } else {
                      // Giriş yapmamışsa kayıt sayfasına yönlendir
                      router.push('/kayit');
                    }
                  }}
                  className={`w-full text-center py-3 rounded-lg font-semibold transition-colors ${
                    plan.popular
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  Satın Al
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

