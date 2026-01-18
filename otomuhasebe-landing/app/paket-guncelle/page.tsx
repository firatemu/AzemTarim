'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  Puzzle, 
  CreditCard, 
  Building2, 
  User,
  CheckCircle,
  X,
  ArrowLeft,
  AlertCircle
} from 'lucide-react';

interface Subscription {
  id: string;
  status: string;
  plan?: {
    id: string;
    name: string;
    price: number | string;
  };
  additionalUsers?: number;
}

interface Module {
  id: string;
  name: string;
  description: string;
}

export default function PaketGuncellePage() {
  const router = useRouter();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [purchasing, setPurchasing] = useState(false);
  
  // Seçimler
  const [additionalUsersCount, setAdditionalUsersCount] = useState(0);
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'bank_transfer'>('credit_card');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      router.push('/login');
      return;
    }

    try {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.otomuhasebe.com';
      
      // Subscription bilgisini al
      const subResponse = await fetch(`${apiUrl}/api/subscriptions/current`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      
      if (subResponse.ok) {
        const subData = await subResponse.json();
        setSubscription(subData);
      }

      // Modülleri al
      const modulesResponse = await fetch(`${apiUrl}/api/licenses/available-modules`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (modulesResponse.ok) {
        const modulesData = await modulesResponse.json();
        setModules(modulesData.available || []);
      }
    } catch (err: any) {
      setError(err.message || 'Veri yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };


  const calculateTotal = () => {
    if (!subscription?.plan?.price) return 0;
    const planPrice = typeof subscription.plan.price === 'string' 
      ? parseFloat(subscription.plan.price) 
      : Number(subscription.plan.price);
    
    const usersPrice = additionalUsersCount * planPrice;
    const modulesPrice = selectedModules.length * planPrice;
    return usersPrice + modulesPrice;
  };

  const handlePurchase = async () => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      setError('Oturum bilgisi bulunamadı');
      return;
    }

    if (additionalUsersCount === 0 && selectedModules.length === 0) {
      setError('Lütfen en az bir ürün seçin');
      return;
    }

    try {
      setPurchasing(true);
      setError(null);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.otomuhasebe.com';

      const requestBody: any = {
        additionalUsers: additionalUsersCount > 0 ? additionalUsersCount : undefined,
        modules: selectedModules.length > 0 ? selectedModules : undefined,
        paymentMethod,
      };

      const response = await fetch(`${apiUrl}/api/licenses/upgrade-package`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Paket güncellenemedi');
      }

      const data = await response.json();
      alert(`Paket başarıyla güncellendi! ${paymentMethod === 'bank_transfer' ? 'Ödeme onayı bekleniyor.' : ''}`);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Paket güncellenirken bir hata oluştu');
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Abonelik Bulunamadı</h2>
          <p className="text-gray-600 mb-6">Aktif bir aboneliğiniz bulunmamaktadır.</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
          >
            Dashboard'a Dön
          </button>
        </div>
      </div>
    );
  }

  const planPrice = subscription.plan?.price 
    ? (typeof subscription.plan.price === 'string' 
        ? parseFloat(subscription.plan.price) 
        : Number(subscription.plan.price))
    : 0;
  const totalPrice = calculateTotal();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Dashboard'a Dön</span>
          </button>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Paket Güncelle</h1>
          <p className="text-gray-600">Mevcut paketinize ek kullanıcı ve modül ekleyebilirsiniz</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sol Taraf - Seçimler */}
          <div className="lg:col-span-2 space-y-6">
            {/* Ek Kullanıcı */}
            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Ek Kullanıcı</h2>
                  <p className="text-sm text-gray-600">Mevcut: {subscription.additionalUsers || 0} ek kullanıcı</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setAdditionalUsersCount(Math.max(0, additionalUsersCount - 1))}
                  className="w-10 h-10 border-2 border-gray-300 rounded-lg flex items-center justify-center hover:border-purple-500 hover:bg-purple-50 transition-colors font-semibold text-gray-700"
                >
                  -
                </button>
                <span className="text-2xl font-bold text-gray-900 w-16 text-center">{additionalUsersCount}</span>
                <button
                  onClick={() => setAdditionalUsersCount(additionalUsersCount + 1)}
                  className="w-10 h-10 border-2 border-gray-300 rounded-lg flex items-center justify-center hover:border-purple-500 hover:bg-purple-50 transition-colors font-semibold text-gray-700"
                >
                  +
                </button>
                <div className="ml-auto text-right">
                  <p className="text-sm text-gray-600">Birim Fiyat</p>
                  <p className="text-lg font-bold text-purple-600">
                    ₺{planPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
              {additionalUsersCount > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600">Ara Toplam</p>
                  <p className="text-xl font-bold text-gray-900">
                    ₺{(additionalUsersCount * planPrice).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
              )}
            </div>

            {/* Modüller */}
            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Puzzle className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Modüller</h2>
                  <p className="text-sm text-gray-600">Sahip olmadığınız modülleri satın alın</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {modules.map((module) => (
                  <label
                    key={module.id}
                    className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedModules.includes(module.id)
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedModules.includes(module.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedModules([...selectedModules, module.id]);
                        } else {
                          setSelectedModules(selectedModules.filter(id => id !== module.id));
                        }
                      }}
                      className="mt-1 w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{module.name}</p>
                      <p className="text-sm text-gray-600">{module.description}</p>
                      <p className="text-sm font-bold text-purple-600 mt-1">
                        ₺{planPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
              {selectedModules.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600">Seçili Modül: {selectedModules.length} adet</p>
                  <p className="text-xl font-bold text-gray-900">
                    ₺{(selectedModules.length * planPrice).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Sağ Taraf - Özet ve Ödeme */}
          <div className="space-y-6">
            {/* Özet */}
            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-100 sticky top-4">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Sipariş Özeti</h3>
              <div className="space-y-3 mb-4">
                {additionalUsersCount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Ek Kullanıcı ({additionalUsersCount} adet)</span>
                    <span className="font-semibold">
                      ₺{(additionalUsersCount * planPrice).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                )}
                {selectedModules.length > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Modül ({selectedModules.length} adet)</span>
                    <span className="font-semibold">
                      ₺{(selectedModules.length * planPrice).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                )}
                {totalPrice === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">Lütfen ürün seçin</p>
                )}
              </div>
              {totalPrice > 0 && (
                <div className="border-t border-gray-200 pt-4 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">Toplam</span>
                    <span className="text-2xl font-bold text-purple-600">
                      ₺{totalPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              )}

              {/* Ödeme Şekli */}
              {totalPrice > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Ödeme Şekli</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setPaymentMethod('credit_card')}
                      className={`p-3 border-2 rounded-lg font-semibold transition-colors ${
                        paymentMethod === 'credit_card'
                          ? 'border-purple-500 bg-purple-50 text-purple-700'
                          : 'border-gray-300 text-gray-700 hover:border-purple-300'
                      }`}
                    >
                      <CreditCard className="w-5 h-5 mx-auto mb-1" />
                      Kredi Kartı
                    </button>
                    <button
                      onClick={() => setPaymentMethod('bank_transfer')}
                      className={`p-3 border-2 rounded-lg font-semibold transition-colors ${
                        paymentMethod === 'bank_transfer'
                          ? 'border-purple-500 bg-purple-50 text-purple-700'
                          : 'border-gray-300 text-gray-700 hover:border-purple-300'
                      }`}
                    >
                      <Building2 className="w-5 h-5 mx-auto mb-1" />
                      Banka Havalesi
                    </button>
                  </div>
                </div>
              )}

              {/* Satın Al Butonu */}
              <button
                onClick={handlePurchase}
                disabled={purchasing || totalPrice === 0}
                className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-purple-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
              >
                {purchasing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    İşleniyor...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Satın Al
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

