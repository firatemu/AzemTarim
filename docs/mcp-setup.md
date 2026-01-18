# MCP (Model Context Protocol) Kurulum Rehberi

Bu doküman, OtoMuhasebe projesi için MCP sunucularının kurulumunu, yapılandırmasını ve kullanımını açıklamaktadır.

## Ön Koşullar

- **Node.js**: v20.19.5 ✓ (yüklü)
- **npx**: v11.6.2 ✓ (yüklü)
- **Proje Dizini**: `/var/www` (çalışma dizini)

## Kurulum Özeti

### ✅ Kurulan MCP Sunucuları (Güvenilir ve Doğrulanmış)

1. **Filesystem MCP** - `@modelcontextprotocol/server-filesystem`
   - **Amaç**: Dosya sistemi erişimi
   - **Root Dizini**: `/var/www/panel-stage/client`
   - **Durum**: Yapılandırıldı

2. **GitHub MCP** - `@modelcontextprotocol/server-github`
   - **Amaç**: GitHub depolarına erişim ve yönetim
   - **Env**: `GITHUB_PERSONAL_ACCESS_TOKEN` gerekiyor
   - **Durum**: Yapılandırıldı
   - **⚠️ Not**: Paket artık desteklenmemektedir (DEPRECATED), ancak çalışmaya devam eder

3. **Playwright MCP** - `puppeteer-mcp-server`
   - **Amaç**: Next.js panel için E2E test akışları (login, liste, filtre, pdf/print)
   - **Env**: `E2E_BASE_URL` gerekiyor (opsiyonel)
   - **Durum**: Yapılandırıldı
   - **Güvenilirlik**: npm'de mevcut, GitHub'de aktif geliştirme
   - **Not**: Puppeteer tabanlı alternatif, Playwright gibi işlevsellik sağlar

### ❌ Context7'de Olmayan Paketler (Kurulmadı)

Aşağıdaki MCP sunucuları, **Context7 ekosisteminden eklenmediği** için araştırıldı ancak **resmi veya güvenilir bir paket bulunamadığı için kurulmamıştır**:

| MCP Adı | Amaç | Durum | Neden Kurulmadı |
|----------|-------|--------|----------------|
| **PostgreSQL** | Şema keşfi, sorgu/EXPLAIN, performans teşhisi | ❌ Kurulmadı | Resmi paket npm'de yok |
| **Redis** | Cache/session yönetimi | ❌ Kurulmadı | Resmi paket npm'de yok |
| **Sentry** | Hata/perf olayları triage | ❌ Kurulmadı | Resmi paket npm'de yok |

## Paket Doğrulama Süreci

Aşağıdaki kategoriler için kapsamlı bir araştırma yapıldı:

### Postgres, Redis, Sentry için
- **Aranılan Kaynaklar**: modelcontextprotocol/servers listesi, GitHub reposu
- **npm Registry**: Resmi paket araması yapıldı
- **Sonuç**: Resmi `@modelcontextprotocol/server-{postgres,redis,sentry}` paketleri bulunamadı
- **Alternatifler**:
  - Postgres için: Supabase SDK (ancak bu bir SDK, MCP sunucusu değil)
  - Genel: Özel MCP sunucusu geliştirme (Python/Node.js ile)

### Playwright için
- **Aranılan Kaynaklar**: npm registry, GitHub topluluk
- **Bulunan Alternatifler**:
  1. `puppeteer-mcp-server` - npm'de mevcut, aktif
  2. `@hisma/server-puppeteer` - fork, güncelleştirilmiş
- **Seçilen Paket**: `puppeteer-mcp-server` (güvenilirlik ve aktif geliştirme)
- **Referans**: https://github.com/merajmehrabi/puppeteer-mcp-server

## Dosya Yapısı

```
/var/www/
├── .cursor/
│   ├── mcp.json              # MCP sunucuları konfigürasyonu (güncellendi)
│   └── .env.mcp.example    # Secret anahtarları şablonu (güncellendi)
└── docs/
    └── mcp-setup.md          # Bu doküman (güncellendi)
```

## Yapılandırma Detayları

### `/var/www/.cursor/mcp.json`

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/var/www/panel-stage/client"],
      "env": {}
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_PERSONAL_ACCESS_TOKEN}"
      }
    },
    "playwright": {
      "command": "npx",
      "args": ["-y", "puppeteer-mcp-server"],
      "env": {
        "E2E_BASE_URL": "${E2E_BASE_URL}"
      }
    }
  }
}
```

**MCP Sunucuları:**
1. **filesystem** - Filesystem erişimi
2. **github** - GitHub repo yönetimi (DEPRECATED not)
3. **playwright** - Browser automation/E2E testing

### `/var/www/.cursor/.env.mcp.example`

```bash
GITHUB_PERSONAL_ACCESS_TOKEN=
DATABASE_URL=
REDIS_URL=
E2E_BASE_URL=
SENTRY_AUTH_TOKEN=
SENTRY_ORG=
SENTRY_PROJECT=
SENTRY_DSN=
```

## Kullanım

### Local vs Remote SSH

Bu proje **remote SSH** üzerinden bir sunucuda çalışıyor. MCP sunucuları Cursor'ın çalıştığı yerde yani sunucuda çalışacak.

### Secret'ların Ayarlanması

1. `.env.mcp.example` dosyasını kopyalayın:
   ```bash
   cp /var/www/.cursor/.env.mcp.example /var/www/.cursor/.env.mcp
   ```

2. Secret'ları dosyaya ekleyin:
   ```bash
   nano /var/www/.cursor/.env.mcp
   ```

   **Güvenlik Notu**: Repo içine secret yazmayın, sadece `.env` dosyasında tutun!

3. Cursor içinden env referansı otomatik çalışacak.

### Filesystem MCP Testi

Filesystem MCP `/var/www/panel-stage/client` dizinine erişebilmeli. Test için:

1. Cursor'ın MCP panelinde "filesystem" sunucusunun bağlı olduğunu doğrulayın
2. Dosya listesi almayı deneyin
3. Dosya okuma/yazma işlemlerini test edin

### GitHub MCP Testi

GitHub MCP kullanmak için:

1. GitHub Personal Access Token alın (repo scope gerekli)
2. Token'ı `.env.mcp` dosyasına ekleyin
3. Cursor'ı yeniden başlatın
4. MCP panelinde "github" sunucusunun bağlı olduğunu doğrulayın

### Playwright MCP Testi (Opsiyonel)

E2E testleri için Playwright MCP kullanacaksanız:

1. `.env.mcp` dosyasına `E2E_BASE_URL` ekleyin:
   ```bash
   E2E_BASE_URL=https://panel.otomuhasebe.com
   ```

2. Cursor'ın MCP panelinde "playwright" sunucusunun bağlı olduğunu doğrulayın
3. Test akışlarını çalıştırın:
   - Login sayfası açma
   - Liste görüntüleme
   - Filtreleme
   - PDF/print işlevleri

## Sorun Giderme

### MCP Sunucusu Başlamıyorsa

1. **JSON Geçerliliği**: `mcp.json` dosyasının geçerli JSON olup olmadığını kontrol edin
   ```bash
   cat /var/www/.cursor/mcp.json | python3 -m json.tool
   ```

2. **Paket Yükleme**: İlgili paketin `npx` ile indirilebildiğini kontrol edin
   ```bash
   npx -y @modelcontextprotocol/server-filesystem --help
   ```

3. **Dosya İzinleri**: Root dizinine erişim izinlerini kontrol edin
   ```bash
   ls -la /var/www/panel-stage/client
   ```

### GitHub Token Hatası

- **Hata**: "Bad credentials" veya "401 Unauthorized"
- **Çözüm**: Token'ın doğru kapsa (repo read) sahip olduğunu doğrulayın
- **Not**: GitHub MCP paketi DEPRECATED ilan edilmiştir, gelecekte desteklenmeyebilir

### Playwright Bağlantı Hatası

- **Hata**: "Connection refused" veya "ECONNREFUSED"
- **Çözüm**:
  1. `E2E_BASE_URL`'nın doğru ayarlandığını doğrulayın
  2. E2E uygulamanın çalıştığından emin olun
  3. Nginx yapılandırmasını kontrol edin

## Güvenlik İpuçları

1. **Secret Yönetimi**:
   - Asla secret'ları repo'ya commit etmeyin
   - `.env` dosyasını `.gitignore`'a eklediğinizden emin olun
   - Token'ı düzenli olarak yenileyin (30-90 gün önerisi)

2. **Erişim Kontrolü**:
   - GitHub token için minimum gerekli scope'u verin (repo:read)
   - Database URL için read-only kullanıcı kullanın (mümkünse)

3. **Node.js Güncelliği**:
   ```bash
   node -v    # v20.19.5+ gerekli
   npx -v    # v11.6.2+ gerekli
   ```

## Eksik Paketler Raporu

Aşağıdaki MCP sunucuları, **resmi veya güvenilir paket bulunamadığı için kurulmamıştır**:

| MCP Adı | Amaç | Neden Eklenmedi | Alternatif |
|----------|-------|----------------|------------|
| **PostgreSQL** | Şema keşfi, sorgu/EXPLAIN | Resmi paket npm'de yok | Özel MCP geliştirme öneriliyor |
| **Redis** | Cache/session yönetimi | Resmi paket npm'de yok | Özel MCP geliştirme öneriliyor |
| **Sentry** | Hata/perf olayları triage | Resmi paket npm'de yok | Özel MCP geliştirme öneriliyor |

**Not**: Bu paketler için alternatif çözümler:
- Postgres: Prisma/PG Client + özel MCP sunucusu geliştirme
- Redis: Redis Client + özel MCP sunucusu geliştirme  
- Sentry: Sentry SDK + özel MCP sunucusu geliştirme

## Gelecek İyileştirmeler

1. **Playwright MCP**: `puppeteer-mcp-server` paketi daha fazla test edilecek
2. **PostgreSQL/Redis/Sentry**: Özel MCP sunucuları geliştirilebilir (Node.js + @modelcontextprotocol/sdk)
3. **MCP Inspector**: `@modelcontextprotocol/inspector` eklenerek config yönetimi kolaylaştırılabilir

## Sonuç

- ✅ Filesystem MCP - Kurulu ve yapılandırılmış
- ✅ GitHub MCP - Kurulu (DEPRECATED not, ancak çalışmaya devam eder)
- ✅ Playwright MCP - Kurulu (puppeteer-mcp-server ile)
- ❌ PostgreSQL MCP - Resmi paket yok (alternatif: özel geliştirme)
- ❌ Redis MCP - Resmi paket yok (alternatif: özel geliştirme)
- ❌ Sentry MCP - Resmi paket yok (alternatif: özel geliştirme)

## Destek

Sorun yaşarsanız:
1. MCP sunucusu loglarını kontrol edin
2. Node.js ve npx sürümlerini doğrulayın
3. Cursor'ın MCP panelindeki hata mesajlarını inceleyin
4. Bu dokümanı güncelleyin

---

**Oluşturma Tarihi**: 2026-01-09
**Güncelleme Tarihi**: 2026-01-09 (Playwright eklendi)
**Node.js Sürümü**: v20.19.5
**npx Sürümü**: v11.6.2
**Çalışma Modu**: Remote SSH
**Kurulum Yaklaşımı**: Güvenilir paketlere öncelik, alternatiflere geri dönüş
