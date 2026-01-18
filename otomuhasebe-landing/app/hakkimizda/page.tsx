export const metadata = {
  title: 'Hakkımızda',
  description: 'OtoMuhasebe hakkında bilgiler',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <section className="bg-gradient-to-br from-blue-600 to-purple-800 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Hakkımızda</h1>
          <p className="text-xl text-blue-100">Muhasebe süreçlerinizi kolaylaştırmak için buradayız</p>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="prose prose-lg max-w-none">
            <h2>Misyonumuz</h2>
            <p>
              Türkiye'deki işletmelerin muhasebe süreçlerini dijitalleştirmek ve otomatikleştirmek. 
              KOBİ'lerin muhasebe işlemlerini kolaylaştırarak, onların asıl işlerine odaklanmalarını sağlamak.
            </p>

            <h2>Vizyonumuz</h2>
            <p>
              Türkiye'nin en güvenilir ve kullanıcı dostu bulut tabanlı muhasebe yazılımı olmak. 
              Her işletmenin muhasebe işlemlerini kolayca yönetebilmesini sağlamak.
            </p>

            <h2>Değerlerimiz</h2>
            <ul>
              <li><strong>Güvenilirlik:</strong> Verilerinizin güvenliği bizim önceliğimiz</li>
              <li><strong>Kolaylık:</strong> Karmaşık işlemleri basitleştiriyoruz</li>
              <li><strong>İnovasyon:</strong> Sürekli gelişen teknoloji ile yenilikçi çözümler</li>
              <li><strong>Müşteri Odaklılık:</strong> Müşteri memnuniyeti her şeyden önce</li>
            </ul>

            <h2>İletişim</h2>
            <p>
              <strong>Email:</strong> info@otomuhasebe.com<br />
              <strong>Telefon:</strong> +90 (212) 000 00 00<br />
              <strong>Adres:</strong> İstanbul, Türkiye
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

