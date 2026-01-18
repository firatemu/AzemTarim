import { FileText, TrendingUp, Archive, Building, Users, BarChart3, Smartphone, Code } from 'lucide-react';

export const metadata = {
  title: 'Özellikler',
  description: 'OtoMuhasebe özellikleri ve yetenekleri',
};

export default function FeaturesPage() {
  const features = [
    {
      icon: FileText,
      title: 'Otomatik Fatura Oluşturma',
      desc: 'Faturalarınızı otomatik oluşturun, düzenleyin ve yönetin. E-fatura ve e-arşiv desteği ile tam uyumlu.',
      details: ['E-fatura entegrasyonu', 'Otomatik numaralandırma', 'Şablon yönetimi', 'Toplu işlemler'],
    },
    {
      icon: TrendingUp,
      title: 'Gelir-Gider Takibi',
      desc: 'Gelir ve giderlerinizi detaylı şekilde takip edin. Kategorilere göre analiz yapın.',
      details: ['Kategori bazlı takip', 'Grafik ve raporlar', 'Bütçe yönetimi', 'Otomatik kategorizasyon'],
    },
    {
      icon: Archive,
      title: 'E-Arşiv Entegrasyonu',
      desc: 'E-arşiv sistemi ile tam entegrasyon. Faturalarınız otomatik olarak e-arşive gönderilir.',
      details: ['Otomatik e-arşiv gönderimi', 'E-arşiv sorgulama', 'Yedekleme', 'Uyumluluk garantisi'],
    },
    {
      icon: Building,
      title: 'Çoklu Şirket Yönetimi',
      desc: 'Birden fazla şirketi tek bir panelden yönetin. Her şirket için ayrı veri izolasyonu.',
      details: ['Sınırsız şirket', 'Ayrı veri izolasyonu', 'Kolay geçiş', 'Toplu işlemler'],
    },
    {
      icon: Users,
      title: 'Muhasebeci Erişimi',
      desc: 'Muhasebecinize erişim verin. Verilerinizi güvenli şekilde paylaşın.',
      details: ['Rol bazlı erişim', 'Güvenli paylaşım', 'İşlem geçmişi', 'Onay mekanizması'],
    },
    {
      icon: BarChart3,
      title: 'Raporlama & Analiz',
      desc: 'Detaylı raporlar ve analizler. Excel ve PDF formatında dışa aktarım.',
      details: ['Gelir-gider raporları', 'KDV raporları', 'Özel raporlar', 'Excel/PDF export'],
    },
    {
      icon: Smartphone,
      title: 'Mobil Uygulama',
      desc: 'iOS ve Android uygulamaları ile her yerden erişim sağlayın.',
      details: ['iOS uygulaması', 'Android uygulaması', 'Offline mod', 'Push bildirimleri'],
    },
    {
      icon: Code,
      title: 'API Entegrasyonu',
      desc: 'RESTful API ile sisteminizi entegre edin. Webhook desteği.',
      details: ['RESTful API', 'Webhook desteği', 'API dokümantasyonu', 'Örnek kodlar'],
    },
  ];

  return (
    <div className="min-h-screen">
      <section className="bg-gradient-to-br from-blue-600 to-purple-800 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Özellikler</h1>
          <p className="text-xl text-blue-100">Muhasebe işlemlerinizi kolaylaştıran güçlü özellikler</p>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {features.map((feature, idx) => (
              <div key={idx} className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                    <feature.icon className="w-8 h-8 text-blue-600" />
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-gray-600 mb-4">{feature.desc}</p>
                  <ul className="space-y-2">
                    {feature.details.map((detail, dIdx) => (
                      <li key={dIdx} className="flex items-center gap-2 text-gray-700">
                        <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

