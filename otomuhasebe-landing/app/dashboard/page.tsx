'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  LayoutDashboard,
  Package, 
  ShoppingCart,
  CreditCard, 
  Settings,
  LogOut,
  User,
  FileText,
  Download,
  CheckCircle, 
  Clock,
  XCircle,
  AlertCircle,
  TrendingUp,
  Calendar,
  Building2,
  Phone,
  Mail,
  Puzzle,
  Plus,
  X,
  Save,
  Receipt
} from 'lucide-react';

interface UserData {
  id: string;
  email: string;
  username: string;
  fullName: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  tenantId?: string;
  phone?: string;
}

interface Subscription {
  id: string;
  status: 'ACTIVE' | 'TRIAL' | 'EXPIRED' | 'CANCELLED' | 'PENDING';
  startDate: string;
  endDate: string;
  packageName?: string;
  plan?: {
    id: string;
    name: string;
    price: number;
  };
  additionalUsers?: number;
}

interface Payment {
  id: string;
  amount: number;
  status: string;
  paymentMethod: string;
  invoiceNumber?: string;
  invoiceFileUrl?: string;
  invoiceFileName?: string;
  createdAt: string;
  paidAt?: string;
}

interface Tenant {
  id: string;
  name: string | null;
  subscription?: Subscription | null;
}

interface UserProfile extends UserData {
  tenant?: Tenant | null;
}

type TabType = 'dashboard' | 'subscription' | 'orders' | 'payments' | 'settings';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [tenantSettings, setTenantSettings] = useState<any>(null);
  
  // Modal states
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [updatingInvoice, setUpdatingInvoice] = useState(false);
  const [profileFormData, setProfileFormData] = useState({
    fullName: '',
    email: '',
    username: '',
    phone: '',
  });
  const [invoiceFormData, setInvoiceFormData] = useState({
    companyType: 'LIMITED' as 'LIMITED' | 'SAHIS',
    companyName: '',
    taxNumber: '',
    tcKimlikNo: '',
    firstName: '',
    lastName: '',
    taxOffice: '',
    city: '',
    district: '',
    address: '',
  });

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user && activeTab) {
      fetchTabData();
    }
  }, [user, activeTab]);

  const checkAuth = async () => {
    const accessToken = localStorage.getItem('accessToken');
    const userData = localStorage.getItem('user');

    if (!accessToken || !userData) {
      router.push('/giris');
      return;
    }

    try {
      const userObj = JSON.parse(userData);
      setUser(userObj);
      await fetchUserProfile(accessToken);
    } catch (err) {
      console.error('Auth check error:', err);
      router.push('/giris');
    }
  };

  const fetchUserProfile = async (token: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.otomuhasebe.com';
      
      // User profile
      const response = await fetch(`${apiUrl}/api/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          handleLogout();
          return;
        }
        throw new Error('Profil bilgileri alınamadı');
      }

      const responseText = await response.text();
      let profileData;
      try {
        profileData = responseText ? JSON.parse(responseText) : {};
      } catch (e) {
        throw new Error('Profil bilgileri alınamadı');
      }
      setUser(profileData);

      // Subscription
      const subResponse = await fetch(`${apiUrl}/api/subscriptions/current`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (subResponse.ok) {
        const subResponseText = await subResponse.text();
        const subData = subResponseText ? JSON.parse(subResponseText) : null;
        setSubscription(subData);
      }

      // Tenant settings
      const settingsResponse = await fetch(`${apiUrl}/api/tenant-settings`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (settingsResponse.ok) {
        const settingsText = await settingsResponse.text();
        const settingsData = settingsText ? JSON.parse(settingsText) : null;
        setTenantSettings(settingsData);
        if (settingsData) {
          setInvoiceFormData({
            companyType: settingsData.companyType || 'LIMITED',
            companyName: settingsData.companyName || '',
            taxNumber: settingsData.taxNumber || '',
            tcKimlikNo: settingsData.tcKimlikNo || '',
            firstName: settingsData.firstName || '',
            lastName: settingsData.lastName || '',
            taxOffice: settingsData.taxOffice || '',
            city: settingsData.city || '',
            district: settingsData.district || '',
            address: settingsData.address || '',
          });
        }
      }
    } catch (err: any) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTabData = async () => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) return;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.otomuhasebe.com';

    try {
      if (activeTab === 'orders') {
        const response = await fetch(`${apiUrl}/api/subscriptions/my-orders`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });

        if (response.ok) {
          const responseText = await response.text();
          const data = responseText ? JSON.parse(responseText) : [];
          setOrders(data);
        }
      }
      
      if (activeTab === 'payments') {
        const response = await fetch(`${apiUrl}/api/subscriptions/my-payments`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });

        if (response.ok) {
          const responseText = await response.text();
          const data = responseText ? JSON.parse(responseText) : [];
          setPayments(data);
        }
      }
    } catch (err) {
      console.error('Tab data fetch error:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    router.push('/giris');
  };

  const getSubscriptionStatusColor = (status?: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'TRIAL':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'EXPIRED':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSubscriptionStatusText = (status?: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'Aktif';
      case 'TRIAL':
        return 'Deneme';
      case 'PENDING':
        return 'Beklemede';
      case 'EXPIRED':
        return 'Süresi Dolmuş';
      case 'CANCELLED':
        return 'İptal Edilmiş';
      default:
        return 'Bilinmiyor';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'FAILED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return 'Ödendi';
      case 'PENDING':
        return 'Bekliyor';
      case 'FAILED':
        return 'Başarısız';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleUpdateProfile = async () => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) return;

    setUpdatingProfile(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.otomuhasebe.com';
      const response = await fetch(`${apiUrl}/api/auth/profile`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileFormData),
      });

      const responseText = await response.text();
      if (!response.ok) {
        throw new Error('Profil güncellenemedi');
      }

      const data = responseText ? JSON.parse(responseText) : {};
      setUser(data);
      setProfileModalOpen(false);
      alert('Profil bilgileri başarıyla güncellendi!');
    } catch (err: any) {
      alert(err.message || 'Profil güncellenirken hata oluştu');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleUpdateInvoice = async () => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) return;

    setUpdatingInvoice(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.otomuhasebe.com';
      const response = await fetch(`${apiUrl}/api/tenant-settings`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invoiceFormData),
      });

      const responseText = await response.text();
      if (!response.ok) {
        throw new Error('Fatura bilgileri güncellenemedi');
      }

      const data = responseText ? JSON.parse(responseText) : {};
      setTenantSettings(data);
      setInvoiceModalOpen(false);
      alert('Fatura bilgileri başarıyla güncellendi!');
    } catch (err: any) {
      alert(err.message || 'Fatura bilgileri güncellenirken hata oluştu');
    } finally {
      setUpdatingInvoice(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const menuItems = [
    { id: 'dashboard' as TabType, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'subscription' as TabType, label: 'Abonelik', icon: Package },
    { id: 'orders' as TabType, label: 'Siparişlerim', icon: ShoppingCart },
    { id: 'payments' as TabType, label: 'Ödemelerim', icon: CreditCard },
    { id: 'settings' as TabType, label: 'Ayarlar', icon: Settings },
  ];

  const stats = {
    totalOrders: orders.length,
    totalSpent: payments.filter(p => p.status === 'SUCCESS').reduce((sum, p) => sum + Number(p.amount || 0), 0),
    pendingPayments: payments.filter(p => p.status === 'PENDING').length,
    activeSubscription: subscription?.status === 'ACTIVE' || subscription?.status === 'TRIAL',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">O</span>
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              OtoMuhasebe
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">{user?.fullName || user?.email}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-purple-600" />
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title="Çıkış Yap"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="w-64 flex-shrink-0 hidden lg:block">
            <nav className="bg-white rounded-xl shadow-sm border border-gray-200 p-2 sticky top-24">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Mobile Menu */}
          <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
            <div className="flex justify-around py-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all ${
                      isActive ? 'text-purple-600' : 'text-gray-500'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-xs font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>
        </div>

          {/* Main Content */}
          <main className="flex-1 pb-20 lg:pb-8">
            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Hoş Geldiniz, {user?.fullName || user?.email}!</h2>
                  <p className="text-gray-600">Hesabınızın genel durumunu buradan takip edebilirsiniz.</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <ShoppingCart className="w-6 h-6 text-blue-600" />
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getSubscriptionStatusColor(subscription?.status)}`}>
                        {getSubscriptionStatusText(subscription?.status)}
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">{stats.totalOrders}</h3>
                    <p className="text-sm text-gray-600 mt-1">Toplam Sipariş</p>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-green-600" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      ₺{stats.totalSpent.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">Toplam Harcama</p>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <Clock className="w-6 h-6 text-yellow-600" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">{stats.pendingPayments}</h3>
                    <p className="text-sm text-gray-600 mt-1">Bekleyen Ödeme</p>
              </div>

                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Package className="w-6 h-6 text-purple-600" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">{subscription?.plan?.name || '-'}</h3>
                    <p className="text-sm text-gray-600 mt-1">Aktif Paket</p>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Hızlı İşlemler</h3>
                    <div className="space-y-2">
                      <button
                        onClick={() => router.push('/paket-guncelle')}
                        className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-md"
                      >
                        <Plus className="w-5 h-5" />
                        <span className="font-medium">Yeni Modül Satın Al</span>
                      </button>
                      <a
                        href="https://panel.otomuhasebe.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center gap-3 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all"
                      >
                        <Package className="w-5 h-5" />
                        <span className="font-medium">Panele Git</span>
                      </a>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Son Siparişler</h3>
                    {orders.length > 0 ? (
                      <div className="space-y-3">
                        {orders.slice(0, 3).map((order: any) => (
                          <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium text-gray-900">
                                {order.invoiceNumber || `Sipariş #${order.id.slice(0, 8)}`}
                              </p>
                              <p className="text-sm text-gray-600">{formatDate(order.createdAt)}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-gray-900">
                                ₺{Number(order.amount).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </p>
                              <span className={`text-xs px-2 py-1 rounded-full ${getPaymentStatusColor(order.status)}`}>
                                {getPaymentStatusText(order.status)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">Henüz sipariş bulunmuyor</p>
                    )}
                  </div>
                </div>
                </div>
            )}

            {/* Subscription Tab */}
            {activeTab === 'subscription' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Abonelik Bilgileri</h2>
                  <p className="text-gray-600">Paket ve abonelik durumunuzu buradan görüntüleyebilirsiniz.</p>
                </div>

                {subscription ? (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Durum</label>
                        <div className="mt-1">
                          <span className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${getSubscriptionStatusColor(subscription.status)}`}>
                            {getSubscriptionStatusText(subscription.status)}
                  </span>
                </div>
              </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Paket</label>
                        <p className="mt-1 text-lg font-semibold text-gray-900">{subscription.plan?.name || subscription.packageName || '-'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Başlangıç Tarihi</label>
                        <p className="mt-1 text-lg font-semibold text-gray-900">{formatDate(subscription.startDate)}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Bitiş Tarihi</label>
                        <p className="mt-1 text-lg font-semibold text-gray-900">{formatDate(subscription.endDate)}</p>
                      </div>
                      {subscription.additionalUsers !== undefined && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Ek Kullanıcı</label>
                          <p className="mt-1 text-lg font-semibold text-gray-900">{subscription.additionalUsers || 0} kullanıcı</p>
                        </div>
                      )}
                      {subscription.plan?.price && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Aylık Ücret</label>
                          <p className="mt-1 text-lg font-semibold text-gray-900">
                            ₺{Number(subscription.plan.price).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <button
                        onClick={() => router.push('/paket-guncelle')}
                        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-md font-medium"
                      >
                        <Plus className="w-5 h-5 inline mr-2" />
                        Yeni Modül Satın Al
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                    <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Aktif Abonelik Bulunamadı</h3>
                    <p className="text-gray-600 mb-6">Yeni bir paket satın alarak başlayabilirsiniz.</p>
                    <button
                      onClick={() => router.push('/fiyatlandirma')}
                      className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-md font-medium"
                    >
                      Paketleri Görüntüle
              </button>
            </div>
                )}
                </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Siparişlerim</h2>
                  <p className="text-gray-600">Tüm siparişlerinizi ve faturalarınızı buradan görüntüleyebilirsiniz.</p>
                </div>

                {orders.length > 0 ? (
                  <div className="space-y-4">
                    {orders.map((order: any) => (
                      <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                              {order.invoiceNumber ? (
                                <span className="font-mono">{order.invoiceNumber}</span>
                              ) : (
                                `Sipariş #${order.id.slice(0, 8)}`
                              )}
                            </h3>
                            <p className="text-sm text-gray-600">{formatDateTime(order.createdAt)}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getPaymentStatusColor(order.status)}`}>
                            {getPaymentStatusText(order.status)}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div>
                            <label className="text-sm font-medium text-gray-500">Tutar</label>
                            <p className="text-xl font-bold text-gray-900 mt-1">
                              ₺{Number(order.amount).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500">Ödeme Yöntemi</label>
                            <p className="text-lg font-semibold text-gray-900 mt-1">
                              {order.paymentMethod === 'bank_transfer' ? '🏦 Banka Havalesi' : '💳 Kredi Kartı'}
                            </p>
                          </div>
                          {order.subscription?.plan && (
                            <div>
                              <label className="text-sm font-medium text-gray-500">Plan</label>
                              <p className="text-lg font-semibold text-gray-900 mt-1">{order.subscription.plan.name}</p>
                            </div>
                          )}
                        </div>
                        {order.invoiceFileUrl && (
                          <div className="pt-4 border-t border-gray-200">
                            <a
                              href={`${process.env.NEXT_PUBLIC_API_URL || 'https://api.otomuhasebe.com'}${order.invoiceFileUrl}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
                            >
                              <Download className="w-4 h-4" />
                              <span className="font-medium">Faturayı İndir</span>
                              {order.invoiceFileName && (
                                <span className="text-sm text-purple-600">({order.invoiceFileName})</span>
                              )}
                            </a>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                    <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Henüz Sipariş Bulunmuyor</h3>
                    <p className="text-gray-600 mb-6">İlk siparişinizi vermek için paketlerimizi inceleyin.</p>
                    <button
                      onClick={() => router.push('/fiyatlandirma')}
                      className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-md font-medium"
                    >
                      Paketleri Görüntüle
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Payments Tab */}
            {activeTab === 'payments' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Ödemelerim</h2>
                  <p className="text-gray-600">Ödeme geçmişinizi buradan takip edebilirsiniz.</p>
              </div>

                {payments.length > 0 ? (
                <div className="space-y-4">
                    {payments.map((payment: any) => (
                      <div key={payment.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                              {payment.invoiceNumber ? (
                                <span className="font-mono">{payment.invoiceNumber}</span>
                              ) : (
                                `Ödeme #${payment.id.slice(0, 8)}`
                              )}
                            </h3>
                            <p className="text-sm text-gray-600">{formatDateTime(payment.createdAt)}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getPaymentStatusColor(payment.status)}`}>
                            {getPaymentStatusText(payment.status)}
                    </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-gray-500">Tutar</label>
                            <p className="text-xl font-bold text-gray-900 mt-1">
                              ₺{Number(payment.amount).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500">Ödeme Yöntemi</label>
                            <p className="text-lg font-semibold text-gray-900 mt-1">
                              {payment.paymentMethod === 'bank_transfer' ? '🏦 Banka Havalesi' : '💳 Kredi Kartı'}
                            </p>
                          </div>
                          {payment.paidAt && (
                            <div>
                              <label className="text-sm font-medium text-gray-500">Ödeme Tarihi</label>
                              <p className="text-lg font-semibold text-gray-900 mt-1">{formatDateTime(payment.paidAt)}</p>
                            </div>
                          )}
                        </div>
                        {payment.invoiceFileUrl && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <a
                              href={`${process.env.NEXT_PUBLIC_API_URL || 'https://api.otomuhasebe.com'}${payment.invoiceFileUrl}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
                            >
                              <Download className="w-4 h-4" />
                              <span className="font-medium">Faturayı İndir</span>
                              {payment.invoiceFileName && (
                                <span className="text-sm text-purple-600">({payment.invoiceFileName})</span>
                              )}
                            </a>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                    <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Henüz Ödeme Bulunmuyor</h3>
                    <p className="text-gray-600">Ödeme geçmişiniz burada görüntülenecektir.</p>
                  </div>
                )}
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Ayarlar</h2>
                  <p className="text-gray-600">Profil ve fatura bilgilerinizi buradan yönetebilirsiniz.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Profile Settings */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Profil Bilgileri</h3>
                      <button
                        onClick={() => {
                          setProfileFormData({
                            fullName: user?.fullName || '',
                            email: user?.email || '',
                            username: user?.username || '',
                            phone: user?.phone || '',
                          });
                          setProfileModalOpen(true);
                        }}
                        className="text-purple-600 hover:text-purple-700 font-medium text-sm"
                      >
                        Düzenle
                      </button>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Ad Soyad</label>
                        <p className="text-gray-900 font-medium">{user?.fullName || '-'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Email</label>
                        <p className="text-gray-900 font-medium">{user?.email || '-'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Kullanıcı Adı</label>
                        <p className="text-gray-900 font-medium">{user?.username || '-'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Telefon</label>
                        <p className="text-gray-900 font-medium">{user?.phone || '-'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Invoice Settings */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Fatura Bilgileri</h3>
                      <button
                        onClick={() => setInvoiceModalOpen(true)}
                        className="text-purple-600 hover:text-purple-700 font-medium text-sm"
                      >
                        Düzenle
                      </button>
                    </div>
                    {tenantSettings ? (
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-gray-500">Şirket Tipi</label>
                          <p className="text-gray-900 font-medium">
                            {tenantSettings.companyType === 'LIMITED' ? 'Limited Şirket' : 'Şahıs Firması'}
                          </p>
                        </div>
                        {tenantSettings.companyType === 'LIMITED' ? (
                          <>
                            <div>
                              <label className="text-sm font-medium text-gray-500">Şirket Adı</label>
                              <p className="text-gray-900 font-medium">{tenantSettings.companyName || '-'}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-500">Vergi Numarası</label>
                              <p className="text-gray-900 font-medium font-mono">{tenantSettings.taxNumber || '-'}</p>
                            </div>
                          </>
                        ) : (
                          <>
                            <div>
                              <label className="text-sm font-medium text-gray-500">Ad Soyad</label>
                              <p className="text-gray-900 font-medium">
                                {tenantSettings.firstName || ''} {tenantSettings.lastName || ''}
                              </p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-500">TC Kimlik No</label>
                              <p className="text-gray-900 font-medium font-mono">{tenantSettings.tcKimlikNo || '-'}</p>
                            </div>
                          </>
                        )}
                        <div>
                          <label className="text-sm font-medium text-gray-500">Vergi Dairesi</label>
                          <p className="text-gray-900 font-medium">{tenantSettings.taxOffice || '-'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Adres</label>
                          <p className="text-gray-900 font-medium">{tenantSettings.address || '-'}</p>
                        </div>
                </div>
              ) : (
                      <p className="text-gray-500 text-sm">Fatura bilgileri henüz girilmemiş</p>
                    )}
                  </div>
                </div>
                </div>
              )}
          </main>
        </div>
      </div>

      {/* Profile Modal */}
      {profileModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Profil Bilgilerini Güncelle</h3>
              <button
                onClick={() => setProfileModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ad Soyad</label>
                <input
                  type="text"
                  value={profileFormData.fullName}
                  onChange={(e) => setProfileFormData({ ...profileFormData, fullName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={profileFormData.email}
                  onChange={(e) => setProfileFormData({ ...profileFormData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Kullanıcı Adı</label>
                <input
                  type="text"
                  value={profileFormData.username}
                  onChange={(e) => setProfileFormData({ ...profileFormData, username: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Telefon</label>
                <input
                  type="tel"
                  value={profileFormData.phone}
                  onChange={(e) => setProfileFormData({ ...profileFormData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setProfileModalOpen(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                İptal
              </button>
              <button
                onClick={handleUpdateProfile}
                disabled={updatingProfile}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-md font-medium disabled:opacity-50"
              >
                {updatingProfile ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {invoiceModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Fatura Bilgilerini Güncelle</h3>
              <button
                onClick={() => setInvoiceModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
                </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Şirket Tipi</label>
                <select
                  value={invoiceFormData.companyType}
                  onChange={(e) => setInvoiceFormData({ ...invoiceFormData, companyType: e.target.value as 'LIMITED' | 'SAHIS' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                >
                  <option value="LIMITED">Limited Şirket</option>
                  <option value="SAHIS">Şahıs Firması</option>
                </select>
              </div>

              {invoiceFormData.companyType === 'LIMITED' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Şirket Adı *</label>
                    <input
                      type="text"
                      value={invoiceFormData.companyName}
                      onChange={(e) => setInvoiceFormData({ ...invoiceFormData, companyName: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Vergi Numarası (10 haneli) *</label>
                    <input
                      type="text"
                      value={invoiceFormData.taxNumber}
                      onChange={(e) => setInvoiceFormData({ ...invoiceFormData, taxNumber: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent font-mono"
                      maxLength={10}
                      required
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Ad *</label>
                      <input
                        type="text"
                        value={invoiceFormData.firstName}
                        onChange={(e) => setInvoiceFormData({ ...invoiceFormData, firstName: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Soyad *</label>
                      <input
                        type="text"
                        value={invoiceFormData.lastName}
                        onChange={(e) => setInvoiceFormData({ ...invoiceFormData, lastName: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">TC Kimlik No (11 haneli) *</label>
                    <input
                      type="text"
                      value={invoiceFormData.tcKimlikNo}
                      onChange={(e) => setInvoiceFormData({ ...invoiceFormData, tcKimlikNo: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent font-mono"
                      maxLength={11}
                      required
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Vergi Dairesi *</label>
                <input
                  type="text"
                  value={invoiceFormData.taxOffice}
                  onChange={(e) => setInvoiceFormData({ ...invoiceFormData, taxOffice: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">İl *</label>
                  <input
                    type="text"
                    value={invoiceFormData.city}
                    onChange={(e) => setInvoiceFormData({ ...invoiceFormData, city: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">İlçe *</label>
                  <input
                    type="text"
                    value={invoiceFormData.district}
                    onChange={(e) => setInvoiceFormData({ ...invoiceFormData, district: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    required
                  />
              </div>
            </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Adres *</label>
                <textarea
                  value={invoiceFormData.address}
                  onChange={(e) => setInvoiceFormData({ ...invoiceFormData, address: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-gray-900 placeholder-gray-400"
                  required
                />
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setInvoiceModalOpen(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                İptal
              </button>
              <button
                onClick={handleUpdateInvoice}
                disabled={updatingInvoice}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-md font-medium disabled:opacity-50"
              >
                {updatingInvoice ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
