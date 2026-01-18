-- CreateEnum
CREATE TYPE "TenantStatus" AS ENUM ('PENDING', 'ACTIVE', 'SUSPENDED', 'TRIAL', 'CHURNED', 'DELETED');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('PENDING', 'TRIAL', 'ACTIVE', 'PAST_DUE', 'CANCELED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "BillingPeriod" AS ENUM ('MONTHLY', 'QUARTERLY', 'YEARLY', 'LIFETIME');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PROCESSING', 'SUCCESS', 'FAILED', 'REFUNDED', 'CANCELED');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'TENANT_ADMIN', 'ADMIN', 'USER', 'VIEWER', 'SUPPORT', 'MANAGER');

-- CreateEnum
CREATE TYPE "PriceCardType" AS ENUM ('SALE', 'PURCHASE');

-- CreateEnum
CREATE TYPE "HareketTipi" AS ENUM ('GIRIS', 'CIKIS', 'SATIS', 'IADE', 'SAYIM', 'SAYIM_FAZLA', 'SAYIM_EKSIK');

-- CreateEnum
CREATE TYPE "CariTip" AS ENUM ('MUSTERI', 'TEDARIKCI', 'HER_IKISI');

-- CreateEnum
CREATE TYPE "SirketTipi" AS ENUM ('KURUMSAL', 'SAHIS');

-- CreateEnum
CREATE TYPE "BorcAlacak" AS ENUM ('BORC', 'ALACAK', 'DEVIR');

-- CreateEnum
CREATE TYPE "BelgeTipi" AS ENUM ('FATURA', 'TAHSILAT', 'ODEME', 'CEK_SENET', 'DEVIR', 'DUZELTME');

-- CreateEnum
CREATE TYPE "BankaHesapTipi" AS ENUM ('VADESIZ', 'POS');

-- CreateEnum
CREATE TYPE "KasaTipi" AS ENUM ('NAKIT', 'POS', 'FIRMA_KREDI_KARTI', 'BANKA', 'CEK_SENET');

-- CreateEnum
CREATE TYPE "KasaHareketTipi" AS ENUM ('TAHSILAT', 'ODEME', 'HAVALE_GELEN', 'HAVALE_GIDEN', 'KREDI_KARTI', 'VIRMAN', 'DEVIR', 'CEK_ALINDI', 'CEK_VERILDI', 'SENET_ALINDI', 'SENET_VERILDI', 'CEK_TAHSIL', 'SENET_TAHSIL');

-- CreateEnum
CREATE TYPE "LogAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'DURUM_DEGISIKLIK', 'IPTAL', 'RESTORE', 'SIPARISE_DONUSTU', 'EFATURA_GONDERILDI', 'EFATURA_GONDERIM_HATASI', 'SEVK');

-- CreateEnum
CREATE TYPE "FaturaTipi" AS ENUM ('ALIS', 'SATIS', 'SATIS_IADE', 'ALIS_IADE');

-- CreateEnum
CREATE TYPE "FaturaDurum" AS ENUM ('ACIK', 'KAPALI', 'KISMEN_ODENDI', 'ONAYLANDI', 'IPTAL');

-- CreateEnum
CREATE TYPE "EFaturaStatus" AS ENUM ('PENDING', 'SENT', 'ERROR', 'DRAFT');

-- CreateEnum
CREATE TYPE "TahsilatTip" AS ENUM ('TAHSILAT', 'ODEME');

-- CreateEnum
CREATE TYPE "OdemeTipi" AS ENUM ('NAKIT', 'KREDI_KARTI', 'BANKA_HAVALESI', 'CEK', 'SENET');

-- CreateEnum
CREATE TYPE "SiparisTipi" AS ENUM ('SATIS', 'SATIN_ALMA');

-- CreateEnum
CREATE TYPE "SiparisDurum" AS ENUM ('BEKLEMEDE', 'HAZIRLANIYOR', 'HAZIRLANDI', 'SEVK_EDILDI', 'KISMI_SEVK', 'FATURALANDI', 'IPTAL');

-- CreateEnum
CREATE TYPE "TeklifTipi" AS ENUM ('SATIS', 'SATIN_ALMA');

-- CreateEnum
CREATE TYPE "TeklifDurum" AS ENUM ('TEKLIF', 'ONAYLANDI', 'REDDEDILDI', 'SIPARISE_DONUSTU');

-- CreateEnum
CREATE TYPE "SayimTipi" AS ENUM ('URUN_BAZLI', 'RAF_BAZLI');

-- CreateEnum
CREATE TYPE "SayimDurum" AS ENUM ('TASLAK', 'TAMAMLANDI', 'ONAYLANDI', 'IPTAL');

-- CreateEnum
CREATE TYPE "StockMoveType" AS ENUM ('PUT_AWAY', 'TRANSFER', 'PICKING', 'ADJUSTMENT', 'SALE', 'RETURN', 'DAMAGE');

-- CreateEnum
CREATE TYPE "HavaleTipi" AS ENUM ('GELEN', 'GIDEN');

-- CreateEnum
CREATE TYPE "CekSenetTip" AS ENUM ('CEK', 'SENET');

-- CreateEnum
CREATE TYPE "PortfoyTip" AS ENUM ('ALACAK', 'BORC');

-- CreateEnum
CREATE TYPE "CekSenetDurum" AS ENUM ('PORTFOYDE', 'ODENMEDI', 'BANKAYA_VERILDI', 'TAHSIL_EDILDI', 'ODENDI', 'CIRO_EDILDI', 'IADE_EDILDI', 'KARSILIKIZ');

-- CreateEnum
CREATE TYPE "Cinsiyet" AS ENUM ('ERKEK', 'KADIN', 'BELIRTILMEMIS');

-- CreateEnum
CREATE TYPE "MedeniDurum" AS ENUM ('BEKAR', 'EVLI');

-- CreateEnum
CREATE TYPE "PersonelOdemeTip" AS ENUM ('HAK_EDIS', 'MAAS', 'AVANS', 'PRIM', 'KESINTI', 'ZIMMET', 'ZIMMET_IADE');

-- CreateEnum
CREATE TYPE "ModuleType" AS ENUM ('WAREHOUSE', 'CASHBOX', 'PERSONNEL', 'PRODUCT', 'CUSTOMER', 'INVOICE_SALES', 'INVOICE_PURCHASE', 'ORDER_SALES', 'ORDER_PURCHASE', 'INVENTORY_COUNT', 'TEKLIF', 'DELIVERY_NOTE_SALES', 'DELIVERY_NOTE_PURCHASE');

-- CreateEnum
CREATE TYPE "IrsaliyeKaynakTip" AS ENUM ('SIPARIS', 'DOGRUDAN', 'FATURA_OTOMATIK');

-- CreateEnum
CREATE TYPE "IrsaliyeDurum" AS ENUM ('FATURALANMADI', 'FATURALANDI');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'PARTIAL', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "OrderItemStatus" AS ENUM ('PENDING', 'PARTIAL', 'COMPLETED');

-- CreateEnum
CREATE TYPE "BasitSiparisDurum" AS ENUM ('ONAY_BEKLIYOR', 'ONAYLANDI', 'SIPARIS_VERILDI', 'FATURALANDI', 'IPTAL_EDILDI');

-- CreateEnum
CREATE TYPE "SatınAlmaSiparisDurum" AS ENUM ('BEKLEMEDE', 'HAZIRLANIYOR', 'HAZIRLANDI', 'SEVK_EDILDI', 'KISMI_SEVK', 'SIPARIS_VERILDI', 'FATURALANDI', 'IPTAL');

-- CreateEnum
CREATE TYPE "LicenseType" AS ENUM ('BASE_PLAN', 'MODULE');

-- CreateEnum
CREATE TYPE "InvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "WorkOrderStatus" AS ENUM ('ACCEPTED', 'DIAGNOSIS', 'WAITING_FOR_APPROVAL', 'APPROVED', 'PART_WAITING', 'IN_PROGRESS', 'QUALITY_CONTROL', 'READY_FOR_DELIVERY', 'INVOICED', 'CLOSED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ServiceWorkStatus" AS ENUM ('SERVICE_ACCEPTED', 'PRE_DIAGNOSIS', 'TECHNICAL_DIAGNOSIS', 'SOLUTION_PROPOSED', 'WAITING_MANAGER_APPROVAL', 'APPROVED', 'PART_SUPPLY', 'IN_PROGRESS', 'QUALITY_CONTROL', 'READY_FOR_BILLING', 'INVOICED', 'CLOSED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "WorkOrderLineType" AS ENUM ('LABOR', 'PART');

-- CreateEnum
CREATE TYPE "PartSource" AS ENUM ('STOCK_DIRECT', 'SUPPLY_REQUEST');

-- CreateEnum
CREATE TYPE "SupplyRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "tenants" (
    "id" TEXT NOT NULL,
    "uuid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subdomain" TEXT,
    "domain" TEXT,
    "status" "TenantStatus" NOT NULL DEFAULT 'TRIAL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant_settings" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "companyName" TEXT,
    "taxNumber" TEXT,
    "address" TEXT,
    "logoUrl" TEXT,
    "features" JSONB,
    "limits" JSONB,
    "timezone" TEXT NOT NULL DEFAULT 'Europe/Istanbul',
    "locale" TEXT NOT NULL DEFAULT 'tr-TR',
    "currency" TEXT NOT NULL DEFAULT 'TRY',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenant_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plans" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'TRY',
    "billingPeriod" "BillingPeriod" NOT NULL DEFAULT 'MONTHLY',
    "trialDays" INTEGER NOT NULL DEFAULT 0,
    "baseUserLimit" INTEGER NOT NULL DEFAULT 1,
    "features" JSONB,
    "limits" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isPopular" BOOLEAN NOT NULL DEFAULT false,
    "isBasePlan" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'TRIAL',
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3) NOT NULL,
    "trialEndsAt" TIMESTAMP(3),
    "canceledAt" TIMESTAMP(3),
    "nextBillingDate" TIMESTAMP(3),
    "lastBillingDate" TIMESTAMP(3),
    "autoRenew" BOOLEAN NOT NULL DEFAULT true,
    "iyzicoSubscriptionRef" TEXT,
    "additionalUsers" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'TRY',
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "iyzicoPaymentId" TEXT,
    "iyzicoToken" TEXT,
    "conversationId" TEXT,
    "invoiceNumber" TEXT,
    "invoiceUrl" TEXT,
    "paidAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "refundedAt" TIMESTAMP(3),
    "errorCode" TEXT,
    "errorMessage" TEXT,
    "paymentMethod" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "tenantId" TEXT,
    "action" TEXT NOT NULL,
    "resource" TEXT,
    "resourceId" TEXT,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "uuid" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "fullName" TEXT NOT NULL,
    "phone" TEXT,
    "avatarUrl" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "refreshToken" TEXT,
    "tokenVersion" INTEGER NOT NULL DEFAULT 0,
    "tenantId" TEXT,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "refreshToken" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stoklar" (
    "id" TEXT NOT NULL,
    "stokKodu" TEXT NOT NULL,
    "tenantId" TEXT,
    "stokAdi" TEXT NOT NULL,
    "aciklama" TEXT,
    "birim" TEXT NOT NULL,
    "alisFiyati" DECIMAL(10,2) NOT NULL,
    "satisFiyati" DECIMAL(10,2) NOT NULL,
    "kdvOrani" INTEGER NOT NULL DEFAULT 20,
    "kritikStokMiktari" INTEGER NOT NULL DEFAULT 0,
    "kategori" TEXT,
    "anaKategori" TEXT,
    "altKategori" TEXT,
    "marka" TEXT,
    "model" TEXT,
    "oem" TEXT,
    "olcu" TEXT,
    "raf" TEXT,
    "barkod" TEXT,
    "tedarikciKodu" TEXT,
    "esdegerGrupId" TEXT,
    "aracMarka" TEXT,
    "aracModel" TEXT,
    "aracMotorHacmi" TEXT,
    "aracYakitTipi" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stoklar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "price_cards" (
    "id" TEXT NOT NULL,
    "stok_id" TEXT NOT NULL,
    "type" "PriceCardType" NOT NULL,
    "price" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'TRY',
    "effective_from" TIMESTAMP(3),
    "effective_to" TIMESTAMP(3),
    "note" TEXT,
    "created_by" TEXT,
    "updated_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "price_cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_cost_history" (
    "id" TEXT NOT NULL,
    "stok_id" TEXT NOT NULL,
    "cost" DECIMAL(12,4) NOT NULL,
    "method" TEXT NOT NULL DEFAULT 'WEIGHTED_AVERAGE',
    "computed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "marka" TEXT,
    "anaKategori" TEXT,
    "altKategori" TEXT,
    "note" TEXT,

    CONSTRAINT "stock_cost_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "esdeger_gruplar" (
    "id" TEXT NOT NULL,
    "grupAdi" TEXT,
    "aciklama" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "esdeger_gruplar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stok_esdegers" (
    "id" TEXT NOT NULL,
    "stok1Id" TEXT NOT NULL,
    "stok2Id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stok_esdegers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stok_hareketleri" (
    "id" TEXT NOT NULL,
    "stokId" TEXT NOT NULL,
    "hareketTipi" "HareketTipi" NOT NULL,
    "miktar" INTEGER NOT NULL,
    "birimFiyat" DECIMAL(10,2) NOT NULL,
    "aciklama" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stok_hareketleri_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cariler" (
    "id" TEXT NOT NULL,
    "cariKodu" TEXT NOT NULL,
    "tenantId" TEXT,
    "unvan" TEXT NOT NULL,
    "tip" "CariTip" NOT NULL,
    "sirketTipi" "SirketTipi" DEFAULT 'KURUMSAL',
    "vergiNo" TEXT,
    "vergiDairesi" TEXT,
    "tcKimlikNo" TEXT,
    "isimSoyisim" TEXT,
    "telefon" TEXT,
    "email" TEXT,
    "ulke" TEXT DEFAULT 'Türkiye',
    "il" TEXT,
    "ilce" TEXT,
    "adres" TEXT,
    "yetkili" TEXT,
    "bakiye" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "vadeSuresi" INTEGER,
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cariler_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cari_hareketler" (
    "id" TEXT NOT NULL,
    "cariId" TEXT NOT NULL,
    "tip" "BorcAlacak" NOT NULL,
    "tutar" DECIMAL(12,2) NOT NULL,
    "bakiye" DECIMAL(12,2) NOT NULL,
    "belgeTipi" "BelgeTipi",
    "belgeNo" TEXT,
    "tarih" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "aciklama" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cari_hareketler_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kasalar" (
    "id" TEXT NOT NULL,
    "kasaKodu" TEXT NOT NULL,
    "tenantId" TEXT,
    "kasaAdi" TEXT NOT NULL,
    "kasaTipi" "KasaTipi" NOT NULL,
    "bakiye" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kasalar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "banka_hesaplari" (
    "id" TEXT NOT NULL,
    "kasaId" TEXT NOT NULL,
    "hesapKodu" TEXT NOT NULL,
    "hesapAdi" TEXT,
    "bankaAdi" TEXT NOT NULL,
    "subeKodu" TEXT,
    "subeAdi" TEXT,
    "hesapNo" TEXT,
    "iban" TEXT,
    "hesapTipi" "BankaHesapTipi" NOT NULL,
    "bakiye" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "banka_hesaplari_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "banka_hesap_hareketler" (
    "id" TEXT NOT NULL,
    "hesapId" TEXT NOT NULL,
    "hareketTipi" TEXT NOT NULL,
    "tutar" DECIMAL(15,2) NOT NULL,
    "bakiye" DECIMAL(15,2) NOT NULL,
    "aciklama" TEXT,
    "referansNo" TEXT,
    "cariId" TEXT,
    "tarih" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "banka_hesap_hareketler_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "firma_kredi_kartlari" (
    "id" TEXT NOT NULL,
    "kasaId" TEXT NOT NULL,
    "kartKodu" TEXT NOT NULL,
    "kartAdi" TEXT NOT NULL,
    "bankaAdi" TEXT NOT NULL,
    "kartTipi" TEXT,
    "sonDortHane" TEXT,
    "limit" DECIMAL(15,2),
    "bakiye" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "firma_kredi_kartlari_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "firma_kredi_karti_hareketler" (
    "id" TEXT NOT NULL,
    "kartId" TEXT NOT NULL,
    "tutar" DECIMAL(15,2) NOT NULL,
    "bakiye" DECIMAL(15,2) NOT NULL,
    "aciklama" TEXT,
    "cariId" TEXT,
    "referansNo" TEXT,
    "tarih" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "firma_kredi_karti_hareketler_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kasa_hareketler" (
    "id" TEXT NOT NULL,
    "kasaId" TEXT NOT NULL,
    "hareketTipi" "KasaHareketTipi" NOT NULL,
    "tutar" DECIMAL(15,2) NOT NULL,
    "komisyonTutari" DECIMAL(15,2),
    "bsmvTutari" DECIMAL(15,2),
    "netTutar" DECIMAL(15,2),
    "bakiye" DECIMAL(15,2) NOT NULL,
    "belgeTipi" TEXT,
    "belgeNo" TEXT,
    "cariId" TEXT,
    "aciklama" TEXT,
    "tarih" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "transferEdildi" BOOLEAN NOT NULL DEFAULT false,
    "transferTarihi" TIMESTAMP(3),
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "kasa_hareketler_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "faturalar" (
    "id" TEXT NOT NULL,
    "faturaNo" TEXT NOT NULL,
    "faturaTipi" "FaturaTipi" NOT NULL,
    "tenantId" TEXT,
    "cariId" TEXT NOT NULL,
    "tarih" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "vade" TIMESTAMP(3),
    "iskonto" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "toplamTutar" DECIMAL(12,2) NOT NULL,
    "kdvTutar" DECIMAL(12,2) NOT NULL,
    "genelToplam" DECIMAL(12,2) NOT NULL,
    "aciklama" TEXT,
    "durum" "FaturaDurum" NOT NULL DEFAULT 'ACIK',
    "odenecekTutar" DECIMAL(12,2),
    "odenenTutar" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "siparisNo" TEXT,
    "purchaseOrderId" TEXT,
    "satinAlmaSiparisiId" TEXT,
    "deliveryNoteId" TEXT,
    "satinAlmaIrsaliyeId" TEXT,
    "efaturaStatus" "EFaturaStatus" DEFAULT 'PENDING',
    "efaturaEttn" TEXT,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "faturalar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fatura_logs" (
    "id" TEXT NOT NULL,
    "faturaId" TEXT NOT NULL,
    "userId" TEXT,
    "actionType" "LogAction" NOT NULL,
    "changes" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fatura_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fatura_kalemleri" (
    "id" TEXT NOT NULL,
    "faturaId" TEXT NOT NULL,
    "stokId" TEXT NOT NULL,
    "miktar" INTEGER NOT NULL,
    "birimFiyat" DECIMAL(10,2) NOT NULL,
    "kdvOrani" INTEGER NOT NULL,
    "kdvTutar" DECIMAL(10,2) NOT NULL,
    "tutar" DECIMAL(10,2) NOT NULL,
    "raf" TEXT,
    "purchaseOrderItemId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fatura_kalemleri_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tahsilatlar" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "cariId" TEXT NOT NULL,
    "faturaId" TEXT,
    "tip" "TahsilatTip" NOT NULL,
    "tutar" DECIMAL(12,2) NOT NULL,
    "tarih" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "odemeTipi" "OdemeTipi" NOT NULL,
    "kasaId" TEXT,
    "bankaHesapId" TEXT,
    "firmaKrediKartiId" TEXT,
    "aciklama" TEXT,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tahsilatlar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fatura_tahsilatlar" (
    "id" TEXT NOT NULL,
    "faturaId" TEXT NOT NULL,
    "tahsilatId" TEXT NOT NULL,
    "tutar" DECIMAL(12,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fatura_tahsilatlar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "efatura_xml" (
    "id" TEXT NOT NULL,
    "faturaId" TEXT NOT NULL,
    "xmlData" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "efatura_xml_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "siparisler" (
    "id" TEXT NOT NULL,
    "siparisNo" TEXT NOT NULL,
    "tenantId" TEXT,
    "siparisTipi" "SiparisTipi" NOT NULL,
    "cariId" TEXT NOT NULL,
    "tarih" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "vade" TIMESTAMP(3),
    "iskonto" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "toplamTutar" DECIMAL(12,2) NOT NULL,
    "kdvTutar" DECIMAL(12,2) NOT NULL,
    "genelToplam" DECIMAL(12,2) NOT NULL,
    "aciklama" TEXT,
    "durum" "SiparisDurum" NOT NULL DEFAULT 'BEKLEMEDE',
    "faturaNo" TEXT,
    "deliveryNoteId" TEXT,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "siparisler_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "siparis_kalemleri" (
    "id" TEXT NOT NULL,
    "siparisId" TEXT NOT NULL,
    "stokId" TEXT NOT NULL,
    "miktar" INTEGER NOT NULL,
    "sevkEdilenMiktar" INTEGER NOT NULL DEFAULT 0,
    "birimFiyat" DECIMAL(10,2) NOT NULL,
    "kdvOrani" INTEGER NOT NULL,
    "kdvTutar" DECIMAL(10,2) NOT NULL,
    "tutar" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "siparis_kalemleri_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "siparis_logs" (
    "id" TEXT NOT NULL,
    "siparisId" TEXT NOT NULL,
    "userId" TEXT,
    "actionType" "LogAction" NOT NULL,
    "changes" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "siparis_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "siparis_hazirliklar" (
    "id" TEXT NOT NULL,
    "siparisId" TEXT NOT NULL,
    "siparisKalemiId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "miktar" INTEGER NOT NULL,
    "hazirlayan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "siparis_hazirliklar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "satis_irsaliyeleri" (
    "id" TEXT NOT NULL,
    "irsaliyeNo" TEXT NOT NULL,
    "irsaliyeTarihi" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tenantId" TEXT,
    "cariId" TEXT NOT NULL,
    "depoId" TEXT,
    "kaynakTip" "IrsaliyeKaynakTip" NOT NULL,
    "kaynakId" TEXT,
    "durum" "IrsaliyeDurum" NOT NULL DEFAULT 'FATURALANMADI',
    "toplamTutar" DECIMAL(12,2) NOT NULL,
    "kdvTutar" DECIMAL(12,2) NOT NULL,
    "genelToplam" DECIMAL(12,2) NOT NULL,
    "iskonto" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "aciklama" TEXT,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "satis_irsaliyeleri_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "satis_irsaliyesi_kalemleri" (
    "id" TEXT NOT NULL,
    "irsaliyeId" TEXT NOT NULL,
    "stokId" TEXT NOT NULL,
    "miktar" INTEGER NOT NULL,
    "birimFiyat" DECIMAL(10,2) NOT NULL,
    "kdvOrani" INTEGER NOT NULL,
    "kdvTutar" DECIMAL(10,2) NOT NULL,
    "tutar" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "satis_irsaliyesi_kalemleri_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "satis_irsaliyesi_logs" (
    "id" TEXT NOT NULL,
    "irsaliyeId" TEXT NOT NULL,
    "userId" TEXT,
    "actionType" "LogAction" NOT NULL,
    "changes" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "satis_irsaliyesi_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teklifler" (
    "id" TEXT NOT NULL,
    "teklifNo" TEXT NOT NULL,
    "tenantId" TEXT,
    "teklifTipi" "TeklifTipi" NOT NULL,
    "cariId" TEXT NOT NULL,
    "tarih" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "gecerlilikTarihi" TIMESTAMP(3),
    "iskonto" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "toplamTutar" DECIMAL(12,2) NOT NULL,
    "kdvTutar" DECIMAL(12,2) NOT NULL,
    "genelToplam" DECIMAL(12,2) NOT NULL,
    "aciklama" TEXT,
    "durum" "TeklifDurum" NOT NULL DEFAULT 'TEKLIF',
    "siparisId" TEXT,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teklifler_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teklif_kalemleri" (
    "id" TEXT NOT NULL,
    "teklifId" TEXT NOT NULL,
    "stokId" TEXT NOT NULL,
    "miktar" INTEGER NOT NULL,
    "birimFiyat" DECIMAL(10,2) NOT NULL,
    "kdvOrani" INTEGER NOT NULL,
    "kdvTutar" DECIMAL(10,2) NOT NULL,
    "tutar" DECIMAL(10,2) NOT NULL,
    "iskontoOran" DECIMAL(5,2),
    "iskontoTutar" DECIMAL(10,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "teklif_kalemleri_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teklif_logs" (
    "id" TEXT NOT NULL,
    "teklifId" TEXT NOT NULL,
    "userId" TEXT,
    "actionType" "LogAction" NOT NULL,
    "changes" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "teklif_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sayimlar" (
    "id" TEXT NOT NULL,
    "sayimNo" TEXT NOT NULL,
    "tenantId" TEXT,
    "sayimTipi" "SayimTipi" NOT NULL,
    "tarih" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "durum" "SayimDurum" NOT NULL DEFAULT 'TASLAK',
    "aciklama" TEXT,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "onaylayanId" TEXT,
    "onayTarihi" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sayimlar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sayim_kalemleri" (
    "id" TEXT NOT NULL,
    "sayimId" TEXT NOT NULL,
    "stokId" TEXT NOT NULL,
    "locationId" TEXT,
    "sistemMiktari" INTEGER NOT NULL,
    "sayilanMiktar" INTEGER NOT NULL,
    "farkMiktari" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sayim_kalemleri_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "depolar" (
    "id" TEXT NOT NULL,
    "depoAdi" TEXT NOT NULL,
    "adres" TEXT,
    "yetkili" TEXT,
    "telefon" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "depolar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "raflar" (
    "id" TEXT NOT NULL,
    "depoId" TEXT NOT NULL,
    "rafKodu" TEXT NOT NULL,
    "aciklama" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "raflar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "urun_raflar" (
    "id" TEXT NOT NULL,
    "stokId" TEXT NOT NULL,
    "rafId" TEXT NOT NULL,
    "miktar" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "urun_raflar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "warehouses" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "tenantId" TEXT,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "address" TEXT,
    "phone" TEXT,
    "manager" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "warehouses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "locations" (
    "id" TEXT NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "layer" INTEGER NOT NULL,
    "corridor" TEXT NOT NULL,
    "side" INTEGER NOT NULL,
    "section" INTEGER NOT NULL,
    "level" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "barcode" TEXT NOT NULL,
    "name" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_barcodes" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "barcode" TEXT NOT NULL,
    "symbology" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_barcodes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_location_stocks" (
    "id" TEXT NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "qtyOnHand" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_location_stocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_moves" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "fromWarehouseId" TEXT,
    "fromLocationId" TEXT,
    "toWarehouseId" TEXT NOT NULL,
    "toLocationId" TEXT NOT NULL,
    "qty" INTEGER NOT NULL,
    "moveType" "StockMoveType" NOT NULL,
    "refType" TEXT,
    "refId" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,

    CONSTRAINT "stock_moves_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "masraf_kategoriler" (
    "id" TEXT NOT NULL,
    "kategoriAdi" TEXT NOT NULL,
    "aciklama" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "masraf_kategoriler_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "masraflar" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "kategoriId" TEXT NOT NULL,
    "aciklama" TEXT,
    "tutar" DECIMAL(10,2) NOT NULL,
    "tarih" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "odemeTipi" "OdemeTipi" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "masraflar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "banka_havaleler" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "hareketTipi" "HavaleTipi" NOT NULL,
    "bankaHesabiId" TEXT NOT NULL,
    "cariId" TEXT NOT NULL,
    "tutar" DECIMAL(15,2) NOT NULL,
    "tarih" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "aciklama" TEXT,
    "referansNo" TEXT,
    "gonderen" TEXT,
    "alici" TEXT,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "banka_havaleler_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deleted_banka_havaleler" (
    "id" TEXT NOT NULL,
    "originalId" TEXT NOT NULL,
    "hareketTipi" "HavaleTipi" NOT NULL,
    "bankaHesabiId" TEXT NOT NULL,
    "bankaHesabiAdi" TEXT NOT NULL,
    "cariId" TEXT NOT NULL,
    "cariUnvan" TEXT NOT NULL,
    "tutar" DECIMAL(15,2) NOT NULL,
    "tarih" TIMESTAMP(3) NOT NULL,
    "aciklama" TEXT,
    "referansNo" TEXT,
    "gonderen" TEXT,
    "alici" TEXT,
    "originalCreatedBy" TEXT,
    "originalUpdatedBy" TEXT,
    "originalCreatedAt" TIMESTAMP(3) NOT NULL,
    "originalUpdatedAt" TIMESTAMP(3) NOT NULL,
    "deletedBy" TEXT,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleteReason" TEXT,

    CONSTRAINT "deleted_banka_havaleler_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "banka_havale_logs" (
    "id" TEXT NOT NULL,
    "bankaHavaleId" TEXT NOT NULL,
    "userId" TEXT,
    "actionType" "LogAction" NOT NULL,
    "changes" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "banka_havale_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cek_senetler" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "tip" "CekSenetTip" NOT NULL,
    "portfoyTip" "PortfoyTip" NOT NULL,
    "cariId" TEXT NOT NULL,
    "tutar" DECIMAL(15,2) NOT NULL,
    "vade" TIMESTAMP(3) NOT NULL,
    "banka" TEXT,
    "sube" TEXT,
    "hesapNo" TEXT,
    "cekNo" TEXT,
    "seriNo" TEXT,
    "durum" "CekSenetDurum",
    "tahsilTarihi" TIMESTAMP(3),
    "tahsilKasaId" TEXT,
    "ciroEdildi" BOOLEAN NOT NULL DEFAULT false,
    "ciroTarihi" TIMESTAMP(3),
    "ciroEdilen" TEXT,
    "aciklama" TEXT,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cek_senetler_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deleted_cek_senetler" (
    "id" TEXT NOT NULL,
    "originalId" TEXT NOT NULL,
    "tip" "CekSenetTip" NOT NULL,
    "portfoyTip" "PortfoyTip" NOT NULL,
    "cariId" TEXT NOT NULL,
    "cariUnvan" TEXT NOT NULL,
    "tutar" DECIMAL(15,2) NOT NULL,
    "vade" TIMESTAMP(3) NOT NULL,
    "banka" TEXT,
    "sube" TEXT,
    "hesapNo" TEXT,
    "cekNo" TEXT,
    "seriNo" TEXT,
    "durum" "CekSenetDurum" NOT NULL,
    "tahsilTarihi" TIMESTAMP(3),
    "tahsilKasaId" TEXT,
    "ciroEdildi" BOOLEAN NOT NULL,
    "ciroTarihi" TIMESTAMP(3),
    "ciroEdilen" TEXT,
    "aciklama" TEXT,
    "originalCreatedBy" TEXT,
    "originalUpdatedBy" TEXT,
    "originalCreatedAt" TIMESTAMP(3) NOT NULL,
    "originalUpdatedAt" TIMESTAMP(3) NOT NULL,
    "deletedBy" TEXT,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleteReason" TEXT,

    CONSTRAINT "deleted_cek_senetler_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cek_senet_logs" (
    "id" TEXT NOT NULL,
    "cekSenetId" TEXT NOT NULL,
    "userId" TEXT,
    "actionType" "LogAction" NOT NULL,
    "changes" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cek_senet_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "personeller" (
    "id" TEXT NOT NULL,
    "personelKodu" TEXT NOT NULL,
    "tenantId" TEXT,
    "tcKimlikNo" TEXT,
    "ad" TEXT NOT NULL,
    "soyad" TEXT NOT NULL,
    "dogumTarihi" TIMESTAMP(3),
    "cinsiyet" "Cinsiyet",
    "medeniDurum" "MedeniDurum",
    "telefon" TEXT,
    "email" TEXT,
    "adres" TEXT,
    "il" TEXT,
    "ilce" TEXT,
    "pozisyon" TEXT,
    "departman" TEXT,
    "iseBaslamaTarihi" TIMESTAMP(3),
    "istenCikisTarihi" TIMESTAMP(3),
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "maas" DECIMAL(10,2),
    "maasGunu" INTEGER,
    "sgkNo" TEXT,
    "ibanNo" TEXT,
    "bakiye" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "aciklama" TEXT,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "personeller_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "personel_odemeler" (
    "id" TEXT NOT NULL,
    "personelId" TEXT NOT NULL,
    "tip" "PersonelOdemeTip" NOT NULL,
    "tutar" DECIMAL(10,2) NOT NULL,
    "tarih" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "donem" TEXT,
    "aciklama" TEXT,
    "kasaId" TEXT,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "personel_odemeler_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "code_templates" (
    "id" TEXT NOT NULL,
    "module" "ModuleType" NOT NULL,
    "name" TEXT NOT NULL,
    "prefix" TEXT NOT NULL,
    "digitCount" INTEGER NOT NULL DEFAULT 3,
    "currentValue" INTEGER NOT NULL DEFAULT 0,
    "includeYear" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "code_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "araclar" (
    "id" TEXT NOT NULL,
    "marka" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "motorHacmi" TEXT NOT NULL,
    "yakitTipi" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "araclar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_orders" (
    "id" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "tenantId" TEXT,
    "supplier_id" TEXT NOT NULL,
    "order_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expected_delivery_date" TIMESTAMP(3),
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "total_amount" DECIMAL(12,2) NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "purchase_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_order_items" (
    "id" TEXT NOT NULL,
    "purchase_order_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "ordered_quantity" INTEGER NOT NULL,
    "received_quantity" INTEGER NOT NULL DEFAULT 0,
    "unit_price" DECIMAL(10,2) NOT NULL,
    "status" "OrderItemStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "purchase_order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "basit_siparisler" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "firmaId" TEXT NOT NULL,
    "urunId" TEXT NOT NULL,
    "miktar" INTEGER NOT NULL,
    "durum" "BasitSiparisDurum" NOT NULL DEFAULT 'ONAY_BEKLIYOR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tedarikEdilenMiktar" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "basit_siparisler_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "satin_alma_siparisleri" (
    "id" TEXT NOT NULL,
    "siparisNo" TEXT NOT NULL,
    "tenantId" TEXT,
    "cariId" TEXT NOT NULL,
    "tarih" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "vade" TIMESTAMP(3),
    "iskonto" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "toplamTutar" DECIMAL(12,2) NOT NULL,
    "kdvTutar" DECIMAL(12,2) NOT NULL,
    "genelToplam" DECIMAL(12,2) NOT NULL,
    "aciklama" TEXT,
    "durum" "SatınAlmaSiparisDurum" NOT NULL DEFAULT 'BEKLEMEDE',
    "faturaNo" TEXT,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deliveryNoteId" TEXT,

    CONSTRAINT "satin_alma_siparisleri_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "satin_alma_siparis_kalemleri" (
    "id" TEXT NOT NULL,
    "satınAlmaSiparisId" TEXT NOT NULL,
    "stokId" TEXT NOT NULL,
    "miktar" INTEGER NOT NULL,
    "sevkEdilenMiktar" INTEGER NOT NULL DEFAULT 0,
    "birimFiyat" DECIMAL(10,2) NOT NULL,
    "kdvOrani" INTEGER NOT NULL,
    "kdvTutar" DECIMAL(10,2) NOT NULL,
    "tutar" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "satin_alma_siparis_kalemleri_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "satin_alma_siparis_logs" (
    "id" TEXT NOT NULL,
    "satınAlmaSiparisId" TEXT NOT NULL,
    "userId" TEXT,
    "actionType" "LogAction" NOT NULL,
    "changes" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "satin_alma_siparis_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "satin_alma_irsaliyeleri" (
    "id" TEXT NOT NULL,
    "irsaliyeNo" TEXT NOT NULL,
    "irsaliyeTarihi" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tenantId" TEXT,
    "cariId" TEXT NOT NULL,
    "depoId" TEXT,
    "kaynakTip" "IrsaliyeKaynakTip" NOT NULL,
    "kaynakId" TEXT,
    "durum" "IrsaliyeDurum" NOT NULL DEFAULT 'FATURALANMADI',
    "toplamTutar" DECIMAL(12,2) NOT NULL,
    "kdvTutar" DECIMAL(12,2) NOT NULL,
    "genelToplam" DECIMAL(12,2) NOT NULL,
    "iskonto" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "aciklama" TEXT,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "satin_alma_irsaliyeleri_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "satin_alma_irsaliyesi_kalemleri" (
    "id" TEXT NOT NULL,
    "irsaliyeId" TEXT NOT NULL,
    "stokId" TEXT NOT NULL,
    "miktar" INTEGER NOT NULL,
    "birimFiyat" DECIMAL(10,2) NOT NULL,
    "kdvOrani" INTEGER NOT NULL,
    "kdvTutar" DECIMAL(10,2) NOT NULL,
    "tutar" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "satin_alma_irsaliyesi_kalemleri_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "satin_alma_irsaliyesi_logs" (
    "id" TEXT NOT NULL,
    "irsaliyeId" TEXT NOT NULL,
    "userId" TEXT,
    "actionType" "LogAction" NOT NULL,
    "changes" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "satin_alma_irsaliyesi_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "modules" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'TRY',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "modules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "module_licenses" (
    "id" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "module_licenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_licenses" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "licenseType" "LicenseType" NOT NULL,
    "moduleId" TEXT,
    "assignedBy" TEXT,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),
    "revokedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_licenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invitations" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "invitedBy" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "status" "InvitationStatus" NOT NULL DEFAULT 'PENDING',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "acceptedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invitations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hizli_tokens" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "loginHash" TEXT NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hizli_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "efatura_inbox" (
    "id" SERIAL NOT NULL,
    "ettn" TEXT NOT NULL,
    "senderVkn" TEXT NOT NULL,
    "senderTitle" TEXT NOT NULL,
    "invoiceNo" TEXT,
    "invoiceDate" TIMESTAMP(3),
    "rawXml" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "efatura_inbox_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicles" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "plateNumber" TEXT NOT NULL,
    "vin" TEXT,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "year" INTEGER,
    "firstRegistrationDate" TIMESTAMP(3),
    "engineSize" TEXT,
    "fuelType" TEXT,
    "color" TEXT,
    "mileage" INTEGER,
    "customerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "technicians" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "specialization" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "technicians_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_orders" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "workOrderNo" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "technicianId" TEXT,
    "status" "WorkOrderStatus" NOT NULL DEFAULT 'ACCEPTED',
    "acceptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diagnosisAt" TIMESTAMP(3),
    "approvedAt" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "estimatedDelivery" TIMESTAMP(3),
    "complaint" TEXT,
    "findings" TEXT,
    "internalNotes" TEXT,
    "invoiceId" TEXT,
    "laborTotal" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "partsTotal" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "discountAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "taxAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "grandTotal" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "work_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_order_lines" (
    "id" TEXT NOT NULL,
    "workOrderId" TEXT NOT NULL,
    "lineType" "WorkOrderLineType" NOT NULL,
    "description" TEXT,
    "laborHours" DECIMAL(5,2),
    "hourlyRate" DECIMAL(10,2),
    "productId" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPrice" DECIMAL(10,2),
    "discountRate" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "discountAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "taxRate" INTEGER NOT NULL DEFAULT 20,
    "taxAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "lineTotal" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "usedAt" TIMESTAMP(3),
    "partSource" "PartSource" DEFAULT 'STOCK_DIRECT',
    "supplyRequestStatus" "SupplyRequestStatus",
    "requestedAt" TIMESTAMP(3),
    "approvedAt" TIMESTAMP(3),
    "approvedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "work_order_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_order_audit_logs" (
    "id" TEXT NOT NULL,
    "workOrderId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "previousStatus" "WorkOrderStatus",
    "newStatus" "WorkOrderStatus",
    "technicianId" TEXT,
    "details" TEXT,
    "userId" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "work_order_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_order_status_history" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "workOrderId" TEXT NOT NULL,
    "fromStatus" "ServiceWorkStatus",
    "toStatus" "ServiceWorkStatus" NOT NULL,
    "changedBy" TEXT NOT NULL,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reason" TEXT,

    CONSTRAINT "work_order_status_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "technical_findings" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "workOrderId" TEXT NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "technical_findings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diagnostic_notes" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "workOrderId" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "diagnostic_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "solution_packages" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "workOrderId" TEXT NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "description" TEXT NOT NULL,
    "estimatedDurationMinutes" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "solution_packages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "solution_package_parts" (
    "id" TEXT NOT NULL,
    "solutionPackageId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" DECIMAL(10,3) NOT NULL,

    CONSTRAINT "solution_package_parts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "manager_approvals" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "workOrderId" TEXT NOT NULL,
    "solutionPackageId" TEXT NOT NULL,
    "approvedBy" TEXT NOT NULL,
    "approvedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvalNote" TEXT,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "manager_approvals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "manager_rejections" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "workOrderId" TEXT NOT NULL,
    "solutionPackageId" TEXT NOT NULL,
    "rejectedBy" TEXT NOT NULL,
    "rejectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rejectionReason" TEXT NOT NULL,

    CONSTRAINT "manager_rejections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicle_maintenance_reminders" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "lastServiceDate" TIMESTAMP(3) NOT NULL,
    "lastWorkOrderId" TEXT,
    "lastMileage" INTEGER,
    "nextReminderDate" TIMESTAMP(3) NOT NULL,
    "reminderSent" BOOLEAN NOT NULL DEFAULT false,
    "reminderSentAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicle_maintenance_reminders_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tenants_uuid_key" ON "tenants"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "tenants_subdomain_key" ON "tenants"("subdomain");

-- CreateIndex
CREATE UNIQUE INDEX "tenants_domain_key" ON "tenants"("domain");

-- CreateIndex
CREATE INDEX "tenants_subdomain_idx" ON "tenants"("subdomain");

-- CreateIndex
CREATE INDEX "tenants_domain_idx" ON "tenants"("domain");

-- CreateIndex
CREATE INDEX "tenants_status_idx" ON "tenants"("status");

-- CreateIndex
CREATE INDEX "tenants_createdAt_idx" ON "tenants"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_settings_tenantId_key" ON "tenant_settings"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "plans_slug_key" ON "plans"("slug");

-- CreateIndex
CREATE INDEX "plans_slug_idx" ON "plans"("slug");

-- CreateIndex
CREATE INDEX "plans_isActive_idx" ON "plans"("isActive");

-- CreateIndex
CREATE INDEX "plans_isBasePlan_idx" ON "plans"("isBasePlan");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_tenantId_key" ON "subscriptions"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_iyzicoSubscriptionRef_key" ON "subscriptions"("iyzicoSubscriptionRef");

-- CreateIndex
CREATE INDEX "subscriptions_tenantId_idx" ON "subscriptions"("tenantId");

-- CreateIndex
CREATE INDEX "subscriptions_planId_idx" ON "subscriptions"("planId");

-- CreateIndex
CREATE INDEX "subscriptions_status_idx" ON "subscriptions"("status");

-- CreateIndex
CREATE INDEX "subscriptions_endDate_idx" ON "subscriptions"("endDate");

-- CreateIndex
CREATE INDEX "subscriptions_nextBillingDate_idx" ON "subscriptions"("nextBillingDate");

-- CreateIndex
CREATE UNIQUE INDEX "payments_iyzicoPaymentId_key" ON "payments"("iyzicoPaymentId");

-- CreateIndex
CREATE UNIQUE INDEX "payments_iyzicoToken_key" ON "payments"("iyzicoToken");

-- CreateIndex
CREATE UNIQUE INDEX "payments_conversationId_key" ON "payments"("conversationId");

-- CreateIndex
CREATE INDEX "payments_subscriptionId_idx" ON "payments"("subscriptionId");

-- CreateIndex
CREATE INDEX "payments_status_idx" ON "payments"("status");

-- CreateIndex
CREATE INDEX "payments_iyzicoPaymentId_idx" ON "payments"("iyzicoPaymentId");

-- CreateIndex
CREATE INDEX "payments_conversationId_idx" ON "payments"("conversationId");

-- CreateIndex
CREATE INDEX "payments_createdAt_idx" ON "payments"("createdAt");

-- CreateIndex
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");

-- CreateIndex
CREATE INDEX "audit_logs_tenantId_idx" ON "audit_logs"("tenantId");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "users_uuid_key" ON "users"("uuid");

-- CreateIndex
CREATE INDEX "users_tenantId_idx" ON "users"("tenantId");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_username_idx" ON "users"("username");

-- CreateIndex
CREATE INDEX "users_status_idx" ON "users"("status");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_tenantId_key" ON "users"("email", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_token_key" ON "sessions"("token");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_refreshToken_key" ON "sessions"("refreshToken");

-- CreateIndex
CREATE INDEX "sessions_userId_idx" ON "sessions"("userId");

-- CreateIndex
CREATE INDEX "sessions_token_idx" ON "sessions"("token");

-- CreateIndex
CREATE INDEX "sessions_refreshToken_idx" ON "sessions"("refreshToken");

-- CreateIndex
CREATE INDEX "sessions_expiresAt_idx" ON "sessions"("expiresAt");

-- CreateIndex
CREATE INDEX "stoklar_tenantId_idx" ON "stoklar"("tenantId");

-- CreateIndex
CREATE INDEX "stoklar_tenantId_stokKodu_idx" ON "stoklar"("tenantId", "stokKodu");

-- CreateIndex
CREATE INDEX "stoklar_tenantId_barkod_idx" ON "stoklar"("tenantId", "barkod");

-- CreateIndex
CREATE UNIQUE INDEX "stoklar_stokKodu_tenantId_key" ON "stoklar"("stokKodu", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "stoklar_barkod_tenantId_key" ON "stoklar"("barkod", "tenantId");

-- CreateIndex
CREATE INDEX "price_cards_stok_id_type_created_at_idx" ON "price_cards"("stok_id", "type", "created_at");

-- CreateIndex
CREATE INDEX "stock_cost_history_stok_id_computed_at_idx" ON "stock_cost_history"("stok_id", "computed_at");

-- CreateIndex
CREATE UNIQUE INDEX "stok_esdegers_stok1Id_stok2Id_key" ON "stok_esdegers"("stok1Id", "stok2Id");

-- CreateIndex
CREATE INDEX "cariler_tenantId_idx" ON "cariler"("tenantId");

-- CreateIndex
CREATE INDEX "cariler_tenantId_cariKodu_idx" ON "cariler"("tenantId", "cariKodu");

-- CreateIndex
CREATE UNIQUE INDEX "cariler_cariKodu_tenantId_key" ON "cariler"("cariKodu", "tenantId");

-- CreateIndex
CREATE INDEX "cari_hareketler_cariId_tarih_idx" ON "cari_hareketler"("cariId", "tarih");

-- CreateIndex
CREATE INDEX "kasalar_tenantId_idx" ON "kasalar"("tenantId");

-- CreateIndex
CREATE INDEX "kasalar_tenantId_kasaKodu_idx" ON "kasalar"("tenantId", "kasaKodu");

-- CreateIndex
CREATE INDEX "kasalar_kasaTipi_idx" ON "kasalar"("kasaTipi");

-- CreateIndex
CREATE INDEX "kasalar_aktif_idx" ON "kasalar"("aktif");

-- CreateIndex
CREATE UNIQUE INDEX "kasalar_kasaKodu_tenantId_key" ON "kasalar"("kasaKodu", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "banka_hesaplari_hesapKodu_key" ON "banka_hesaplari"("hesapKodu");

-- CreateIndex
CREATE INDEX "banka_hesaplari_kasaId_idx" ON "banka_hesaplari"("kasaId");

-- CreateIndex
CREATE INDEX "banka_hesaplari_hesapTipi_idx" ON "banka_hesaplari"("hesapTipi");

-- CreateIndex
CREATE INDEX "banka_hesap_hareketler_hesapId_tarih_idx" ON "banka_hesap_hareketler"("hesapId", "tarih");

-- CreateIndex
CREATE UNIQUE INDEX "firma_kredi_kartlari_kartKodu_key" ON "firma_kredi_kartlari"("kartKodu");

-- CreateIndex
CREATE INDEX "firma_kredi_kartlari_kasaId_idx" ON "firma_kredi_kartlari"("kasaId");

-- CreateIndex
CREATE INDEX "firma_kredi_karti_hareketler_kartId_tarih_idx" ON "firma_kredi_karti_hareketler"("kartId", "tarih");

-- CreateIndex
CREATE INDEX "kasa_hareketler_kasaId_tarih_idx" ON "kasa_hareketler"("kasaId", "tarih");

-- CreateIndex
CREATE INDEX "kasa_hareketler_cariId_idx" ON "kasa_hareketler"("cariId");

-- CreateIndex
CREATE INDEX "kasa_hareketler_transferEdildi_idx" ON "kasa_hareketler"("transferEdildi");

-- CreateIndex
CREATE UNIQUE INDEX "faturalar_purchaseOrderId_key" ON "faturalar"("purchaseOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "faturalar_satinAlmaSiparisiId_key" ON "faturalar"("satinAlmaSiparisiId");

-- CreateIndex
CREATE UNIQUE INDEX "faturalar_satinAlmaIrsaliyeId_key" ON "faturalar"("satinAlmaIrsaliyeId");

-- CreateIndex
CREATE UNIQUE INDEX "faturalar_efaturaEttn_key" ON "faturalar"("efaturaEttn");

-- CreateIndex
CREATE INDEX "faturalar_tenantId_idx" ON "faturalar"("tenantId");

-- CreateIndex
CREATE INDEX "faturalar_tenantId_faturaTipi_idx" ON "faturalar"("tenantId", "faturaTipi");

-- CreateIndex
CREATE INDEX "faturalar_tenantId_durum_idx" ON "faturalar"("tenantId", "durum");

-- CreateIndex
CREATE INDEX "faturalar_tenantId_tarih_idx" ON "faturalar"("tenantId", "tarih");

-- CreateIndex
CREATE INDEX "faturalar_cariId_idx" ON "faturalar"("cariId");

-- CreateIndex
CREATE INDEX "faturalar_durum_idx" ON "faturalar"("durum");

-- CreateIndex
CREATE INDEX "faturalar_deliveryNoteId_idx" ON "faturalar"("deliveryNoteId");

-- CreateIndex
CREATE UNIQUE INDEX "faturalar_faturaNo_tenantId_key" ON "faturalar"("faturaNo", "tenantId");

-- CreateIndex
CREATE INDEX "fatura_logs_faturaId_idx" ON "fatura_logs"("faturaId");

-- CreateIndex
CREATE INDEX "fatura_logs_userId_idx" ON "fatura_logs"("userId");

-- CreateIndex
CREATE INDEX "tahsilatlar_tenantId_idx" ON "tahsilatlar"("tenantId");

-- CreateIndex
CREATE INDEX "tahsilatlar_tenantId_tarih_idx" ON "tahsilatlar"("tenantId", "tarih");

-- CreateIndex
CREATE UNIQUE INDEX "fatura_tahsilatlar_faturaId_tahsilatId_key" ON "fatura_tahsilatlar"("faturaId", "tahsilatId");

-- CreateIndex
CREATE UNIQUE INDEX "efatura_xml_faturaId_key" ON "efatura_xml"("faturaId");

-- CreateIndex
CREATE INDEX "siparisler_tenantId_idx" ON "siparisler"("tenantId");

-- CreateIndex
CREATE INDEX "siparisler_tenantId_siparisNo_idx" ON "siparisler"("tenantId", "siparisNo");

-- CreateIndex
CREATE INDEX "siparisler_deliveryNoteId_idx" ON "siparisler"("deliveryNoteId");

-- CreateIndex
CREATE UNIQUE INDEX "siparisler_siparisNo_tenantId_key" ON "siparisler"("siparisNo", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "siparisler_deliveryNoteId_key" ON "siparisler"("deliveryNoteId");

-- CreateIndex
CREATE INDEX "siparis_logs_siparisId_idx" ON "siparis_logs"("siparisId");

-- CreateIndex
CREATE INDEX "siparis_logs_userId_idx" ON "siparis_logs"("userId");

-- CreateIndex
CREATE INDEX "siparis_hazirliklar_siparisId_idx" ON "siparis_hazirliklar"("siparisId");

-- CreateIndex
CREATE INDEX "siparis_hazirliklar_siparisKalemiId_idx" ON "siparis_hazirliklar"("siparisKalemiId");

-- CreateIndex
CREATE INDEX "siparis_hazirliklar_locationId_idx" ON "siparis_hazirliklar"("locationId");

-- CreateIndex
CREATE INDEX "satis_irsaliyeleri_tenantId_idx" ON "satis_irsaliyeleri"("tenantId");

-- CreateIndex
CREATE INDEX "satis_irsaliyeleri_tenantId_irsaliyeNo_idx" ON "satis_irsaliyeleri"("tenantId", "irsaliyeNo");

-- CreateIndex
CREATE INDEX "satis_irsaliyeleri_tenantId_durum_idx" ON "satis_irsaliyeleri"("tenantId", "durum");

-- CreateIndex
CREATE INDEX "satis_irsaliyeleri_tenantId_irsaliyeTarihi_idx" ON "satis_irsaliyeleri"("tenantId", "irsaliyeTarihi");

-- CreateIndex
CREATE INDEX "satis_irsaliyeleri_cariId_idx" ON "satis_irsaliyeleri"("cariId");

-- CreateIndex
CREATE INDEX "satis_irsaliyeleri_durum_idx" ON "satis_irsaliyeleri"("durum");

-- CreateIndex
CREATE INDEX "satis_irsaliyeleri_kaynakId_idx" ON "satis_irsaliyeleri"("kaynakId");

-- CreateIndex
CREATE UNIQUE INDEX "satis_irsaliyeleri_irsaliyeNo_tenantId_key" ON "satis_irsaliyeleri"("irsaliyeNo", "tenantId");

-- CreateIndex
CREATE INDEX "satis_irsaliyesi_kalemleri_irsaliyeId_idx" ON "satis_irsaliyesi_kalemleri"("irsaliyeId");

-- CreateIndex
CREATE INDEX "satis_irsaliyesi_kalemleri_stokId_idx" ON "satis_irsaliyesi_kalemleri"("stokId");

-- CreateIndex
CREATE INDEX "satis_irsaliyesi_logs_irsaliyeId_idx" ON "satis_irsaliyesi_logs"("irsaliyeId");

-- CreateIndex
CREATE INDEX "satis_irsaliyesi_logs_userId_idx" ON "satis_irsaliyesi_logs"("userId");

-- CreateIndex
CREATE INDEX "teklifler_tenantId_idx" ON "teklifler"("tenantId");

-- CreateIndex
CREATE INDEX "teklifler_tenantId_teklifNo_idx" ON "teklifler"("tenantId", "teklifNo");

-- CreateIndex
CREATE UNIQUE INDEX "teklifler_teklifNo_tenantId_key" ON "teklifler"("teklifNo", "tenantId");

-- CreateIndex
CREATE INDEX "teklif_logs_teklifId_idx" ON "teklif_logs"("teklifId");

-- CreateIndex
CREATE INDEX "teklif_logs_userId_idx" ON "teklif_logs"("userId");

-- CreateIndex
CREATE INDEX "sayimlar_tenantId_idx" ON "sayimlar"("tenantId");

-- CreateIndex
CREATE INDEX "sayimlar_tenantId_sayimNo_idx" ON "sayimlar"("tenantId", "sayimNo");

-- CreateIndex
CREATE UNIQUE INDEX "sayimlar_sayimNo_tenantId_key" ON "sayimlar"("sayimNo", "tenantId");

-- CreateIndex
CREATE INDEX "sayim_kalemleri_sayimId_idx" ON "sayim_kalemleri"("sayimId");

-- CreateIndex
CREATE INDEX "sayim_kalemleri_stokId_idx" ON "sayim_kalemleri"("stokId");

-- CreateIndex
CREATE INDEX "sayim_kalemleri_locationId_idx" ON "sayim_kalemleri"("locationId");

-- CreateIndex
CREATE UNIQUE INDEX "depolar_depoAdi_key" ON "depolar"("depoAdi");

-- CreateIndex
CREATE UNIQUE INDEX "raflar_depoId_rafKodu_key" ON "raflar"("depoId", "rafKodu");

-- CreateIndex
CREATE UNIQUE INDEX "urun_raflar_stokId_rafId_key" ON "urun_raflar"("stokId", "rafId");

-- CreateIndex
CREATE INDEX "warehouses_tenantId_idx" ON "warehouses"("tenantId");

-- CreateIndex
CREATE INDEX "warehouses_tenantId_code_idx" ON "warehouses"("tenantId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "warehouses_code_tenantId_key" ON "warehouses"("code", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "locations_code_key" ON "locations"("code");

-- CreateIndex
CREATE UNIQUE INDEX "locations_barcode_key" ON "locations"("barcode");

-- CreateIndex
CREATE INDEX "locations_warehouseId_idx" ON "locations"("warehouseId");

-- CreateIndex
CREATE INDEX "locations_code_idx" ON "locations"("code");

-- CreateIndex
CREATE INDEX "locations_barcode_idx" ON "locations"("barcode");

-- CreateIndex
CREATE UNIQUE INDEX "locations_warehouseId_code_key" ON "locations"("warehouseId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "product_barcodes_barcode_key" ON "product_barcodes"("barcode");

-- CreateIndex
CREATE INDEX "product_barcodes_productId_idx" ON "product_barcodes"("productId");

-- CreateIndex
CREATE INDEX "product_barcodes_barcode_idx" ON "product_barcodes"("barcode");

-- CreateIndex
CREATE INDEX "product_location_stocks_warehouseId_idx" ON "product_location_stocks"("warehouseId");

-- CreateIndex
CREATE INDEX "product_location_stocks_locationId_idx" ON "product_location_stocks"("locationId");

-- CreateIndex
CREATE INDEX "product_location_stocks_productId_idx" ON "product_location_stocks"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "product_location_stocks_warehouseId_locationId_productId_key" ON "product_location_stocks"("warehouseId", "locationId", "productId");

-- CreateIndex
CREATE INDEX "stock_moves_productId_idx" ON "stock_moves"("productId");

-- CreateIndex
CREATE INDEX "stock_moves_fromWarehouseId_fromLocationId_idx" ON "stock_moves"("fromWarehouseId", "fromLocationId");

-- CreateIndex
CREATE INDEX "stock_moves_toWarehouseId_toLocationId_idx" ON "stock_moves"("toWarehouseId", "toLocationId");

-- CreateIndex
CREATE INDEX "stock_moves_moveType_idx" ON "stock_moves"("moveType");

-- CreateIndex
CREATE INDEX "stock_moves_createdAt_idx" ON "stock_moves"("createdAt");

-- CreateIndex
CREATE INDEX "stock_moves_refType_refId_idx" ON "stock_moves"("refType", "refId");

-- CreateIndex
CREATE UNIQUE INDEX "masraf_kategoriler_kategoriAdi_key" ON "masraf_kategoriler"("kategoriAdi");

-- CreateIndex
CREATE INDEX "masraflar_tenantId_idx" ON "masraflar"("tenantId");

-- CreateIndex
CREATE INDEX "masraflar_tenantId_tarih_idx" ON "masraflar"("tenantId", "tarih");

-- CreateIndex
CREATE INDEX "banka_havaleler_tenantId_idx" ON "banka_havaleler"("tenantId");

-- CreateIndex
CREATE INDEX "banka_havaleler_tenantId_tarih_idx" ON "banka_havaleler"("tenantId", "tarih");

-- CreateIndex
CREATE INDEX "banka_havaleler_bankaHesabiId_idx" ON "banka_havaleler"("bankaHesabiId");

-- CreateIndex
CREATE INDEX "banka_havaleler_cariId_idx" ON "banka_havaleler"("cariId");

-- CreateIndex
CREATE INDEX "banka_havaleler_tarih_idx" ON "banka_havaleler"("tarih");

-- CreateIndex
CREATE INDEX "banka_havaleler_hareketTipi_idx" ON "banka_havaleler"("hareketTipi");

-- CreateIndex
CREATE INDEX "deleted_banka_havaleler_originalId_idx" ON "deleted_banka_havaleler"("originalId");

-- CreateIndex
CREATE INDEX "deleted_banka_havaleler_deletedAt_idx" ON "deleted_banka_havaleler"("deletedAt");

-- CreateIndex
CREATE INDEX "deleted_banka_havaleler_bankaHesabiId_idx" ON "deleted_banka_havaleler"("bankaHesabiId");

-- CreateIndex
CREATE INDEX "deleted_banka_havaleler_cariId_idx" ON "deleted_banka_havaleler"("cariId");

-- CreateIndex
CREATE INDEX "banka_havale_logs_bankaHavaleId_idx" ON "banka_havale_logs"("bankaHavaleId");

-- CreateIndex
CREATE INDEX "banka_havale_logs_userId_idx" ON "banka_havale_logs"("userId");

-- CreateIndex
CREATE INDEX "cek_senetler_tenantId_idx" ON "cek_senetler"("tenantId");

-- CreateIndex
CREATE INDEX "cek_senetler_tenantId_vade_idx" ON "cek_senetler"("tenantId", "vade");

-- CreateIndex
CREATE INDEX "cek_senetler_cariId_idx" ON "cek_senetler"("cariId");

-- CreateIndex
CREATE INDEX "cek_senetler_vade_idx" ON "cek_senetler"("vade");

-- CreateIndex
CREATE INDEX "cek_senetler_durum_idx" ON "cek_senetler"("durum");

-- CreateIndex
CREATE INDEX "cek_senetler_tip_idx" ON "cek_senetler"("tip");

-- CreateIndex
CREATE INDEX "cek_senetler_portfoyTip_idx" ON "cek_senetler"("portfoyTip");

-- CreateIndex
CREATE INDEX "deleted_cek_senetler_originalId_idx" ON "deleted_cek_senetler"("originalId");

-- CreateIndex
CREATE INDEX "deleted_cek_senetler_deletedAt_idx" ON "deleted_cek_senetler"("deletedAt");

-- CreateIndex
CREATE INDEX "deleted_cek_senetler_cariId_idx" ON "deleted_cek_senetler"("cariId");

-- CreateIndex
CREATE INDEX "cek_senet_logs_cekSenetId_idx" ON "cek_senet_logs"("cekSenetId");

-- CreateIndex
CREATE INDEX "cek_senet_logs_userId_idx" ON "cek_senet_logs"("userId");

-- CreateIndex
CREATE INDEX "personeller_tenantId_idx" ON "personeller"("tenantId");

-- CreateIndex
CREATE INDEX "personeller_tenantId_personelKodu_idx" ON "personeller"("tenantId", "personelKodu");

-- CreateIndex
CREATE INDEX "personeller_aktif_idx" ON "personeller"("aktif");

-- CreateIndex
CREATE INDEX "personeller_departman_idx" ON "personeller"("departman");

-- CreateIndex
CREATE UNIQUE INDEX "personeller_personelKodu_tenantId_key" ON "personeller"("personelKodu", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "personeller_tcKimlikNo_tenantId_key" ON "personeller"("tcKimlikNo", "tenantId");

-- CreateIndex
CREATE INDEX "personel_odemeler_personelId_idx" ON "personel_odemeler"("personelId");

-- CreateIndex
CREATE INDEX "personel_odemeler_tarih_idx" ON "personel_odemeler"("tarih");

-- CreateIndex
CREATE INDEX "personel_odemeler_tip_idx" ON "personel_odemeler"("tip");

-- CreateIndex
CREATE UNIQUE INDEX "code_templates_module_key" ON "code_templates"("module");

-- CreateIndex
CREATE INDEX "araclar_marka_idx" ON "araclar"("marka");

-- CreateIndex
CREATE INDEX "araclar_model_idx" ON "araclar"("model");

-- CreateIndex
CREATE INDEX "araclar_yakitTipi_idx" ON "araclar"("yakitTipi");

-- CreateIndex
CREATE UNIQUE INDEX "araclar_marka_model_motorHacmi_yakitTipi_key" ON "araclar"("marka", "model", "motorHacmi", "yakitTipi");

-- CreateIndex
CREATE INDEX "purchase_orders_tenantId_idx" ON "purchase_orders"("tenantId");

-- CreateIndex
CREATE INDEX "purchase_orders_tenantId_orderNumber_idx" ON "purchase_orders"("tenantId", "orderNumber");

-- CreateIndex
CREATE INDEX "purchase_orders_supplier_id_idx" ON "purchase_orders"("supplier_id");

-- CreateIndex
CREATE INDEX "purchase_orders_status_idx" ON "purchase_orders"("status");

-- CreateIndex
CREATE INDEX "purchase_orders_order_date_idx" ON "purchase_orders"("order_date");

-- CreateIndex
CREATE UNIQUE INDEX "purchase_orders_orderNumber_tenantId_key" ON "purchase_orders"("orderNumber", "tenantId");

-- CreateIndex
CREATE INDEX "purchase_order_items_purchase_order_id_idx" ON "purchase_order_items"("purchase_order_id");

-- CreateIndex
CREATE INDEX "purchase_order_items_product_id_idx" ON "purchase_order_items"("product_id");

-- CreateIndex
CREATE INDEX "basit_siparisler_tenantId_idx" ON "basit_siparisler"("tenantId");

-- CreateIndex
CREATE INDEX "basit_siparisler_tenantId_firmaId_idx" ON "basit_siparisler"("tenantId", "firmaId");

-- CreateIndex
CREATE INDEX "basit_siparisler_tenantId_urunId_idx" ON "basit_siparisler"("tenantId", "urunId");

-- CreateIndex
CREATE INDEX "basit_siparisler_firmaId_idx" ON "basit_siparisler"("firmaId");

-- CreateIndex
CREATE INDEX "basit_siparisler_urunId_idx" ON "basit_siparisler"("urunId");

-- CreateIndex
CREATE INDEX "basit_siparisler_durum_idx" ON "basit_siparisler"("durum");

-- CreateIndex
CREATE INDEX "basit_siparisler_createdAt_idx" ON "basit_siparisler"("createdAt");

-- CreateIndex
CREATE INDEX "satin_alma_siparisleri_tenantId_idx" ON "satin_alma_siparisleri"("tenantId");

-- CreateIndex
CREATE INDEX "satin_alma_siparisleri_tenantId_siparisNo_idx" ON "satin_alma_siparisleri"("tenantId", "siparisNo");

-- CreateIndex
CREATE INDEX "satin_alma_siparisleri_cariId_idx" ON "satin_alma_siparisleri"("cariId");

-- CreateIndex
CREATE INDEX "satin_alma_siparisleri_durum_idx" ON "satin_alma_siparisleri"("durum");

-- CreateIndex
CREATE INDEX "satin_alma_siparisleri_createdAt_idx" ON "satin_alma_siparisleri"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "satin_alma_siparisleri_siparisNo_tenantId_key" ON "satin_alma_siparisleri"("siparisNo", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "satin_alma_siparisleri_deliveryNoteId_key" ON "satin_alma_siparisleri"("deliveryNoteId");

-- CreateIndex
CREATE INDEX "satin_alma_siparis_kalemleri_satınAlmaSiparisId_idx" ON "satin_alma_siparis_kalemleri"("satınAlmaSiparisId");

-- CreateIndex
CREATE INDEX "satin_alma_siparis_kalemleri_stokId_idx" ON "satin_alma_siparis_kalemleri"("stokId");

-- CreateIndex
CREATE INDEX "satin_alma_siparis_logs_satınAlmaSiparisId_idx" ON "satin_alma_siparis_logs"("satınAlmaSiparisId");

-- CreateIndex
CREATE INDEX "satin_alma_siparis_logs_userId_idx" ON "satin_alma_siparis_logs"("userId");

-- CreateIndex
CREATE INDEX "satin_alma_irsaliyeleri_tenantId_idx" ON "satin_alma_irsaliyeleri"("tenantId");

-- CreateIndex
CREATE INDEX "satin_alma_irsaliyeleri_tenantId_irsaliyeNo_idx" ON "satin_alma_irsaliyeleri"("tenantId", "irsaliyeNo");

-- CreateIndex
CREATE INDEX "satin_alma_irsaliyeleri_tenantId_durum_idx" ON "satin_alma_irsaliyeleri"("tenantId", "durum");

-- CreateIndex
CREATE INDEX "satin_alma_irsaliyeleri_tenantId_irsaliyeTarihi_idx" ON "satin_alma_irsaliyeleri"("tenantId", "irsaliyeTarihi");

-- CreateIndex
CREATE INDEX "satin_alma_irsaliyeleri_cariId_idx" ON "satin_alma_irsaliyeleri"("cariId");

-- CreateIndex
CREATE INDEX "satin_alma_irsaliyeleri_durum_idx" ON "satin_alma_irsaliyeleri"("durum");

-- CreateIndex
CREATE INDEX "satin_alma_irsaliyeleri_kaynakId_idx" ON "satin_alma_irsaliyeleri"("kaynakId");

-- CreateIndex
CREATE UNIQUE INDEX "satin_alma_irsaliyeleri_irsaliyeNo_tenantId_key" ON "satin_alma_irsaliyeleri"("irsaliyeNo", "tenantId");

-- CreateIndex
CREATE INDEX "satin_alma_irsaliyesi_kalemleri_irsaliyeId_idx" ON "satin_alma_irsaliyesi_kalemleri"("irsaliyeId");

-- CreateIndex
CREATE INDEX "satin_alma_irsaliyesi_kalemleri_stokId_idx" ON "satin_alma_irsaliyesi_kalemleri"("stokId");

-- CreateIndex
CREATE INDEX "satin_alma_irsaliyesi_logs_irsaliyeId_idx" ON "satin_alma_irsaliyesi_logs"("irsaliyeId");

-- CreateIndex
CREATE INDEX "satin_alma_irsaliyesi_logs_userId_idx" ON "satin_alma_irsaliyesi_logs"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "modules_slug_key" ON "modules"("slug");

-- CreateIndex
CREATE INDEX "modules_slug_idx" ON "modules"("slug");

-- CreateIndex
CREATE INDEX "modules_isActive_idx" ON "modules"("isActive");

-- CreateIndex
CREATE INDEX "module_licenses_subscriptionId_idx" ON "module_licenses"("subscriptionId");

-- CreateIndex
CREATE INDEX "module_licenses_moduleId_idx" ON "module_licenses"("moduleId");

-- CreateIndex
CREATE INDEX "user_licenses_userId_idx" ON "user_licenses"("userId");

-- CreateIndex
CREATE INDEX "user_licenses_moduleId_idx" ON "user_licenses"("moduleId");

-- CreateIndex
CREATE INDEX "user_licenses_licenseType_idx" ON "user_licenses"("licenseType");

-- CreateIndex
CREATE UNIQUE INDEX "user_licenses_userId_licenseType_moduleId_key" ON "user_licenses"("userId", "licenseType", "moduleId");

-- CreateIndex
CREATE UNIQUE INDEX "invitations_token_key" ON "invitations"("token");

-- CreateIndex
CREATE INDEX "invitations_email_idx" ON "invitations"("email");

-- CreateIndex
CREATE INDEX "invitations_tenantId_idx" ON "invitations"("tenantId");

-- CreateIndex
CREATE INDEX "invitations_token_idx" ON "invitations"("token");

-- CreateIndex
CREATE INDEX "invitations_status_idx" ON "invitations"("status");

-- CreateIndex
CREATE INDEX "hizli_tokens_expiresAt_idx" ON "hizli_tokens"("expiresAt");

-- CreateIndex
CREATE INDEX "hizli_tokens_loginHash_idx" ON "hizli_tokens"("loginHash");

-- CreateIndex
CREATE UNIQUE INDEX "efatura_inbox_ettn_key" ON "efatura_inbox"("ettn");

-- CreateIndex
CREATE INDEX "efatura_inbox_senderVkn_idx" ON "efatura_inbox"("senderVkn");

-- CreateIndex
CREATE INDEX "efatura_inbox_createdAt_idx" ON "efatura_inbox"("createdAt");

-- CreateIndex
CREATE INDEX "vehicles_tenantId_idx" ON "vehicles"("tenantId");

-- CreateIndex
CREATE INDEX "vehicles_tenantId_plateNumber_idx" ON "vehicles"("tenantId", "plateNumber");

-- CreateIndex
CREATE INDEX "vehicles_customerId_idx" ON "vehicles"("customerId");

-- CreateIndex
CREATE INDEX "vehicles_vin_idx" ON "vehicles"("vin");

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_tenantId_plateNumber_key" ON "vehicles"("tenantId", "plateNumber");

-- CreateIndex
CREATE INDEX "technicians_tenantId_idx" ON "technicians"("tenantId");

-- CreateIndex
CREATE INDEX "technicians_tenantId_code_idx" ON "technicians"("tenantId", "code");

-- CreateIndex
CREATE INDEX "technicians_isActive_idx" ON "technicians"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "technicians_tenantId_code_key" ON "technicians"("tenantId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "work_orders_invoiceId_key" ON "work_orders"("invoiceId");

-- CreateIndex
CREATE INDEX "work_orders_tenantId_idx" ON "work_orders"("tenantId");

-- CreateIndex
CREATE INDEX "work_orders_tenantId_workOrderNo_idx" ON "work_orders"("tenantId", "workOrderNo");

-- CreateIndex
CREATE INDEX "work_orders_vehicleId_idx" ON "work_orders"("vehicleId");

-- CreateIndex
CREATE INDEX "work_orders_customerId_idx" ON "work_orders"("customerId");

-- CreateIndex
CREATE INDEX "work_orders_technicianId_idx" ON "work_orders"("technicianId");

-- CreateIndex
CREATE INDEX "work_orders_status_idx" ON "work_orders"("status");

-- CreateIndex
CREATE INDEX "work_orders_acceptedAt_idx" ON "work_orders"("acceptedAt");

-- CreateIndex
CREATE INDEX "work_orders_closedAt_idx" ON "work_orders"("closedAt");

-- CreateIndex
CREATE UNIQUE INDEX "work_orders_tenantId_workOrderNo_key" ON "work_orders"("tenantId", "workOrderNo");

-- CreateIndex
CREATE INDEX "work_order_lines_workOrderId_idx" ON "work_order_lines"("workOrderId");

-- CreateIndex
CREATE INDEX "work_order_lines_lineType_idx" ON "work_order_lines"("lineType");

-- CreateIndex
CREATE INDEX "work_order_lines_productId_idx" ON "work_order_lines"("productId");

-- CreateIndex
CREATE INDEX "work_order_lines_isUsed_idx" ON "work_order_lines"("isUsed");

-- CreateIndex
CREATE INDEX "work_order_audit_logs_workOrderId_idx" ON "work_order_audit_logs"("workOrderId");

-- CreateIndex
CREATE INDEX "work_order_audit_logs_action_idx" ON "work_order_audit_logs"("action");

-- CreateIndex
CREATE INDEX "work_order_audit_logs_createdAt_idx" ON "work_order_audit_logs"("createdAt");

-- CreateIndex
CREATE INDEX "work_order_status_history_tenantId_idx" ON "work_order_status_history"("tenantId");

-- CreateIndex
CREATE INDEX "work_order_status_history_tenantId_workOrderId_idx" ON "work_order_status_history"("tenantId", "workOrderId");

-- CreateIndex
CREATE INDEX "work_order_status_history_tenantId_changedAt_idx" ON "work_order_status_history"("tenantId", "changedAt");

-- CreateIndex
CREATE INDEX "technical_findings_tenantId_workOrderId_idx" ON "technical_findings"("tenantId", "workOrderId");

-- CreateIndex
CREATE INDEX "technical_findings_tenantId_createdAt_idx" ON "technical_findings"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "diagnostic_notes_tenantId_workOrderId_idx" ON "diagnostic_notes"("tenantId", "workOrderId");

-- CreateIndex
CREATE INDEX "diagnostic_notes_tenantId_createdAt_idx" ON "diagnostic_notes"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "solution_packages_tenantId_workOrderId_idx" ON "solution_packages"("tenantId", "workOrderId");

-- CreateIndex
CREATE INDEX "solution_packages_tenantId_createdAt_idx" ON "solution_packages"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "solution_package_parts_solutionPackageId_idx" ON "solution_package_parts"("solutionPackageId");

-- CreateIndex
CREATE UNIQUE INDEX "solution_package_parts_solutionPackageId_productId_key" ON "solution_package_parts"("solutionPackageId", "productId");

-- CreateIndex
CREATE UNIQUE INDEX "manager_approvals_workOrderId_key" ON "manager_approvals"("workOrderId");

-- CreateIndex
CREATE INDEX "manager_approvals_tenantId_workOrderId_idx" ON "manager_approvals"("tenantId", "workOrderId");

-- CreateIndex
CREATE INDEX "manager_approvals_tenantId_approvedAt_idx" ON "manager_approvals"("tenantId", "approvedAt");

-- CreateIndex
CREATE INDEX "manager_approvals_deletedAt_idx" ON "manager_approvals"("deletedAt");

-- CreateIndex
CREATE INDEX "manager_rejections_tenantId_workOrderId_idx" ON "manager_rejections"("tenantId", "workOrderId");

-- CreateIndex
CREATE INDEX "manager_rejections_tenantId_rejectedAt_idx" ON "manager_rejections"("tenantId", "rejectedAt");

-- CreateIndex
CREATE UNIQUE INDEX "vehicle_maintenance_reminders_vehicleId_key" ON "vehicle_maintenance_reminders"("vehicleId");

-- CreateIndex
CREATE INDEX "vehicle_maintenance_reminders_tenantId_idx" ON "vehicle_maintenance_reminders"("tenantId");

-- CreateIndex
CREATE INDEX "vehicle_maintenance_reminders_vehicleId_idx" ON "vehicle_maintenance_reminders"("vehicleId");

-- CreateIndex
CREATE INDEX "vehicle_maintenance_reminders_nextReminderDate_idx" ON "vehicle_maintenance_reminders"("nextReminderDate");

-- CreateIndex
CREATE INDEX "vehicle_maintenance_reminders_reminderSent_idx" ON "vehicle_maintenance_reminders"("reminderSent");

-- CreateIndex
CREATE UNIQUE INDEX "vehicle_maintenance_reminders_tenantId_vehicleId_key" ON "vehicle_maintenance_reminders"("tenantId", "vehicleId");

-- AddForeignKey
ALTER TABLE "tenant_settings" ADD CONSTRAINT "tenant_settings_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_planId_fkey" FOREIGN KEY ("planId") REFERENCES "plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "subscriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stoklar" ADD CONSTRAINT "stoklar_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stoklar" ADD CONSTRAINT "stoklar_esdegerGrupId_fkey" FOREIGN KEY ("esdegerGrupId") REFERENCES "esdeger_gruplar"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "price_cards" ADD CONSTRAINT "price_cards_stok_id_fkey" FOREIGN KEY ("stok_id") REFERENCES "stoklar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "price_cards" ADD CONSTRAINT "price_cards_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "price_cards" ADD CONSTRAINT "price_cards_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_cost_history" ADD CONSTRAINT "stock_cost_history_stok_id_fkey" FOREIGN KEY ("stok_id") REFERENCES "stoklar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stok_esdegers" ADD CONSTRAINT "stok_esdegers_stok1Id_fkey" FOREIGN KEY ("stok1Id") REFERENCES "stoklar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stok_esdegers" ADD CONSTRAINT "stok_esdegers_stok2Id_fkey" FOREIGN KEY ("stok2Id") REFERENCES "stoklar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stok_hareketleri" ADD CONSTRAINT "stok_hareketleri_stokId_fkey" FOREIGN KEY ("stokId") REFERENCES "stoklar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cariler" ADD CONSTRAINT "cariler_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cari_hareketler" ADD CONSTRAINT "cari_hareketler_cariId_fkey" FOREIGN KEY ("cariId") REFERENCES "cariler"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kasalar" ADD CONSTRAINT "kasalar_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kasalar" ADD CONSTRAINT "kasalar_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kasalar" ADD CONSTRAINT "kasalar_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "banka_hesaplari" ADD CONSTRAINT "banka_hesaplari_kasaId_fkey" FOREIGN KEY ("kasaId") REFERENCES "kasalar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "banka_hesap_hareketler" ADD CONSTRAINT "banka_hesap_hareketler_hesapId_fkey" FOREIGN KEY ("hesapId") REFERENCES "banka_hesaplari"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "banka_hesap_hareketler" ADD CONSTRAINT "banka_hesap_hareketler_cariId_fkey" FOREIGN KEY ("cariId") REFERENCES "cariler"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "firma_kredi_kartlari" ADD CONSTRAINT "firma_kredi_kartlari_kasaId_fkey" FOREIGN KEY ("kasaId") REFERENCES "kasalar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "firma_kredi_karti_hareketler" ADD CONSTRAINT "firma_kredi_karti_hareketler_kartId_fkey" FOREIGN KEY ("kartId") REFERENCES "firma_kredi_kartlari"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "firma_kredi_karti_hareketler" ADD CONSTRAINT "firma_kredi_karti_hareketler_cariId_fkey" FOREIGN KEY ("cariId") REFERENCES "cariler"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kasa_hareketler" ADD CONSTRAINT "kasa_hareketler_kasaId_fkey" FOREIGN KEY ("kasaId") REFERENCES "kasalar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kasa_hareketler" ADD CONSTRAINT "kasa_hareketler_cariId_fkey" FOREIGN KEY ("cariId") REFERENCES "cariler"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kasa_hareketler" ADD CONSTRAINT "kasa_hareketler_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faturalar" ADD CONSTRAINT "faturalar_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faturalar" ADD CONSTRAINT "faturalar_cariId_fkey" FOREIGN KEY ("cariId") REFERENCES "cariler"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faturalar" ADD CONSTRAINT "faturalar_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "purchase_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faturalar" ADD CONSTRAINT "faturalar_satinAlmaSiparisiId_fkey" FOREIGN KEY ("satinAlmaSiparisiId") REFERENCES "satin_alma_siparisleri"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faturalar" ADD CONSTRAINT "faturalar_deliveryNoteId_fkey" FOREIGN KEY ("deliveryNoteId") REFERENCES "satis_irsaliyeleri"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faturalar" ADD CONSTRAINT "faturalar_satinAlmaIrsaliyeId_fkey" FOREIGN KEY ("satinAlmaIrsaliyeId") REFERENCES "satin_alma_irsaliyeleri"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faturalar" ADD CONSTRAINT "faturalar_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faturalar" ADD CONSTRAINT "faturalar_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faturalar" ADD CONSTRAINT "faturalar_deletedBy_fkey" FOREIGN KEY ("deletedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fatura_logs" ADD CONSTRAINT "fatura_logs_faturaId_fkey" FOREIGN KEY ("faturaId") REFERENCES "faturalar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fatura_logs" ADD CONSTRAINT "fatura_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fatura_kalemleri" ADD CONSTRAINT "fatura_kalemleri_faturaId_fkey" FOREIGN KEY ("faturaId") REFERENCES "faturalar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fatura_kalemleri" ADD CONSTRAINT "fatura_kalemleri_stokId_fkey" FOREIGN KEY ("stokId") REFERENCES "stoklar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fatura_kalemleri" ADD CONSTRAINT "fatura_kalemleri_purchaseOrderItemId_fkey" FOREIGN KEY ("purchaseOrderItemId") REFERENCES "purchase_order_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tahsilatlar" ADD CONSTRAINT "tahsilatlar_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tahsilatlar" ADD CONSTRAINT "tahsilatlar_cariId_fkey" FOREIGN KEY ("cariId") REFERENCES "cariler"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tahsilatlar" ADD CONSTRAINT "tahsilatlar_faturaId_fkey" FOREIGN KEY ("faturaId") REFERENCES "faturalar"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tahsilatlar" ADD CONSTRAINT "tahsilatlar_kasaId_fkey" FOREIGN KEY ("kasaId") REFERENCES "kasalar"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tahsilatlar" ADD CONSTRAINT "tahsilatlar_bankaHesapId_fkey" FOREIGN KEY ("bankaHesapId") REFERENCES "banka_hesaplari"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tahsilatlar" ADD CONSTRAINT "tahsilatlar_firmaKrediKartiId_fkey" FOREIGN KEY ("firmaKrediKartiId") REFERENCES "firma_kredi_kartlari"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tahsilatlar" ADD CONSTRAINT "tahsilatlar_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fatura_tahsilatlar" ADD CONSTRAINT "fatura_tahsilatlar_faturaId_fkey" FOREIGN KEY ("faturaId") REFERENCES "faturalar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fatura_tahsilatlar" ADD CONSTRAINT "fatura_tahsilatlar_tahsilatId_fkey" FOREIGN KEY ("tahsilatId") REFERENCES "tahsilatlar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "efatura_xml" ADD CONSTRAINT "efatura_xml_faturaId_fkey" FOREIGN KEY ("faturaId") REFERENCES "faturalar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "siparisler" ADD CONSTRAINT "siparisler_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "siparisler" ADD CONSTRAINT "siparisler_cariId_fkey" FOREIGN KEY ("cariId") REFERENCES "cariler"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "siparisler" ADD CONSTRAINT "siparisler_deliveryNoteId_fkey" FOREIGN KEY ("deliveryNoteId") REFERENCES "satis_irsaliyeleri"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "siparisler" ADD CONSTRAINT "siparisler_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "siparisler" ADD CONSTRAINT "siparisler_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "siparisler" ADD CONSTRAINT "siparisler_deletedBy_fkey" FOREIGN KEY ("deletedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "siparis_kalemleri" ADD CONSTRAINT "siparis_kalemleri_siparisId_fkey" FOREIGN KEY ("siparisId") REFERENCES "siparisler"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "siparis_kalemleri" ADD CONSTRAINT "siparis_kalemleri_stokId_fkey" FOREIGN KEY ("stokId") REFERENCES "stoklar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "siparis_logs" ADD CONSTRAINT "siparis_logs_siparisId_fkey" FOREIGN KEY ("siparisId") REFERENCES "siparisler"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "siparis_logs" ADD CONSTRAINT "siparis_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "siparis_hazirliklar" ADD CONSTRAINT "siparis_hazirliklar_siparisId_fkey" FOREIGN KEY ("siparisId") REFERENCES "siparisler"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "siparis_hazirliklar" ADD CONSTRAINT "siparis_hazirliklar_siparisKalemiId_fkey" FOREIGN KEY ("siparisKalemiId") REFERENCES "siparis_kalemleri"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "siparis_hazirliklar" ADD CONSTRAINT "siparis_hazirliklar_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "siparis_hazirliklar" ADD CONSTRAINT "siparis_hazirliklar_hazirlayan_fkey" FOREIGN KEY ("hazirlayan") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "satis_irsaliyeleri" ADD CONSTRAINT "satis_irsaliyeleri_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "satis_irsaliyeleri" ADD CONSTRAINT "satis_irsaliyeleri_cariId_fkey" FOREIGN KEY ("cariId") REFERENCES "cariler"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "satis_irsaliyeleri" ADD CONSTRAINT "satis_irsaliyeleri_depoId_fkey" FOREIGN KEY ("depoId") REFERENCES "warehouses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "satis_irsaliyeleri" ADD CONSTRAINT "satis_irsaliyeleri_kaynakId_fkey" FOREIGN KEY ("kaynakId") REFERENCES "siparisler"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "satis_irsaliyeleri" ADD CONSTRAINT "satis_irsaliyeleri_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "satis_irsaliyeleri" ADD CONSTRAINT "satis_irsaliyeleri_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "satis_irsaliyeleri" ADD CONSTRAINT "satis_irsaliyeleri_deletedBy_fkey" FOREIGN KEY ("deletedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "satis_irsaliyesi_kalemleri" ADD CONSTRAINT "satis_irsaliyesi_kalemleri_irsaliyeId_fkey" FOREIGN KEY ("irsaliyeId") REFERENCES "satis_irsaliyeleri"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "satis_irsaliyesi_kalemleri" ADD CONSTRAINT "satis_irsaliyesi_kalemleri_stokId_fkey" FOREIGN KEY ("stokId") REFERENCES "stoklar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "satis_irsaliyesi_logs" ADD CONSTRAINT "satis_irsaliyesi_logs_irsaliyeId_fkey" FOREIGN KEY ("irsaliyeId") REFERENCES "satis_irsaliyeleri"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "satis_irsaliyesi_logs" ADD CONSTRAINT "satis_irsaliyesi_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teklifler" ADD CONSTRAINT "teklifler_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teklifler" ADD CONSTRAINT "teklifler_cariId_fkey" FOREIGN KEY ("cariId") REFERENCES "cariler"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teklifler" ADD CONSTRAINT "teklifler_siparisId_fkey" FOREIGN KEY ("siparisId") REFERENCES "siparisler"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teklifler" ADD CONSTRAINT "teklifler_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teklifler" ADD CONSTRAINT "teklifler_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teklifler" ADD CONSTRAINT "teklifler_deletedBy_fkey" FOREIGN KEY ("deletedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teklif_kalemleri" ADD CONSTRAINT "teklif_kalemleri_teklifId_fkey" FOREIGN KEY ("teklifId") REFERENCES "teklifler"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teklif_kalemleri" ADD CONSTRAINT "teklif_kalemleri_stokId_fkey" FOREIGN KEY ("stokId") REFERENCES "stoklar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teklif_logs" ADD CONSTRAINT "teklif_logs_teklifId_fkey" FOREIGN KEY ("teklifId") REFERENCES "teklifler"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teklif_logs" ADD CONSTRAINT "teklif_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sayimlar" ADD CONSTRAINT "sayimlar_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sayimlar" ADD CONSTRAINT "sayimlar_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sayimlar" ADD CONSTRAINT "sayimlar_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sayimlar" ADD CONSTRAINT "sayimlar_onaylayanId_fkey" FOREIGN KEY ("onaylayanId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sayim_kalemleri" ADD CONSTRAINT "sayim_kalemleri_sayimId_fkey" FOREIGN KEY ("sayimId") REFERENCES "sayimlar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sayim_kalemleri" ADD CONSTRAINT "sayim_kalemleri_stokId_fkey" FOREIGN KEY ("stokId") REFERENCES "stoklar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sayim_kalemleri" ADD CONSTRAINT "sayim_kalemleri_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "raflar" ADD CONSTRAINT "raflar_depoId_fkey" FOREIGN KEY ("depoId") REFERENCES "depolar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "urun_raflar" ADD CONSTRAINT "urun_raflar_stokId_fkey" FOREIGN KEY ("stokId") REFERENCES "stoklar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "urun_raflar" ADD CONSTRAINT "urun_raflar_rafId_fkey" FOREIGN KEY ("rafId") REFERENCES "raflar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warehouses" ADD CONSTRAINT "warehouses_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "locations" ADD CONSTRAINT "locations_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "warehouses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_barcodes" ADD CONSTRAINT "product_barcodes_productId_fkey" FOREIGN KEY ("productId") REFERENCES "stoklar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_location_stocks" ADD CONSTRAINT "product_location_stocks_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "warehouses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_location_stocks" ADD CONSTRAINT "product_location_stocks_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_location_stocks" ADD CONSTRAINT "product_location_stocks_productId_fkey" FOREIGN KEY ("productId") REFERENCES "stoklar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_moves" ADD CONSTRAINT "stock_moves_productId_fkey" FOREIGN KEY ("productId") REFERENCES "stoklar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_moves" ADD CONSTRAINT "stock_moves_fromWarehouseId_fkey" FOREIGN KEY ("fromWarehouseId") REFERENCES "warehouses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_moves" ADD CONSTRAINT "stock_moves_fromLocationId_fkey" FOREIGN KEY ("fromLocationId") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_moves" ADD CONSTRAINT "stock_moves_toWarehouseId_fkey" FOREIGN KEY ("toWarehouseId") REFERENCES "warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_moves" ADD CONSTRAINT "stock_moves_toLocationId_fkey" FOREIGN KEY ("toLocationId") REFERENCES "locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_moves" ADD CONSTRAINT "stock_moves_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "masraflar" ADD CONSTRAINT "masraflar_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "masraflar" ADD CONSTRAINT "masraflar_kategoriId_fkey" FOREIGN KEY ("kategoriId") REFERENCES "masraf_kategoriler"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "banka_havaleler" ADD CONSTRAINT "banka_havaleler_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "banka_havaleler" ADD CONSTRAINT "banka_havaleler_bankaHesabiId_fkey" FOREIGN KEY ("bankaHesabiId") REFERENCES "kasalar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "banka_havaleler" ADD CONSTRAINT "banka_havaleler_cariId_fkey" FOREIGN KEY ("cariId") REFERENCES "cariler"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "banka_havaleler" ADD CONSTRAINT "banka_havaleler_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "banka_havaleler" ADD CONSTRAINT "banka_havaleler_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "banka_havaleler" ADD CONSTRAINT "banka_havaleler_deletedBy_fkey" FOREIGN KEY ("deletedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deleted_banka_havaleler" ADD CONSTRAINT "deleted_banka_havaleler_deletedBy_fkey" FOREIGN KEY ("deletedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "banka_havale_logs" ADD CONSTRAINT "banka_havale_logs_bankaHavaleId_fkey" FOREIGN KEY ("bankaHavaleId") REFERENCES "banka_havaleler"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "banka_havale_logs" ADD CONSTRAINT "banka_havale_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cek_senetler" ADD CONSTRAINT "cek_senetler_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cek_senetler" ADD CONSTRAINT "cek_senetler_cariId_fkey" FOREIGN KEY ("cariId") REFERENCES "cariler"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cek_senetler" ADD CONSTRAINT "cek_senetler_tahsilKasaId_fkey" FOREIGN KEY ("tahsilKasaId") REFERENCES "kasalar"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cek_senetler" ADD CONSTRAINT "cek_senetler_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cek_senetler" ADD CONSTRAINT "cek_senetler_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cek_senetler" ADD CONSTRAINT "cek_senetler_deletedBy_fkey" FOREIGN KEY ("deletedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deleted_cek_senetler" ADD CONSTRAINT "deleted_cek_senetler_deletedBy_fkey" FOREIGN KEY ("deletedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cek_senet_logs" ADD CONSTRAINT "cek_senet_logs_cekSenetId_fkey" FOREIGN KEY ("cekSenetId") REFERENCES "cek_senetler"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cek_senet_logs" ADD CONSTRAINT "cek_senet_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personeller" ADD CONSTRAINT "personeller_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personeller" ADD CONSTRAINT "personeller_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personeller" ADD CONSTRAINT "personeller_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personel_odemeler" ADD CONSTRAINT "personel_odemeler_personelId_fkey" FOREIGN KEY ("personelId") REFERENCES "personeller"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personel_odemeler" ADD CONSTRAINT "personel_odemeler_kasaId_fkey" FOREIGN KEY ("kasaId") REFERENCES "kasalar"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personel_odemeler" ADD CONSTRAINT "personel_odemeler_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "cariler"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_order_items" ADD CONSTRAINT "purchase_order_items_purchase_order_id_fkey" FOREIGN KEY ("purchase_order_id") REFERENCES "purchase_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_order_items" ADD CONSTRAINT "purchase_order_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "stoklar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "basit_siparisler" ADD CONSTRAINT "basit_siparisler_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "basit_siparisler" ADD CONSTRAINT "basit_siparisler_firmaId_fkey" FOREIGN KEY ("firmaId") REFERENCES "cariler"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "basit_siparisler" ADD CONSTRAINT "basit_siparisler_urunId_fkey" FOREIGN KEY ("urunId") REFERENCES "stoklar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "satin_alma_siparisleri" ADD CONSTRAINT "satin_alma_siparisleri_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "satin_alma_siparisleri" ADD CONSTRAINT "satin_alma_siparisleri_cariId_fkey" FOREIGN KEY ("cariId") REFERENCES "cariler"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "satin_alma_siparisleri" ADD CONSTRAINT "satin_alma_siparisleri_deliveryNoteId_fkey" FOREIGN KEY ("deliveryNoteId") REFERENCES "satin_alma_irsaliyeleri"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "satin_alma_siparisleri" ADD CONSTRAINT "satin_alma_siparisleri_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "satin_alma_siparisleri" ADD CONSTRAINT "satin_alma_siparisleri_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "satin_alma_siparisleri" ADD CONSTRAINT "satin_alma_siparisleri_deletedBy_fkey" FOREIGN KEY ("deletedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "satin_alma_siparis_kalemleri" ADD CONSTRAINT "satin_alma_siparis_kalemleri_satınAlmaSiparisId_fkey" FOREIGN KEY ("satınAlmaSiparisId") REFERENCES "satin_alma_siparisleri"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "satin_alma_siparis_kalemleri" ADD CONSTRAINT "satin_alma_siparis_kalemleri_stokId_fkey" FOREIGN KEY ("stokId") REFERENCES "stoklar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "satin_alma_siparis_logs" ADD CONSTRAINT "satin_alma_siparis_logs_satınAlmaSiparisId_fkey" FOREIGN KEY ("satınAlmaSiparisId") REFERENCES "satin_alma_siparisleri"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "satin_alma_siparis_logs" ADD CONSTRAINT "satin_alma_siparis_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "satin_alma_irsaliyeleri" ADD CONSTRAINT "satin_alma_irsaliyeleri_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "satin_alma_irsaliyeleri" ADD CONSTRAINT "satin_alma_irsaliyeleri_cariId_fkey" FOREIGN KEY ("cariId") REFERENCES "cariler"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "satin_alma_irsaliyeleri" ADD CONSTRAINT "satin_alma_irsaliyeleri_depoId_fkey" FOREIGN KEY ("depoId") REFERENCES "warehouses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "satin_alma_irsaliyeleri" ADD CONSTRAINT "satin_alma_irsaliyeleri_kaynakId_fkey" FOREIGN KEY ("kaynakId") REFERENCES "satin_alma_siparisleri"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "satin_alma_irsaliyeleri" ADD CONSTRAINT "satin_alma_irsaliyeleri_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "satin_alma_irsaliyeleri" ADD CONSTRAINT "satin_alma_irsaliyeleri_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "satin_alma_irsaliyeleri" ADD CONSTRAINT "satin_alma_irsaliyeleri_deletedBy_fkey" FOREIGN KEY ("deletedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "satin_alma_irsaliyesi_kalemleri" ADD CONSTRAINT "satin_alma_irsaliyesi_kalemleri_irsaliyeId_fkey" FOREIGN KEY ("irsaliyeId") REFERENCES "satin_alma_irsaliyeleri"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "satin_alma_irsaliyesi_kalemleri" ADD CONSTRAINT "satin_alma_irsaliyesi_kalemleri_stokId_fkey" FOREIGN KEY ("stokId") REFERENCES "stoklar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "satin_alma_irsaliyesi_logs" ADD CONSTRAINT "satin_alma_irsaliyesi_logs_irsaliyeId_fkey" FOREIGN KEY ("irsaliyeId") REFERENCES "satin_alma_irsaliyeleri"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "satin_alma_irsaliyesi_logs" ADD CONSTRAINT "satin_alma_irsaliyesi_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "module_licenses" ADD CONSTRAINT "module_licenses_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "subscriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "module_licenses" ADD CONSTRAINT "module_licenses_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "modules"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_licenses" ADD CONSTRAINT "user_licenses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_licenses" ADD CONSTRAINT "user_licenses_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "modules"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "cariler"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "technicians" ADD CONSTRAINT "technicians_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "cariler"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "technicians"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "faturalar"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_order_lines" ADD CONSTRAINT "work_order_lines_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "work_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_order_lines" ADD CONSTRAINT "work_order_lines_productId_fkey" FOREIGN KEY ("productId") REFERENCES "stoklar"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_order_lines" ADD CONSTRAINT "work_order_lines_approvedBy_fkey" FOREIGN KEY ("approvedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_order_audit_logs" ADD CONSTRAINT "work_order_audit_logs_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "work_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_order_audit_logs" ADD CONSTRAINT "work_order_audit_logs_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "technicians"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_order_status_history" ADD CONSTRAINT "work_order_status_history_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "work_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "technical_findings" ADD CONSTRAINT "technical_findings_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "work_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnostic_notes" ADD CONSTRAINT "diagnostic_notes_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "work_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solution_packages" ADD CONSTRAINT "solution_packages_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "work_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solution_package_parts" ADD CONSTRAINT "solution_package_parts_solutionPackageId_fkey" FOREIGN KEY ("solutionPackageId") REFERENCES "solution_packages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solution_package_parts" ADD CONSTRAINT "solution_package_parts_productId_fkey" FOREIGN KEY ("productId") REFERENCES "stoklar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manager_approvals" ADD CONSTRAINT "manager_approvals_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "work_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manager_approvals" ADD CONSTRAINT "manager_approvals_solutionPackageId_fkey" FOREIGN KEY ("solutionPackageId") REFERENCES "solution_packages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manager_rejections" ADD CONSTRAINT "manager_rejections_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "work_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manager_rejections" ADD CONSTRAINT "manager_rejections_solutionPackageId_fkey" FOREIGN KEY ("solutionPackageId") REFERENCES "solution_packages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_maintenance_reminders" ADD CONSTRAINT "vehicle_maintenance_reminders_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_maintenance_reminders" ADD CONSTRAINT "vehicle_maintenance_reminders_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

