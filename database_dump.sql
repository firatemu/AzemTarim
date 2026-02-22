--
-- PostgreSQL database dump
--

\restrict nLvJxL9O6roGMkgbQMVqmTsY0pfPCeArXIOT58KqTLzOjyFULeaxymV5FDLd0iB

-- Dumped from database version 16.12
-- Dumped by pg_dump version 16.12

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


--
-- Name: AdresTipi; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."AdresTipi" AS ENUM (
    'TESLIMAT',
    'FATURA',
    'MERKEZ',
    'SUBE',
    'DEPO',
    'DIGER'
);


ALTER TYPE public."AdresTipi" OWNER TO postgres;

--
-- Name: AvansDurum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."AvansDurum" AS ENUM (
    'ACIK',
    'KISMI',
    'KAPALI'
);


ALTER TYPE public."AvansDurum" OWNER TO postgres;

--
-- Name: BankaHareketAltTipi; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."BankaHareketAltTipi" AS ENUM (
    'HAVALE_GELEN',
    'HAVALE_GIDEN',
    'KREDI_KULLANIM',
    'KREDI_ODEME',
    'TEMINAT_CEK',
    'TEMINAT_SENET',
    'POS_TAHSILAT',
    'KART_HARCAMA',
    'KART_ODEME',
    'VIRMAN',
    'DIGER',
    'KREDI_TAKSIT_ODEME'
);


ALTER TYPE public."BankaHareketAltTipi" OWNER TO postgres;

--
-- Name: BankaHareketTipi; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."BankaHareketTipi" AS ENUM (
    'GELEN',
    'GIDEN'
);


ALTER TYPE public."BankaHareketTipi" OWNER TO postgres;

--
-- Name: BankaHesapTipi; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."BankaHesapTipi" AS ENUM (
    'VADESIZ',
    'KREDI',
    'POS',
    'FIRMA_KREDI_KARTI',
    'VADELI',
    'YATIRIM',
    'ALTIN',
    'DOVIZ',
    'DIGER'
);


ALTER TYPE public."BankaHesapTipi" OWNER TO postgres;

--
-- Name: BasitSiparisDurum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."BasitSiparisDurum" AS ENUM (
    'ONAY_BEKLIYOR',
    'ONAYLANDI',
    'SIPARIS_VERILDI',
    'FATURALANDI',
    'IPTAL_EDILDI'
);


ALTER TYPE public."BasitSiparisDurum" OWNER TO postgres;

--
-- Name: BelgeTipi; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."BelgeTipi" AS ENUM (
    'FATURA',
    'TAHSILAT',
    'ODEME',
    'CEK_SENET',
    'DEVIR',
    'DUZELTME',
    'CEK_GIRIS',
    'CEK_CIKIS',
    'IADE'
);


ALTER TYPE public."BelgeTipi" OWNER TO postgres;

--
-- Name: BillingPeriod; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."BillingPeriod" AS ENUM (
    'MONTHLY',
    'QUARTERLY',
    'YEARLY',
    'LIFETIME'
);


ALTER TYPE public."BillingPeriod" OWNER TO postgres;

--
-- Name: BorcAlacak; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."BorcAlacak" AS ENUM (
    'BORC',
    'ALACAK',
    'DEVIR'
);


ALTER TYPE public."BorcAlacak" OWNER TO postgres;

--
-- Name: BordroTipi; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."BordroTipi" AS ENUM (
    'GIRIS_BORDROSU',
    'CIKIS_BORDROSU',
    'MUSTERI_EVRAK_GIRISI',
    'MUSTERI_EVRAK_CIKIS',
    'KENDI_EVRAK_GIRIS',
    'KENDI_EVRAK_CIKIS',
    'BANKA_TAHSIL_CIROSU',
    'BANKA_TEMINAT_CIROSU',
    'CARIYE_EVRAK_CIROSU',
    'BORC_EVRAK_CIKISI',
    'IADE_BORDROSU'
);


ALTER TYPE public."BordroTipi" OWNER TO postgres;

--
-- Name: CariTip; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."CariTip" AS ENUM (
    'MUSTERI',
    'TEDARIKCI',
    'HER_IKISI'
);


ALTER TYPE public."CariTip" OWNER TO postgres;

--
-- Name: CekSenetDurum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."CekSenetDurum" AS ENUM (
    'PORTFOYDE',
    'ODENMEDI',
    'BANKAYA_VERILDI',
    'TAHSIL_EDILDI',
    'ODENDI',
    'CIRO_EDILDI',
    'IADE_EDILDI',
    'KARSILIKIZ',
    'BANKA_TAHSILDE',
    'BANKA_TEMINATTA'
);


ALTER TYPE public."CekSenetDurum" OWNER TO postgres;

--
-- Name: CekSenetTip; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."CekSenetTip" AS ENUM (
    'CEK',
    'SENET'
);


ALTER TYPE public."CekSenetTip" OWNER TO postgres;

--
-- Name: Cinsiyet; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."Cinsiyet" AS ENUM (
    'ERKEK',
    'KADIN',
    'BELIRTILMEMIS'
);


ALTER TYPE public."Cinsiyet" OWNER TO postgres;

--
-- Name: EFaturaStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."EFaturaStatus" AS ENUM (
    'PENDING',
    'SENT',
    'ERROR',
    'DRAFT'
);


ALTER TYPE public."EFaturaStatus" OWNER TO postgres;

--
-- Name: FaturaDurum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."FaturaDurum" AS ENUM (
    'ACIK',
    'KAPALI',
    'KISMEN_ODENDI',
    'ONAYLANDI',
    'IPTAL'
);


ALTER TYPE public."FaturaDurum" OWNER TO postgres;

--
-- Name: FaturaTipi; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."FaturaTipi" AS ENUM (
    'ALIS',
    'SATIS',
    'SATIS_IADE',
    'ALIS_IADE'
);


ALTER TYPE public."FaturaTipi" OWNER TO postgres;

--
-- Name: HareketTipi; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."HareketTipi" AS ENUM (
    'GIRIS',
    'CIKIS',
    'SATIS',
    'IADE',
    'SAYIM',
    'SAYIM_FAZLA',
    'SAYIM_EKSIK'
);


ALTER TYPE public."HareketTipi" OWNER TO postgres;

--
-- Name: HavaleTipi; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."HavaleTipi" AS ENUM (
    'GELEN',
    'GIDEN'
);


ALTER TYPE public."HavaleTipi" OWNER TO postgres;

--
-- Name: InvitationStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."InvitationStatus" AS ENUM (
    'PENDING',
    'ACCEPTED',
    'EXPIRED',
    'CANCELLED'
);


ALTER TYPE public."InvitationStatus" OWNER TO postgres;

--
-- Name: IrsaliyeDurum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."IrsaliyeDurum" AS ENUM (
    'FATURALANMADI',
    'FATURALANDI'
);


ALTER TYPE public."IrsaliyeDurum" OWNER TO postgres;

--
-- Name: IrsaliyeKaynakTip; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."IrsaliyeKaynakTip" AS ENUM (
    'SIPARIS',
    'DOGRUDAN',
    'FATURA_OTOMATIK'
);


ALTER TYPE public."IrsaliyeKaynakTip" OWNER TO postgres;

--
-- Name: KasaHareketTipi; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."KasaHareketTipi" AS ENUM (
    'TAHSILAT',
    'ODEME',
    'HAVALE_GELEN',
    'HAVALE_GIDEN',
    'KREDI_KARTI',
    'VIRMAN',
    'DEVIR',
    'CEK_ALINDI',
    'CEK_VERILDI',
    'SENET_ALINDI',
    'SENET_VERILDI',
    'CEK_TAHSIL',
    'SENET_TAHSIL'
);


ALTER TYPE public."KasaHareketTipi" OWNER TO postgres;

--
-- Name: KasaTipi; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."KasaTipi" AS ENUM (
    'NAKIT',
    'POS',
    'FIRMA_KREDI_KARTI',
    'BANKA',
    'CEK_SENET'
);


ALTER TYPE public."KasaTipi" OWNER TO postgres;

--
-- Name: KrediDurum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."KrediDurum" AS ENUM (
    'AKTIF',
    'KAPANDI',
    'IPTAL'
);


ALTER TYPE public."KrediDurum" OWNER TO postgres;

--
-- Name: KrediPlanDurum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."KrediPlanDurum" AS ENUM (
    'BEKLIYOR',
    'ODENDI',
    'GECIKMEDE',
    'KISMI_ODENDI'
);


ALTER TYPE public."KrediPlanDurum" OWNER TO postgres;

--
-- Name: KrediTuru; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."KrediTuru" AS ENUM (
    'ESIT_TAKSITLI',
    'ROTATIF'
);


ALTER TYPE public."KrediTuru" OWNER TO postgres;

--
-- Name: LicenseType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."LicenseType" AS ENUM (
    'BASE_PLAN',
    'MODULE'
);


ALTER TYPE public."LicenseType" OWNER TO postgres;

--
-- Name: LogAction; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."LogAction" AS ENUM (
    'CREATE',
    'UPDATE',
    'DELETE',
    'DURUM_DEGISIKLIK',
    'IPTAL',
    'RESTORE',
    'SIPARISE_DONUSTU',
    'EFATURA_GONDERILDI',
    'EFATURA_GONDERIM_HATASI',
    'SEVK',
    'CIRO'
);


ALTER TYPE public."LogAction" OWNER TO postgres;

--
-- Name: MaasDurum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."MaasDurum" AS ENUM (
    'ODENMEDI',
    'KISMI_ODENDI',
    'TAMAMEN_ODENDI'
);


ALTER TYPE public."MaasDurum" OWNER TO postgres;

--
-- Name: MedeniDurum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."MedeniDurum" AS ENUM (
    'BEKAR',
    'EVLI'
);


ALTER TYPE public."MedeniDurum" OWNER TO postgres;

--
-- Name: ModuleType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ModuleType" AS ENUM (
    'WAREHOUSE',
    'CASHBOX',
    'PERSONNEL',
    'PRODUCT',
    'CUSTOMER',
    'INVOICE_SALES',
    'INVOICE_PURCHASE',
    'ORDER_SALES',
    'ORDER_PURCHASE',
    'INVENTORY_COUNT',
    'TEKLIF',
    'DELIVERY_NOTE_SALES',
    'DELIVERY_NOTE_PURCHASE',
    'WAREHOUSE_TRANSFER',
    'TECHNICIAN'
);


ALTER TYPE public."ModuleType" OWNER TO postgres;

--
-- Name: OdemeTipi; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."OdemeTipi" AS ENUM (
    'NAKIT',
    'KREDI_KARTI',
    'BANKA_HAVALESI',
    'CEK',
    'SENET'
);


ALTER TYPE public."OdemeTipi" OWNER TO postgres;

--
-- Name: OrderItemStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."OrderItemStatus" AS ENUM (
    'PENDING',
    'PARTIAL',
    'COMPLETED'
);


ALTER TYPE public."OrderItemStatus" OWNER TO postgres;

--
-- Name: OrderStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."OrderStatus" AS ENUM (
    'PENDING',
    'PARTIAL',
    'COMPLETED',
    'CANCELLED'
);


ALTER TYPE public."OrderStatus" OWNER TO postgres;

--
-- Name: PaymentStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PaymentStatus" AS ENUM (
    'PENDING',
    'PROCESSING',
    'SUCCESS',
    'FAILED',
    'REFUNDED',
    'CANCELED'
);


ALTER TYPE public."PaymentStatus" OWNER TO postgres;

--
-- Name: PersonelOdemeTip; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PersonelOdemeTip" AS ENUM (
    'HAK_EDIS',
    'MAAS',
    'AVANS',
    'PRIM',
    'KESINTI',
    'ZIMMET',
    'ZIMMET_IADE'
);


ALTER TYPE public."PersonelOdemeTip" OWNER TO postgres;

--
-- Name: PortfoyTip; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PortfoyTip" AS ENUM (
    'ALACAK',
    'BORC'
);


ALTER TYPE public."PortfoyTip" OWNER TO postgres;

--
-- Name: PriceCardType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PriceCardType" AS ENUM (
    'SALE',
    'PURCHASE'
);


ALTER TYPE public."PriceCardType" OWNER TO postgres;

--
-- Name: RiskDurumu; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."RiskDurumu" AS ENUM (
    'NORMAL',
    'RISKLI',
    'KARA_LISTE',
    'TAKIPTE'
);


ALTER TYPE public."RiskDurumu" OWNER TO postgres;

--
-- Name: SatınAlmaSiparisDurum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."SatınAlmaSiparisDurum" AS ENUM (
    'BEKLEMEDE',
    'HAZIRLANIYOR',
    'HAZIRLANDI',
    'SEVK_EDILDI',
    'KISMI_SEVK',
    'SIPARIS_VERILDI',
    'FATURALANDI',
    'IPTAL'
);


ALTER TYPE public."SatınAlmaSiparisDurum" OWNER TO postgres;

--
-- Name: SayimDurum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."SayimDurum" AS ENUM (
    'TASLAK',
    'TAMAMLANDI',
    'ONAYLANDI',
    'IPTAL'
);


ALTER TYPE public."SayimDurum" OWNER TO postgres;

--
-- Name: SayimTipi; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."SayimTipi" AS ENUM (
    'URUN_BAZLI',
    'RAF_BAZLI'
);


ALTER TYPE public."SayimTipi" OWNER TO postgres;

--
-- Name: ServiceWorkStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ServiceWorkStatus" AS ENUM (
    'SERVICE_ACCEPTED',
    'PRE_DIAGNOSIS',
    'TECHNICAL_DIAGNOSIS',
    'SOLUTION_PROPOSED',
    'WAITING_MANAGER_APPROVAL',
    'APPROVED',
    'PART_SUPPLY',
    'IN_PROGRESS',
    'QUALITY_CONTROL',
    'READY_FOR_BILLING',
    'INVOICED',
    'CLOSED',
    'CANCELLED'
);


ALTER TYPE public."ServiceWorkStatus" OWNER TO postgres;

--
-- Name: SiparisDurum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."SiparisDurum" AS ENUM (
    'BEKLEMEDE',
    'HAZIRLANIYOR',
    'HAZIRLANDI',
    'SEVK_EDILDI',
    'KISMI_SEVK',
    'FATURALANDI',
    'IPTAL'
);


ALTER TYPE public."SiparisDurum" OWNER TO postgres;

--
-- Name: SiparisTipi; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."SiparisTipi" AS ENUM (
    'SATIS',
    'SATIN_ALMA'
);


ALTER TYPE public."SiparisTipi" OWNER TO postgres;

--
-- Name: SirketTipi; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."SirketTipi" AS ENUM (
    'KURUMSAL',
    'SAHIS'
);


ALTER TYPE public."SirketTipi" OWNER TO postgres;

--
-- Name: StockMoveType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."StockMoveType" AS ENUM (
    'PUT_AWAY',
    'TRANSFER',
    'PICKING',
    'ADJUSTMENT',
    'SALE',
    'RETURN',
    'DAMAGE'
);


ALTER TYPE public."StockMoveType" OWNER TO postgres;

--
-- Name: SubscriptionStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."SubscriptionStatus" AS ENUM (
    'PENDING',
    'TRIAL',
    'ACTIVE',
    'PAST_DUE',
    'CANCELED',
    'EXPIRED'
);


ALTER TYPE public."SubscriptionStatus" OWNER TO postgres;

--
-- Name: TahsilatTip; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."TahsilatTip" AS ENUM (
    'TAHSILAT',
    'ODEME'
);


ALTER TYPE public."TahsilatTip" OWNER TO postgres;

--
-- Name: TeklifDurum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."TeklifDurum" AS ENUM (
    'TEKLIF',
    'ONAYLANDI',
    'REDDEDILDI',
    'SIPARISE_DONUSTU'
);


ALTER TYPE public."TeklifDurum" OWNER TO postgres;

--
-- Name: TeklifTipi; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."TeklifTipi" AS ENUM (
    'SATIS',
    'SATIN_ALMA'
);


ALTER TYPE public."TeklifTipi" OWNER TO postgres;

--
-- Name: TenantStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."TenantStatus" AS ENUM (
    'TRIAL',
    'ACTIVE',
    'SUSPENDED',
    'CANCELLED',
    'PURGED',
    'EXPIRED',
    'CHURNED',
    'DELETED',
    'PENDING'
);


ALTER TYPE public."TenantStatus" OWNER TO postgres;

--
-- Name: TenantType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."TenantType" AS ENUM (
    'INDIVIDUAL',
    'CORPORATE'
);


ALTER TYPE public."TenantType" OWNER TO postgres;

--
-- Name: TransferStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."TransferStatus" AS ENUM (
    'HAZIRLANIYOR',
    'YOLDA',
    'TAMAMLANDI',
    'IPTAL'
);


ALTER TYPE public."TransferStatus" OWNER TO postgres;

--
-- Name: UserRole; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."UserRole" AS ENUM (
    'SUPER_ADMIN',
    'TENANT_ADMIN',
    'ADMIN',
    'USER',
    'VIEWER',
    'SUPPORT',
    'MANAGER',
    'TECHNICIAN',
    'WORKSHOP_MANAGER',
    'RECEPTION',
    'SERVICE_MANAGER',
    'PROCUREMENT',
    'WAREHOUSE'
);


ALTER TYPE public."UserRole" OWNER TO postgres;

--
-- Name: UserStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."UserStatus" AS ENUM (
    'ACTIVE',
    'INACTIVE',
    'SUSPENDED',
    'PENDING_VERIFICATION'
);


ALTER TYPE public."UserStatus" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: araclar; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.araclar (
    id text NOT NULL,
    marka text NOT NULL,
    model text NOT NULL,
    "motorHacmi" text NOT NULL,
    "yakitTipi" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.araclar OWNER TO postgres;

--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.audit_logs (
    id text NOT NULL,
    "userId" text,
    "tenantId" text,
    action text NOT NULL,
    resource text,
    "resourceId" text,
    metadata jsonb,
    "ipAddress" text,
    "userAgent" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.audit_logs OWNER TO postgres;

--
-- Name: avans_mahsuplasmalar; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.avans_mahsuplasmalar (
    id text NOT NULL,
    "tenantId" text,
    "avansId" text NOT NULL,
    "planId" text NOT NULL,
    tutar numeric(10,2) NOT NULL,
    tarih timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    aciklama text
);


ALTER TABLE public.avans_mahsuplasmalar OWNER TO postgres;

--
-- Name: avanslar; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.avanslar (
    id text NOT NULL,
    "tenantId" text,
    "personelId" text NOT NULL,
    tutar numeric(10,2) NOT NULL,
    tarih timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    aciklama text,
    "kasaId" text,
    "mahsupEdilen" numeric(10,2) DEFAULT 0 NOT NULL,
    kalan numeric(10,2) NOT NULL,
    durum public."AvansDurum" DEFAULT 'ACIK'::public."AvansDurum" NOT NULL,
    "createdBy" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.avanslar OWNER TO postgres;

--
-- Name: banka_havale_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.banka_havale_logs (
    id text NOT NULL,
    "bankaHavaleId" text NOT NULL,
    "userId" text,
    "actionType" public."LogAction" NOT NULL,
    changes text,
    "ipAddress" text,
    "userAgent" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.banka_havale_logs OWNER TO postgres;

--
-- Name: banka_havaleler; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.banka_havaleler (
    id text NOT NULL,
    "tenantId" text,
    "hareketTipi" public."HavaleTipi" NOT NULL,
    "bankaHesabiId" text,
    "cariId" text NOT NULL,
    tutar numeric(15,2) NOT NULL,
    tarih timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    aciklama text,
    "referansNo" text,
    gonderen text,
    alici text,
    "createdBy" text,
    "updatedBy" text,
    "deletedAt" timestamp(3) without time zone,
    "deletedBy" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "bankaHesapId" text
);


ALTER TABLE public.banka_havaleler OWNER TO postgres;

--
-- Name: banka_hesap_hareketler; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.banka_hesap_hareketler (
    id text NOT NULL,
    "hesapId" text NOT NULL,
    "hareketTipi" public."BankaHareketTipi" NOT NULL,
    "hareketAltTipi" public."BankaHareketAltTipi",
    tutar numeric(15,2) NOT NULL,
    "komisyonOrani" numeric(5,2),
    "komisyonTutar" numeric(15,2),
    "netTutar" numeric(15,2),
    bakiye numeric(15,2) NOT NULL,
    aciklama text,
    "referansNo" text,
    "cariId" text,
    tarih timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.banka_hesap_hareketler OWNER TO postgres;

--
-- Name: banka_hesaplari; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.banka_hesaplari (
    id text NOT NULL,
    "bankaId" text NOT NULL,
    "hesapKodu" text NOT NULL,
    "hesapAdi" text,
    "hesapNo" text,
    iban text,
    "hesapTipi" public."BankaHesapTipi" NOT NULL,
    bakiye numeric(15,2) DEFAULT 0 NOT NULL,
    aktif boolean DEFAULT true NOT NULL,
    "komisyonOrani" numeric(5,2),
    "krediLimiti" numeric(15,2),
    "kullanilanLimit" numeric(15,2),
    "kartLimiti" numeric(15,2),
    "hesapKesimGunu" integer,
    "sonOdemeGunu" integer,
    "terminalNo" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.banka_hesaplari OWNER TO postgres;

--
-- Name: banka_kredi_planlari; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.banka_kredi_planlari (
    id text NOT NULL,
    "krediId" text NOT NULL,
    "taksitNo" integer NOT NULL,
    "vadeTarihi" timestamp(3) without time zone NOT NULL,
    tutar numeric(15,2) NOT NULL,
    odenen numeric(15,2) DEFAULT 0 NOT NULL,
    durum public."KrediPlanDurum" DEFAULT 'BEKLIYOR'::public."KrediPlanDurum" NOT NULL,
    "tenantId" text
);


ALTER TABLE public.banka_kredi_planlari OWNER TO postgres;

--
-- Name: banka_krediler; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.banka_krediler (
    id text NOT NULL,
    "bankaHesapId" text NOT NULL,
    tutar numeric(15,2) NOT NULL,
    "toplamGeriOdeme" numeric(15,2) NOT NULL,
    "toplamFaiz" numeric(15,2) NOT NULL,
    "taksitSayisi" integer NOT NULL,
    "baslangicTarihi" timestamp(3) without time zone NOT NULL,
    aciklama text,
    "krediTuru" public."KrediTuru" DEFAULT 'ESIT_TAKSITLI'::public."KrediTuru" NOT NULL,
    durum public."KrediDurum" DEFAULT 'AKTIF'::public."KrediDurum" NOT NULL,
    "yillikFaizOrani" numeric(5,2),
    "odemeSikligi" integer DEFAULT 1 NOT NULL,
    "tenantId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.banka_krediler OWNER TO postgres;

--
-- Name: bankalar; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bankalar (
    id text NOT NULL,
    "tenantId" text,
    ad text NOT NULL,
    sube text,
    sehir text,
    yetkili text,
    telefon text,
    logo text,
    durum boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.bankalar OWNER TO postgres;

--
-- Name: basit_siparisler; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.basit_siparisler (
    id text NOT NULL,
    "tenantId" text,
    "firmaId" text NOT NULL,
    "urunId" text NOT NULL,
    miktar integer NOT NULL,
    durum public."BasitSiparisDurum" DEFAULT 'ONAY_BEKLIYOR'::public."BasitSiparisDurum" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "tedarikEdilenMiktar" integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.basit_siparisler OWNER TO postgres;

--
-- Name: bordrolar; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bordrolar (
    id text NOT NULL,
    "bordroNo" text NOT NULL,
    tip public."BordroTipi" NOT NULL,
    tarih timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "cariId" text,
    aciklama text,
    "tenantId" text,
    "createdById" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "bankaHesabiId" text
);


ALTER TABLE public.bordrolar OWNER TO postgres;

--
-- Name: cari_adresler; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cari_adresler (
    id text NOT NULL,
    "cariId" text NOT NULL,
    baslik text NOT NULL,
    tip public."AdresTipi" NOT NULL,
    adres text NOT NULL,
    il text,
    ilce text,
    "postaKodu" text,
    varsayilan boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.cari_adresler OWNER TO postgres;

--
-- Name: cari_bankalar; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cari_bankalar (
    id text NOT NULL,
    "cariId" text NOT NULL,
    "bankaAdi" text NOT NULL,
    "subeAdi" text,
    "subeKodu" text,
    "hesapNo" text,
    iban text NOT NULL,
    "paraBirimi" text,
    aciklama text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.cari_bankalar OWNER TO postgres;

--
-- Name: cari_hareketler; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cari_hareketler (
    id text NOT NULL,
    "cariId" text NOT NULL,
    tip public."BorcAlacak" NOT NULL,
    tutar numeric(12,2) NOT NULL,
    bakiye numeric(12,2) NOT NULL,
    "belgeTipi" public."BelgeTipi",
    "belgeNo" text,
    tarih timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    aciklama text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "tenantId" text
);


ALTER TABLE public.cari_hareketler OWNER TO postgres;

--
-- Name: cari_yetkililer; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cari_yetkililer (
    id text NOT NULL,
    "cariId" text NOT NULL,
    "adSoyad" text NOT NULL,
    unvan text,
    telefon text,
    email text,
    dahili text,
    varsayilan boolean DEFAULT false NOT NULL,
    notlar text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.cari_yetkililer OWNER TO postgres;

--
-- Name: cariler; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cariler (
    id text NOT NULL,
    "cariKodu" text NOT NULL,
    "tenantId" text,
    unvan text NOT NULL,
    tip public."CariTip" NOT NULL,
    "sirketTipi" public."SirketTipi" DEFAULT 'KURUMSAL'::public."SirketTipi",
    "vergiNo" text,
    "vergiDairesi" text,
    "tcKimlikNo" text,
    "isimSoyisim" text,
    telefon text,
    email text,
    ulke text DEFAULT 'Türkiye'::text,
    il text,
    ilce text,
    adres text,
    yetkili text,
    bakiye numeric(12,2) DEFAULT 0 NOT NULL,
    "vadeSuresi" integer,
    aktif boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "satisElemaniId" text,
    "riskLimiti" numeric(12,2),
    "riskDurumu" public."RiskDurumu" DEFAULT 'NORMAL'::public."RiskDurumu",
    "teminatTutar" numeric(12,2),
    sektor text,
    "ozelKod1" text,
    "ozelKod2" text,
    "webSite" text,
    faks text,
    "vadeGun" integer,
    "paraBirimi" text,
    "bankaBilgileri" text
);


ALTER TABLE public.cariler OWNER TO postgres;

--
-- Name: cek_senet_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cek_senet_logs (
    id text NOT NULL,
    "cekSenetId" text NOT NULL,
    "userId" text,
    "actionType" public."LogAction" NOT NULL,
    changes text,
    "ipAddress" text,
    "userAgent" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.cek_senet_logs OWNER TO postgres;

--
-- Name: cek_senetler; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cek_senetler (
    id text NOT NULL,
    "tenantId" text,
    tip public."CekSenetTip" NOT NULL,
    "portfoyTip" public."PortfoyTip" NOT NULL,
    "cariId" text NOT NULL,
    tutar numeric(15,2) NOT NULL,
    "kalanTutar" numeric(15,2) DEFAULT 0 NOT NULL,
    vade timestamp(3) without time zone NOT NULL,
    banka text,
    sube text,
    "hesapNo" text,
    "cekNo" text,
    "seriNo" text,
    durum public."CekSenetDurum",
    "tahsilTarihi" timestamp(3) without time zone,
    "tahsilKasaId" text,
    "ciroEdildi" boolean DEFAULT false NOT NULL,
    "ciroTarihi" timestamp(3) without time zone,
    "ciroEdilen" text,
    aciklama text,
    "createdBy" text,
    "updatedBy" text,
    "deletedAt" timestamp(3) without time zone,
    "deletedBy" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "sonBordroId" text
);


ALTER TABLE public.cek_senetler OWNER TO postgres;

--
-- Name: code_templates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.code_templates (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    module public."ModuleType" NOT NULL,
    name text NOT NULL,
    prefix text NOT NULL,
    "digitCount" integer DEFAULT 3 NOT NULL,
    "currentValue" integer DEFAULT 0 NOT NULL,
    "includeYear" boolean DEFAULT false NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.code_templates OWNER TO postgres;

--
-- Name: deleted_banka_havaleler; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.deleted_banka_havaleler (
    id text NOT NULL,
    "originalId" text NOT NULL,
    "hareketTipi" public."HavaleTipi" NOT NULL,
    "bankaHesabiId" text NOT NULL,
    "bankaHesabiAdi" text NOT NULL,
    "cariId" text NOT NULL,
    "cariUnvan" text NOT NULL,
    tutar numeric(15,2) NOT NULL,
    tarih timestamp(3) without time zone NOT NULL,
    aciklama text,
    "referansNo" text,
    gonderen text,
    alici text,
    "originalCreatedBy" text,
    "originalUpdatedBy" text,
    "originalCreatedAt" timestamp(3) without time zone NOT NULL,
    "originalUpdatedAt" timestamp(3) without time zone NOT NULL,
    "deletedBy" text,
    "deletedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "deleteReason" text
);


ALTER TABLE public.deleted_banka_havaleler OWNER TO postgres;

--
-- Name: deleted_cek_senetler; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.deleted_cek_senetler (
    id text NOT NULL,
    "originalId" text NOT NULL,
    tip public."CekSenetTip" NOT NULL,
    "portfoyTip" public."PortfoyTip" NOT NULL,
    "cariId" text NOT NULL,
    "cariUnvan" text NOT NULL,
    tutar numeric(15,2) NOT NULL,
    vade timestamp(3) without time zone NOT NULL,
    banka text,
    sube text,
    "hesapNo" text,
    "cekNo" text,
    "seriNo" text,
    durum public."CekSenetDurum" NOT NULL,
    "tahsilTarihi" timestamp(3) without time zone,
    "tahsilKasaId" text,
    "ciroEdildi" boolean NOT NULL,
    "ciroTarihi" timestamp(3) without time zone,
    "ciroEdilen" text,
    aciklama text,
    "originalCreatedBy" text,
    "originalUpdatedBy" text,
    "originalCreatedAt" timestamp(3) without time zone NOT NULL,
    "originalUpdatedAt" timestamp(3) without time zone NOT NULL,
    "deletedBy" text,
    "deletedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "deleteReason" text
);


ALTER TABLE public.deleted_cek_senetler OWNER TO postgres;

--
-- Name: depolar; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.depolar (
    id text NOT NULL,
    "depoAdi" text NOT NULL,
    adres text,
    yetkili text,
    telefon text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.depolar OWNER TO postgres;

--
-- Name: diagnostic_notes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.diagnostic_notes (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "workOrderId" text NOT NULL,
    note text NOT NULL,
    "createdBy" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    version integer DEFAULT 1 NOT NULL
);


ALTER TABLE public.diagnostic_notes OWNER TO postgres;

--
-- Name: efatura_inbox; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.efatura_inbox (
    id integer NOT NULL,
    ettn text NOT NULL,
    "senderVkn" text NOT NULL,
    "senderTitle" text NOT NULL,
    "invoiceNo" text,
    "invoiceDate" timestamp(3) without time zone,
    "rawXml" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.efatura_inbox OWNER TO postgres;

--
-- Name: efatura_inbox_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.efatura_inbox_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.efatura_inbox_id_seq OWNER TO postgres;

--
-- Name: efatura_inbox_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.efatura_inbox_id_seq OWNED BY public.efatura_inbox.id;


--
-- Name: efatura_xml; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.efatura_xml (
    id text NOT NULL,
    "faturaId" text NOT NULL,
    "xmlData" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.efatura_xml OWNER TO postgres;

--
-- Name: esdeger_gruplar; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.esdeger_gruplar (
    id text NOT NULL,
    "grupAdi" text,
    aciklama text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.esdeger_gruplar OWNER TO postgres;

--
-- Name: fatura_kalemleri; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.fatura_kalemleri (
    id text NOT NULL,
    "faturaId" text NOT NULL,
    "stokId" text NOT NULL,
    miktar integer NOT NULL,
    "birimFiyat" numeric(10,2) NOT NULL,
    "kdvOrani" integer NOT NULL,
    "kdvTutar" numeric(10,2) NOT NULL,
    tutar numeric(10,2) NOT NULL,
    raf text,
    "purchaseOrderItemId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "iskontoOrani" numeric(10,2) DEFAULT 0,
    "iskontoTutari" numeric(10,2) DEFAULT 0
);


ALTER TABLE public.fatura_kalemleri OWNER TO postgres;

--
-- Name: fatura_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.fatura_logs (
    id text NOT NULL,
    "faturaId" text NOT NULL,
    "userId" text,
    "actionType" public."LogAction" NOT NULL,
    changes text,
    "ipAddress" text,
    "userAgent" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.fatura_logs OWNER TO postgres;

--
-- Name: fatura_tahsilatlar; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.fatura_tahsilatlar (
    id text NOT NULL,
    "faturaId" text NOT NULL,
    "tahsilatId" text NOT NULL,
    tutar numeric(12,2) NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "tenantId" text
);


ALTER TABLE public.fatura_tahsilatlar OWNER TO postgres;

--
-- Name: faturalar; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.faturalar (
    id text NOT NULL,
    "faturaNo" text NOT NULL,
    "faturaTipi" public."FaturaTipi" NOT NULL,
    "tenantId" text,
    "cariId" text NOT NULL,
    tarih timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    vade timestamp(3) without time zone,
    iskonto numeric(10,2) DEFAULT 0 NOT NULL,
    "toplamTutar" numeric(12,2) NOT NULL,
    "kdvTutar" numeric(12,2) NOT NULL,
    "genelToplam" numeric(12,2) NOT NULL,
    "dovizToplam" numeric(12,2),
    "dovizCinsi" text DEFAULT 'TRY'::text NOT NULL,
    "dovizKuru" numeric(10,4) DEFAULT 1 NOT NULL,
    aciklama text,
    durum public."FaturaDurum" DEFAULT 'ACIK'::public."FaturaDurum" NOT NULL,
    "odenecekTutar" numeric(12,2),
    "odenenTutar" numeric(12,2) DEFAULT 0 NOT NULL,
    "siparisNo" text,
    "purchaseOrderId" text,
    "satinAlmaSiparisiId" text,
    "deliveryNoteId" text,
    "satinAlmaIrsaliyeId" text,
    "efaturaStatus" public."EFaturaStatus" DEFAULT 'PENDING'::public."EFaturaStatus",
    "efaturaEttn" text,
    "createdBy" text,
    "updatedBy" text,
    "deletedAt" timestamp(3) without time zone,
    "deletedBy" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "satisElemaniId" text
);


ALTER TABLE public.faturalar OWNER TO postgres;

--
-- Name: firma_kredi_karti_hareketler; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.firma_kredi_karti_hareketler (
    id text NOT NULL,
    "kartId" text NOT NULL,
    tutar numeric(15,2) NOT NULL,
    bakiye numeric(15,2) NOT NULL,
    aciklama text,
    "cariId" text,
    "referansNo" text,
    tarih timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.firma_kredi_karti_hareketler OWNER TO postgres;

--
-- Name: firma_kredi_karti_hatirlaticilar; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.firma_kredi_karti_hatirlaticilar (
    id text NOT NULL,
    "kartId" text NOT NULL,
    tip text NOT NULL,
    gun integer NOT NULL,
    aktif boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.firma_kredi_karti_hatirlaticilar OWNER TO postgres;

--
-- Name: firma_kredi_kartlari; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.firma_kredi_kartlari (
    id text NOT NULL,
    "kasaId" text NOT NULL,
    "kartKodu" text NOT NULL,
    "kartAdi" text NOT NULL,
    "bankaAdi" text NOT NULL,
    "kartTipi" text,
    "sonDortHane" text,
    "limit" numeric(15,2),
    bakiye numeric(15,2) DEFAULT 0 NOT NULL,
    aktif boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "hesapKesimTarihi" timestamp(3) without time zone,
    "sonOdemeTarihi" timestamp(3) without time zone
);


ALTER TABLE public.firma_kredi_kartlari OWNER TO postgres;

--
-- Name: hizli_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.hizli_tokens (
    id integer NOT NULL,
    token text NOT NULL,
    "loginHash" text NOT NULL,
    "generatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.hizli_tokens OWNER TO postgres;

--
-- Name: hizli_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.hizli_tokens_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.hizli_tokens_id_seq OWNER TO postgres;

--
-- Name: hizli_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.hizli_tokens_id_seq OWNED BY public.hizli_tokens.id;


--
-- Name: invitations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.invitations (
    id text NOT NULL,
    email text NOT NULL,
    "tenantId" text NOT NULL,
    "invitedBy" text NOT NULL,
    token text NOT NULL,
    status public."InvitationStatus" DEFAULT 'PENDING'::public."InvitationStatus" NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "acceptedAt" timestamp(3) without time zone,
    "acceptedBy" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.invitations OWNER TO postgres;

--
-- Name: invoice_profit; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.invoice_profit (
    id text NOT NULL,
    "faturaId" text NOT NULL,
    "faturaKalemiId" text,
    "stokId" text NOT NULL,
    "tenantId" text,
    miktar integer NOT NULL,
    "birimFiyat" numeric(10,2) NOT NULL,
    "birimMaliyet" numeric(12,4) NOT NULL,
    "toplamSatisTutari" numeric(12,2) NOT NULL,
    "toplamMaliyet" numeric(12,2) NOT NULL,
    kar numeric(12,2) NOT NULL,
    "karOrani" numeric(10,2) NOT NULL,
    "hesaplamaTarihi" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.invoice_profit OWNER TO postgres;

--
-- Name: kasa_hareketler; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.kasa_hareketler (
    id text NOT NULL,
    "kasaId" text NOT NULL,
    "hareketTipi" public."KasaHareketTipi" NOT NULL,
    tutar numeric(15,2) NOT NULL,
    "komisyonTutari" numeric(15,2),
    "bsmvTutari" numeric(15,2),
    "netTutar" numeric(15,2),
    bakiye numeric(15,2) NOT NULL,
    "belgeTipi" text,
    "belgeNo" text,
    "cariId" text,
    aciklama text,
    tarih timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "transferEdildi" boolean DEFAULT false NOT NULL,
    "transferTarihi" timestamp(3) without time zone,
    "createdBy" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.kasa_hareketler OWNER TO postgres;

--
-- Name: kasalar; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.kasalar (
    id text NOT NULL,
    "kasaKodu" text NOT NULL,
    "tenantId" text,
    "kasaAdi" text NOT NULL,
    "kasaTipi" public."KasaTipi" NOT NULL,
    bakiye numeric(15,2) DEFAULT 0 NOT NULL,
    aktif boolean DEFAULT true NOT NULL,
    "createdBy" text,
    "updatedBy" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.kasalar OWNER TO postgres;

--
-- Name: locations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.locations (
    id text NOT NULL,
    "warehouseId" text NOT NULL,
    layer integer NOT NULL,
    corridor text NOT NULL,
    side integer NOT NULL,
    section integer NOT NULL,
    level integer NOT NULL,
    code text NOT NULL,
    barcode text NOT NULL,
    name text,
    active boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.locations OWNER TO postgres;

--
-- Name: maas_odeme_detaylari; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.maas_odeme_detaylari (
    id text NOT NULL,
    "tenantId" text,
    "odemeId" text NOT NULL,
    "odemeTipi" public."OdemeTipi" NOT NULL,
    tutar numeric(10,2) NOT NULL,
    "kasaId" text,
    "bankaHesapId" text,
    "referansNo" text,
    aciklama text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.maas_odeme_detaylari OWNER TO postgres;

--
-- Name: maas_odemeler; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.maas_odemeler (
    id text NOT NULL,
    "tenantId" text,
    "planId" text NOT NULL,
    "personelId" text NOT NULL,
    tutar numeric(10,2) NOT NULL,
    tarih timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    aciklama text,
    "createdBy" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.maas_odemeler OWNER TO postgres;

--
-- Name: maas_planlari; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.maas_planlari (
    id text NOT NULL,
    "tenantId" text,
    "personelId" text NOT NULL,
    yil integer NOT NULL,
    ay integer NOT NULL,
    maas numeric(10,2) NOT NULL,
    prim numeric(10,2) DEFAULT 0 NOT NULL,
    toplam numeric(10,2) NOT NULL,
    durum public."MaasDurum" DEFAULT 'ODENMEDI'::public."MaasDurum" NOT NULL,
    "odenenTutar" numeric(10,2) DEFAULT 0 NOT NULL,
    "kalanTutar" numeric(10,2) NOT NULL,
    aktif boolean DEFAULT true NOT NULL,
    aciklama text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.maas_planlari OWNER TO postgres;

--
-- Name: manager_approvals; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.manager_approvals (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "workOrderId" text NOT NULL,
    "solutionPackageId" text NOT NULL,
    "approvedBy" text NOT NULL,
    "approvedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "approvalNote" text,
    "deletedAt" timestamp(3) without time zone
);


ALTER TABLE public.manager_approvals OWNER TO postgres;

--
-- Name: manager_rejections; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.manager_rejections (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "workOrderId" text NOT NULL,
    "solutionPackageId" text NOT NULL,
    "rejectedBy" text NOT NULL,
    "rejectedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "rejectionReason" text NOT NULL
);


ALTER TABLE public.manager_rejections OWNER TO postgres;

--
-- Name: masraf_kategoriler; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.masraf_kategoriler (
    id text NOT NULL,
    "kategoriAdi" text NOT NULL,
    aciklama text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.masraf_kategoriler OWNER TO postgres;

--
-- Name: masraflar; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.masraflar (
    id text NOT NULL,
    "tenantId" text,
    "kategoriId" text NOT NULL,
    aciklama text,
    tutar numeric(10,2) NOT NULL,
    tarih timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "odemeTipi" public."OdemeTipi" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.masraflar OWNER TO postgres;

--
-- Name: module_licenses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.module_licenses (
    id text NOT NULL,
    "subscriptionId" text NOT NULL,
    "moduleId" text NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.module_licenses OWNER TO postgres;

--
-- Name: modules; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.modules (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    price numeric(10,2) NOT NULL,
    currency text DEFAULT 'TRY'::text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.modules OWNER TO postgres;

--
-- Name: payments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payments (
    id text NOT NULL,
    "subscriptionId" text NOT NULL,
    amount numeric(10,2) NOT NULL,
    currency text DEFAULT 'TRY'::text NOT NULL,
    status public."PaymentStatus" DEFAULT 'PENDING'::public."PaymentStatus" NOT NULL,
    "iyzicoPaymentId" text,
    "iyzicoToken" text,
    "conversationId" text,
    "invoiceNumber" text,
    "invoiceUrl" text,
    "paidAt" timestamp(3) without time zone,
    "failedAt" timestamp(3) without time zone,
    "refundedAt" timestamp(3) without time zone,
    "errorCode" text,
    "errorMessage" text,
    "paymentMethod" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.payments OWNER TO postgres;

--
-- Name: permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.permissions (
    id text NOT NULL,
    module text NOT NULL,
    action text NOT NULL,
    description text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.permissions OWNER TO postgres;

--
-- Name: personel_odemeler; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.personel_odemeler (
    id text NOT NULL,
    "personelId" text NOT NULL,
    tip public."PersonelOdemeTip" NOT NULL,
    tutar numeric(10,2) NOT NULL,
    tarih timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    donem text,
    aciklama text,
    "kasaId" text,
    "createdBy" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.personel_odemeler OWNER TO postgres;

--
-- Name: personeller; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.personeller (
    id text NOT NULL,
    "personelKodu" text NOT NULL,
    "tenantId" text,
    "tcKimlikNo" text,
    ad text NOT NULL,
    soyad text NOT NULL,
    "dogumTarihi" timestamp(3) without time zone,
    cinsiyet public."Cinsiyet",
    "medeniDurum" public."MedeniDurum",
    telefon text,
    email text,
    adres text,
    il text,
    ilce text,
    pozisyon text,
    departman text,
    "iseBaslamaTarihi" timestamp(3) without time zone,
    "istenCikisTarihi" timestamp(3) without time zone,
    aktif boolean DEFAULT true NOT NULL,
    maas numeric(10,2),
    "maasGunu" integer,
    "sgkNo" text,
    "ibanNo" text,
    bakiye numeric(10,2) DEFAULT 0 NOT NULL,
    aciklama text,
    "createdBy" text,
    "updatedBy" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    prim numeric(10,2)
);


ALTER TABLE public.personeller OWNER TO postgres;

--
-- Name: plans; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.plans (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    price numeric(10,2) NOT NULL,
    currency text DEFAULT 'TRY'::text NOT NULL,
    "billingPeriod" public."BillingPeriod" DEFAULT 'MONTHLY'::public."BillingPeriod" NOT NULL,
    "trialDays" integer DEFAULT 0 NOT NULL,
    "baseUserLimit" integer DEFAULT 1 NOT NULL,
    features jsonb,
    limits jsonb,
    "isActive" boolean DEFAULT true NOT NULL,
    "isPopular" boolean DEFAULT false NOT NULL,
    "isBasePlan" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.plans OWNER TO postgres;

--
-- Name: postal_codes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.postal_codes (
    id text NOT NULL,
    city text NOT NULL,
    district text NOT NULL,
    neighborhood text NOT NULL,
    "postalCode" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.postal_codes OWNER TO postgres;

--
-- Name: price_cards; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.price_cards (
    id text NOT NULL,
    stok_id text NOT NULL,
    type public."PriceCardType" NOT NULL,
    price numeric(12,2) NOT NULL,
    currency text DEFAULT 'TRY'::text NOT NULL,
    effective_from timestamp(3) without time zone,
    effective_to timestamp(3) without time zone,
    note text,
    created_by text,
    updated_by text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.price_cards OWNER TO postgres;

--
-- Name: price_quotes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.price_quotes (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "workOrderId" text NOT NULL,
    "quotedBy" text NOT NULL,
    "sentAt" timestamp(3) without time zone,
    "viewedAt" timestamp(3) without time zone,
    "approvedAt" timestamp(3) without time zone,
    "rejectedAt" timestamp(3) without time zone,
    "laborCost" numeric(12,2) NOT NULL,
    "partsCost" numeric(12,2) NOT NULL,
    "taxAmount" numeric(12,2) NOT NULL,
    "totalCost" numeric(12,2) NOT NULL,
    "discountAmount" numeric(12,2) DEFAULT 0 NOT NULL,
    "customerResponse" text,
    "customerNotes" text,
    "itemsBreakdown" jsonb NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.price_quotes OWNER TO postgres;

--
-- Name: product_barcodes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_barcodes (
    id text NOT NULL,
    "productId" text NOT NULL,
    barcode text NOT NULL,
    symbology text NOT NULL,
    "isPrimary" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.product_barcodes OWNER TO postgres;

--
-- Name: product_location_stocks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_location_stocks (
    id text NOT NULL,
    "warehouseId" text NOT NULL,
    "locationId" text NOT NULL,
    "productId" text NOT NULL,
    "qtyOnHand" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.product_location_stocks OWNER TO postgres;

--
-- Name: purchase_order_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.purchase_order_items (
    id text NOT NULL,
    purchase_order_id text NOT NULL,
    product_id text NOT NULL,
    ordered_quantity integer NOT NULL,
    received_quantity integer DEFAULT 0 NOT NULL,
    unit_price numeric(10,2) NOT NULL,
    status public."OrderItemStatus" DEFAULT 'PENDING'::public."OrderItemStatus" NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.purchase_order_items OWNER TO postgres;

--
-- Name: purchase_orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.purchase_orders (
    id text NOT NULL,
    "orderNumber" text NOT NULL,
    "tenantId" text,
    supplier_id text NOT NULL,
    order_date timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    expected_delivery_date timestamp(3) without time zone,
    status public."OrderStatus" DEFAULT 'PENDING'::public."OrderStatus" NOT NULL,
    total_amount numeric(12,2) NOT NULL,
    notes text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.purchase_orders OWNER TO postgres;

--
-- Name: raflar; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.raflar (
    id text NOT NULL,
    "depoId" text NOT NULL,
    "rafKodu" text NOT NULL,
    aciklama text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.raflar OWNER TO postgres;

--
-- Name: role_permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.role_permissions (
    id text NOT NULL,
    "roleId" text NOT NULL,
    "permissionId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.role_permissions OWNER TO postgres;

--
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    "isSystemRole" boolean DEFAULT false NOT NULL,
    "tenantId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- Name: satin_alma_irsaliyeleri; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.satin_alma_irsaliyeleri (
    id text NOT NULL,
    "irsaliyeNo" text NOT NULL,
    "irsaliyeTarihi" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "tenantId" text,
    "cariId" text NOT NULL,
    "depoId" text,
    "kaynakTip" public."IrsaliyeKaynakTip" NOT NULL,
    "kaynakId" text,
    durum public."IrsaliyeDurum" DEFAULT 'FATURALANMADI'::public."IrsaliyeDurum" NOT NULL,
    "toplamTutar" numeric(12,2) NOT NULL,
    "kdvTutar" numeric(12,2) NOT NULL,
    "genelToplam" numeric(12,2) NOT NULL,
    iskonto numeric(10,2) DEFAULT 0 NOT NULL,
    aciklama text,
    "createdBy" text,
    "updatedBy" text,
    "deletedAt" timestamp(3) without time zone,
    "deletedBy" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.satin_alma_irsaliyeleri OWNER TO postgres;

--
-- Name: satin_alma_irsaliyesi_kalemleri; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.satin_alma_irsaliyesi_kalemleri (
    id text NOT NULL,
    "irsaliyeId" text NOT NULL,
    "stokId" text NOT NULL,
    miktar integer NOT NULL,
    "birimFiyat" numeric(10,2) NOT NULL,
    "kdvOrani" integer NOT NULL,
    "kdvTutar" numeric(10,2) NOT NULL,
    tutar numeric(10,2) NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.satin_alma_irsaliyesi_kalemleri OWNER TO postgres;

--
-- Name: satin_alma_irsaliyesi_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.satin_alma_irsaliyesi_logs (
    id text NOT NULL,
    "irsaliyeId" text NOT NULL,
    "userId" text,
    "actionType" public."LogAction" NOT NULL,
    changes text,
    "ipAddress" text,
    "userAgent" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.satin_alma_irsaliyesi_logs OWNER TO postgres;

--
-- Name: satin_alma_siparis_kalemleri; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.satin_alma_siparis_kalemleri (
    id text NOT NULL,
    "satınAlmaSiparisId" text NOT NULL,
    "stokId" text NOT NULL,
    miktar integer NOT NULL,
    "sevkEdilenMiktar" integer DEFAULT 0 NOT NULL,
    "birimFiyat" numeric(10,2) NOT NULL,
    "kdvOrani" integer NOT NULL,
    "kdvTutar" numeric(10,2) NOT NULL,
    tutar numeric(10,2) NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.satin_alma_siparis_kalemleri OWNER TO postgres;

--
-- Name: satin_alma_siparis_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.satin_alma_siparis_logs (
    id text NOT NULL,
    "satınAlmaSiparisId" text NOT NULL,
    "userId" text,
    "actionType" public."LogAction" NOT NULL,
    changes text,
    "ipAddress" text,
    "userAgent" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.satin_alma_siparis_logs OWNER TO postgres;

--
-- Name: satin_alma_siparisleri; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.satin_alma_siparisleri (
    id text NOT NULL,
    "siparisNo" text NOT NULL,
    "tenantId" text,
    "cariId" text NOT NULL,
    tarih timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    vade timestamp(3) without time zone,
    iskonto numeric(10,2) DEFAULT 0 NOT NULL,
    "toplamTutar" numeric(12,2) NOT NULL,
    "kdvTutar" numeric(12,2) NOT NULL,
    "genelToplam" numeric(12,2) NOT NULL,
    aciklama text,
    durum public."SatınAlmaSiparisDurum" DEFAULT 'BEKLEMEDE'::public."SatınAlmaSiparisDurum" NOT NULL,
    "faturaNo" text,
    "createdBy" text,
    "updatedBy" text,
    "deletedAt" timestamp(3) without time zone,
    "deletedBy" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deliveryNoteId" text
);


ALTER TABLE public.satin_alma_siparisleri OWNER TO postgres;

--
-- Name: satis_elemanlari; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.satis_elemanlari (
    id text NOT NULL,
    "adSoyad" text NOT NULL,
    telefon text,
    email text,
    aktif boolean DEFAULT true NOT NULL,
    "tenantId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.satis_elemanlari OWNER TO postgres;

--
-- Name: satis_irsaliyeleri; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.satis_irsaliyeleri (
    id text NOT NULL,
    "irsaliyeNo" text NOT NULL,
    "irsaliyeTarihi" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "tenantId" text,
    "cariId" text NOT NULL,
    "depoId" text,
    "kaynakTip" public."IrsaliyeKaynakTip" NOT NULL,
    "kaynakId" text,
    durum public."IrsaliyeDurum" DEFAULT 'FATURALANMADI'::public."IrsaliyeDurum" NOT NULL,
    "toplamTutar" numeric(12,2) NOT NULL,
    "kdvTutar" numeric(12,2) NOT NULL,
    "genelToplam" numeric(12,2) NOT NULL,
    iskonto numeric(10,2) DEFAULT 0 NOT NULL,
    aciklama text,
    "createdBy" text,
    "updatedBy" text,
    "deletedAt" timestamp(3) without time zone,
    "deletedBy" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.satis_irsaliyeleri OWNER TO postgres;

--
-- Name: satis_irsaliyesi_kalemleri; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.satis_irsaliyesi_kalemleri (
    id text NOT NULL,
    "irsaliyeId" text NOT NULL,
    "stokId" text NOT NULL,
    miktar integer NOT NULL,
    "birimFiyat" numeric(10,2) NOT NULL,
    "kdvOrani" integer NOT NULL,
    "kdvTutar" numeric(10,2) NOT NULL,
    tutar numeric(10,2) NOT NULL,
    "faturalananMiktar" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.satis_irsaliyesi_kalemleri OWNER TO postgres;

--
-- Name: satis_irsaliyesi_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.satis_irsaliyesi_logs (
    id text NOT NULL,
    "irsaliyeId" text NOT NULL,
    "userId" text,
    "actionType" public."LogAction" NOT NULL,
    changes text,
    "ipAddress" text,
    "userAgent" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.satis_irsaliyesi_logs OWNER TO postgres;

--
-- Name: sayim_kalemleri; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sayim_kalemleri (
    id text NOT NULL,
    "sayimId" text NOT NULL,
    "stokId" text NOT NULL,
    "locationId" text,
    "sistemMiktari" integer NOT NULL,
    "sayilanMiktar" integer NOT NULL,
    "farkMiktari" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.sayim_kalemleri OWNER TO postgres;

--
-- Name: sayimlar; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sayimlar (
    id text NOT NULL,
    "sayimNo" text NOT NULL,
    "tenantId" text,
    "sayimTipi" public."SayimTipi" NOT NULL,
    tarih timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    durum public."SayimDurum" DEFAULT 'TASLAK'::public."SayimDurum" NOT NULL,
    aciklama text,
    "createdBy" text,
    "updatedBy" text,
    "onaylayanId" text,
    "onayTarihi" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.sayimlar OWNER TO postgres;

--
-- Name: sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sessions (
    id text NOT NULL,
    "userId" text NOT NULL,
    token text NOT NULL,
    "refreshToken" text,
    "ipAddress" text,
    "userAgent" text,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.sessions OWNER TO postgres;

--
-- Name: siparis_hazirliklar; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.siparis_hazirliklar (
    id text NOT NULL,
    "siparisId" text NOT NULL,
    "siparisKalemiId" text NOT NULL,
    "locationId" text NOT NULL,
    miktar integer NOT NULL,
    hazirlayan text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.siparis_hazirliklar OWNER TO postgres;

--
-- Name: siparis_kalemleri; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.siparis_kalemleri (
    id text NOT NULL,
    "siparisId" text NOT NULL,
    "stokId" text NOT NULL,
    miktar integer NOT NULL,
    "sevkEdilenMiktar" integer DEFAULT 0 NOT NULL,
    "birimFiyat" numeric(10,2) NOT NULL,
    "kdvOrani" integer NOT NULL,
    "kdvTutar" numeric(10,2) NOT NULL,
    tutar numeric(10,2) NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.siparis_kalemleri OWNER TO postgres;

--
-- Name: siparis_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.siparis_logs (
    id text NOT NULL,
    "siparisId" text NOT NULL,
    "userId" text,
    "actionType" public."LogAction" NOT NULL,
    changes text,
    "ipAddress" text,
    "userAgent" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.siparis_logs OWNER TO postgres;

--
-- Name: siparisler; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.siparisler (
    id text NOT NULL,
    "siparisNo" text NOT NULL,
    "tenantId" text,
    "siparisTipi" public."SiparisTipi" NOT NULL,
    "cariId" text NOT NULL,
    tarih timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    vade timestamp(3) without time zone,
    iskonto numeric(10,2) DEFAULT 0 NOT NULL,
    "toplamTutar" numeric(12,2) NOT NULL,
    "kdvTutar" numeric(12,2) NOT NULL,
    "genelToplam" numeric(12,2) NOT NULL,
    aciklama text,
    durum public."SiparisDurum" DEFAULT 'BEKLEMEDE'::public."SiparisDurum" NOT NULL,
    "faturaNo" text,
    "deliveryNoteId" text,
    "createdBy" text,
    "updatedBy" text,
    "deletedAt" timestamp(3) without time zone,
    "deletedBy" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.siparisler OWNER TO postgres;

--
-- Name: solution_package_parts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.solution_package_parts (
    id text NOT NULL,
    "solutionPackageId" text NOT NULL,
    "productId" text NOT NULL,
    quantity numeric(10,3) NOT NULL
);


ALTER TABLE public.solution_package_parts OWNER TO postgres;

--
-- Name: solution_packages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.solution_packages (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "workOrderId" text NOT NULL,
    name character varying(200) NOT NULL,
    description text NOT NULL,
    "estimatedDurationMinutes" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    version integer DEFAULT 1 NOT NULL
);


ALTER TABLE public.solution_packages OWNER TO postgres;

--
-- Name: stock_cost_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stock_cost_history (
    id text NOT NULL,
    stok_id text NOT NULL,
    cost numeric(12,4) NOT NULL,
    method text DEFAULT 'WEIGHTED_AVERAGE'::text NOT NULL,
    computed_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    marka text,
    "anaKategori" text,
    "altKategori" text,
    note text
);


ALTER TABLE public.stock_cost_history OWNER TO postgres;

--
-- Name: stock_moves; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stock_moves (
    id text NOT NULL,
    "productId" text NOT NULL,
    "fromWarehouseId" text,
    "fromLocationId" text,
    "toWarehouseId" text NOT NULL,
    "toLocationId" text NOT NULL,
    qty integer NOT NULL,
    "moveType" public."StockMoveType" NOT NULL,
    "refType" text,
    "refId" text,
    note text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdBy" text
);


ALTER TABLE public.stock_moves OWNER TO postgres;

--
-- Name: stok_esdegers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stok_esdegers (
    id text NOT NULL,
    "stok1Id" text NOT NULL,
    "stok2Id" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.stok_esdegers OWNER TO postgres;

--
-- Name: stok_hareketleri; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stok_hareketleri (
    id text NOT NULL,
    "stokId" text NOT NULL,
    "hareketTipi" public."HareketTipi" NOT NULL,
    miktar integer NOT NULL,
    "birimFiyat" numeric(10,2) NOT NULL,
    aciklama text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "warehouseId" text,
    "tenantId" text
);


ALTER TABLE public.stok_hareketleri OWNER TO postgres;

--
-- Name: stoklar; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stoklar (
    id text NOT NULL,
    "stokKodu" text NOT NULL,
    "tenantId" text,
    "stokAdi" text NOT NULL,
    aciklama text,
    birim text NOT NULL,
    "alisFiyati" numeric(10,2) NOT NULL,
    "satisFiyati" numeric(10,2) NOT NULL,
    "kdvOrani" integer DEFAULT 20 NOT NULL,
    "kritikStokMiktari" integer DEFAULT 0 NOT NULL,
    kategori text,
    "anaKategori" text,
    "altKategori" text,
    marka text,
    model text,
    oem text,
    olcu text,
    raf text,
    barkod text,
    "tedarikciKodu" text,
    "esdegerGrupId" text,
    "aracMarka" text,
    "aracModel" text,
    "aracMotorHacmi" text,
    "aracYakitTipi" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.stoklar OWNER TO postgres;

--
-- Name: subscriptions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subscriptions (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "planId" text NOT NULL,
    status public."SubscriptionStatus" DEFAULT 'TRIAL'::public."SubscriptionStatus" NOT NULL,
    "startDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "endDate" timestamp(3) without time zone NOT NULL,
    "trialEndsAt" timestamp(3) without time zone,
    "canceledAt" timestamp(3) without time zone,
    "nextBillingDate" timestamp(3) without time zone,
    "lastBillingDate" timestamp(3) without time zone,
    "autoRenew" boolean DEFAULT true NOT NULL,
    "iyzicoSubscriptionRef" text,
    "additionalUsers" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.subscriptions OWNER TO postgres;

--
-- Name: system_parameters; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.system_parameters (
    id text NOT NULL,
    "tenantId" text,
    key text NOT NULL,
    value jsonb NOT NULL,
    description text,
    category text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.system_parameters OWNER TO postgres;

--
-- Name: tahsilatlar; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tahsilatlar (
    id text NOT NULL,
    "tenantId" text,
    "cariId" text NOT NULL,
    "faturaId" text,
    tip public."TahsilatTip" NOT NULL,
    tutar numeric(12,2) NOT NULL,
    tarih timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "odemeTipi" public."OdemeTipi" NOT NULL,
    "kasaId" text,
    "bankaHesapId" text,
    "firmaKrediKartiId" text,
    aciklama text,
    "createdBy" text,
    "deletedAt" timestamp(3) without time zone,
    "deletedBy" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "satisElemaniId" text,
    "workOrderId" text
);


ALTER TABLE public.tahsilatlar OWNER TO postgres;

--
-- Name: technical_findings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.technical_findings (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "workOrderId" text NOT NULL,
    title character varying(200) NOT NULL,
    description text NOT NULL,
    "createdBy" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    version integer DEFAULT 1 NOT NULL
);


ALTER TABLE public.technical_findings OWNER TO postgres;

--
-- Name: teklif_kalemleri; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.teklif_kalemleri (
    id text NOT NULL,
    "teklifId" text NOT NULL,
    "stokId" text NOT NULL,
    miktar integer NOT NULL,
    "birimFiyat" numeric(10,2) NOT NULL,
    "kdvOrani" integer NOT NULL,
    "kdvTutar" numeric(10,2) NOT NULL,
    tutar numeric(10,2) NOT NULL,
    "iskontoOran" numeric(5,2),
    "iskontoTutar" numeric(10,2),
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.teklif_kalemleri OWNER TO postgres;

--
-- Name: teklif_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.teklif_logs (
    id text NOT NULL,
    "teklifId" text NOT NULL,
    "userId" text,
    "actionType" public."LogAction" NOT NULL,
    changes text,
    "ipAddress" text,
    "userAgent" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.teklif_logs OWNER TO postgres;

--
-- Name: teklifler; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.teklifler (
    id text NOT NULL,
    "teklifNo" text NOT NULL,
    "tenantId" text,
    "teklifTipi" public."TeklifTipi" NOT NULL,
    "cariId" text NOT NULL,
    tarih timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "gecerlilikTarihi" timestamp(3) without time zone,
    iskonto numeric(10,2) DEFAULT 0 NOT NULL,
    "toplamTutar" numeric(12,2) NOT NULL,
    "kdvTutar" numeric(12,2) NOT NULL,
    "genelToplam" numeric(12,2) NOT NULL,
    aciklama text,
    durum public."TeklifDurum" DEFAULT 'TEKLIF'::public."TeklifDurum" NOT NULL,
    "siparisId" text,
    "createdBy" text,
    "updatedBy" text,
    "deletedAt" timestamp(3) without time zone,
    "deletedBy" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.teklifler OWNER TO postgres;

--
-- Name: tenant_purge_audits; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tenant_purge_audits (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "adminId" text NOT NULL,
    "adminEmail" text NOT NULL,
    "ipAddress" text NOT NULL,
    "deletedFiles" integer DEFAULT 0 NOT NULL,
    errors jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.tenant_purge_audits OWNER TO postgres;

--
-- Name: tenant_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tenant_settings (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "companyName" text,
    "taxNumber" text,
    address text,
    "logoUrl" text,
    features jsonb,
    limits jsonb,
    timezone text DEFAULT 'Europe/Istanbul'::text NOT NULL,
    locale text DEFAULT 'tr-TR'::text NOT NULL,
    currency text DEFAULT 'TRY'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    city text,
    "companyType" text DEFAULT 'COMPANY'::text,
    country text,
    district text,
    email text,
    "firstName" text,
    "lastName" text,
    "mersisNo" text,
    neighborhood text,
    phone text,
    "postalCode" text,
    "taxOffice" text,
    "tcNo" text,
    website text
);


ALTER TABLE public.tenant_settings OWNER TO postgres;

--
-- Name: tenants; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tenants (
    id text NOT NULL,
    uuid text NOT NULL,
    name text NOT NULL,
    subdomain text,
    domain text,
    status public."TenantStatus" DEFAULT 'TRIAL'::public."TenantStatus" NOT NULL,
    "cancelledAt" timestamp(3) without time zone,
    "purgedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "tenantType" public."TenantType" DEFAULT 'CORPORATE'::public."TenantType" NOT NULL
);


ALTER TABLE public.tenants OWNER TO postgres;

--
-- Name: urun_raflar; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.urun_raflar (
    id text NOT NULL,
    "stokId" text NOT NULL,
    "rafId" text NOT NULL,
    miktar integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.urun_raflar OWNER TO postgres;

--
-- Name: user_licenses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_licenses (
    id text NOT NULL,
    "userId" text NOT NULL,
    "licenseType" public."LicenseType" NOT NULL,
    "moduleId" text,
    "assignedBy" text,
    "assignedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "revokedAt" timestamp(3) without time zone,
    "revokedBy" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.user_licenses OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id text NOT NULL,
    uuid text NOT NULL,
    email text NOT NULL,
    username text NOT NULL,
    password text NOT NULL,
    "firstName" text,
    "lastName" text,
    "fullName" text NOT NULL,
    phone text,
    "avatarUrl" text,
    role public."UserRole" DEFAULT 'USER'::public."UserRole" NOT NULL,
    status public."UserStatus" DEFAULT 'ACTIVE'::public."UserStatus" NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "refreshToken" text,
    "tokenVersion" integer DEFAULT 0 NOT NULL,
    "tenantId" text,
    "emailVerified" boolean DEFAULT false NOT NULL,
    "lastLoginAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "roleId" text
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: warehouse_critical_stocks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.warehouse_critical_stocks (
    id text NOT NULL,
    "warehouseId" text NOT NULL,
    "productId" text NOT NULL,
    "criticalQty" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.warehouse_critical_stocks OWNER TO postgres;

--
-- Name: warehouse_transfer_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.warehouse_transfer_items (
    id text NOT NULL,
    "transferId" text NOT NULL,
    "stokId" text NOT NULL,
    miktar integer NOT NULL,
    "fromLocationId" text,
    "toLocationId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.warehouse_transfer_items OWNER TO postgres;

--
-- Name: warehouse_transfer_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.warehouse_transfer_logs (
    id text NOT NULL,
    "transferId" text NOT NULL,
    "userId" text,
    "actionType" public."LogAction" NOT NULL,
    changes text,
    "ipAddress" text,
    "userAgent" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.warehouse_transfer_logs OWNER TO postgres;

--
-- Name: warehouse_transfers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.warehouse_transfers (
    id text NOT NULL,
    "transferNo" text NOT NULL,
    "tenantId" text,
    tarih timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "fromWarehouseId" text NOT NULL,
    "toWarehouseId" text NOT NULL,
    durum public."TransferStatus" DEFAULT 'HAZIRLANIYOR'::public."TransferStatus" NOT NULL,
    "driverName" text,
    "vehiclePlate" text,
    aciklama text,
    "hazirlayanUserId" text,
    "onaylayanUserId" text,
    "teslimAlanUserId" text,
    "sevkTarihi" timestamp(3) without time zone,
    "teslimTarihi" timestamp(3) without time zone,
    "createdBy" text,
    "updatedBy" text,
    "deletedAt" timestamp(3) without time zone,
    "deletedBy" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.warehouse_transfers OWNER TO postgres;

--
-- Name: warehouses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.warehouses (
    id text NOT NULL,
    code text NOT NULL,
    "tenantId" text,
    name text NOT NULL,
    active boolean DEFAULT true NOT NULL,
    address text,
    phone text,
    manager text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "isDefault" boolean DEFAULT false NOT NULL
);


ALTER TABLE public.warehouses OWNER TO postgres;

--
-- Name: efatura_inbox id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.efatura_inbox ALTER COLUMN id SET DEFAULT nextval('public.efatura_inbox_id_seq'::regclass);


--
-- Name: hizli_tokens id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hizli_tokens ALTER COLUMN id SET DEFAULT nextval('public.hizli_tokens_id_seq'::regclass);


--
-- Data for Name: araclar; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.araclar (id, marka, model, "motorHacmi", "yakitTipi", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.audit_logs (id, "userId", "tenantId", action, resource, "resourceId", metadata, "ipAddress", "userAgent", "createdAt") FROM stdin;
\.


--
-- Data for Name: avans_mahsuplasmalar; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.avans_mahsuplasmalar (id, "tenantId", "avansId", "planId", tutar, tarih, aciklama) FROM stdin;
\.


--
-- Data for Name: avanslar; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.avanslar (id, "tenantId", "personelId", tutar, tarih, aciklama, "kasaId", "mahsupEdilen", kalan, durum, "createdBy", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: banka_havale_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.banka_havale_logs (id, "bankaHavaleId", "userId", "actionType", changes, "ipAddress", "userAgent", "createdAt") FROM stdin;
\.


--
-- Data for Name: banka_havaleler; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.banka_havaleler (id, "tenantId", "hareketTipi", "bankaHesabiId", "cariId", tutar, tarih, aciklama, "referansNo", gonderen, alici, "createdBy", "updatedBy", "deletedAt", "deletedBy", "createdAt", "updatedAt", "bankaHesapId") FROM stdin;
\.


--
-- Data for Name: banka_hesap_hareketler; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.banka_hesap_hareketler (id, "hesapId", "hareketTipi", "hareketAltTipi", tutar, "komisyonOrani", "komisyonTutar", "netTutar", bakiye, aciklama, "referansNo", "cariId", tarih, "createdAt") FROM stdin;
\.


--
-- Data for Name: banka_hesaplari; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.banka_hesaplari (id, "bankaId", "hesapKodu", "hesapAdi", "hesapNo", iban, "hesapTipi", bakiye, aktif, "komisyonOrani", "krediLimiti", "kullanilanLimit", "kartLimiti", "hesapKesimGunu", "sonOdemeGunu", "terminalNo", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: banka_kredi_planlari; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.banka_kredi_planlari (id, "krediId", "taksitNo", "vadeTarihi", tutar, odenen, durum, "tenantId") FROM stdin;
\.


--
-- Data for Name: banka_krediler; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.banka_krediler (id, "bankaHesapId", tutar, "toplamGeriOdeme", "toplamFaiz", "taksitSayisi", "baslangicTarihi", aciklama, "krediTuru", durum, "yillikFaizOrani", "odemeSikligi", "tenantId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: bankalar; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.bankalar (id, "tenantId", ad, sube, sehir, yetkili, telefon, logo, durum, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: basit_siparisler; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.basit_siparisler (id, "tenantId", "firmaId", "urunId", miktar, durum, "createdAt", "updatedAt", "tedarikEdilenMiktar") FROM stdin;
\.


--
-- Data for Name: bordrolar; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.bordrolar (id, "bordroNo", tip, tarih, "cariId", aciklama, "tenantId", "createdById", "createdAt", "updatedAt", "bankaHesabiId") FROM stdin;
\.


--
-- Data for Name: cari_adresler; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cari_adresler (id, "cariId", baslik, tip, adres, il, ilce, "postaKodu", varsayilan, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: cari_bankalar; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cari_bankalar (id, "cariId", "bankaAdi", "subeAdi", "subeKodu", "hesapNo", iban, "paraBirimi", aciklama, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: cari_hareketler; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cari_hareketler (id, "cariId", tip, tutar, bakiye, "belgeTipi", "belgeNo", tarih, aciklama, "createdAt", "updatedAt", "tenantId") FROM stdin;
a6c5742c-766d-4bf3-9ad5-74018d6edf19	f99631c1-40d5-4e7a-83a8-56bd9e8700ec	ALACAK	2400.00	-2400.00	FATURA	AF-2026-001	2026-02-17 00:00:00	Alış Faturası: AF-2026-001	2026-02-17 09:18:36.956	2026-02-17 09:18:36.956	\N
791384da-dc05-4607-97f5-8aeb9fea23f8	f99631c1-40d5-4e7a-83a8-56bd9e8700ec	ALACAK	48000.00	-50400.00	FATURA	AF-2026-002	2026-02-17 00:00:00	Alış Faturası: AF-2026-002	2026-02-17 09:29:30.536	2026-02-17 09:29:30.536	\N
ce26e6b6-e587-41d6-a29c-054db6e7dd71	f99631c1-40d5-4e7a-83a8-56bd9e8700ec	ALACAK	360000.00	-410400.00	FATURA	AF-2026-003	2026-02-17 00:00:00	Alış Faturası: AF-2026-003	2026-02-17 10:04:47.415	2026-02-17 10:04:47.415	\N
5c1859e5-08c1-4543-b973-c6fc454d4a13	f99631c1-40d5-4e7a-83a8-56bd9e8700ec	BORC	1482.00	-408918.00	FATURA	SF00004	2026-02-17 00:00:00	Satış Faturası: SF00004	2026-02-17 12:17:30.352	2026-02-17 12:17:30.352	\N
91984467-eb8f-4ee6-865e-52c9935390ab	f99631c1-40d5-4e7a-83a8-56bd9e8700ec	BORC	360.00	-408558.00	FATURA	SF00006	2026-02-17 00:00:00	Satış Faturası: SF00006	2026-02-17 12:57:32.59	2026-02-17 12:57:32.59	\N
0ec95cb6-418b-4c10-8365-809172b06bb4	f99631c1-40d5-4e7a-83a8-56bd9e8700ec	BORC	240.00	-408318.00	FATURA	SF00008	2026-02-17 00:00:00	Satış Faturası: SF00008	2026-02-17 13:01:44.041	2026-02-17 13:01:44.041	\N
eaac6e67-ebf3-4427-afef-0d376cfddc72	f99631c1-40d5-4e7a-83a8-56bd9e8700ec	BORC	144.00	-408174.00	FATURA	SF00010	2026-02-17 00:00:00	Satış Faturası: SF00010	2026-02-17 13:02:34.455	2026-02-17 13:02:34.455	\N
44aabfc9-4040-4cf0-af95-f91930607770	f99631c1-40d5-4e7a-83a8-56bd9e8700ec	BORC	19200.00	-388974.00	FATURA	SF00013	2026-02-17 00:00:00	Satış Faturası: SF00013	2026-02-17 13:19:05.143	2026-02-17 13:19:05.143	\N
3a790cb2-746d-4786-a5d4-0e9cee6bcd23	f99631c1-40d5-4e7a-83a8-56bd9e8700ec	BORC	21600.00	-367374.00	FATURA	SF00015	2026-02-17 00:00:00	Satış Faturası: SF00015	2026-02-17 13:19:49.705	2026-02-17 13:19:49.705	\N
3ed1a502-eec6-496d-a2bc-163bdac5d993	f99631c1-40d5-4e7a-83a8-56bd9e8700ec	BORC	1200.00	-366174.00	FATURA	SF00017	2026-02-17 00:00:00	Satış Faturası: SF00017	2026-02-17 13:21:01.596	2026-02-17 13:21:01.596	\N
c19eefb2-50b1-4fd7-a399-e020806cb5f3	f99631c1-40d5-4e7a-83a8-56bd9e8700ec	BORC	540.00	-365634.00	FATURA	SF00019	2026-02-17 00:00:00	Satış Faturası: SF00019	2026-02-17 13:25:53.794	2026-02-17 13:25:53.794	\N
143bd549-36e1-4c55-b51d-ffe68ac96422	f99631c1-40d5-4e7a-83a8-56bd9e8700ec	BORC	7200.00	-358434.00	FATURA	SF00021	2026-02-17 00:00:00	Satış Faturası: SF00021	2026-02-17 13:28:10.173	2026-02-17 13:28:10.173	\N
7bd0b396-7532-4984-b80e-88b50bced379	f99631c1-40d5-4e7a-83a8-56bd9e8700ec	BORC	60.00	-358374.00	FATURA	SF00023	2026-02-17 00:00:00	Satış Faturası: SF00023	2026-02-17 13:37:50.336	2026-02-17 13:37:50.336	\N
119d0246-aa51-48ef-bf7c-b11fd9b43f4c	f99631c1-40d5-4e7a-83a8-56bd9e8700ec	BORC	300.00	-358074.00	FATURA	SF00025	2026-02-17 00:00:00	Satış Faturası: SF00025	2026-02-17 13:53:22.094	2026-02-17 13:53:22.094	\N
7bcc6cd1-afd0-41f2-b072-bfcc08e6e901	f99631c1-40d5-4e7a-83a8-56bd9e8700ec	BORC	480.00	-357594.00	FATURA	SF00027	2026-02-17 00:00:00	Satış Faturası: SF00027	2026-02-17 13:55:27.697	2026-02-17 13:55:27.697	\N
acd10a40-36c4-4007-90e4-c8af468cd72a	f99631c1-40d5-4e7a-83a8-56bd9e8700ec	ALACAK	6000.00	-363594.00	FATURA	AF-2026-004	2026-02-17 00:00:00	Alış Faturası: AF-2026-004	2026-02-17 13:58:26.992	2026-02-17 13:58:26.992	\N
b6931249-4611-4522-af78-afa661f5b7ba	f99631c1-40d5-4e7a-83a8-56bd9e8700ec	BORC	36.00	-363558.00	FATURA	SF00029	2026-02-17 00:00:00	Satış Faturası: SF00029	2026-02-17 14:00:20.292	2026-02-17 14:00:20.292	\N
81696824-4d99-41d1-8f20-24ebae03fcf1	f99631c1-40d5-4e7a-83a8-56bd9e8700ec	BORC	288.00	-363270.00	FATURA	SF00031	2026-02-17 00:00:00	Satış Faturası: SF00031	2026-02-17 14:08:04.605	2026-02-17 14:08:04.605	\N
829eea7d-90f8-47be-8726-34c3ba20c7d5	f99631c1-40d5-4e7a-83a8-56bd9e8700ec	BORC	15000.00	-348270.00	FATURA	SF00033	2026-02-17 00:00:00	Satış Faturası: SF00033	2026-02-17 14:24:21.416	2026-02-17 14:24:21.416	\N
c3401ed3-4ad7-417e-b18a-6da7dcfb3b0c	f99631c1-40d5-4e7a-83a8-56bd9e8700ec	BORC	480.00	-347790.00	FATURA	SF00036	2026-02-17 00:00:00	Satış Faturası: SF00036	2026-02-17 14:49:22.304	2026-02-17 14:49:22.304	\N
feabd1f6-a970-4b01-b1b4-64e86708f3a4	f99631c1-40d5-4e7a-83a8-56bd9e8700ec	BORC	180.00	-347610.00	FATURA	SF00038	2026-02-17 00:00:00	Satış Faturası: SF00038	2026-02-17 15:01:39.779	2026-02-17 15:01:39.779	\N
d2f991d0-77df-4213-9ef0-8fad00d2e8cc	f99631c1-40d5-4e7a-83a8-56bd9e8700ec	ALACAK	5508.00	-353118.00	FATURA	AF-2026-005	2026-02-17 00:00:00	Alış Faturası: AF-2026-005	2026-02-17 15:40:42.92	2026-02-17 15:40:42.92	\N
\.


--
-- Data for Name: cari_yetkililer; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cari_yetkililer (id, "cariId", "adSoyad", unvan, telefon, email, dahili, varsayilan, notlar, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: cariler; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cariler (id, "cariKodu", "tenantId", unvan, tip, "sirketTipi", "vergiNo", "vergiDairesi", "tcKimlikNo", "isimSoyisim", telefon, email, ulke, il, ilce, adres, yetkili, bakiye, "vadeSuresi", aktif, "createdAt", "updatedAt", "satisElemaniId", "riskLimiti", "riskDurumu", "teminatTutar", sektor, "ozelKod1", "ozelKod2", "webSite", faks, "vadeGun", "paraBirimi", "bankaBilgileri") FROM stdin;
f99631c1-40d5-4e7a-83a8-56bd9e8700ec	C0001	cmlq7po8x0000npcaphn2psck	Mrk Otomotiv	HER_IKISI	KURUMSAL	6231176306	Beşocak	\N	\N	\N	\N	Türkiye	Adana	Seyhan	Sarıhamzalı mah 47019 sokak 74/C	\N	-353118.00	\N	t	2026-02-17 06:23:26.915	2026-02-17 15:40:42.923	\N	100000.00	NORMAL	0.00	\N	\N	\N	\N	\N	30	TRY	\N
\.


--
-- Data for Name: cek_senet_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cek_senet_logs (id, "cekSenetId", "userId", "actionType", changes, "ipAddress", "userAgent", "createdAt") FROM stdin;
\.


--
-- Data for Name: cek_senetler; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cek_senetler (id, "tenantId", tip, "portfoyTip", "cariId", tutar, "kalanTutar", vade, banka, sube, "hesapNo", "cekNo", "seriNo", durum, "tahsilTarihi", "tahsilKasaId", "ciroEdildi", "ciroTarihi", "ciroEdilen", aciklama, "createdBy", "updatedBy", "deletedAt", "deletedBy", "createdAt", "updatedAt", "sonBordroId") FROM stdin;
\.


--
-- Data for Name: code_templates; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.code_templates (id, "tenantId", module, name, prefix, "digitCount", "currentValue", "includeYear", "isActive", "createdAt", "updatedAt") FROM stdin;
b62dce71-2b0c-469b-8cfd-be1e3bafcc5e	cmlq7po8x0000npcaphn2psck	CUSTOMER	Cari Kodu	C	4	2	f	t	2026-02-17 06:21:55.827	2026-02-17 06:23:40.176
3515d2f2-b6f7-46de-9b45-76d4ad769a96	cmlq7po8x0000npcaphn2psck	PRODUCT	Ürün Kodu	ST	4	4	f	t	2026-02-17 06:21:21.51	2026-02-17 10:01:31.643
86c770ac-de3f-4647-81bb-4d146a87cf4c	cmlq7po8x0000npcaphn2psck	INVOICE_SALES	Satış Faturası No	SF	5	38	f	t	2026-02-17 10:02:50.46	2026-02-17 15:01:23.811
9a1e632d-d9eb-4efb-8716-f6760fd8c744	cmlq7po8x0000npcaphn2psck	DELIVERY_NOTE_SALES	Satış İrsaliyesi No	Sİ	5	20	f	t	2026-02-17 12:17:30.307	2026-02-17 15:01:39.756
e806a3da-7a31-45a2-93b8-68c2da2e9560	cmlq7po8x0000npcaphn2psck	DELIVERY_NOTE_PURCHASE	Alış İrsaliyesi No	Aİ	5	5	f	t	2026-02-17 09:18:36.89	2026-02-17 15:40:42.889
\.


--
-- Data for Name: deleted_banka_havaleler; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.deleted_banka_havaleler (id, "originalId", "hareketTipi", "bankaHesabiId", "bankaHesabiAdi", "cariId", "cariUnvan", tutar, tarih, aciklama, "referansNo", gonderen, alici, "originalCreatedBy", "originalUpdatedBy", "originalCreatedAt", "originalUpdatedAt", "deletedBy", "deletedAt", "deleteReason") FROM stdin;
\.


--
-- Data for Name: deleted_cek_senetler; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.deleted_cek_senetler (id, "originalId", tip, "portfoyTip", "cariId", "cariUnvan", tutar, vade, banka, sube, "hesapNo", "cekNo", "seriNo", durum, "tahsilTarihi", "tahsilKasaId", "ciroEdildi", "ciroTarihi", "ciroEdilen", aciklama, "originalCreatedBy", "originalUpdatedBy", "originalCreatedAt", "originalUpdatedAt", "deletedBy", "deletedAt", "deleteReason") FROM stdin;
\.


--
-- Data for Name: depolar; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.depolar (id, "depoAdi", adres, yetkili, telefon, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: diagnostic_notes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.diagnostic_notes (id, "tenantId", "workOrderId", note, "createdBy", "createdAt", version) FROM stdin;
\.


--
-- Data for Name: efatura_inbox; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.efatura_inbox (id, ettn, "senderVkn", "senderTitle", "invoiceNo", "invoiceDate", "rawXml", "createdAt") FROM stdin;
\.


--
-- Data for Name: efatura_xml; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.efatura_xml (id, "faturaId", "xmlData", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: esdeger_gruplar; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.esdeger_gruplar (id, "grupAdi", aciklama, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: fatura_kalemleri; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.fatura_kalemleri (id, "faturaId", "stokId", miktar, "birimFiyat", "kdvOrani", "kdvTutar", tutar, raf, "purchaseOrderItemId", "createdAt", "iskontoOrani", "iskontoTutari") FROM stdin;
75f0cf33-4788-4aa6-be66-a3977cf2cb67	70f1d748-e48a-446d-b865-c5cdee7f0ff7	0c3ab199-73fa-4256-9808-766324404070	10	50.00	20	100.00	500.00	\N	\N	2026-02-17 09:18:36.935	0.00	0.00
e583f8f8-c841-499a-ab5c-ab652fbc8ff9	70f1d748-e48a-446d-b865-c5cdee7f0ff7	14672763-8a13-4394-b5c4-8181db1d7bfa	10	150.00	20	300.00	1500.00	\N	\N	2026-02-17 09:18:36.935	0.00	0.00
6096eb6b-3239-4552-a8ee-4a3b28bb1970	79e82509-349f-4cb3-a0ce-2d29c512889f	b367e0cf-82b0-44b5-946b-c68f80a72c94	20	2000.00	20	8000.00	40000.00	\N	\N	2026-02-17 09:29:30.524	0.00	0.00
d1ae4e88-c97a-4f06-a3ad-7e77df10fe82	8e10cfc7-09dc-4ed8-b7b5-e7ae5eac0c1c	c0aab138-c0de-4ba5-bea5-fb4a742b0373	500	600.00	20	60000.00	300000.00	\N	\N	2026-02-17 10:04:47.405	0.00	0.00
bff92721-ea59-4adf-8f98-cfb9a9c0d6a9	7c59fed2-3363-4567-b376-3046e05de1d8	c0aab138-c0de-4ba5-bea5-fb4a742b0373	20	50.00	20	200.00	1000.00	\N	\N	2026-02-17 12:17:30.337	0.00	0.00
040586ea-363a-47c2-9748-1efa9340b344	7c59fed2-3363-4567-b376-3046e05de1d8	0c3ab199-73fa-4256-9808-766324404070	1	75.00	20	15.00	75.00	\N	\N	2026-02-17 12:17:30.337	0.00	0.00
a7a15060-f341-41f0-a1a6-1f725c83f383	7c59fed2-3363-4567-b376-3046e05de1d8	b367e0cf-82b0-44b5-946b-c68f80a72c94	2	80.00	20	32.00	160.00	\N	\N	2026-02-17 12:17:30.337	0.00	0.00
57fb2dc1-de94-46a6-84f7-9d9d8aa47f13	7c96cd87-ec1a-41f2-9e06-bf05cf4869e4	0c3ab199-73fa-4256-9808-766324404070	2	150.00	20	60.00	300.00	\N	\N	2026-02-17 12:57:32.579	0.00	0.00
f447e7bf-77f0-4631-88bc-86a352100e9a	dfd0fb0f-8dcc-446d-972b-8e4a0b3f3301	0c3ab199-73fa-4256-9808-766324404070	1	200.00	20	40.00	200.00	\N	\N	2026-02-17 13:01:44.031	0.00	0.00
8f0e8541-1eac-46c1-b6d5-d34c2e5d9131	8c273228-7dac-4868-8a92-3bdd6c0af583	0c3ab199-73fa-4256-9808-766324404070	1	120.00	20	24.00	120.00	\N	\N	2026-02-17 13:02:34.442	0.00	0.00
256bf1ff-afbd-48d2-b390-c24b03b89ef6	1496ce82-0148-4186-9ecb-a345177cbdf3	c0aab138-c0de-4ba5-bea5-fb4a742b0373	20	800.00	20	3200.00	16000.00	\N	\N	2026-02-17 13:19:05.132	0.00	0.00
ade4a41f-49e6-49cb-a832-68bbcd140a59	35ea1d14-b603-44d8-b711-10d8d9d5a966	c0aab138-c0de-4ba5-bea5-fb4a742b0373	20	900.00	20	3600.00	18000.00	\N	\N	2026-02-17 13:19:49.694	0.00	0.00
3f5fecc0-dc31-4529-a70d-862bd061ea03	a02f0e50-04ea-4f80-ad23-c28df5cf6977	c0aab138-c0de-4ba5-bea5-fb4a742b0373	10	100.00	20	200.00	1000.00	\N	\N	2026-02-17 13:21:01.585	0.00	0.00
c3c61aeb-f5f2-4892-9c94-59793d67233c	3a878c82-f5e3-4348-a89c-4759428e5f8c	14672763-8a13-4394-b5c4-8181db1d7bfa	2	150.00	20	60.00	300.00	\N	\N	2026-02-17 13:25:53.783	0.00	0.00
086b2a2b-096b-4583-b3c3-bb5b78981907	3a878c82-f5e3-4348-a89c-4759428e5f8c	b367e0cf-82b0-44b5-946b-c68f80a72c94	3	50.00	20	30.00	150.00	\N	\N	2026-02-17 13:25:53.783	0.00	0.00
4988396e-3d21-4041-904e-7918fcca4c23	a99f4d6b-9556-4f2e-8fbc-4f19c376829e	c0aab138-c0de-4ba5-bea5-fb4a742b0373	30	200.00	20	1200.00	6000.00	\N	\N	2026-02-17 13:28:10.162	0.00	0.00
4c2bac30-b4d0-4cda-959e-a8dc0db0c7ae	0e5df291-d2e5-4a9f-bcc6-5126c3b6427d	b367e0cf-82b0-44b5-946b-c68f80a72c94	5	10.00	20	10.00	50.00	\N	\N	2026-02-17 13:37:50.326	0.00	0.00
4a7e6d4f-0515-495d-b01f-4d192138df97	5a163ad0-7297-4fed-8cd4-7b40623f93a3	b367e0cf-82b0-44b5-946b-c68f80a72c94	1	250.00	20	50.00	250.00	\N	\N	2026-02-17 13:53:22.085	0.00	0.00
727ee604-3dd2-4cf7-9bf1-c30d8f5f7a7d	63683c35-3de0-419c-a19b-3cf0300dd7a7	b367e0cf-82b0-44b5-946b-c68f80a72c94	1	400.00	20	80.00	400.00	\N	\N	2026-02-17 13:55:27.689	0.00	0.00
78e0edc0-1571-436a-bbb4-cb3f712c890f	c76c9b8c-01d5-4892-b11a-83a41036e623	c0aab138-c0de-4ba5-bea5-fb4a742b0373	50	100.00	20	1000.00	5000.00	\N	\N	2026-02-17 13:58:26.983	0.00	0.00
df5fdfb5-d4da-4baa-aeec-86af8af34353	cabcbb6b-9681-4309-b1fe-d6d94c64fcc4	b367e0cf-82b0-44b5-946b-c68f80a72c94	3	10.00	20	6.00	30.00	\N	\N	2026-02-17 14:00:20.283	0.00	0.00
1af0e0bf-05a3-409a-b3de-e6f6163574a7	6b28ddb5-3144-4092-b3e8-e2a1822d71cb	b367e0cf-82b0-44b5-946b-c68f80a72c94	1	240.00	20	48.00	240.00	\N	\N	2026-02-17 14:08:04.593	0.00	0.00
abd1f389-a3a2-43e4-835d-523d89ce4f72	a0d40ced-ce5f-4a3b-ab0d-604171b5c3e4	c0aab138-c0de-4ba5-bea5-fb4a742b0373	50	250.00	20	2500.00	12500.00	\N	\N	2026-02-17 14:24:21.406	0.00	0.00
c5be2abb-05e9-4eeb-8abf-a1143ec57eda	79996abe-a578-45a5-9563-fc64f286e571	c0aab138-c0de-4ba5-bea5-fb4a742b0373	20	20.00	20	80.00	400.00	\N	\N	2026-02-17 14:49:22.295	0.00	0.00
97da47ed-1202-4e03-8eef-73bcb6acc4d1	09b85125-ae41-4ca0-a67b-082d8b29e28d	c0aab138-c0de-4ba5-bea5-fb4a742b0373	2	100.00	20	30.00	150.00	\N	\N	2026-02-17 15:01:39.767	25.00	50.00
e3985f6e-fff5-45e6-9e7d-fe804cdc0434	791be43b-04fe-4057-b6d6-2268b360c9f3	c0aab138-c0de-4ba5-bea5-fb4a742b0373	12	450.00	20	918.00	4590.00	\N	\N	2026-02-17 15:40:42.909	15.00	810.00
\.


--
-- Data for Name: fatura_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.fatura_logs (id, "faturaId", "userId", "actionType", changes, "ipAddress", "userAgent", "createdAt") FROM stdin;
0c741857-ab1c-4aac-b47c-a1df0ee1c380	70f1d748-e48a-446d-b865-c5cdee7f0ff7	892b2fc0-7ebe-4754-9c00-d09116a557cb	CREATE	{"fatura":{"faturaNo":"AF-2026-001","faturaTipi":"ALIS","cariId":"f99631c1-40d5-4e7a-83a8-56bd9e8700ec","tarih":"2026-02-17T00:00:00.000Z","vade":"2026-03-19T00:00:00.000Z","iskonto":0,"aciklama":null,"durum":"ONAYLANDI"},"kalemler":[{"stokId":"0c3ab199-73fa-4256-9808-766324404070","miktar":10,"birimFiyat":50,"kdvOrani":20,"tutar":500,"kdvTutar":100},{"stokId":"14672763-8a13-4394-b5c4-8181db1d7bfa","miktar":10,"birimFiyat":150,"kdvOrani":20,"tutar":1500,"kdvTutar":300}]}	\N	\N	2026-02-17 09:18:37.01
bb1a72f2-df71-4634-a98b-bb523323d0b9	79e82509-349f-4cb3-a0ce-2d29c512889f	892b2fc0-7ebe-4754-9c00-d09116a557cb	CREATE	{"fatura":{"faturaNo":"AF-2026-002","faturaTipi":"ALIS","cariId":"f99631c1-40d5-4e7a-83a8-56bd9e8700ec","tarih":"2026-02-17T00:00:00.000Z","vade":"2026-03-19T00:00:00.000Z","iskonto":0,"aciklama":null,"durum":"ONAYLANDI"},"kalemler":[{"stokId":"b367e0cf-82b0-44b5-946b-c68f80a72c94","miktar":20,"birimFiyat":2000,"kdvOrani":20,"tutar":40000,"kdvTutar":8000}]}	\N	\N	2026-02-17 09:29:30.555
de0f751e-c65c-49a4-b5a2-484124c85874	8e10cfc7-09dc-4ed8-b7b5-e7ae5eac0c1c	892b2fc0-7ebe-4754-9c00-d09116a557cb	CREATE	{"fatura":{"faturaNo":"AF-2026-003","faturaTipi":"ALIS","cariId":"f99631c1-40d5-4e7a-83a8-56bd9e8700ec","tarih":"2026-02-17T00:00:00.000Z","vade":"2026-03-19T00:00:00.000Z","iskonto":0,"aciklama":null,"durum":"ONAYLANDI"},"kalemler":[{"stokId":"c0aab138-c0de-4ba5-bea5-fb4a742b0373","miktar":500,"birimFiyat":600,"kdvOrani":20,"tutar":300000,"kdvTutar":60000}]}	\N	\N	2026-02-17 10:04:47.427
aa4f3e28-b52f-421f-8bf3-93f00a81b1b6	7c59fed2-3363-4567-b376-3046e05de1d8	892b2fc0-7ebe-4754-9c00-d09116a557cb	CREATE	{"fatura":{"faturaNo":"SF00004","faturaTipi":"SATIS","cariId":"f99631c1-40d5-4e7a-83a8-56bd9e8700ec","tarih":"2026-02-17T00:00:00.000Z","vade":"2026-03-19T00:00:00.000Z","iskonto":0,"aciklama":null,"durum":"ONAYLANDI","dovizCinsi":"TRY","dovizKuru":1},"kalemler":[{"stokId":"c0aab138-c0de-4ba5-bea5-fb4a742b0373","miktar":20,"birimFiyat":50,"kdvOrani":20,"tutar":1000,"kdvTutar":200},{"stokId":"0c3ab199-73fa-4256-9808-766324404070","miktar":1,"birimFiyat":75,"kdvOrani":20,"tutar":75,"kdvTutar":15},{"stokId":"b367e0cf-82b0-44b5-946b-c68f80a72c94","miktar":2,"birimFiyat":80,"kdvOrani":20,"tutar":160,"kdvTutar":32}]}	\N	\N	2026-02-17 12:17:30.368
542ca635-929b-4855-8083-a3327ecb8495	7c96cd87-ec1a-41f2-9e06-bf05cf4869e4	892b2fc0-7ebe-4754-9c00-d09116a557cb	CREATE	{"fatura":{"faturaNo":"SF00006","faturaTipi":"SATIS","cariId":"f99631c1-40d5-4e7a-83a8-56bd9e8700ec","tarih":"2026-02-17T00:00:00.000Z","vade":"2026-03-19T00:00:00.000Z","iskonto":0,"aciklama":null,"durum":"ONAYLANDI","dovizCinsi":"TRY","dovizKuru":1},"kalemler":[{"stokId":"0c3ab199-73fa-4256-9808-766324404070","miktar":2,"birimFiyat":150,"kdvOrani":20,"tutar":300,"kdvTutar":60}]}	\N	\N	2026-02-17 12:57:32.599
853575aa-3711-4208-88b6-97d9f7d130f9	dfd0fb0f-8dcc-446d-972b-8e4a0b3f3301	892b2fc0-7ebe-4754-9c00-d09116a557cb	CREATE	{"fatura":{"faturaNo":"SF00008","faturaTipi":"SATIS","cariId":"f99631c1-40d5-4e7a-83a8-56bd9e8700ec","tarih":"2026-02-17T00:00:00.000Z","vade":"2026-03-19T00:00:00.000Z","iskonto":0,"aciklama":null,"durum":"ONAYLANDI","dovizCinsi":"TRY","dovizKuru":1},"kalemler":[{"stokId":"0c3ab199-73fa-4256-9808-766324404070","miktar":1,"birimFiyat":200,"kdvOrani":20,"tutar":200,"kdvTutar":40}]}	\N	\N	2026-02-17 13:01:44.052
701b7949-2b26-4569-ae6c-45f026d3423f	8c273228-7dac-4868-8a92-3bdd6c0af583	892b2fc0-7ebe-4754-9c00-d09116a557cb	CREATE	{"fatura":{"faturaNo":"SF00010","faturaTipi":"SATIS","cariId":"f99631c1-40d5-4e7a-83a8-56bd9e8700ec","tarih":"2026-02-17T00:00:00.000Z","vade":"2026-03-19T00:00:00.000Z","iskonto":0,"aciklama":null,"durum":"ONAYLANDI","dovizCinsi":"TRY","dovizKuru":1},"kalemler":[{"stokId":"0c3ab199-73fa-4256-9808-766324404070","miktar":1,"birimFiyat":120,"kdvOrani":20,"tutar":120,"kdvTutar":24}]}	\N	\N	2026-02-17 13:02:34.468
2d1b749c-9e72-45e1-8cea-1f5c4418fbeb	1496ce82-0148-4186-9ecb-a345177cbdf3	892b2fc0-7ebe-4754-9c00-d09116a557cb	CREATE	{"fatura":{"faturaNo":"SF00013","faturaTipi":"SATIS","cariId":"f99631c1-40d5-4e7a-83a8-56bd9e8700ec","tarih":"2026-02-17T00:00:00.000Z","vade":"2026-03-19T00:00:00.000Z","iskonto":0,"aciklama":null,"durum":"ONAYLANDI","dovizCinsi":"TRY","dovizKuru":1},"kalemler":[{"stokId":"c0aab138-c0de-4ba5-bea5-fb4a742b0373","miktar":20,"birimFiyat":800,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"16000","kdvTutar":"3200"}]}	\N	\N	2026-02-17 13:19:05.157
b2f6adf1-284e-410f-ab62-1e970dbf93a3	35ea1d14-b603-44d8-b711-10d8d9d5a966	892b2fc0-7ebe-4754-9c00-d09116a557cb	CREATE	{"fatura":{"faturaNo":"SF00015","faturaTipi":"SATIS","cariId":"f99631c1-40d5-4e7a-83a8-56bd9e8700ec","tarih":"2026-02-17T00:00:00.000Z","vade":"2026-03-19T00:00:00.000Z","iskonto":0,"aciklama":null,"durum":"ONAYLANDI","dovizCinsi":"TRY","dovizKuru":1},"kalemler":[{"stokId":"c0aab138-c0de-4ba5-bea5-fb4a742b0373","miktar":20,"birimFiyat":900,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"18000","kdvTutar":"3600"}]}	\N	\N	2026-02-17 13:19:49.718
33810807-4398-499d-89b4-4fc7150b6564	a02f0e50-04ea-4f80-ad23-c28df5cf6977	892b2fc0-7ebe-4754-9c00-d09116a557cb	CREATE	{"fatura":{"faturaNo":"SF00017","faturaTipi":"SATIS","cariId":"f99631c1-40d5-4e7a-83a8-56bd9e8700ec","tarih":"2026-02-17T00:00:00.000Z","vade":"2026-03-19T00:00:00.000Z","iskonto":0,"aciklama":null,"durum":"ONAYLANDI","dovizCinsi":"TRY","dovizKuru":1},"kalemler":[{"stokId":"c0aab138-c0de-4ba5-bea5-fb4a742b0373","miktar":10,"birimFiyat":100,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"1000","kdvTutar":"200"}]}	\N	\N	2026-02-17 13:21:01.61
e6399749-6247-4a1b-80ee-2604dda3b89f	3a878c82-f5e3-4348-a89c-4759428e5f8c	892b2fc0-7ebe-4754-9c00-d09116a557cb	CREATE	{"fatura":{"faturaNo":"SF00019","faturaTipi":"SATIS","cariId":"f99631c1-40d5-4e7a-83a8-56bd9e8700ec","tarih":"2026-02-17T00:00:00.000Z","vade":"2026-03-19T00:00:00.000Z","iskonto":0,"aciklama":null,"durum":"ONAYLANDI","dovizCinsi":"TRY","dovizKuru":1},"kalemler":[{"stokId":"14672763-8a13-4394-b5c4-8181db1d7bfa","miktar":2,"birimFiyat":150,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"300","kdvTutar":"60"},{"stokId":"b367e0cf-82b0-44b5-946b-c68f80a72c94","miktar":3,"birimFiyat":50,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"150","kdvTutar":"30"}]}	\N	\N	2026-02-17 13:25:53.809
ca441670-cbb9-4050-a748-b9c248be2eb1	a99f4d6b-9556-4f2e-8fbc-4f19c376829e	892b2fc0-7ebe-4754-9c00-d09116a557cb	CREATE	{"fatura":{"faturaNo":"SF00021","faturaTipi":"SATIS","cariId":"f99631c1-40d5-4e7a-83a8-56bd9e8700ec","tarih":"2026-02-17T00:00:00.000Z","vade":"2026-03-19T00:00:00.000Z","iskonto":0,"aciklama":null,"durum":"ONAYLANDI","dovizCinsi":"TRY","dovizKuru":1},"kalemler":[{"stokId":"c0aab138-c0de-4ba5-bea5-fb4a742b0373","miktar":30,"birimFiyat":200,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"6000","kdvTutar":"1200"}]}	\N	\N	2026-02-17 13:28:10.182
f9f635b7-0cc2-499f-9edd-8d69218c998d	0e5df291-d2e5-4a9f-bcc6-5126c3b6427d	892b2fc0-7ebe-4754-9c00-d09116a557cb	CREATE	{"fatura":{"faturaNo":"SF00023","faturaTipi":"SATIS","cariId":"f99631c1-40d5-4e7a-83a8-56bd9e8700ec","tarih":"2026-02-17T00:00:00.000Z","vade":"2026-03-19T00:00:00.000Z","iskonto":0,"aciklama":null,"durum":"ONAYLANDI","dovizCinsi":"TRY","dovizKuru":1},"kalemler":[{"stokId":"b367e0cf-82b0-44b5-946b-c68f80a72c94","miktar":5,"birimFiyat":10,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"50","kdvTutar":"10"}]}	\N	\N	2026-02-17 13:37:50.345
e62f1350-632e-4088-a52b-dcc5f4da60d6	5a163ad0-7297-4fed-8cd4-7b40623f93a3	892b2fc0-7ebe-4754-9c00-d09116a557cb	CREATE	{"fatura":{"faturaNo":"SF00025","faturaTipi":"SATIS","cariId":"f99631c1-40d5-4e7a-83a8-56bd9e8700ec","tarih":"2026-02-17T00:00:00.000Z","vade":"2026-03-19T00:00:00.000Z","iskonto":0,"aciklama":null,"durum":"ONAYLANDI","dovizCinsi":"TRY","dovizKuru":1},"kalemler":[{"stokId":"b367e0cf-82b0-44b5-946b-c68f80a72c94","miktar":1,"birimFiyat":250,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"250","kdvTutar":"50"}]}	\N	\N	2026-02-17 13:53:22.103
5955d6bd-4604-4313-97c3-c152f4c79063	63683c35-3de0-419c-a19b-3cf0300dd7a7	892b2fc0-7ebe-4754-9c00-d09116a557cb	CREATE	{"fatura":{"faturaNo":"SF00027","faturaTipi":"SATIS","cariId":"f99631c1-40d5-4e7a-83a8-56bd9e8700ec","tarih":"2026-02-17T00:00:00.000Z","vade":"2026-03-19T00:00:00.000Z","iskonto":0,"aciklama":null,"durum":"ONAYLANDI","dovizCinsi":"TRY","dovizKuru":1},"kalemler":[{"stokId":"b367e0cf-82b0-44b5-946b-c68f80a72c94","miktar":1,"birimFiyat":400,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"400","kdvTutar":"80"}]}	\N	\N	2026-02-17 13:55:27.706
d41952b0-22aa-4e1f-b56a-194f154435a0	c76c9b8c-01d5-4892-b11a-83a41036e623	892b2fc0-7ebe-4754-9c00-d09116a557cb	CREATE	{"fatura":{"faturaNo":"AF-2026-004","faturaTipi":"ALIS","cariId":"f99631c1-40d5-4e7a-83a8-56bd9e8700ec","tarih":"2026-02-17T00:00:00.000Z","vade":"2026-03-19T00:00:00.000Z","iskonto":0,"aciklama":null,"durum":"ONAYLANDI"},"kalemler":[{"stokId":"c0aab138-c0de-4ba5-bea5-fb4a742b0373","miktar":50,"birimFiyat":100,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"5000","kdvTutar":"1000"}]}	\N	\N	2026-02-17 13:58:27.002
d6a9c519-3b75-4209-9d55-7269c207d4e8	cabcbb6b-9681-4309-b1fe-d6d94c64fcc4	892b2fc0-7ebe-4754-9c00-d09116a557cb	CREATE	{"fatura":{"faturaNo":"SF00029","faturaTipi":"SATIS","cariId":"f99631c1-40d5-4e7a-83a8-56bd9e8700ec","tarih":"2026-02-17T00:00:00.000Z","vade":"2026-03-19T00:00:00.000Z","iskonto":0,"aciklama":null,"durum":"ONAYLANDI","dovizCinsi":"TRY","dovizKuru":1},"kalemler":[{"stokId":"b367e0cf-82b0-44b5-946b-c68f80a72c94","miktar":3,"birimFiyat":10,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"30","kdvTutar":"6"}]}	\N	\N	2026-02-17 14:00:20.301
e3b32fcb-e0ab-4b68-87cc-0235c7e7f5dc	6b28ddb5-3144-4092-b3e8-e2a1822d71cb	892b2fc0-7ebe-4754-9c00-d09116a557cb	CREATE	{"fatura":{"faturaNo":"SF00031","faturaTipi":"SATIS","cariId":"f99631c1-40d5-4e7a-83a8-56bd9e8700ec","tarih":"2026-02-17T00:00:00.000Z","vade":"2026-03-19T00:00:00.000Z","iskonto":0,"aciklama":null,"durum":"ONAYLANDI","dovizCinsi":"TRY","dovizKuru":1},"kalemler":[{"stokId":"b367e0cf-82b0-44b5-946b-c68f80a72c94","miktar":1,"birimFiyat":240,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"240","kdvTutar":"48"}]}	\N	\N	2026-02-17 14:08:04.615
f7b0eb09-cdc2-4a58-9758-702cfd53c8e8	a0d40ced-ce5f-4a3b-ab0d-604171b5c3e4	892b2fc0-7ebe-4754-9c00-d09116a557cb	CREATE	{"fatura":{"faturaNo":"SF00033","faturaTipi":"SATIS","cariId":"f99631c1-40d5-4e7a-83a8-56bd9e8700ec","tarih":"2026-02-17T00:00:00.000Z","vade":"2026-03-19T00:00:00.000Z","iskonto":0,"aciklama":null,"durum":"ONAYLANDI","dovizCinsi":"TRY","dovizKuru":1},"kalemler":[{"stokId":"c0aab138-c0de-4ba5-bea5-fb4a742b0373","miktar":50,"birimFiyat":250,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"12500","kdvTutar":"2500"}]}	\N	\N	2026-02-17 14:24:21.428
94f73c5f-e36b-40af-91f5-f47820bfe86d	79996abe-a578-45a5-9563-fc64f286e571	892b2fc0-7ebe-4754-9c00-d09116a557cb	CREATE	{"fatura":{"faturaNo":"SF00036","faturaTipi":"SATIS","cariId":"f99631c1-40d5-4e7a-83a8-56bd9e8700ec","tarih":"2026-02-17T00:00:00.000Z","vade":"2026-03-19T00:00:00.000Z","iskonto":0,"aciklama":null,"durum":"ONAYLANDI","dovizCinsi":"TRY","dovizKuru":1},"kalemler":[{"stokId":"c0aab138-c0de-4ba5-bea5-fb4a742b0373","miktar":20,"birimFiyat":20,"kdvOrani":20,"iskontoOrani":"0","iskontoTutari":"0","tutar":"400","kdvTutar":"80"}]}	\N	\N	2026-02-17 14:49:22.313
911e9463-fc18-4e6e-9121-017d5c32288e	09b85125-ae41-4ca0-a67b-082d8b29e28d	892b2fc0-7ebe-4754-9c00-d09116a557cb	CREATE	{"fatura":{"faturaNo":"SF00038","faturaTipi":"SATIS","cariId":"f99631c1-40d5-4e7a-83a8-56bd9e8700ec","tarih":"2026-02-17T00:00:00.000Z","vade":"2026-03-19T00:00:00.000Z","iskonto":0,"aciklama":null,"durum":"ONAYLANDI","dovizCinsi":"TRY","dovizKuru":1},"kalemler":[{"stokId":"c0aab138-c0de-4ba5-bea5-fb4a742b0373","miktar":2,"birimFiyat":100,"kdvOrani":20,"iskontoOrani":"25","iskontoTutari":"50","tutar":"150","kdvTutar":"30"}]}	\N	\N	2026-02-17 15:01:39.789
fc7e24a8-58cb-4e29-9d56-5304054f1dc1	791be43b-04fe-4057-b6d6-2268b360c9f3	892b2fc0-7ebe-4754-9c00-d09116a557cb	CREATE	{"fatura":{"faturaNo":"AF-2026-005","faturaTipi":"ALIS","cariId":"f99631c1-40d5-4e7a-83a8-56bd9e8700ec","tarih":"2026-02-17T00:00:00.000Z","vade":"2026-03-19T00:00:00.000Z","iskonto":0,"aciklama":null,"durum":"ONAYLANDI"},"kalemler":[{"stokId":"c0aab138-c0de-4ba5-bea5-fb4a742b0373","miktar":12,"birimFiyat":450,"kdvOrani":20,"iskontoOrani":"15","iskontoTutari":"810","tutar":"4590","kdvTutar":"918"}]}	\N	\N	2026-02-17 15:40:42.931
\.


--
-- Data for Name: fatura_tahsilatlar; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.fatura_tahsilatlar (id, "faturaId", "tahsilatId", tutar, "createdAt", "tenantId") FROM stdin;
\.


--
-- Data for Name: faturalar; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.faturalar (id, "faturaNo", "faturaTipi", "tenantId", "cariId", tarih, vade, iskonto, "toplamTutar", "kdvTutar", "genelToplam", "dovizToplam", "dovizCinsi", "dovizKuru", aciklama, durum, "odenecekTutar", "odenenTutar", "siparisNo", "purchaseOrderId", "satinAlmaSiparisiId", "deliveryNoteId", "satinAlmaIrsaliyeId", "efaturaStatus", "efaturaEttn", "createdBy", "updatedBy", "deletedAt", "deletedBy", "createdAt", "updatedAt", "satisElemaniId") FROM stdin;
70f1d748-e48a-446d-b865-c5cdee7f0ff7	AF-2026-001	ALIS	cmlq7po8x0000npcaphn2psck	f99631c1-40d5-4e7a-83a8-56bd9e8700ec	2026-02-17 00:00:00	2026-03-19 00:00:00	0.00	2000.00	400.00	2400.00	\N	TRY	1.0000	\N	ONAYLANDI	2400.00	0.00	\N	\N	\N	\N	c4ae5bda-3273-43bc-9193-4eba70081986	PENDING	\N	892b2fc0-7ebe-4754-9c00-d09116a557cb	\N	\N	\N	2026-02-17 09:18:36.935	2026-02-17 09:18:36.935	\N
79e82509-349f-4cb3-a0ce-2d29c512889f	AF-2026-002	ALIS	cmlq7po8x0000npcaphn2psck	f99631c1-40d5-4e7a-83a8-56bd9e8700ec	2026-02-17 00:00:00	2026-03-19 00:00:00	0.00	40000.00	8000.00	48000.00	\N	TRY	1.0000	\N	ONAYLANDI	48000.00	0.00	\N	\N	\N	\N	69618ecd-7469-41e3-b918-224917c2dfff	PENDING	\N	892b2fc0-7ebe-4754-9c00-d09116a557cb	\N	\N	\N	2026-02-17 09:29:30.524	2026-02-17 09:29:30.524	\N
8e10cfc7-09dc-4ed8-b7b5-e7ae5eac0c1c	AF-2026-003	ALIS	cmlq7po8x0000npcaphn2psck	f99631c1-40d5-4e7a-83a8-56bd9e8700ec	2026-02-17 00:00:00	2026-03-19 00:00:00	0.00	300000.00	60000.00	360000.00	\N	TRY	1.0000	\N	ONAYLANDI	360000.00	0.00	\N	\N	\N	\N	06720d4d-6b1c-4ac3-85eb-a3ec3c5161ac	PENDING	\N	892b2fc0-7ebe-4754-9c00-d09116a557cb	\N	\N	\N	2026-02-17 10:04:47.405	2026-02-17 10:04:47.405	\N
7c59fed2-3363-4567-b376-3046e05de1d8	SF00004	SATIS	cmlq7po8x0000npcaphn2psck	f99631c1-40d5-4e7a-83a8-56bd9e8700ec	2026-02-17 00:00:00	2026-03-19 00:00:00	0.00	1235.00	247.00	1482.00	\N	TRY	1.0000	\N	ONAYLANDI	1482.00	0.00	\N	\N	\N	4830b0e1-ecf4-4ad2-8cf8-f8516d242a8c	\N	PENDING	\N	892b2fc0-7ebe-4754-9c00-d09116a557cb	\N	\N	\N	2026-02-17 12:17:30.337	2026-02-17 12:17:30.337	a000a7ad-46cf-4ca1-b0c9-f9fd8192022b
7c96cd87-ec1a-41f2-9e06-bf05cf4869e4	SF00006	SATIS	cmlq7po8x0000npcaphn2psck	f99631c1-40d5-4e7a-83a8-56bd9e8700ec	2026-02-17 00:00:00	2026-03-19 00:00:00	0.00	300.00	60.00	360.00	\N	TRY	1.0000	\N	ONAYLANDI	360.00	0.00	\N	\N	\N	ff0ff229-29e1-42dd-84cd-507e2f98d6c8	\N	PENDING	\N	892b2fc0-7ebe-4754-9c00-d09116a557cb	\N	\N	\N	2026-02-17 12:57:32.579	2026-02-17 12:57:32.579	a000a7ad-46cf-4ca1-b0c9-f9fd8192022b
dfd0fb0f-8dcc-446d-972b-8e4a0b3f3301	SF00008	SATIS	cmlq7po8x0000npcaphn2psck	f99631c1-40d5-4e7a-83a8-56bd9e8700ec	2026-02-17 00:00:00	2026-03-19 00:00:00	0.00	200.00	40.00	240.00	\N	TRY	1.0000	\N	ONAYLANDI	240.00	0.00	\N	\N	\N	bfc4826c-393e-4d7d-8e18-94da6ce899ac	\N	PENDING	\N	892b2fc0-7ebe-4754-9c00-d09116a557cb	\N	\N	\N	2026-02-17 13:01:44.031	2026-02-17 13:01:44.031	a000a7ad-46cf-4ca1-b0c9-f9fd8192022b
8c273228-7dac-4868-8a92-3bdd6c0af583	SF00010	SATIS	cmlq7po8x0000npcaphn2psck	f99631c1-40d5-4e7a-83a8-56bd9e8700ec	2026-02-17 00:00:00	2026-03-19 00:00:00	0.00	120.00	24.00	144.00	\N	TRY	1.0000	\N	ONAYLANDI	144.00	0.00	\N	\N	\N	2c7c4336-c361-44a3-b3aa-2aeaace174e6	\N	PENDING	\N	892b2fc0-7ebe-4754-9c00-d09116a557cb	\N	\N	\N	2026-02-17 13:02:34.442	2026-02-17 13:02:34.442	a000a7ad-46cf-4ca1-b0c9-f9fd8192022b
1496ce82-0148-4186-9ecb-a345177cbdf3	SF00013	SATIS	cmlq7po8x0000npcaphn2psck	f99631c1-40d5-4e7a-83a8-56bd9e8700ec	2026-02-17 00:00:00	2026-03-19 00:00:00	0.00	16000.00	3200.00	19200.00	\N	TRY	1.0000	\N	ONAYLANDI	19200.00	0.00	\N	\N	\N	10649cfe-d518-4459-a9c0-5ef21d10ac65	\N	PENDING	\N	892b2fc0-7ebe-4754-9c00-d09116a557cb	\N	\N	\N	2026-02-17 13:19:05.132	2026-02-17 13:19:05.132	a000a7ad-46cf-4ca1-b0c9-f9fd8192022b
35ea1d14-b603-44d8-b711-10d8d9d5a966	SF00015	SATIS	cmlq7po8x0000npcaphn2psck	f99631c1-40d5-4e7a-83a8-56bd9e8700ec	2026-02-17 00:00:00	2026-03-19 00:00:00	0.00	18000.00	3600.00	21600.00	\N	TRY	1.0000	\N	ONAYLANDI	21600.00	0.00	\N	\N	\N	ad72b3f4-60c5-4c0b-93a9-2bc65162a0b1	\N	PENDING	\N	892b2fc0-7ebe-4754-9c00-d09116a557cb	\N	\N	\N	2026-02-17 13:19:49.694	2026-02-17 13:19:49.694	a000a7ad-46cf-4ca1-b0c9-f9fd8192022b
a02f0e50-04ea-4f80-ad23-c28df5cf6977	SF00017	SATIS	cmlq7po8x0000npcaphn2psck	f99631c1-40d5-4e7a-83a8-56bd9e8700ec	2026-02-17 00:00:00	2026-03-19 00:00:00	0.00	1000.00	200.00	1200.00	\N	TRY	1.0000	\N	ONAYLANDI	1200.00	0.00	\N	\N	\N	945392cb-eb02-46bb-a41d-9fc89054d40b	\N	PENDING	\N	892b2fc0-7ebe-4754-9c00-d09116a557cb	\N	\N	\N	2026-02-17 13:21:01.585	2026-02-17 13:21:01.585	a000a7ad-46cf-4ca1-b0c9-f9fd8192022b
3a878c82-f5e3-4348-a89c-4759428e5f8c	SF00019	SATIS	cmlq7po8x0000npcaphn2psck	f99631c1-40d5-4e7a-83a8-56bd9e8700ec	2026-02-17 00:00:00	2026-03-19 00:00:00	0.00	450.00	90.00	540.00	\N	TRY	1.0000	\N	ONAYLANDI	540.00	0.00	\N	\N	\N	dd28aaa8-806a-4957-9181-2d2f07d5b52f	\N	PENDING	\N	892b2fc0-7ebe-4754-9c00-d09116a557cb	\N	\N	\N	2026-02-17 13:25:53.783	2026-02-17 13:25:53.783	a000a7ad-46cf-4ca1-b0c9-f9fd8192022b
a99f4d6b-9556-4f2e-8fbc-4f19c376829e	SF00021	SATIS	cmlq7po8x0000npcaphn2psck	f99631c1-40d5-4e7a-83a8-56bd9e8700ec	2026-02-17 00:00:00	2026-03-19 00:00:00	0.00	6000.00	1200.00	7200.00	\N	TRY	1.0000	\N	ONAYLANDI	7200.00	0.00	\N	\N	\N	389e389b-0bc9-475c-94a8-024a4207f72e	\N	PENDING	\N	892b2fc0-7ebe-4754-9c00-d09116a557cb	\N	\N	\N	2026-02-17 13:28:10.162	2026-02-17 13:28:10.162	a000a7ad-46cf-4ca1-b0c9-f9fd8192022b
0e5df291-d2e5-4a9f-bcc6-5126c3b6427d	SF00023	SATIS	cmlq7po8x0000npcaphn2psck	f99631c1-40d5-4e7a-83a8-56bd9e8700ec	2026-02-17 00:00:00	2026-03-19 00:00:00	0.00	50.00	10.00	60.00	\N	TRY	1.0000	\N	ONAYLANDI	60.00	0.00	\N	\N	\N	2cbb9431-340d-45de-9e4b-4caa64475ecc	\N	PENDING	\N	892b2fc0-7ebe-4754-9c00-d09116a557cb	\N	\N	\N	2026-02-17 13:37:50.326	2026-02-17 13:37:50.326	a000a7ad-46cf-4ca1-b0c9-f9fd8192022b
5a163ad0-7297-4fed-8cd4-7b40623f93a3	SF00025	SATIS	cmlq7po8x0000npcaphn2psck	f99631c1-40d5-4e7a-83a8-56bd9e8700ec	2026-02-17 00:00:00	2026-03-19 00:00:00	0.00	250.00	50.00	300.00	\N	TRY	1.0000	\N	ONAYLANDI	300.00	0.00	\N	\N	\N	7532b038-eef1-4da4-829a-0e37a4b3b72a	\N	PENDING	\N	892b2fc0-7ebe-4754-9c00-d09116a557cb	\N	\N	\N	2026-02-17 13:53:22.085	2026-02-17 13:53:22.085	a000a7ad-46cf-4ca1-b0c9-f9fd8192022b
63683c35-3de0-419c-a19b-3cf0300dd7a7	SF00027	SATIS	cmlq7po8x0000npcaphn2psck	f99631c1-40d5-4e7a-83a8-56bd9e8700ec	2026-02-17 00:00:00	2026-03-19 00:00:00	0.00	400.00	80.00	480.00	\N	TRY	1.0000	\N	ONAYLANDI	480.00	0.00	\N	\N	\N	a46f82b2-b61a-4669-ab5c-5580b7b4706c	\N	PENDING	\N	892b2fc0-7ebe-4754-9c00-d09116a557cb	\N	\N	\N	2026-02-17 13:55:27.689	2026-02-17 13:55:27.689	a000a7ad-46cf-4ca1-b0c9-f9fd8192022b
c76c9b8c-01d5-4892-b11a-83a41036e623	AF-2026-004	ALIS	cmlq7po8x0000npcaphn2psck	f99631c1-40d5-4e7a-83a8-56bd9e8700ec	2026-02-17 00:00:00	2026-03-19 00:00:00	0.00	5000.00	1000.00	6000.00	\N	TRY	1.0000	\N	ONAYLANDI	6000.00	0.00	\N	\N	\N	\N	b6c21261-c0d7-4d0e-9f65-04a5c09d3860	PENDING	\N	892b2fc0-7ebe-4754-9c00-d09116a557cb	\N	\N	\N	2026-02-17 13:58:26.983	2026-02-17 13:58:26.983	\N
cabcbb6b-9681-4309-b1fe-d6d94c64fcc4	SF00029	SATIS	cmlq7po8x0000npcaphn2psck	f99631c1-40d5-4e7a-83a8-56bd9e8700ec	2026-02-17 00:00:00	2026-03-19 00:00:00	0.00	30.00	6.00	36.00	\N	TRY	1.0000	\N	ONAYLANDI	36.00	0.00	\N	\N	\N	77dd2eaf-2de9-4819-b4b8-01daf6a3068f	\N	PENDING	\N	892b2fc0-7ebe-4754-9c00-d09116a557cb	\N	\N	\N	2026-02-17 14:00:20.283	2026-02-17 14:00:20.283	a000a7ad-46cf-4ca1-b0c9-f9fd8192022b
6b28ddb5-3144-4092-b3e8-e2a1822d71cb	SF00031	SATIS	cmlq7po8x0000npcaphn2psck	f99631c1-40d5-4e7a-83a8-56bd9e8700ec	2026-02-17 00:00:00	2026-03-19 00:00:00	0.00	240.00	48.00	288.00	\N	TRY	1.0000	\N	ONAYLANDI	288.00	0.00	\N	\N	\N	bee2d804-568a-4a15-8eae-b3ff82e4a0b0	\N	PENDING	\N	892b2fc0-7ebe-4754-9c00-d09116a557cb	\N	\N	\N	2026-02-17 14:08:04.593	2026-02-17 14:08:04.593	a000a7ad-46cf-4ca1-b0c9-f9fd8192022b
a0d40ced-ce5f-4a3b-ab0d-604171b5c3e4	SF00033	SATIS	cmlq7po8x0000npcaphn2psck	f99631c1-40d5-4e7a-83a8-56bd9e8700ec	2026-02-17 00:00:00	2026-03-19 00:00:00	0.00	12500.00	2500.00	15000.00	\N	TRY	1.0000	\N	ONAYLANDI	15000.00	0.00	\N	\N	\N	395602bc-f4e5-41e0-8a73-b4d86c02b9a9	\N	PENDING	\N	892b2fc0-7ebe-4754-9c00-d09116a557cb	\N	\N	\N	2026-02-17 14:24:21.406	2026-02-17 14:24:21.406	a000a7ad-46cf-4ca1-b0c9-f9fd8192022b
79996abe-a578-45a5-9563-fc64f286e571	SF00036	SATIS	cmlq7po8x0000npcaphn2psck	f99631c1-40d5-4e7a-83a8-56bd9e8700ec	2026-02-17 00:00:00	2026-03-19 00:00:00	0.00	400.00	80.00	480.00	\N	TRY	1.0000	\N	ONAYLANDI	480.00	0.00	\N	\N	\N	d5fed480-dd72-424e-9227-e46be98f2be4	\N	PENDING	\N	892b2fc0-7ebe-4754-9c00-d09116a557cb	\N	\N	\N	2026-02-17 14:49:22.295	2026-02-17 14:49:22.295	a000a7ad-46cf-4ca1-b0c9-f9fd8192022b
09b85125-ae41-4ca0-a67b-082d8b29e28d	SF00038	SATIS	cmlq7po8x0000npcaphn2psck	f99631c1-40d5-4e7a-83a8-56bd9e8700ec	2026-02-17 00:00:00	2026-03-19 00:00:00	0.00	150.00	30.00	180.00	\N	TRY	1.0000	\N	ONAYLANDI	180.00	0.00	\N	\N	\N	19ba9427-3660-46f2-b919-7fc953b47389	\N	PENDING	\N	892b2fc0-7ebe-4754-9c00-d09116a557cb	\N	\N	\N	2026-02-17 15:01:39.767	2026-02-17 15:01:39.767	a000a7ad-46cf-4ca1-b0c9-f9fd8192022b
791be43b-04fe-4057-b6d6-2268b360c9f3	AF-2026-005	ALIS	cmlq7po8x0000npcaphn2psck	f99631c1-40d5-4e7a-83a8-56bd9e8700ec	2026-02-17 00:00:00	2026-03-19 00:00:00	0.00	4590.00	918.00	5508.00	\N	TRY	1.0000	\N	ONAYLANDI	5508.00	0.00	\N	\N	\N	\N	80c32f90-ba5e-4418-ba1d-670b5cf30816	PENDING	\N	892b2fc0-7ebe-4754-9c00-d09116a557cb	\N	\N	\N	2026-02-17 15:40:42.909	2026-02-17 15:40:42.909	\N
\.


--
-- Data for Name: firma_kredi_karti_hareketler; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.firma_kredi_karti_hareketler (id, "kartId", tutar, bakiye, aciklama, "cariId", "referansNo", tarih, "createdAt") FROM stdin;
\.


--
-- Data for Name: firma_kredi_karti_hatirlaticilar; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.firma_kredi_karti_hatirlaticilar (id, "kartId", tip, gun, aktif, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: firma_kredi_kartlari; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.firma_kredi_kartlari (id, "kasaId", "kartKodu", "kartAdi", "bankaAdi", "kartTipi", "sonDortHane", "limit", bakiye, aktif, "createdAt", "updatedAt", "hesapKesimTarihi", "sonOdemeTarihi") FROM stdin;
\.


--
-- Data for Name: hizli_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.hizli_tokens (id, token, "loginHash", "generatedAt", "expiresAt") FROM stdin;
\.


--
-- Data for Name: invitations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.invitations (id, email, "tenantId", "invitedBy", token, status, "expiresAt", "acceptedAt", "acceptedBy", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: invoice_profit; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.invoice_profit (id, "faturaId", "faturaKalemiId", "stokId", "tenantId", miktar, "birimFiyat", "birimMaliyet", "toplamSatisTutari", "toplamMaliyet", kar, "karOrani", "hesaplamaTarihi", "updatedAt") FROM stdin;
16f11875-51f4-44fd-9374-81cb175464a2	7c59fed2-3363-4567-b376-3046e05de1d8	bff92721-ea59-4adf-8f98-cfb9a9c0d6a9	c0aab138-c0de-4ba5-bea5-fb4a742b0373	cmlq7po8x0000npcaphn2psck	20	50.00	600.0000	1000.00	12000.00	-11000.00	-91.67	2026-02-17 12:17:30.391	2026-02-17 12:17:30.391
b3c66f4c-c590-4199-8386-ac3ad2f454a6	7c59fed2-3363-4567-b376-3046e05de1d8	040586ea-363a-47c2-9748-1efa9340b344	0c3ab199-73fa-4256-9808-766324404070	cmlq7po8x0000npcaphn2psck	1	75.00	50.0000	75.00	50.00	25.00	50.00	2026-02-17 12:17:30.391	2026-02-17 12:17:30.391
5eee4a4a-6931-45ef-ac04-770ecb4f0958	7c59fed2-3363-4567-b376-3046e05de1d8	a7a15060-f341-41f0-a1a6-1f725c83f383	b367e0cf-82b0-44b5-946b-c68f80a72c94	cmlq7po8x0000npcaphn2psck	2	80.00	2000.0000	160.00	4000.00	-3840.00	-96.00	2026-02-17 12:17:30.391	2026-02-17 12:17:30.391
e4c87348-5afd-44a7-a074-bcef537d3c5d	7c59fed2-3363-4567-b376-3046e05de1d8	\N	c0aab138-c0de-4ba5-bea5-fb4a742b0373	cmlq7po8x0000npcaphn2psck	23	0.00	0.0000	1235.00	16050.00	-14815.00	-92.31	2026-02-17 12:17:30.391	2026-02-17 12:17:30.391
f9dc48da-329f-42bb-b40d-2f581ab3a904	7c96cd87-ec1a-41f2-9e06-bf05cf4869e4	57fb2dc1-de94-46a6-84f7-9d9d8aa47f13	0c3ab199-73fa-4256-9808-766324404070	cmlq7po8x0000npcaphn2psck	2	150.00	50.0000	300.00	100.00	200.00	200.00	2026-02-17 12:57:32.618	2026-02-17 12:57:32.618
e01b6c3a-2e50-4a2d-8038-f50e50afbec0	7c96cd87-ec1a-41f2-9e06-bf05cf4869e4	\N	0c3ab199-73fa-4256-9808-766324404070	cmlq7po8x0000npcaphn2psck	2	0.00	0.0000	300.00	100.00	200.00	200.00	2026-02-17 12:57:32.618	2026-02-17 12:57:32.618
b2884c8b-1d57-4f4e-926f-f27574db0e2f	dfd0fb0f-8dcc-446d-972b-8e4a0b3f3301	f447e7bf-77f0-4631-88bc-86a352100e9a	0c3ab199-73fa-4256-9808-766324404070	cmlq7po8x0000npcaphn2psck	1	200.00	50.0000	200.00	50.00	150.00	300.00	2026-02-17 13:01:44.063	2026-02-17 13:01:44.063
0b8260f7-dde8-43fd-91ea-768d0aa11593	dfd0fb0f-8dcc-446d-972b-8e4a0b3f3301	\N	0c3ab199-73fa-4256-9808-766324404070	cmlq7po8x0000npcaphn2psck	1	0.00	0.0000	200.00	50.00	150.00	300.00	2026-02-17 13:01:44.063	2026-02-17 13:01:44.063
7ab65008-9d10-4119-adb8-f92d25a9c973	8c273228-7dac-4868-8a92-3bdd6c0af583	8f0e8541-1eac-46c1-b6d5-d34c2e5d9131	0c3ab199-73fa-4256-9808-766324404070	cmlq7po8x0000npcaphn2psck	1	120.00	50.0000	120.00	50.00	70.00	140.00	2026-02-17 13:02:34.482	2026-02-17 13:02:34.482
7ab7b8a2-0d14-4f99-80fe-6f35e02774aa	8c273228-7dac-4868-8a92-3bdd6c0af583	\N	0c3ab199-73fa-4256-9808-766324404070	cmlq7po8x0000npcaphn2psck	1	0.00	0.0000	120.00	50.00	70.00	140.00	2026-02-17 13:02:34.482	2026-02-17 13:02:34.482
45b7fc59-d68e-48b3-94b8-ea45bda51cfe	1496ce82-0148-4186-9ecb-a345177cbdf3	256bf1ff-afbd-48d2-b390-c24b03b89ef6	c0aab138-c0de-4ba5-bea5-fb4a742b0373	cmlq7po8x0000npcaphn2psck	20	800.00	600.0000	16000.00	12000.00	4000.00	33.33	2026-02-17 13:19:05.173	2026-02-17 13:19:05.173
03b9d830-2cf9-4e71-b186-d91180af3f1e	1496ce82-0148-4186-9ecb-a345177cbdf3	\N	c0aab138-c0de-4ba5-bea5-fb4a742b0373	cmlq7po8x0000npcaphn2psck	20	0.00	0.0000	16000.00	12000.00	4000.00	33.33	2026-02-17 13:19:05.173	2026-02-17 13:19:05.173
10db244b-faa2-42c4-ac5b-a3f66f3dede6	35ea1d14-b603-44d8-b711-10d8d9d5a966	ade4a41f-49e6-49cb-a832-68bbcd140a59	c0aab138-c0de-4ba5-bea5-fb4a742b0373	cmlq7po8x0000npcaphn2psck	20	900.00	600.0000	18000.00	12000.00	6000.00	50.00	2026-02-17 13:19:49.732	2026-02-17 13:19:49.732
6308dfb0-8a82-4694-b28c-ea431dd97afb	35ea1d14-b603-44d8-b711-10d8d9d5a966	\N	c0aab138-c0de-4ba5-bea5-fb4a742b0373	cmlq7po8x0000npcaphn2psck	20	0.00	0.0000	18000.00	12000.00	6000.00	50.00	2026-02-17 13:19:49.732	2026-02-17 13:19:49.732
039b2807-61f9-44fe-9da5-c303d0f504e4	a02f0e50-04ea-4f80-ad23-c28df5cf6977	3f5fecc0-dc31-4529-a70d-862bd061ea03	c0aab138-c0de-4ba5-bea5-fb4a742b0373	cmlq7po8x0000npcaphn2psck	10	100.00	600.0000	1000.00	6000.00	-5000.00	-83.33	2026-02-17 13:21:01.626	2026-02-17 13:21:01.626
67eed8af-b8ca-48be-ba6a-e7ec4bc5680e	a02f0e50-04ea-4f80-ad23-c28df5cf6977	\N	c0aab138-c0de-4ba5-bea5-fb4a742b0373	cmlq7po8x0000npcaphn2psck	10	0.00	0.0000	1000.00	6000.00	-5000.00	-83.33	2026-02-17 13:21:01.626	2026-02-17 13:21:01.626
d4a0b1bf-08d0-440e-bc88-9db6acb7a415	3a878c82-f5e3-4348-a89c-4759428e5f8c	c3c61aeb-f5f2-4892-9c94-59793d67233c	14672763-8a13-4394-b5c4-8181db1d7bfa	cmlq7po8x0000npcaphn2psck	2	150.00	150.0000	300.00	300.00	0.00	0.00	2026-02-17 13:25:53.832	2026-02-17 13:25:53.832
a9df45e7-c788-42da-9af0-c01b6aa5859e	3a878c82-f5e3-4348-a89c-4759428e5f8c	086b2a2b-096b-4583-b3c3-bb5b78981907	b367e0cf-82b0-44b5-946b-c68f80a72c94	cmlq7po8x0000npcaphn2psck	3	50.00	2000.0000	150.00	6000.00	-5850.00	-97.50	2026-02-17 13:25:53.832	2026-02-17 13:25:53.832
505adbdf-e43d-4ba9-a7a0-a0c63ca82148	3a878c82-f5e3-4348-a89c-4759428e5f8c	\N	14672763-8a13-4394-b5c4-8181db1d7bfa	cmlq7po8x0000npcaphn2psck	5	0.00	0.0000	450.00	6300.00	-5850.00	-92.86	2026-02-17 13:25:53.832	2026-02-17 13:25:53.832
7f9ea383-f3e7-4b44-93d5-9e80723cdec7	a99f4d6b-9556-4f2e-8fbc-4f19c376829e	4988396e-3d21-4041-904e-7918fcca4c23	c0aab138-c0de-4ba5-bea5-fb4a742b0373	cmlq7po8x0000npcaphn2psck	30	200.00	600.0000	6000.00	18000.00	-12000.00	-66.67	2026-02-17 13:28:10.194	2026-02-17 13:28:10.194
2404cbfc-c668-41c5-b681-d92b4c161b58	a99f4d6b-9556-4f2e-8fbc-4f19c376829e	\N	c0aab138-c0de-4ba5-bea5-fb4a742b0373	cmlq7po8x0000npcaphn2psck	30	0.00	0.0000	6000.00	18000.00	-12000.00	-66.67	2026-02-17 13:28:10.194	2026-02-17 13:28:10.194
60157fea-d68e-4deb-99d4-e0c6aa5cc154	0e5df291-d2e5-4a9f-bcc6-5126c3b6427d	4c2bac30-b4d0-4cda-959e-a8dc0db0c7ae	b367e0cf-82b0-44b5-946b-c68f80a72c94	cmlq7po8x0000npcaphn2psck	5	10.00	2000.0000	50.00	10000.00	-9950.00	-99.50	2026-02-17 13:37:50.356	2026-02-17 13:37:50.356
44a743e1-c8fb-4811-a131-20d4c3f443cb	0e5df291-d2e5-4a9f-bcc6-5126c3b6427d	\N	b367e0cf-82b0-44b5-946b-c68f80a72c94	cmlq7po8x0000npcaphn2psck	5	0.00	0.0000	50.00	10000.00	-9950.00	-99.50	2026-02-17 13:37:50.356	2026-02-17 13:37:50.356
71fb4974-2c84-4a1a-8097-1e4721286332	5a163ad0-7297-4fed-8cd4-7b40623f93a3	4a7e6d4f-0515-495d-b01f-4d192138df97	b367e0cf-82b0-44b5-946b-c68f80a72c94	cmlq7po8x0000npcaphn2psck	1	250.00	2000.0000	250.00	2000.00	-1750.00	-87.50	2026-02-17 13:53:22.118	2026-02-17 13:53:22.118
9a495ad7-8edc-4866-a6b1-a64da09a958e	5a163ad0-7297-4fed-8cd4-7b40623f93a3	\N	b367e0cf-82b0-44b5-946b-c68f80a72c94	cmlq7po8x0000npcaphn2psck	1	0.00	0.0000	250.00	2000.00	-1750.00	-87.50	2026-02-17 13:53:22.118	2026-02-17 13:53:22.118
a0ce1245-851a-4b91-9be8-4ba4b390114d	63683c35-3de0-419c-a19b-3cf0300dd7a7	727ee604-3dd2-4cf7-9bf1-c30d8f5f7a7d	b367e0cf-82b0-44b5-946b-c68f80a72c94	cmlq7po8x0000npcaphn2psck	1	400.00	2000.0000	400.00	2000.00	-1600.00	-80.00	2026-02-17 13:55:27.716	2026-02-17 13:55:27.716
0520aabe-99d3-427f-a1b8-0c13cdd6cebe	63683c35-3de0-419c-a19b-3cf0300dd7a7	\N	b367e0cf-82b0-44b5-946b-c68f80a72c94	cmlq7po8x0000npcaphn2psck	1	0.00	0.0000	400.00	2000.00	-1600.00	-80.00	2026-02-17 13:55:27.716	2026-02-17 13:55:27.716
3b338830-502d-4aa9-8049-d007cc96a1b5	cabcbb6b-9681-4309-b1fe-d6d94c64fcc4	df5fdfb5-d4da-4baa-aeec-86af8af34353	b367e0cf-82b0-44b5-946b-c68f80a72c94	cmlq7po8x0000npcaphn2psck	3	10.00	2000.0000	30.00	6000.00	-5970.00	-99.50	2026-02-17 14:00:20.31	2026-02-17 14:00:20.31
19bb480f-8715-44ef-919c-ae26931d6792	cabcbb6b-9681-4309-b1fe-d6d94c64fcc4	\N	b367e0cf-82b0-44b5-946b-c68f80a72c94	cmlq7po8x0000npcaphn2psck	3	0.00	0.0000	30.00	6000.00	-5970.00	-99.50	2026-02-17 14:00:20.31	2026-02-17 14:00:20.31
6ecb7e6f-737e-43df-a6a6-65eff9f0c84b	6b28ddb5-3144-4092-b3e8-e2a1822d71cb	1af0e0bf-05a3-409a-b3de-e6f6163574a7	b367e0cf-82b0-44b5-946b-c68f80a72c94	cmlq7po8x0000npcaphn2psck	1	240.00	2000.0000	240.00	2000.00	-1760.00	-88.00	2026-02-17 14:08:04.627	2026-02-17 14:08:04.627
99e09b89-ec2f-4f64-80a7-b8837d44430f	6b28ddb5-3144-4092-b3e8-e2a1822d71cb	\N	b367e0cf-82b0-44b5-946b-c68f80a72c94	cmlq7po8x0000npcaphn2psck	1	0.00	0.0000	240.00	2000.00	-1760.00	-88.00	2026-02-17 14:08:04.627	2026-02-17 14:08:04.627
80160b89-cca5-4131-a155-bc874fb6b069	a0d40ced-ce5f-4a3b-ab0d-604171b5c3e4	abd1f389-a3a2-43e4-835d-523d89ce4f72	c0aab138-c0de-4ba5-bea5-fb4a742b0373	cmlq7po8x0000npcaphn2psck	50	250.00	554.5455	12500.00	27727.27	-15227.27	-54.92	2026-02-17 14:24:21.442	2026-02-17 14:24:21.442
12255845-751f-44a4-8c3a-0ac8f823f783	a0d40ced-ce5f-4a3b-ab0d-604171b5c3e4	\N	c0aab138-c0de-4ba5-bea5-fb4a742b0373	cmlq7po8x0000npcaphn2psck	50	0.00	0.0000	12500.00	27727.27	-15227.27	-54.92	2026-02-17 14:24:21.442	2026-02-17 14:24:21.442
c690765a-44ad-428e-84bb-0abb76064e71	79996abe-a578-45a5-9563-fc64f286e571	c5be2abb-05e9-4eeb-8abf-a1143ec57eda	c0aab138-c0de-4ba5-bea5-fb4a742b0373	cmlq7po8x0000npcaphn2psck	20	20.00	554.5455	400.00	11090.91	-10690.91	-96.39	2026-02-17 14:49:22.331	2026-02-17 14:49:22.331
41551862-1848-4d16-968e-3c9b3722e56e	79996abe-a578-45a5-9563-fc64f286e571	\N	c0aab138-c0de-4ba5-bea5-fb4a742b0373	cmlq7po8x0000npcaphn2psck	20	0.00	0.0000	400.00	11090.91	-10690.91	-96.39	2026-02-17 14:49:22.331	2026-02-17 14:49:22.331
bb4d6a43-6b5d-4b0f-92ca-835d2974dacd	09b85125-ae41-4ca0-a67b-082d8b29e28d	97da47ed-1202-4e03-8eef-73bcb6acc4d1	c0aab138-c0de-4ba5-bea5-fb4a742b0373	cmlq7po8x0000npcaphn2psck	2	100.00	554.5455	200.00	1109.09	-909.09	-81.97	2026-02-17 15:01:39.804	2026-02-17 15:01:39.804
5dee4299-a411-4734-a0b5-698c18eec987	09b85125-ae41-4ca0-a67b-082d8b29e28d	\N	c0aab138-c0de-4ba5-bea5-fb4a742b0373	cmlq7po8x0000npcaphn2psck	2	0.00	0.0000	200.00	1109.09	-909.09	-81.97	2026-02-17 15:01:39.804	2026-02-17 15:01:39.804
\.


--
-- Data for Name: kasa_hareketler; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.kasa_hareketler (id, "kasaId", "hareketTipi", tutar, "komisyonTutari", "bsmvTutari", "netTutar", bakiye, "belgeTipi", "belgeNo", "cariId", aciklama, tarih, "transferEdildi", "transferTarihi", "createdBy", "createdAt") FROM stdin;
\.


--
-- Data for Name: kasalar; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.kasalar (id, "kasaKodu", "tenantId", "kasaAdi", "kasaTipi", bakiye, aktif, "createdBy", "updatedBy", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: locations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.locations (id, "warehouseId", layer, corridor, side, section, level, code, barcode, name, active, "createdAt", "updatedAt") FROM stdin;
ef86bc85-d0db-4f77-b825-97d39ac4c2cc	04a63d2a-19cf-4f65-b366-95087fe8f605	1	A	1	1	1	DEF-04a63d2a-19cf-4f65-b366-95087fe8f605	DEF-04a63d2a-19cf-4f65-b366-95087fe8f605	Genel Depo Alanı	t	2026-02-17 09:18:36.98	2026-02-17 09:18:36.98
1ef4946a-91d2-4887-bb1d-7e4efc851369	04a63d2a-19cf-4f65-b366-95087fe8f605	1	A	1	1	1	GENEL-01	GENEL-01	Genel Depo Alanı (Seyhan)	t	2026-02-17 09:27:27.44	2026-02-17 09:27:27.44
\.


--
-- Data for Name: maas_odeme_detaylari; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.maas_odeme_detaylari (id, "tenantId", "odemeId", "odemeTipi", tutar, "kasaId", "bankaHesapId", "referansNo", aciklama, "createdAt") FROM stdin;
\.


--
-- Data for Name: maas_odemeler; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.maas_odemeler (id, "tenantId", "planId", "personelId", tutar, tarih, aciklama, "createdBy", "createdAt") FROM stdin;
\.


--
-- Data for Name: maas_planlari; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.maas_planlari (id, "tenantId", "personelId", yil, ay, maas, prim, toplam, durum, "odenenTutar", "kalanTutar", aktif, aciklama, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: manager_approvals; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.manager_approvals (id, "tenantId", "workOrderId", "solutionPackageId", "approvedBy", "approvedAt", "approvalNote", "deletedAt") FROM stdin;
\.


--
-- Data for Name: manager_rejections; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.manager_rejections (id, "tenantId", "workOrderId", "solutionPackageId", "rejectedBy", "rejectedAt", "rejectionReason") FROM stdin;
\.


--
-- Data for Name: masraf_kategoriler; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.masraf_kategoriler (id, "kategoriAdi", aciklama, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: masraflar; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.masraflar (id, "tenantId", "kategoriId", aciklama, tutar, tarih, "odemeTipi", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: module_licenses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.module_licenses (id, "subscriptionId", "moduleId", quantity, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: modules; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.modules (id, name, slug, description, price, currency, "isActive", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payments (id, "subscriptionId", amount, currency, status, "iyzicoPaymentId", "iyzicoToken", "conversationId", "invoiceNumber", "invoiceUrl", "paidAt", "failedAt", "refundedAt", "errorCode", "errorMessage", "paymentMethod", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.permissions (id, module, action, description, "createdAt") FROM stdin;
\.


--
-- Data for Name: personel_odemeler; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.personel_odemeler (id, "personelId", tip, tutar, tarih, donem, aciklama, "kasaId", "createdBy", "createdAt") FROM stdin;
\.


--
-- Data for Name: personeller; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.personeller (id, "personelKodu", "tenantId", "tcKimlikNo", ad, soyad, "dogumTarihi", cinsiyet, "medeniDurum", telefon, email, adres, il, ilce, pozisyon, departman, "iseBaslamaTarihi", "istenCikisTarihi", aktif, maas, "maasGunu", "sgkNo", "ibanNo", bakiye, aciklama, "createdBy", "updatedBy", "createdAt", "updatedAt", prim) FROM stdin;
\.


--
-- Data for Name: plans; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.plans (id, name, slug, description, price, currency, "billingPeriod", "trialDays", "baseUserLimit", features, limits, "isActive", "isPopular", "isBasePlan", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: postal_codes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.postal_codes (id, city, district, neighborhood, "postalCode", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: price_cards; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.price_cards (id, stok_id, type, price, currency, effective_from, effective_to, note, created_by, updated_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: price_quotes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.price_quotes (id, "tenantId", "workOrderId", "quotedBy", "sentAt", "viewedAt", "approvedAt", "rejectedAt", "laborCost", "partsCost", "taxAmount", "totalCost", "discountAmount", "customerResponse", "customerNotes", "itemsBreakdown", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: product_barcodes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_barcodes (id, "productId", barcode, symbology, "isPrimary", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: product_location_stocks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_location_stocks (id, "warehouseId", "locationId", "productId", "qtyOnHand", "createdAt", "updatedAt") FROM stdin;
01e3b06e-579f-4f48-89bb-45a42ae69cbb	04a63d2a-19cf-4f65-b366-95087fe8f605	ef86bc85-d0db-4f77-b825-97d39ac4c2cc	0c3ab199-73fa-4256-9808-766324404070	10	2026-02-17 09:18:36.989	2026-02-17 09:18:36.989
7d2c06d6-7cce-4025-b9ce-5a312e74019e	04a63d2a-19cf-4f65-b366-95087fe8f605	ef86bc85-d0db-4f77-b825-97d39ac4c2cc	14672763-8a13-4394-b5c4-8181db1d7bfa	10	2026-02-17 09:18:37.007	2026-02-17 09:18:37.007
54933aa2-d562-47fe-b59a-5b4a2a588e44	04a63d2a-19cf-4f65-b366-95087fe8f605	1ef4946a-91d2-4887-bb1d-7e4efc851369	b367e0cf-82b0-44b5-946b-c68f80a72c94	20	2026-02-17 09:29:30.551	2026-02-17 09:29:30.551
\.


--
-- Data for Name: purchase_order_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.purchase_order_items (id, purchase_order_id, product_id, ordered_quantity, received_quantity, unit_price, status, created_at) FROM stdin;
\.


--
-- Data for Name: purchase_orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.purchase_orders (id, "orderNumber", "tenantId", supplier_id, order_date, expected_delivery_date, status, total_amount, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: raflar; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.raflar (id, "depoId", "rafKodu", aciklama, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: role_permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.role_permissions (id, "roleId", "permissionId", "createdAt") FROM stdin;
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.roles (id, name, description, "isSystemRole", "tenantId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: satin_alma_irsaliyeleri; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.satin_alma_irsaliyeleri (id, "irsaliyeNo", "irsaliyeTarihi", "tenantId", "cariId", "depoId", "kaynakTip", "kaynakId", durum, "toplamTutar", "kdvTutar", "genelToplam", iskonto, aciklama, "createdBy", "updatedBy", "deletedAt", "deletedBy", "createdAt", "updatedAt") FROM stdin;
c4ae5bda-3273-43bc-9193-4eba70081986	Aİ00001	2026-02-17 00:00:00	cmlq7po8x0000npcaphn2psck	f99631c1-40d5-4e7a-83a8-56bd9e8700ec	04a63d2a-19cf-4f65-b366-95087fe8f605	FATURA_OTOMATIK	\N	FATURALANDI	2000.00	400.00	2400.00	0.00	\N	892b2fc0-7ebe-4754-9c00-d09116a557cb	\N	\N	\N	2026-02-17 09:18:36.901	2026-02-17 09:18:36.901
69618ecd-7469-41e3-b918-224917c2dfff	Aİ00002	2026-02-17 00:00:00	cmlq7po8x0000npcaphn2psck	f99631c1-40d5-4e7a-83a8-56bd9e8700ec	04a63d2a-19cf-4f65-b366-95087fe8f605	FATURA_OTOMATIK	\N	FATURALANDI	40000.00	8000.00	48000.00	0.00	\N	892b2fc0-7ebe-4754-9c00-d09116a557cb	\N	\N	\N	2026-02-17 09:29:30.516	2026-02-17 09:29:30.516
06720d4d-6b1c-4ac3-85eb-a3ec3c5161ac	Aİ00003	2026-02-17 00:00:00	cmlq7po8x0000npcaphn2psck	f99631c1-40d5-4e7a-83a8-56bd9e8700ec	04a63d2a-19cf-4f65-b366-95087fe8f605	FATURA_OTOMATIK	\N	FATURALANDI	300000.00	60000.00	360000.00	0.00	\N	892b2fc0-7ebe-4754-9c00-d09116a557cb	\N	\N	\N	2026-02-17 10:04:47.397	2026-02-17 10:04:47.397
b6c21261-c0d7-4d0e-9f65-04a5c09d3860	Aİ00004	2026-02-17 00:00:00	cmlq7po8x0000npcaphn2psck	f99631c1-40d5-4e7a-83a8-56bd9e8700ec	04a63d2a-19cf-4f65-b366-95087fe8f605	FATURA_OTOMATIK	\N	FATURALANDI	5000.00	1000.00	6000.00	0.00	\N	892b2fc0-7ebe-4754-9c00-d09116a557cb	\N	\N	\N	2026-02-17 13:58:26.968	2026-02-17 13:58:26.968
80c32f90-ba5e-4418-ba1d-670b5cf30816	Aİ00005	2026-02-17 00:00:00	cmlq7po8x0000npcaphn2psck	f99631c1-40d5-4e7a-83a8-56bd9e8700ec	04a63d2a-19cf-4f65-b366-95087fe8f605	FATURA_OTOMATIK	\N	FATURALANDI	4590.00	918.00	5508.00	0.00	\N	892b2fc0-7ebe-4754-9c00-d09116a557cb	\N	\N	\N	2026-02-17 15:40:42.892	2026-02-17 15:40:42.892
\.


--
-- Data for Name: satin_alma_irsaliyesi_kalemleri; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.satin_alma_irsaliyesi_kalemleri (id, "irsaliyeId", "stokId", miktar, "birimFiyat", "kdvOrani", "kdvTutar", tutar, "createdAt") FROM stdin;
2882b8c4-46b5-4106-a199-2db7afbbb511	c4ae5bda-3273-43bc-9193-4eba70081986	0c3ab199-73fa-4256-9808-766324404070	10	50.00	20	100.00	500.00	2026-02-17 09:18:36.901
96305e89-cb31-4e96-ba4d-7693f5b3d601	c4ae5bda-3273-43bc-9193-4eba70081986	14672763-8a13-4394-b5c4-8181db1d7bfa	10	150.00	20	300.00	1500.00	2026-02-17 09:18:36.901
12367969-2763-4151-9bd9-a846934a6dfe	69618ecd-7469-41e3-b918-224917c2dfff	b367e0cf-82b0-44b5-946b-c68f80a72c94	20	2000.00	20	8000.00	40000.00	2026-02-17 09:29:30.516
30184e4f-7314-49f0-aa48-64e22d23df9f	06720d4d-6b1c-4ac3-85eb-a3ec3c5161ac	c0aab138-c0de-4ba5-bea5-fb4a742b0373	500	600.00	20	60000.00	300000.00	2026-02-17 10:04:47.397
39ec8bce-f1b7-4f0c-a6fd-209ca654a1e2	b6c21261-c0d7-4d0e-9f65-04a5c09d3860	c0aab138-c0de-4ba5-bea5-fb4a742b0373	50	100.00	20	1000.00	5000.00	2026-02-17 13:58:26.968
015443c5-5317-49fa-b63d-9f744f742720	80c32f90-ba5e-4418-ba1d-670b5cf30816	c0aab138-c0de-4ba5-bea5-fb4a742b0373	12	450.00	20	918.00	4590.00	2026-02-17 15:40:42.892
\.


--
-- Data for Name: satin_alma_irsaliyesi_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.satin_alma_irsaliyesi_logs (id, "irsaliyeId", "userId", "actionType", changes, "ipAddress", "userAgent", "createdAt") FROM stdin;
\.


--
-- Data for Name: satin_alma_siparis_kalemleri; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.satin_alma_siparis_kalemleri (id, "satınAlmaSiparisId", "stokId", miktar, "sevkEdilenMiktar", "birimFiyat", "kdvOrani", "kdvTutar", tutar, "createdAt") FROM stdin;
\.


--
-- Data for Name: satin_alma_siparis_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.satin_alma_siparis_logs (id, "satınAlmaSiparisId", "userId", "actionType", changes, "ipAddress", "userAgent", "createdAt") FROM stdin;
\.


--
-- Data for Name: satin_alma_siparisleri; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.satin_alma_siparisleri (id, "siparisNo", "tenantId", "cariId", tarih, vade, iskonto, "toplamTutar", "kdvTutar", "genelToplam", aciklama, durum, "faturaNo", "createdBy", "updatedBy", "deletedAt", "deletedBy", "createdAt", "updatedAt", "deliveryNoteId") FROM stdin;
\.


--
-- Data for Name: satis_elemanlari; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.satis_elemanlari (id, "adSoyad", telefon, email, aktif, "tenantId", "createdAt", "updatedAt") FROM stdin;
a000a7ad-46cf-4ca1-b0c9-f9fd8192022b	FIRAT YİĞİTCAN	\N	\N	t	cmlq7po8x0000npcaphn2psck	2026-02-17 12:15:51.414	2026-02-17 12:15:51.414
\.


--
-- Data for Name: satis_irsaliyeleri; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.satis_irsaliyeleri (id, "irsaliyeNo", "irsaliyeTarihi", "tenantId", "cariId", "depoId", "kaynakTip", "kaynakId", durum, "toplamTutar", "kdvTutar", "genelToplam", iskonto, aciklama, "createdBy", "updatedBy", "deletedAt", "deletedBy", "createdAt", "updatedAt") FROM stdin;
4830b0e1-ecf4-4ad2-8cf8-f8516d242a8c	Sİ00001	2026-02-17 00:00:00	cmlq7po8x0000npcaphn2psck	f99631c1-40d5-4e7a-83a8-56bd9e8700ec	04a63d2a-19cf-4f65-b366-95087fe8f605	FATURA_OTOMATIK	\N	FATURALANDI	1235.00	247.00	1482.00	0.00	\N	892b2fc0-7ebe-4754-9c00-d09116a557cb	\N	\N	\N	2026-02-17 12:17:30.314	2026-02-17 12:17:30.314
ff0ff229-29e1-42dd-84cd-507e2f98d6c8	Sİ00002	2026-02-17 00:00:00	cmlq7po8x0000npcaphn2psck	f99631c1-40d5-4e7a-83a8-56bd9e8700ec	04a63d2a-19cf-4f65-b366-95087fe8f605	FATURA_OTOMATIK	\N	FATURALANDI	300.00	60.00	360.00	0.00	\N	892b2fc0-7ebe-4754-9c00-d09116a557cb	\N	\N	\N	2026-02-17 12:57:32.571	2026-02-17 12:57:32.571
bfc4826c-393e-4d7d-8e18-94da6ce899ac	Sİ00003	2026-02-17 00:00:00	cmlq7po8x0000npcaphn2psck	f99631c1-40d5-4e7a-83a8-56bd9e8700ec	04a63d2a-19cf-4f65-b366-95087fe8f605	FATURA_OTOMATIK	\N	FATURALANDI	200.00	40.00	240.00	0.00	\N	892b2fc0-7ebe-4754-9c00-d09116a557cb	\N	\N	\N	2026-02-17 13:01:44.023	2026-02-17 13:01:44.023
2c7c4336-c361-44a3-b3aa-2aeaace174e6	Sİ00004	2026-02-17 00:00:00	cmlq7po8x0000npcaphn2psck	f99631c1-40d5-4e7a-83a8-56bd9e8700ec	04a63d2a-19cf-4f65-b366-95087fe8f605	FATURA_OTOMATIK	\N	FATURALANDI	120.00	24.00	144.00	0.00	\N	892b2fc0-7ebe-4754-9c00-d09116a557cb	\N	\N	\N	2026-02-17 13:02:34.431	2026-02-17 13:02:34.431
10649cfe-d518-4459-a9c0-5ef21d10ac65	Sİ00008	2026-02-17 00:00:00	cmlq7po8x0000npcaphn2psck	f99631c1-40d5-4e7a-83a8-56bd9e8700ec	04a63d2a-19cf-4f65-b366-95087fe8f605	FATURA_OTOMATIK	\N	FATURALANDI	16000.00	3200.00	19200.00	0.00	\N	892b2fc0-7ebe-4754-9c00-d09116a557cb	\N	\N	\N	2026-02-17 13:19:05.12	2026-02-17 13:19:05.12
ad72b3f4-60c5-4c0b-93a9-2bc65162a0b1	Sİ00009	2026-02-17 00:00:00	cmlq7po8x0000npcaphn2psck	f99631c1-40d5-4e7a-83a8-56bd9e8700ec	04a63d2a-19cf-4f65-b366-95087fe8f605	FATURA_OTOMATIK	\N	FATURALANDI	18000.00	3600.00	21600.00	0.00	\N	892b2fc0-7ebe-4754-9c00-d09116a557cb	\N	\N	\N	2026-02-17 13:19:49.685	2026-02-17 13:19:49.685
945392cb-eb02-46bb-a41d-9fc89054d40b	Sİ00010	2026-02-17 00:00:00	cmlq7po8x0000npcaphn2psck	f99631c1-40d5-4e7a-83a8-56bd9e8700ec	04a63d2a-19cf-4f65-b366-95087fe8f605	FATURA_OTOMATIK	\N	FATURALANDI	1000.00	200.00	1200.00	0.00	\N	892b2fc0-7ebe-4754-9c00-d09116a557cb	\N	\N	\N	2026-02-17 13:21:01.578	2026-02-17 13:21:01.578
dd28aaa8-806a-4957-9181-2d2f07d5b52f	Sİ00011	2026-02-17 00:00:00	cmlq7po8x0000npcaphn2psck	f99631c1-40d5-4e7a-83a8-56bd9e8700ec	04a63d2a-19cf-4f65-b366-95087fe8f605	FATURA_OTOMATIK	\N	FATURALANDI	450.00	90.00	540.00	0.00	\N	892b2fc0-7ebe-4754-9c00-d09116a557cb	\N	\N	\N	2026-02-17 13:25:53.773	2026-02-17 13:25:53.773
389e389b-0bc9-475c-94a8-024a4207f72e	Sİ00012	2026-02-17 00:00:00	cmlq7po8x0000npcaphn2psck	f99631c1-40d5-4e7a-83a8-56bd9e8700ec	04a63d2a-19cf-4f65-b366-95087fe8f605	FATURA_OTOMATIK	\N	FATURALANDI	6000.00	1200.00	7200.00	0.00	\N	892b2fc0-7ebe-4754-9c00-d09116a557cb	\N	\N	\N	2026-02-17 13:28:10.155	2026-02-17 13:28:10.155
2cbb9431-340d-45de-9e4b-4caa64475ecc	Sİ00013	2026-02-17 00:00:00	cmlq7po8x0000npcaphn2psck	f99631c1-40d5-4e7a-83a8-56bd9e8700ec	04a63d2a-19cf-4f65-b366-95087fe8f605	FATURA_OTOMATIK	\N	FATURALANDI	50.00	10.00	60.00	0.00	\N	892b2fc0-7ebe-4754-9c00-d09116a557cb	\N	\N	\N	2026-02-17 13:37:50.316	2026-02-17 13:37:50.316
7532b038-eef1-4da4-829a-0e37a4b3b72a	Sİ00014	2026-02-17 00:00:00	cmlq7po8x0000npcaphn2psck	f99631c1-40d5-4e7a-83a8-56bd9e8700ec	04a63d2a-19cf-4f65-b366-95087fe8f605	FATURA_OTOMATIK	\N	FATURALANDI	250.00	50.00	300.00	0.00	\N	892b2fc0-7ebe-4754-9c00-d09116a557cb	\N	\N	\N	2026-02-17 13:53:22.078	2026-02-17 13:53:22.078
a46f82b2-b61a-4669-ab5c-5580b7b4706c	Sİ00015	2026-02-17 00:00:00	cmlq7po8x0000npcaphn2psck	f99631c1-40d5-4e7a-83a8-56bd9e8700ec	04a63d2a-19cf-4f65-b366-95087fe8f605	FATURA_OTOMATIK	\N	FATURALANDI	400.00	80.00	480.00	0.00	\N	892b2fc0-7ebe-4754-9c00-d09116a557cb	\N	\N	\N	2026-02-17 13:55:27.686	2026-02-17 13:55:27.686
77dd2eaf-2de9-4819-b4b8-01daf6a3068f	Sİ00016	2026-02-17 00:00:00	cmlq7po8x0000npcaphn2psck	f99631c1-40d5-4e7a-83a8-56bd9e8700ec	04a63d2a-19cf-4f65-b366-95087fe8f605	FATURA_OTOMATIK	\N	FATURALANDI	30.00	6.00	36.00	0.00	\N	892b2fc0-7ebe-4754-9c00-d09116a557cb	\N	\N	\N	2026-02-17 14:00:20.275	2026-02-17 14:00:20.275
bee2d804-568a-4a15-8eae-b3ff82e4a0b0	Sİ00017	2026-02-17 00:00:00	cmlq7po8x0000npcaphn2psck	f99631c1-40d5-4e7a-83a8-56bd9e8700ec	04a63d2a-19cf-4f65-b366-95087fe8f605	FATURA_OTOMATIK	\N	FATURALANDI	240.00	48.00	288.00	0.00	\N	892b2fc0-7ebe-4754-9c00-d09116a557cb	\N	\N	\N	2026-02-17 14:08:04.586	2026-02-17 14:08:04.586
395602bc-f4e5-41e0-8a73-b4d86c02b9a9	Sİ00018	2026-02-17 00:00:00	cmlq7po8x0000npcaphn2psck	f99631c1-40d5-4e7a-83a8-56bd9e8700ec	04a63d2a-19cf-4f65-b366-95087fe8f605	FATURA_OTOMATIK	\N	FATURALANDI	12500.00	2500.00	15000.00	0.00	\N	892b2fc0-7ebe-4754-9c00-d09116a557cb	\N	\N	\N	2026-02-17 14:24:21.396	2026-02-17 14:24:21.396
d5fed480-dd72-424e-9227-e46be98f2be4	Sİ00019	2026-02-17 00:00:00	cmlq7po8x0000npcaphn2psck	f99631c1-40d5-4e7a-83a8-56bd9e8700ec	04a63d2a-19cf-4f65-b366-95087fe8f605	FATURA_OTOMATIK	\N	FATURALANDI	400.00	80.00	480.00	0.00	\N	892b2fc0-7ebe-4754-9c00-d09116a557cb	\N	\N	\N	2026-02-17 14:49:22.288	2026-02-17 14:49:22.288
19ba9427-3660-46f2-b919-7fc953b47389	Sİ00020	2026-02-17 00:00:00	cmlq7po8x0000npcaphn2psck	f99631c1-40d5-4e7a-83a8-56bd9e8700ec	04a63d2a-19cf-4f65-b366-95087fe8f605	FATURA_OTOMATIK	\N	FATURALANDI	150.00	30.00	180.00	0.00	\N	892b2fc0-7ebe-4754-9c00-d09116a557cb	\N	\N	\N	2026-02-17 15:01:39.758	2026-02-17 15:01:39.758
\.


--
-- Data for Name: satis_irsaliyesi_kalemleri; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.satis_irsaliyesi_kalemleri (id, "irsaliyeId", "stokId", miktar, "birimFiyat", "kdvOrani", "kdvTutar", tutar, "faturalananMiktar", "createdAt") FROM stdin;
a10a8e7b-3c0d-4111-b160-4a59d7d34a74	4830b0e1-ecf4-4ad2-8cf8-f8516d242a8c	c0aab138-c0de-4ba5-bea5-fb4a742b0373	20	50.00	20	200.00	1000.00	0	2026-02-17 12:17:30.314
01aa87c7-cf3c-4952-aa14-5d7bdc09cd14	4830b0e1-ecf4-4ad2-8cf8-f8516d242a8c	0c3ab199-73fa-4256-9808-766324404070	1	75.00	20	15.00	75.00	0	2026-02-17 12:17:30.314
a6f18fd4-7e39-40cf-ad0e-2c556b675820	4830b0e1-ecf4-4ad2-8cf8-f8516d242a8c	b367e0cf-82b0-44b5-946b-c68f80a72c94	2	80.00	20	32.00	160.00	0	2026-02-17 12:17:30.314
4e1e23c4-1b20-480b-9141-9540002d4c8f	ff0ff229-29e1-42dd-84cd-507e2f98d6c8	0c3ab199-73fa-4256-9808-766324404070	2	150.00	20	60.00	300.00	0	2026-02-17 12:57:32.571
1e16b516-a2a8-4a5a-b2b8-bed19f881842	bfc4826c-393e-4d7d-8e18-94da6ce899ac	0c3ab199-73fa-4256-9808-766324404070	1	200.00	20	40.00	200.00	0	2026-02-17 13:01:44.023
239fe8b9-4c3a-4f2e-b3b8-31f2aeb2eb01	2c7c4336-c361-44a3-b3aa-2aeaace174e6	0c3ab199-73fa-4256-9808-766324404070	1	120.00	20	24.00	120.00	0	2026-02-17 13:02:34.431
fa7b02bf-4e57-410b-8824-4ab056d2b01b	10649cfe-d518-4459-a9c0-5ef21d10ac65	c0aab138-c0de-4ba5-bea5-fb4a742b0373	20	800.00	20	3200.00	16000.00	0	2026-02-17 13:19:05.12
80c2f80d-379c-41e5-b2f0-59b37fb4cf13	ad72b3f4-60c5-4c0b-93a9-2bc65162a0b1	c0aab138-c0de-4ba5-bea5-fb4a742b0373	20	900.00	20	3600.00	18000.00	0	2026-02-17 13:19:49.685
4c745044-ad7e-45b2-857b-c2b8eabfd869	945392cb-eb02-46bb-a41d-9fc89054d40b	c0aab138-c0de-4ba5-bea5-fb4a742b0373	10	100.00	20	200.00	1000.00	0	2026-02-17 13:21:01.578
8cfffb7a-cb92-4ec7-9132-1640c1b984e8	dd28aaa8-806a-4957-9181-2d2f07d5b52f	14672763-8a13-4394-b5c4-8181db1d7bfa	2	150.00	20	60.00	300.00	0	2026-02-17 13:25:53.773
f9319f22-70c5-4412-8cb3-4904ec8580ec	dd28aaa8-806a-4957-9181-2d2f07d5b52f	b367e0cf-82b0-44b5-946b-c68f80a72c94	3	50.00	20	30.00	150.00	0	2026-02-17 13:25:53.773
a6cda213-a33e-4676-b13c-145c2261545d	389e389b-0bc9-475c-94a8-024a4207f72e	c0aab138-c0de-4ba5-bea5-fb4a742b0373	30	200.00	20	1200.00	6000.00	0	2026-02-17 13:28:10.155
4d79b955-1185-400e-8ed5-f98eda64e2bc	2cbb9431-340d-45de-9e4b-4caa64475ecc	b367e0cf-82b0-44b5-946b-c68f80a72c94	5	10.00	20	10.00	50.00	0	2026-02-17 13:37:50.316
1692730a-bd64-4a58-984c-dec12fbcb436	7532b038-eef1-4da4-829a-0e37a4b3b72a	b367e0cf-82b0-44b5-946b-c68f80a72c94	1	250.00	20	50.00	250.00	0	2026-02-17 13:53:22.078
9def992a-a2c3-4548-bdee-f0a204922a88	a46f82b2-b61a-4669-ab5c-5580b7b4706c	b367e0cf-82b0-44b5-946b-c68f80a72c94	1	400.00	20	80.00	400.00	0	2026-02-17 13:55:27.686
3e5a67f6-1123-4df5-a4a0-dc983ded8912	77dd2eaf-2de9-4819-b4b8-01daf6a3068f	b367e0cf-82b0-44b5-946b-c68f80a72c94	3	10.00	20	6.00	30.00	0	2026-02-17 14:00:20.275
60ba577f-fecc-4036-b24e-c60d0f05135f	bee2d804-568a-4a15-8eae-b3ff82e4a0b0	b367e0cf-82b0-44b5-946b-c68f80a72c94	1	240.00	20	48.00	240.00	0	2026-02-17 14:08:04.586
6b5bfc41-4e9e-413e-9473-c56281e711d4	395602bc-f4e5-41e0-8a73-b4d86c02b9a9	c0aab138-c0de-4ba5-bea5-fb4a742b0373	50	250.00	20	2500.00	12500.00	0	2026-02-17 14:24:21.396
ee7bd966-70f5-4496-8144-65d53bf6858a	d5fed480-dd72-424e-9227-e46be98f2be4	c0aab138-c0de-4ba5-bea5-fb4a742b0373	20	20.00	20	80.00	400.00	0	2026-02-17 14:49:22.288
2d27c75e-6e5d-476e-b7ae-c3c5622adf28	19ba9427-3660-46f2-b919-7fc953b47389	c0aab138-c0de-4ba5-bea5-fb4a742b0373	2	100.00	20	30.00	150.00	0	2026-02-17 15:01:39.758
\.


--
-- Data for Name: satis_irsaliyesi_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.satis_irsaliyesi_logs (id, "irsaliyeId", "userId", "actionType", changes, "ipAddress", "userAgent", "createdAt") FROM stdin;
\.


--
-- Data for Name: sayim_kalemleri; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sayim_kalemleri (id, "sayimId", "stokId", "locationId", "sistemMiktari", "sayilanMiktar", "farkMiktari", "createdAt") FROM stdin;
\.


--
-- Data for Name: sayimlar; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sayimlar (id, "sayimNo", "tenantId", "sayimTipi", tarih, durum, aciklama, "createdBy", "updatedBy", "onaylayanId", "onayTarihi", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sessions (id, "userId", token, "refreshToken", "ipAddress", "userAgent", "expiresAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: siparis_hazirliklar; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.siparis_hazirliklar (id, "siparisId", "siparisKalemiId", "locationId", miktar, hazirlayan, "createdAt") FROM stdin;
\.


--
-- Data for Name: siparis_kalemleri; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.siparis_kalemleri (id, "siparisId", "stokId", miktar, "sevkEdilenMiktar", "birimFiyat", "kdvOrani", "kdvTutar", tutar, "createdAt") FROM stdin;
\.


--
-- Data for Name: siparis_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.siparis_logs (id, "siparisId", "userId", "actionType", changes, "ipAddress", "userAgent", "createdAt") FROM stdin;
\.


--
-- Data for Name: siparisler; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.siparisler (id, "siparisNo", "tenantId", "siparisTipi", "cariId", tarih, vade, iskonto, "toplamTutar", "kdvTutar", "genelToplam", aciklama, durum, "faturaNo", "deliveryNoteId", "createdBy", "updatedBy", "deletedAt", "deletedBy", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: solution_package_parts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.solution_package_parts (id, "solutionPackageId", "productId", quantity) FROM stdin;
\.


--
-- Data for Name: solution_packages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.solution_packages (id, "tenantId", "workOrderId", name, description, "estimatedDurationMinutes", "createdAt", "updatedAt", version) FROM stdin;
\.


--
-- Data for Name: stock_cost_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock_cost_history (id, stok_id, cost, method, computed_at, marka, "anaKategori", "altKategori", note) FROM stdin;
7653c220-c64f-490a-b0a4-fd14894d9fc2	0c3ab199-73fa-4256-9808-766324404070	50.0000	WEIGHTED_AVERAGE	2026-02-17 09:18:37.05	\N	\N	\N	\N
51f8738e-59af-4b41-8f52-5a473d3a79f0	14672763-8a13-4394-b5c4-8181db1d7bfa	150.0000	WEIGHTED_AVERAGE	2026-02-17 09:18:37.05	\N	\N	\N	\N
1b96a113-187e-4225-9786-0744ec87f010	b367e0cf-82b0-44b5-946b-c68f80a72c94	2000.0000	WEIGHTED_AVERAGE	2026-02-17 09:29:30.582	\N	\N	\N	\N
6a9f1ec4-140b-4e8a-8927-d745688ae8e7	c0aab138-c0de-4ba5-bea5-fb4a742b0373	600.0000	WEIGHTED_AVERAGE	2026-02-17 10:04:47.454	\N	\N	\N	\N
0574605a-6642-4a54-8502-adaf95a08d62	c0aab138-c0de-4ba5-bea5-fb4a742b0373	554.5455	WEIGHTED_AVERAGE	2026-02-17 13:58:27.023	\N	\N	\N	\N
e57ce499-fb85-45b9-9976-11ace1d8d772	c0aab138-c0de-4ba5-bea5-fb4a742b0373	550.8719	WEIGHTED_AVERAGE	2026-02-17 15:40:42.956	\N	\N	\N	\N
\.


--
-- Data for Name: stock_moves; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock_moves (id, "productId", "fromWarehouseId", "fromLocationId", "toWarehouseId", "toLocationId", qty, "moveType", "refType", "refId", note, "createdAt", "createdBy") FROM stdin;
4fa3ae62-7582-45a6-aeff-663152f6a0bc	0c3ab199-73fa-4256-9808-766324404070	\N	\N	04a63d2a-19cf-4f65-b366-95087fe8f605	ef86bc85-d0db-4f77-b825-97d39ac4c2cc	10	PUT_AWAY	Fatura	70f1d748-e48a-446d-b865-c5cdee7f0ff7	Alış Faturası: AF-2026-001	2026-02-17 09:18:36.994	892b2fc0-7ebe-4754-9c00-d09116a557cb
544043d0-0288-420f-9ddd-0892239f9ff9	14672763-8a13-4394-b5c4-8181db1d7bfa	\N	\N	04a63d2a-19cf-4f65-b366-95087fe8f605	ef86bc85-d0db-4f77-b825-97d39ac4c2cc	10	PUT_AWAY	Fatura	70f1d748-e48a-446d-b865-c5cdee7f0ff7	Alış Faturası: AF-2026-001	2026-02-17 09:18:37.008	892b2fc0-7ebe-4754-9c00-d09116a557cb
74af3a1a-26dd-4e4f-85ac-5bd9e45ce8f6	b367e0cf-82b0-44b5-946b-c68f80a72c94	\N	\N	04a63d2a-19cf-4f65-b366-95087fe8f605	1ef4946a-91d2-4887-bb1d-7e4efc851369	20	PUT_AWAY	Fatura	79e82509-349f-4cb3-a0ce-2d29c512889f	Alış Faturası: AF-2026-002	2026-02-17 09:29:30.552	892b2fc0-7ebe-4754-9c00-d09116a557cb
\.


--
-- Data for Name: stok_esdegers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stok_esdegers (id, "stok1Id", "stok2Id", "createdAt") FROM stdin;
\.


--
-- Data for Name: stok_hareketleri; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stok_hareketleri (id, "stokId", "hareketTipi", miktar, "birimFiyat", aciklama, "createdAt", "warehouseId", "tenantId") FROM stdin;
692c9d46-1bc9-404d-be5e-97c7bf2e54d0	0c3ab199-73fa-4256-9808-766324404070	GIRIS	10	50.00	Alış Faturası: AF-2026-001	2026-02-17 09:18:36.965	04a63d2a-19cf-4f65-b366-95087fe8f605	\N
3378d482-9a1b-43ea-acca-3efa0273987f	14672763-8a13-4394-b5c4-8181db1d7bfa	GIRIS	10	150.00	Alış Faturası: AF-2026-001	2026-02-17 09:18:36.969	04a63d2a-19cf-4f65-b366-95087fe8f605	\N
feda97c4-8a74-4a5d-a387-d2d89d9a5df4	b367e0cf-82b0-44b5-946b-c68f80a72c94	GIRIS	20	2000.00	Alış Faturası: AF-2026-002	2026-02-17 09:29:30.541	04a63d2a-19cf-4f65-b366-95087fe8f605	\N
bebd84a8-4760-46b9-93b3-3d2fd9d6bc22	c0aab138-c0de-4ba5-bea5-fb4a742b0373	GIRIS	500	600.00	Alış Faturası: AF-2026-003	2026-02-17 10:04:47.421	04a63d2a-19cf-4f65-b366-95087fe8f605	\N
efa0d223-57fd-4b53-959a-f9a8ba29c453	c0aab138-c0de-4ba5-bea5-fb4a742b0373	SATIS	20	50.00	Satış Faturası: SF00004	2026-02-17 12:17:30.358	04a63d2a-19cf-4f65-b366-95087fe8f605	\N
2b543437-e2ad-462f-9b27-8e35eb85a0f2	0c3ab199-73fa-4256-9808-766324404070	SATIS	1	75.00	Satış Faturası: SF00004	2026-02-17 12:17:30.361	04a63d2a-19cf-4f65-b366-95087fe8f605	\N
852b7252-3c4b-42d7-910a-f9a4f01d8d77	b367e0cf-82b0-44b5-946b-c68f80a72c94	SATIS	2	80.00	Satış Faturası: SF00004	2026-02-17 12:17:30.362	04a63d2a-19cf-4f65-b366-95087fe8f605	\N
7a49ad06-de16-4776-a3a4-f7898451b1ab	0c3ab199-73fa-4256-9808-766324404070	SATIS	2	150.00	Satış Faturası: SF00006	2026-02-17 12:57:32.595	04a63d2a-19cf-4f65-b366-95087fe8f605	\N
d428762d-07b0-4378-afda-fc5724610cca	0c3ab199-73fa-4256-9808-766324404070	SATIS	1	200.00	Satış Faturası: SF00008	2026-02-17 13:01:44.047	04a63d2a-19cf-4f65-b366-95087fe8f605	\N
5c79c647-f998-4ae6-84b7-d0a4605da253	0c3ab199-73fa-4256-9808-766324404070	SATIS	1	120.00	Satış Faturası: SF00010	2026-02-17 13:02:34.462	04a63d2a-19cf-4f65-b366-95087fe8f605	\N
7c94edf3-b4b0-4e79-8237-72ca4fec9f09	c0aab138-c0de-4ba5-bea5-fb4a742b0373	SATIS	20	800.00	Satış Faturası: SF00013	2026-02-17 13:19:05.15	04a63d2a-19cf-4f65-b366-95087fe8f605	\N
02267ff1-042e-4c85-9b49-dcd83f7b6838	c0aab138-c0de-4ba5-bea5-fb4a742b0373	SATIS	20	900.00	Satış Faturası: SF00015	2026-02-17 13:19:49.712	04a63d2a-19cf-4f65-b366-95087fe8f605	\N
3f839285-f0a3-4683-aada-c242980d4682	c0aab138-c0de-4ba5-bea5-fb4a742b0373	SATIS	10	100.00	Satış Faturası: SF00017	2026-02-17 13:21:01.605	04a63d2a-19cf-4f65-b366-95087fe8f605	\N
fc3463af-1b97-44f6-a960-3bd5a3e4382a	14672763-8a13-4394-b5c4-8181db1d7bfa	SATIS	2	150.00	Satış Faturası: SF00019	2026-02-17 13:25:53.801	04a63d2a-19cf-4f65-b366-95087fe8f605	\N
56f66e9d-4833-4f97-843d-ffa90c505360	b367e0cf-82b0-44b5-946b-c68f80a72c94	SATIS	3	50.00	Satış Faturası: SF00019	2026-02-17 13:25:53.803	04a63d2a-19cf-4f65-b366-95087fe8f605	\N
230c58f2-7076-48fa-9f73-2c764fe5cedb	c0aab138-c0de-4ba5-bea5-fb4a742b0373	SATIS	30	200.00	Satış Faturası: SF00021	2026-02-17 13:28:10.178	04a63d2a-19cf-4f65-b366-95087fe8f605	\N
6dfd6554-a0db-43eb-be44-e2617bce47c3	b367e0cf-82b0-44b5-946b-c68f80a72c94	SATIS	5	10.00	Satış Faturası: SF00023	2026-02-17 13:37:50.341	04a63d2a-19cf-4f65-b366-95087fe8f605	\N
3db2dbdb-e8a2-43f8-a8da-9abc6447eabd	b367e0cf-82b0-44b5-946b-c68f80a72c94	SATIS	1	250.00	Satış Faturası: SF00025	2026-02-17 13:53:22.099	04a63d2a-19cf-4f65-b366-95087fe8f605	\N
54b060ac-9c4d-4dcd-bd33-d7a4e7302c30	b367e0cf-82b0-44b5-946b-c68f80a72c94	SATIS	1	400.00	Satış Faturası: SF00027	2026-02-17 13:55:27.702	04a63d2a-19cf-4f65-b366-95087fe8f605	\N
39cc0b7a-5445-4670-bbd2-30e6517f745f	c0aab138-c0de-4ba5-bea5-fb4a742b0373	GIRIS	50	100.00	Alış Faturası: AF-2026-004	2026-02-17 13:58:26.998	04a63d2a-19cf-4f65-b366-95087fe8f605	\N
c10db4a6-eec3-40fe-9505-b21cb6ac4dcb	b367e0cf-82b0-44b5-946b-c68f80a72c94	SATIS	3	10.00	Satış Faturası: SF00029	2026-02-17 14:00:20.297	04a63d2a-19cf-4f65-b366-95087fe8f605	\N
1c8efdbf-f7f9-4de5-9735-d75ccc0e0d81	b367e0cf-82b0-44b5-946b-c68f80a72c94	SATIS	1	240.00	Satış Faturası: SF00031	2026-02-17 14:08:04.61	04a63d2a-19cf-4f65-b366-95087fe8f605	\N
c77b8c17-7c86-419c-b4cc-4268913ca3b4	c0aab138-c0de-4ba5-bea5-fb4a742b0373	SATIS	50	250.00	Satış Faturası: SF00033	2026-02-17 14:24:21.422	04a63d2a-19cf-4f65-b366-95087fe8f605	\N
5090b234-7728-4d56-a196-c9be9cdbc800	c0aab138-c0de-4ba5-bea5-fb4a742b0373	SATIS	20	20.00	Satış Faturası: SF00036	2026-02-17 14:49:22.308	04a63d2a-19cf-4f65-b366-95087fe8f605	\N
1067332c-53ad-4ce2-97e2-c7d84a07dace	c0aab138-c0de-4ba5-bea5-fb4a742b0373	SATIS	2	100.00	Satış Faturası: SF00038	2026-02-17 15:01:39.784	04a63d2a-19cf-4f65-b366-95087fe8f605	\N
f08cbb4d-6197-42c4-8dbc-bfbd117ad011	c0aab138-c0de-4ba5-bea5-fb4a742b0373	GIRIS	12	450.00	Alış Faturası: AF-2026-005	2026-02-17 15:40:42.926	04a63d2a-19cf-4f65-b366-95087fe8f605	\N
\.


--
-- Data for Name: stoklar; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stoklar (id, "stokKodu", "tenantId", "stokAdi", aciklama, birim, "alisFiyati", "satisFiyati", "kdvOrani", "kritikStokMiktari", kategori, "anaKategori", "altKategori", marka, model, oem, olcu, raf, barkod, "tedarikciKodu", "esdegerGrupId", "aracMarka", "aracModel", "aracMotorHacmi", "aracYakitTipi", "createdAt", "updatedAt") FROM stdin;
b367e0cf-82b0-44b5-946b-c68f80a72c94	ST0001	cmlq7po8x0000npcaphn2psck	Fren Diski	\N	Adet	0.00	0.00	20	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-17 06:21:30.897	2026-02-17 06:21:30.897
14672763-8a13-4394-b5c4-8181db1d7bfa	ST0002	cmlq7po8x0000npcaphn2psck	Fren Balatası	\N	Adet	0.00	0.00	20	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-17 06:21:40.968	2026-02-17 06:21:40.968
0c3ab199-73fa-4256-9808-766324404070	ST0003	cmlq7po8x0000npcaphn2psck	Balata Spreyi	\N	Adet	0.00	0.00	20	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-17 06:21:47.777	2026-02-17 06:21:47.777
c0aab138-c0de-4ba5-bea5-fb4a742b0373	ST0004	cmlq7po8x0000npcaphn2psck	Motor Yağı	\N	Adet	0.00	0.00	20	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-17 10:02:05.435	2026-02-17 10:02:05.435
\.


--
-- Data for Name: subscriptions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subscriptions (id, "tenantId", "planId", status, "startDate", "endDate", "trialEndsAt", "canceledAt", "nextBillingDate", "lastBillingDate", "autoRenew", "iyzicoSubscriptionRef", "additionalUsers", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: system_parameters; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.system_parameters (id, "tenantId", key, value, description, category, "createdAt", "updatedAt") FROM stdin;
784c7547-d243-4192-a5cd-5fe4f69bee0c	cmlq7po8x0000npcaphn2psck	ENABLE_WMS_MODULE	"false"	Raf takibi ve detayli stok yonetimi	\N	2026-02-17 09:40:55.346	2026-02-17 09:42:30.506
\.


--
-- Data for Name: tahsilatlar; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tahsilatlar (id, "tenantId", "cariId", "faturaId", tip, tutar, tarih, "odemeTipi", "kasaId", "bankaHesapId", "firmaKrediKartiId", aciklama, "createdBy", "deletedAt", "deletedBy", "createdAt", "updatedAt", "satisElemaniId", "workOrderId") FROM stdin;
\.


--
-- Data for Name: technical_findings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.technical_findings (id, "tenantId", "workOrderId", title, description, "createdBy", "createdAt", version) FROM stdin;
\.


--
-- Data for Name: teklif_kalemleri; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.teklif_kalemleri (id, "teklifId", "stokId", miktar, "birimFiyat", "kdvOrani", "kdvTutar", tutar, "iskontoOran", "iskontoTutar", "createdAt") FROM stdin;
\.


--
-- Data for Name: teklif_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.teklif_logs (id, "teklifId", "userId", "actionType", changes, "ipAddress", "userAgent", "createdAt") FROM stdin;
\.


--
-- Data for Name: teklifler; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.teklifler (id, "teklifNo", "tenantId", "teklifTipi", "cariId", tarih, "gecerlilikTarihi", iskonto, "toplamTutar", "kdvTutar", "genelToplam", aciklama, durum, "siparisId", "createdBy", "updatedBy", "deletedAt", "deletedBy", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: tenant_purge_audits; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tenant_purge_audits (id, "tenantId", "adminId", "adminEmail", "ipAddress", "deletedFiles", errors, "createdAt") FROM stdin;
\.


--
-- Data for Name: tenant_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tenant_settings (id, "tenantId", "companyName", "taxNumber", address, "logoUrl", features, limits, timezone, locale, currency, "createdAt", "updatedAt", city, "companyType", country, district, email, "firstName", "lastName", "mersisNo", neighborhood, phone, "postalCode", "taxOffice", "tcNo", website) FROM stdin;
cmlq7qmqn0001np8t5awpn25g	cmlq7po8x0000npcaphn2psck	Azem Yazılım Bilişim ve Teknolojileri Limited Şirketi	1270777723	73135 sokak bina no 1 Kat 2 no 3	/api/uploads/adsiz_tasarim_7-67ae.png	\N	\N	Europe/Istanbul	tr-TR	TRY	2026-02-17 06:19:19.583	2026-02-18 10:22:41.19	Adana	COMPANY	Türkiye	Seyhan	frtygtcn@gmail.com				Gürselpaşa	05428252015	01200	Ziyapaşa		azemyazilim.com
\.


--
-- Data for Name: tenants; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tenants (id, uuid, name, subdomain, domain, status, "cancelledAt", "purgedAt", "createdAt", "updatedAt", "tenantType") FROM stdin;
cmlq7po8x0000npcaphn2psck	35a07fc8-a2b2-4f06-8da2-019666f4a86a	Azem Yazılım Staging	staging	\N	ACTIVE	\N	\N	2026-02-17 06:18:34.881	2026-02-17 06:18:34.881	CORPORATE
\.


--
-- Data for Name: urun_raflar; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.urun_raflar (id, "stokId", "rafId", miktar, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: user_licenses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_licenses (id, "userId", "licenseType", "moduleId", "assignedBy", "assignedAt", "revokedAt", "revokedBy", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, uuid, email, username, password, "firstName", "lastName", "fullName", phone, "avatarUrl", role, status, "isActive", "refreshToken", "tokenVersion", "tenantId", "emailVerified", "lastLoginAt", "createdAt", "updatedAt", "roleId") FROM stdin;
892b2fc0-7ebe-4754-9c00-d09116a557cb	eeed601d-b01e-48a6-b36b-4089f3ea514f	info@azemyazilim.com	info	$2b$10$dySjr5GUh7cu.Sx32oVjQeEBb5KAf27IPyCki4/Xubr.LcI.zI2Xi	Azem	Super Admin	Azem Super Admin	\N	\N	SUPER_ADMIN	ACTIVE	t	$2b$10$dFM9bHAQCRjzZU3.BX2kpOKz05ypOINw0jW00BE2BjT8.Ize6OL5y	0	cmlq7po8x0000npcaphn2psck	f	2026-02-18 13:38:06.358	2026-02-17 06:18:34.954	2026-02-18 13:38:06.36	\N
\.


--
-- Data for Name: warehouse_critical_stocks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.warehouse_critical_stocks (id, "warehouseId", "productId", "criticalQty", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: warehouse_transfer_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.warehouse_transfer_items (id, "transferId", "stokId", miktar, "fromLocationId", "toLocationId", "createdAt") FROM stdin;
\.


--
-- Data for Name: warehouse_transfer_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.warehouse_transfer_logs (id, "transferId", "userId", "actionType", changes, "ipAddress", "userAgent", "createdAt") FROM stdin;
\.


--
-- Data for Name: warehouse_transfers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.warehouse_transfers (id, "transferNo", "tenantId", tarih, "fromWarehouseId", "toWarehouseId", durum, "driverName", "vehiclePlate", aciklama, "hazirlayanUserId", "onaylayanUserId", "teslimAlanUserId", "sevkTarihi", "teslimTarihi", "createdBy", "updatedBy", "deletedAt", "deletedBy", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: warehouses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.warehouses (id, code, "tenantId", name, active, address, phone, manager, "createdAt", "updatedAt", "isDefault") FROM stdin;
04a63d2a-19cf-4f65-b366-95087fe8f605	01	cmlq7po8x0000npcaphn2psck	Seyhan	t			\N	2026-02-17 06:21:15.622	2026-02-17 06:21:15.622	t
\.


--
-- Name: efatura_inbox_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.efatura_inbox_id_seq', 1, false);


--
-- Name: hizli_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.hizli_tokens_id_seq', 1, false);


--
-- Name: araclar araclar_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.araclar
    ADD CONSTRAINT araclar_pkey PRIMARY KEY (id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: avans_mahsuplasmalar avans_mahsuplasmalar_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.avans_mahsuplasmalar
    ADD CONSTRAINT avans_mahsuplasmalar_pkey PRIMARY KEY (id);


--
-- Name: avanslar avanslar_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.avanslar
    ADD CONSTRAINT avanslar_pkey PRIMARY KEY (id);


--
-- Name: banka_havale_logs banka_havale_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.banka_havale_logs
    ADD CONSTRAINT banka_havale_logs_pkey PRIMARY KEY (id);


--
-- Name: banka_havaleler banka_havaleler_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.banka_havaleler
    ADD CONSTRAINT banka_havaleler_pkey PRIMARY KEY (id);


--
-- Name: banka_hesap_hareketler banka_hesap_hareketler_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.banka_hesap_hareketler
    ADD CONSTRAINT banka_hesap_hareketler_pkey PRIMARY KEY (id);


--
-- Name: banka_hesaplari banka_hesaplari_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.banka_hesaplari
    ADD CONSTRAINT banka_hesaplari_pkey PRIMARY KEY (id);


--
-- Name: banka_kredi_planlari banka_kredi_planlari_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.banka_kredi_planlari
    ADD CONSTRAINT banka_kredi_planlari_pkey PRIMARY KEY (id);


--
-- Name: banka_krediler banka_krediler_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.banka_krediler
    ADD CONSTRAINT banka_krediler_pkey PRIMARY KEY (id);


--
-- Name: bankalar bankalar_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bankalar
    ADD CONSTRAINT bankalar_pkey PRIMARY KEY (id);


--
-- Name: basit_siparisler basit_siparisler_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.basit_siparisler
    ADD CONSTRAINT basit_siparisler_pkey PRIMARY KEY (id);


--
-- Name: bordrolar bordrolar_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bordrolar
    ADD CONSTRAINT bordrolar_pkey PRIMARY KEY (id);


--
-- Name: cari_adresler cari_adresler_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cari_adresler
    ADD CONSTRAINT cari_adresler_pkey PRIMARY KEY (id);


--
-- Name: cari_bankalar cari_bankalar_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cari_bankalar
    ADD CONSTRAINT cari_bankalar_pkey PRIMARY KEY (id);


--
-- Name: cari_hareketler cari_hareketler_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cari_hareketler
    ADD CONSTRAINT cari_hareketler_pkey PRIMARY KEY (id);


--
-- Name: cari_yetkililer cari_yetkililer_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cari_yetkililer
    ADD CONSTRAINT cari_yetkililer_pkey PRIMARY KEY (id);


--
-- Name: cariler cariler_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cariler
    ADD CONSTRAINT cariler_pkey PRIMARY KEY (id);


--
-- Name: cek_senet_logs cek_senet_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cek_senet_logs
    ADD CONSTRAINT cek_senet_logs_pkey PRIMARY KEY (id);


--
-- Name: cek_senetler cek_senetler_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cek_senetler
    ADD CONSTRAINT cek_senetler_pkey PRIMARY KEY (id);


--
-- Name: code_templates code_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.code_templates
    ADD CONSTRAINT code_templates_pkey PRIMARY KEY (id);


--
-- Name: deleted_banka_havaleler deleted_banka_havaleler_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.deleted_banka_havaleler
    ADD CONSTRAINT deleted_banka_havaleler_pkey PRIMARY KEY (id);


--
-- Name: deleted_cek_senetler deleted_cek_senetler_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.deleted_cek_senetler
    ADD CONSTRAINT deleted_cek_senetler_pkey PRIMARY KEY (id);


--
-- Name: depolar depolar_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.depolar
    ADD CONSTRAINT depolar_pkey PRIMARY KEY (id);


--
-- Name: diagnostic_notes diagnostic_notes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.diagnostic_notes
    ADD CONSTRAINT diagnostic_notes_pkey PRIMARY KEY (id);


--
-- Name: efatura_inbox efatura_inbox_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.efatura_inbox
    ADD CONSTRAINT efatura_inbox_pkey PRIMARY KEY (id);


--
-- Name: efatura_xml efatura_xml_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.efatura_xml
    ADD CONSTRAINT efatura_xml_pkey PRIMARY KEY (id);


--
-- Name: esdeger_gruplar esdeger_gruplar_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.esdeger_gruplar
    ADD CONSTRAINT esdeger_gruplar_pkey PRIMARY KEY (id);


--
-- Name: fatura_kalemleri fatura_kalemleri_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fatura_kalemleri
    ADD CONSTRAINT fatura_kalemleri_pkey PRIMARY KEY (id);


--
-- Name: fatura_logs fatura_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fatura_logs
    ADD CONSTRAINT fatura_logs_pkey PRIMARY KEY (id);


--
-- Name: fatura_tahsilatlar fatura_tahsilatlar_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fatura_tahsilatlar
    ADD CONSTRAINT fatura_tahsilatlar_pkey PRIMARY KEY (id);


--
-- Name: faturalar faturalar_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.faturalar
    ADD CONSTRAINT faturalar_pkey PRIMARY KEY (id);


--
-- Name: firma_kredi_karti_hareketler firma_kredi_karti_hareketler_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.firma_kredi_karti_hareketler
    ADD CONSTRAINT firma_kredi_karti_hareketler_pkey PRIMARY KEY (id);


--
-- Name: firma_kredi_karti_hatirlaticilar firma_kredi_karti_hatirlaticilar_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.firma_kredi_karti_hatirlaticilar
    ADD CONSTRAINT firma_kredi_karti_hatirlaticilar_pkey PRIMARY KEY (id);


--
-- Name: firma_kredi_kartlari firma_kredi_kartlari_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.firma_kredi_kartlari
    ADD CONSTRAINT firma_kredi_kartlari_pkey PRIMARY KEY (id);


--
-- Name: hizli_tokens hizli_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hizli_tokens
    ADD CONSTRAINT hizli_tokens_pkey PRIMARY KEY (id);


--
-- Name: invitations invitations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invitations
    ADD CONSTRAINT invitations_pkey PRIMARY KEY (id);


--
-- Name: invoice_profit invoice_profit_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoice_profit
    ADD CONSTRAINT invoice_profit_pkey PRIMARY KEY (id);


--
-- Name: kasa_hareketler kasa_hareketler_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kasa_hareketler
    ADD CONSTRAINT kasa_hareketler_pkey PRIMARY KEY (id);


--
-- Name: kasalar kasalar_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kasalar
    ADD CONSTRAINT kasalar_pkey PRIMARY KEY (id);


--
-- Name: locations locations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.locations
    ADD CONSTRAINT locations_pkey PRIMARY KEY (id);


--
-- Name: maas_odeme_detaylari maas_odeme_detaylari_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maas_odeme_detaylari
    ADD CONSTRAINT maas_odeme_detaylari_pkey PRIMARY KEY (id);


--
-- Name: maas_odemeler maas_odemeler_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maas_odemeler
    ADD CONSTRAINT maas_odemeler_pkey PRIMARY KEY (id);


--
-- Name: maas_planlari maas_planlari_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maas_planlari
    ADD CONSTRAINT maas_planlari_pkey PRIMARY KEY (id);


--
-- Name: manager_approvals manager_approvals_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.manager_approvals
    ADD CONSTRAINT manager_approvals_pkey PRIMARY KEY (id);


--
-- Name: manager_rejections manager_rejections_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.manager_rejections
    ADD CONSTRAINT manager_rejections_pkey PRIMARY KEY (id);


--
-- Name: masraf_kategoriler masraf_kategoriler_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.masraf_kategoriler
    ADD CONSTRAINT masraf_kategoriler_pkey PRIMARY KEY (id);


--
-- Name: masraflar masraflar_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.masraflar
    ADD CONSTRAINT masraflar_pkey PRIMARY KEY (id);


--
-- Name: module_licenses module_licenses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.module_licenses
    ADD CONSTRAINT module_licenses_pkey PRIMARY KEY (id);


--
-- Name: modules modules_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.modules
    ADD CONSTRAINT modules_pkey PRIMARY KEY (id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: permissions permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (id);


--
-- Name: personel_odemeler personel_odemeler_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.personel_odemeler
    ADD CONSTRAINT personel_odemeler_pkey PRIMARY KEY (id);


--
-- Name: personeller personeller_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.personeller
    ADD CONSTRAINT personeller_pkey PRIMARY KEY (id);


--
-- Name: plans plans_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.plans
    ADD CONSTRAINT plans_pkey PRIMARY KEY (id);


--
-- Name: postal_codes postal_codes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.postal_codes
    ADD CONSTRAINT postal_codes_pkey PRIMARY KEY (id);


--
-- Name: price_cards price_cards_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.price_cards
    ADD CONSTRAINT price_cards_pkey PRIMARY KEY (id);


--
-- Name: price_quotes price_quotes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.price_quotes
    ADD CONSTRAINT price_quotes_pkey PRIMARY KEY (id);


--
-- Name: product_barcodes product_barcodes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_barcodes
    ADD CONSTRAINT product_barcodes_pkey PRIMARY KEY (id);


--
-- Name: product_location_stocks product_location_stocks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_location_stocks
    ADD CONSTRAINT product_location_stocks_pkey PRIMARY KEY (id);


--
-- Name: purchase_order_items purchase_order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_order_items
    ADD CONSTRAINT purchase_order_items_pkey PRIMARY KEY (id);


--
-- Name: purchase_orders purchase_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_pkey PRIMARY KEY (id);


--
-- Name: raflar raflar_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.raflar
    ADD CONSTRAINT raflar_pkey PRIMARY KEY (id);


--
-- Name: role_permissions role_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_pkey PRIMARY KEY (id);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: satin_alma_irsaliyeleri satin_alma_irsaliyeleri_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.satin_alma_irsaliyeleri
    ADD CONSTRAINT satin_alma_irsaliyeleri_pkey PRIMARY KEY (id);


--
-- Name: satin_alma_irsaliyesi_kalemleri satin_alma_irsaliyesi_kalemleri_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.satin_alma_irsaliyesi_kalemleri
    ADD CONSTRAINT satin_alma_irsaliyesi_kalemleri_pkey PRIMARY KEY (id);


--
-- Name: satin_alma_irsaliyesi_logs satin_alma_irsaliyesi_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.satin_alma_irsaliyesi_logs
    ADD CONSTRAINT satin_alma_irsaliyesi_logs_pkey PRIMARY KEY (id);


--
-- Name: satin_alma_siparis_kalemleri satin_alma_siparis_kalemleri_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.satin_alma_siparis_kalemleri
    ADD CONSTRAINT satin_alma_siparis_kalemleri_pkey PRIMARY KEY (id);


--
-- Name: satin_alma_siparis_logs satin_alma_siparis_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.satin_alma_siparis_logs
    ADD CONSTRAINT satin_alma_siparis_logs_pkey PRIMARY KEY (id);


--
-- Name: satin_alma_siparisleri satin_alma_siparisleri_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.satin_alma_siparisleri
    ADD CONSTRAINT satin_alma_siparisleri_pkey PRIMARY KEY (id);


--
-- Name: satis_elemanlari satis_elemanlari_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.satis_elemanlari
    ADD CONSTRAINT satis_elemanlari_pkey PRIMARY KEY (id);


--
-- Name: satis_irsaliyeleri satis_irsaliyeleri_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.satis_irsaliyeleri
    ADD CONSTRAINT satis_irsaliyeleri_pkey PRIMARY KEY (id);


--
-- Name: satis_irsaliyesi_kalemleri satis_irsaliyesi_kalemleri_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.satis_irsaliyesi_kalemleri
    ADD CONSTRAINT satis_irsaliyesi_kalemleri_pkey PRIMARY KEY (id);


--
-- Name: satis_irsaliyesi_logs satis_irsaliyesi_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.satis_irsaliyesi_logs
    ADD CONSTRAINT satis_irsaliyesi_logs_pkey PRIMARY KEY (id);


--
-- Name: sayim_kalemleri sayim_kalemleri_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sayim_kalemleri
    ADD CONSTRAINT sayim_kalemleri_pkey PRIMARY KEY (id);


--
-- Name: sayimlar sayimlar_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sayimlar
    ADD CONSTRAINT sayimlar_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: siparis_hazirliklar siparis_hazirliklar_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.siparis_hazirliklar
    ADD CONSTRAINT siparis_hazirliklar_pkey PRIMARY KEY (id);


--
-- Name: siparis_kalemleri siparis_kalemleri_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.siparis_kalemleri
    ADD CONSTRAINT siparis_kalemleri_pkey PRIMARY KEY (id);


--
-- Name: siparis_logs siparis_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.siparis_logs
    ADD CONSTRAINT siparis_logs_pkey PRIMARY KEY (id);


--
-- Name: siparisler siparisler_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.siparisler
    ADD CONSTRAINT siparisler_pkey PRIMARY KEY (id);


--
-- Name: solution_package_parts solution_package_parts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.solution_package_parts
    ADD CONSTRAINT solution_package_parts_pkey PRIMARY KEY (id);


--
-- Name: solution_packages solution_packages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.solution_packages
    ADD CONSTRAINT solution_packages_pkey PRIMARY KEY (id);


--
-- Name: stock_cost_history stock_cost_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_cost_history
    ADD CONSTRAINT stock_cost_history_pkey PRIMARY KEY (id);


--
-- Name: stock_moves stock_moves_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_moves
    ADD CONSTRAINT stock_moves_pkey PRIMARY KEY (id);


--
-- Name: stok_esdegers stok_esdegers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stok_esdegers
    ADD CONSTRAINT stok_esdegers_pkey PRIMARY KEY (id);


--
-- Name: stok_hareketleri stok_hareketleri_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stok_hareketleri
    ADD CONSTRAINT stok_hareketleri_pkey PRIMARY KEY (id);


--
-- Name: stoklar stoklar_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stoklar
    ADD CONSTRAINT stoklar_pkey PRIMARY KEY (id);


--
-- Name: subscriptions subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_pkey PRIMARY KEY (id);


--
-- Name: system_parameters system_parameters_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.system_parameters
    ADD CONSTRAINT system_parameters_pkey PRIMARY KEY (id);


--
-- Name: tahsilatlar tahsilatlar_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tahsilatlar
    ADD CONSTRAINT tahsilatlar_pkey PRIMARY KEY (id);


--
-- Name: technical_findings technical_findings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.technical_findings
    ADD CONSTRAINT technical_findings_pkey PRIMARY KEY (id);


--
-- Name: teklif_kalemleri teklif_kalemleri_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teklif_kalemleri
    ADD CONSTRAINT teklif_kalemleri_pkey PRIMARY KEY (id);


--
-- Name: teklif_logs teklif_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teklif_logs
    ADD CONSTRAINT teklif_logs_pkey PRIMARY KEY (id);


--
-- Name: teklifler teklifler_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teklifler
    ADD CONSTRAINT teklifler_pkey PRIMARY KEY (id);


--
-- Name: tenant_purge_audits tenant_purge_audits_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tenant_purge_audits
    ADD CONSTRAINT tenant_purge_audits_pkey PRIMARY KEY (id);


--
-- Name: tenant_settings tenant_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tenant_settings
    ADD CONSTRAINT tenant_settings_pkey PRIMARY KEY (id);


--
-- Name: tenants tenants_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT tenants_pkey PRIMARY KEY (id);


--
-- Name: urun_raflar urun_raflar_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.urun_raflar
    ADD CONSTRAINT urun_raflar_pkey PRIMARY KEY (id);


--
-- Name: user_licenses user_licenses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_licenses
    ADD CONSTRAINT user_licenses_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: warehouse_critical_stocks warehouse_critical_stocks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.warehouse_critical_stocks
    ADD CONSTRAINT warehouse_critical_stocks_pkey PRIMARY KEY (id);


--
-- Name: warehouse_transfer_items warehouse_transfer_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.warehouse_transfer_items
    ADD CONSTRAINT warehouse_transfer_items_pkey PRIMARY KEY (id);


--
-- Name: warehouse_transfer_logs warehouse_transfer_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.warehouse_transfer_logs
    ADD CONSTRAINT warehouse_transfer_logs_pkey PRIMARY KEY (id);


--
-- Name: warehouse_transfers warehouse_transfers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.warehouse_transfers
    ADD CONSTRAINT warehouse_transfers_pkey PRIMARY KEY (id);


--
-- Name: warehouses warehouses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.warehouses
    ADD CONSTRAINT warehouses_pkey PRIMARY KEY (id);


--
-- Name: araclar_marka_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX araclar_marka_idx ON public.araclar USING btree (marka);


--
-- Name: araclar_marka_model_motorHacmi_yakitTipi_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "araclar_marka_model_motorHacmi_yakitTipi_key" ON public.araclar USING btree (marka, model, "motorHacmi", "yakitTipi");


--
-- Name: araclar_model_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX araclar_model_idx ON public.araclar USING btree (model);


--
-- Name: araclar_yakitTipi_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "araclar_yakitTipi_idx" ON public.araclar USING btree ("yakitTipi");


--
-- Name: audit_logs_action_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX audit_logs_action_idx ON public.audit_logs USING btree (action);


--
-- Name: audit_logs_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "audit_logs_createdAt_idx" ON public.audit_logs USING btree ("createdAt");


--
-- Name: audit_logs_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "audit_logs_tenantId_idx" ON public.audit_logs USING btree ("tenantId");


--
-- Name: audit_logs_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "audit_logs_userId_idx" ON public.audit_logs USING btree ("userId");


--
-- Name: avans_mahsuplasmalar_avansId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "avans_mahsuplasmalar_avansId_idx" ON public.avans_mahsuplasmalar USING btree ("avansId");


--
-- Name: avans_mahsuplasmalar_planId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "avans_mahsuplasmalar_planId_idx" ON public.avans_mahsuplasmalar USING btree ("planId");


--
-- Name: avans_mahsuplasmalar_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "avans_mahsuplasmalar_tenantId_idx" ON public.avans_mahsuplasmalar USING btree ("tenantId");


--
-- Name: avanslar_durum_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX avanslar_durum_idx ON public.avanslar USING btree (durum);


--
-- Name: avanslar_kasaId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "avanslar_kasaId_idx" ON public.avanslar USING btree ("kasaId");


--
-- Name: avanslar_personelId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "avanslar_personelId_idx" ON public.avanslar USING btree ("personelId");


--
-- Name: avanslar_tarih_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX avanslar_tarih_idx ON public.avanslar USING btree (tarih);


--
-- Name: avanslar_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "avanslar_tenantId_idx" ON public.avanslar USING btree ("tenantId");


--
-- Name: banka_havale_logs_bankaHavaleId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "banka_havale_logs_bankaHavaleId_idx" ON public.banka_havale_logs USING btree ("bankaHavaleId");


--
-- Name: banka_havale_logs_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "banka_havale_logs_userId_idx" ON public.banka_havale_logs USING btree ("userId");


--
-- Name: banka_havaleler_bankaHesabiId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "banka_havaleler_bankaHesabiId_idx" ON public.banka_havaleler USING btree ("bankaHesabiId");


--
-- Name: banka_havaleler_cariId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "banka_havaleler_cariId_idx" ON public.banka_havaleler USING btree ("cariId");


--
-- Name: banka_havaleler_hareketTipi_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "banka_havaleler_hareketTipi_idx" ON public.banka_havaleler USING btree ("hareketTipi");


--
-- Name: banka_havaleler_tarih_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX banka_havaleler_tarih_idx ON public.banka_havaleler USING btree (tarih);


--
-- Name: banka_havaleler_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "banka_havaleler_tenantId_idx" ON public.banka_havaleler USING btree ("tenantId");


--
-- Name: banka_havaleler_tenantId_tarih_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "banka_havaleler_tenantId_tarih_idx" ON public.banka_havaleler USING btree ("tenantId", tarih);


--
-- Name: banka_hesap_hareketler_hareketTipi_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "banka_hesap_hareketler_hareketTipi_idx" ON public.banka_hesap_hareketler USING btree ("hareketTipi");


--
-- Name: banka_hesap_hareketler_hesapId_tarih_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "banka_hesap_hareketler_hesapId_tarih_idx" ON public.banka_hesap_hareketler USING btree ("hesapId", tarih);


--
-- Name: banka_hesaplari_bankaId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "banka_hesaplari_bankaId_idx" ON public.banka_hesaplari USING btree ("bankaId");


--
-- Name: banka_hesaplari_hesapKodu_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "banka_hesaplari_hesapKodu_key" ON public.banka_hesaplari USING btree ("hesapKodu");


--
-- Name: banka_hesaplari_hesapTipi_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "banka_hesaplari_hesapTipi_idx" ON public.banka_hesaplari USING btree ("hesapTipi");


--
-- Name: banka_kredi_planlari_krediId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "banka_kredi_planlari_krediId_idx" ON public.banka_kredi_planlari USING btree ("krediId");


--
-- Name: banka_krediler_bankaHesapId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "banka_krediler_bankaHesapId_idx" ON public.banka_krediler USING btree ("bankaHesapId");


--
-- Name: bankalar_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "bankalar_tenantId_idx" ON public.bankalar USING btree ("tenantId");


--
-- Name: basit_siparisler_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "basit_siparisler_createdAt_idx" ON public.basit_siparisler USING btree ("createdAt");


--
-- Name: basit_siparisler_durum_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX basit_siparisler_durum_idx ON public.basit_siparisler USING btree (durum);


--
-- Name: basit_siparisler_firmaId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "basit_siparisler_firmaId_idx" ON public.basit_siparisler USING btree ("firmaId");


--
-- Name: basit_siparisler_tenantId_firmaId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "basit_siparisler_tenantId_firmaId_idx" ON public.basit_siparisler USING btree ("tenantId", "firmaId");


--
-- Name: basit_siparisler_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "basit_siparisler_tenantId_idx" ON public.basit_siparisler USING btree ("tenantId");


--
-- Name: basit_siparisler_tenantId_urunId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "basit_siparisler_tenantId_urunId_idx" ON public.basit_siparisler USING btree ("tenantId", "urunId");


--
-- Name: basit_siparisler_urunId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "basit_siparisler_urunId_idx" ON public.basit_siparisler USING btree ("urunId");


--
-- Name: cari_adresler_cariId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "cari_adresler_cariId_idx" ON public.cari_adresler USING btree ("cariId");


--
-- Name: cari_bankalar_cariId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "cari_bankalar_cariId_idx" ON public.cari_bankalar USING btree ("cariId");


--
-- Name: cari_hareketler_cariId_tarih_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "cari_hareketler_cariId_tarih_idx" ON public.cari_hareketler USING btree ("cariId", tarih);


--
-- Name: cari_hareketler_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "cari_hareketler_tenantId_idx" ON public.cari_hareketler USING btree ("tenantId");


--
-- Name: cari_yetkililer_cariId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "cari_yetkililer_cariId_idx" ON public.cari_yetkililer USING btree ("cariId");


--
-- Name: cariler_cariKodu_tenantId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "cariler_cariKodu_tenantId_key" ON public.cariler USING btree ("cariKodu", "tenantId");


--
-- Name: cariler_tenantId_cariKodu_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "cariler_tenantId_cariKodu_idx" ON public.cariler USING btree ("tenantId", "cariKodu");


--
-- Name: cariler_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "cariler_tenantId_idx" ON public.cariler USING btree ("tenantId");


--
-- Name: cek_senet_logs_cekSenetId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "cek_senet_logs_cekSenetId_idx" ON public.cek_senet_logs USING btree ("cekSenetId");


--
-- Name: cek_senet_logs_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "cek_senet_logs_userId_idx" ON public.cek_senet_logs USING btree ("userId");


--
-- Name: cek_senetler_cariId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "cek_senetler_cariId_idx" ON public.cek_senetler USING btree ("cariId");


--
-- Name: cek_senetler_durum_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX cek_senetler_durum_idx ON public.cek_senetler USING btree (durum);


--
-- Name: cek_senetler_portfoyTip_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "cek_senetler_portfoyTip_idx" ON public.cek_senetler USING btree ("portfoyTip");


--
-- Name: cek_senetler_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "cek_senetler_tenantId_idx" ON public.cek_senetler USING btree ("tenantId");


--
-- Name: cek_senetler_tenantId_vade_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "cek_senetler_tenantId_vade_idx" ON public.cek_senetler USING btree ("tenantId", vade);


--
-- Name: cek_senetler_tip_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX cek_senetler_tip_idx ON public.cek_senetler USING btree (tip);


--
-- Name: cek_senetler_vade_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX cek_senetler_vade_idx ON public.cek_senetler USING btree (vade);


--
-- Name: code_templates_module_tenantId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "code_templates_module_tenantId_key" ON public.code_templates USING btree (module, "tenantId");


--
-- Name: deleted_banka_havaleler_bankaHesabiId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "deleted_banka_havaleler_bankaHesabiId_idx" ON public.deleted_banka_havaleler USING btree ("bankaHesabiId");


--
-- Name: deleted_banka_havaleler_cariId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "deleted_banka_havaleler_cariId_idx" ON public.deleted_banka_havaleler USING btree ("cariId");


--
-- Name: deleted_banka_havaleler_deletedAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "deleted_banka_havaleler_deletedAt_idx" ON public.deleted_banka_havaleler USING btree ("deletedAt");


--
-- Name: deleted_banka_havaleler_originalId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "deleted_banka_havaleler_originalId_idx" ON public.deleted_banka_havaleler USING btree ("originalId");


--
-- Name: deleted_cek_senetler_cariId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "deleted_cek_senetler_cariId_idx" ON public.deleted_cek_senetler USING btree ("cariId");


--
-- Name: deleted_cek_senetler_deletedAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "deleted_cek_senetler_deletedAt_idx" ON public.deleted_cek_senetler USING btree ("deletedAt");


--
-- Name: deleted_cek_senetler_originalId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "deleted_cek_senetler_originalId_idx" ON public.deleted_cek_senetler USING btree ("originalId");


--
-- Name: depolar_depoAdi_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "depolar_depoAdi_key" ON public.depolar USING btree ("depoAdi");


--
-- Name: diagnostic_notes_tenantId_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "diagnostic_notes_tenantId_createdAt_idx" ON public.diagnostic_notes USING btree ("tenantId", "createdAt");


--
-- Name: diagnostic_notes_tenantId_workOrderId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "diagnostic_notes_tenantId_workOrderId_idx" ON public.diagnostic_notes USING btree ("tenantId", "workOrderId");


--
-- Name: efatura_inbox_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "efatura_inbox_createdAt_idx" ON public.efatura_inbox USING btree ("createdAt");


--
-- Name: efatura_inbox_ettn_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX efatura_inbox_ettn_key ON public.efatura_inbox USING btree (ettn);


--
-- Name: efatura_inbox_senderVkn_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "efatura_inbox_senderVkn_idx" ON public.efatura_inbox USING btree ("senderVkn");


--
-- Name: efatura_xml_faturaId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "efatura_xml_faturaId_key" ON public.efatura_xml USING btree ("faturaId");


--
-- Name: fatura_logs_faturaId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "fatura_logs_faturaId_idx" ON public.fatura_logs USING btree ("faturaId");


--
-- Name: fatura_logs_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "fatura_logs_userId_idx" ON public.fatura_logs USING btree ("userId");


--
-- Name: fatura_tahsilatlar_faturaId_tahsilatId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "fatura_tahsilatlar_faturaId_tahsilatId_key" ON public.fatura_tahsilatlar USING btree ("faturaId", "tahsilatId");


--
-- Name: fatura_tahsilatlar_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "fatura_tahsilatlar_tenantId_idx" ON public.fatura_tahsilatlar USING btree ("tenantId");


--
-- Name: faturalar_cariId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "faturalar_cariId_idx" ON public.faturalar USING btree ("cariId");


--
-- Name: faturalar_deliveryNoteId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "faturalar_deliveryNoteId_idx" ON public.faturalar USING btree ("deliveryNoteId");


--
-- Name: faturalar_durum_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX faturalar_durum_idx ON public.faturalar USING btree (durum);


--
-- Name: faturalar_efaturaEttn_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "faturalar_efaturaEttn_key" ON public.faturalar USING btree ("efaturaEttn");


--
-- Name: faturalar_faturaNo_tenantId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "faturalar_faturaNo_tenantId_key" ON public.faturalar USING btree ("faturaNo", "tenantId");


--
-- Name: faturalar_purchaseOrderId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "faturalar_purchaseOrderId_key" ON public.faturalar USING btree ("purchaseOrderId");


--
-- Name: faturalar_satinAlmaIrsaliyeId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "faturalar_satinAlmaIrsaliyeId_key" ON public.faturalar USING btree ("satinAlmaIrsaliyeId");


--
-- Name: faturalar_satinAlmaSiparisiId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "faturalar_satinAlmaSiparisiId_key" ON public.faturalar USING btree ("satinAlmaSiparisiId");


--
-- Name: faturalar_tenantId_durum_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "faturalar_tenantId_durum_idx" ON public.faturalar USING btree ("tenantId", durum);


--
-- Name: faturalar_tenantId_faturaTipi_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "faturalar_tenantId_faturaTipi_idx" ON public.faturalar USING btree ("tenantId", "faturaTipi");


--
-- Name: faturalar_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "faturalar_tenantId_idx" ON public.faturalar USING btree ("tenantId");


--
-- Name: faturalar_tenantId_tarih_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "faturalar_tenantId_tarih_idx" ON public.faturalar USING btree ("tenantId", tarih);


--
-- Name: firma_kredi_karti_hareketler_kartId_tarih_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "firma_kredi_karti_hareketler_kartId_tarih_idx" ON public.firma_kredi_karti_hareketler USING btree ("kartId", tarih);


--
-- Name: firma_kredi_karti_hatirlaticilar_gun_aktif_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX firma_kredi_karti_hatirlaticilar_gun_aktif_idx ON public.firma_kredi_karti_hatirlaticilar USING btree (gun, aktif);


--
-- Name: firma_kredi_karti_hatirlaticilar_kartId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "firma_kredi_karti_hatirlaticilar_kartId_idx" ON public.firma_kredi_karti_hatirlaticilar USING btree ("kartId");


--
-- Name: firma_kredi_karti_hatirlaticilar_kartId_tip_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "firma_kredi_karti_hatirlaticilar_kartId_tip_key" ON public.firma_kredi_karti_hatirlaticilar USING btree ("kartId", tip);


--
-- Name: firma_kredi_kartlari_kartKodu_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "firma_kredi_kartlari_kartKodu_key" ON public.firma_kredi_kartlari USING btree ("kartKodu");


--
-- Name: firma_kredi_kartlari_kasaId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "firma_kredi_kartlari_kasaId_idx" ON public.firma_kredi_kartlari USING btree ("kasaId");


--
-- Name: hizli_tokens_expiresAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "hizli_tokens_expiresAt_idx" ON public.hizli_tokens USING btree ("expiresAt");


--
-- Name: hizli_tokens_loginHash_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "hizli_tokens_loginHash_idx" ON public.hizli_tokens USING btree ("loginHash");


--
-- Name: invitations_email_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX invitations_email_idx ON public.invitations USING btree (email);


--
-- Name: invitations_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX invitations_status_idx ON public.invitations USING btree (status);


--
-- Name: invitations_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "invitations_tenantId_idx" ON public.invitations USING btree ("tenantId");


--
-- Name: invitations_token_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX invitations_token_idx ON public.invitations USING btree (token);


--
-- Name: invitations_token_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX invitations_token_key ON public.invitations USING btree (token);


--
-- Name: invoice_profit_faturaId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "invoice_profit_faturaId_idx" ON public.invoice_profit USING btree ("faturaId");


--
-- Name: invoice_profit_faturaKalemiId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "invoice_profit_faturaKalemiId_idx" ON public.invoice_profit USING btree ("faturaKalemiId");


--
-- Name: invoice_profit_stokId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "invoice_profit_stokId_idx" ON public.invoice_profit USING btree ("stokId");


--
-- Name: invoice_profit_tenantId_faturaId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "invoice_profit_tenantId_faturaId_idx" ON public.invoice_profit USING btree ("tenantId", "faturaId");


--
-- Name: kasa_hareketler_cariId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "kasa_hareketler_cariId_idx" ON public.kasa_hareketler USING btree ("cariId");


--
-- Name: kasa_hareketler_kasaId_tarih_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "kasa_hareketler_kasaId_tarih_idx" ON public.kasa_hareketler USING btree ("kasaId", tarih);


--
-- Name: kasa_hareketler_transferEdildi_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "kasa_hareketler_transferEdildi_idx" ON public.kasa_hareketler USING btree ("transferEdildi");


--
-- Name: kasalar_aktif_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX kasalar_aktif_idx ON public.kasalar USING btree (aktif);


--
-- Name: kasalar_kasaKodu_tenantId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "kasalar_kasaKodu_tenantId_key" ON public.kasalar USING btree ("kasaKodu", "tenantId");


--
-- Name: kasalar_kasaTipi_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "kasalar_kasaTipi_idx" ON public.kasalar USING btree ("kasaTipi");


--
-- Name: kasalar_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "kasalar_tenantId_idx" ON public.kasalar USING btree ("tenantId");


--
-- Name: kasalar_tenantId_kasaKodu_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "kasalar_tenantId_kasaKodu_idx" ON public.kasalar USING btree ("tenantId", "kasaKodu");


--
-- Name: locations_barcode_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX locations_barcode_idx ON public.locations USING btree (barcode);


--
-- Name: locations_barcode_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX locations_barcode_key ON public.locations USING btree (barcode);


--
-- Name: locations_code_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX locations_code_idx ON public.locations USING btree (code);


--
-- Name: locations_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX locations_code_key ON public.locations USING btree (code);


--
-- Name: locations_warehouseId_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "locations_warehouseId_code_key" ON public.locations USING btree ("warehouseId", code);


--
-- Name: locations_warehouseId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "locations_warehouseId_idx" ON public.locations USING btree ("warehouseId");


--
-- Name: maas_odeme_detaylari_bankaHesapId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "maas_odeme_detaylari_bankaHesapId_idx" ON public.maas_odeme_detaylari USING btree ("bankaHesapId");


--
-- Name: maas_odeme_detaylari_kasaId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "maas_odeme_detaylari_kasaId_idx" ON public.maas_odeme_detaylari USING btree ("kasaId");


--
-- Name: maas_odeme_detaylari_odemeId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "maas_odeme_detaylari_odemeId_idx" ON public.maas_odeme_detaylari USING btree ("odemeId");


--
-- Name: maas_odeme_detaylari_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "maas_odeme_detaylari_tenantId_idx" ON public.maas_odeme_detaylari USING btree ("tenantId");


--
-- Name: maas_odemeler_personelId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "maas_odemeler_personelId_idx" ON public.maas_odemeler USING btree ("personelId");


--
-- Name: maas_odemeler_planId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "maas_odemeler_planId_idx" ON public.maas_odemeler USING btree ("planId");


--
-- Name: maas_odemeler_tarih_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX maas_odemeler_tarih_idx ON public.maas_odemeler USING btree (tarih);


--
-- Name: maas_odemeler_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "maas_odemeler_tenantId_idx" ON public.maas_odemeler USING btree ("tenantId");


--
-- Name: maas_planlari_durum_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX maas_planlari_durum_idx ON public.maas_planlari USING btree (durum);


--
-- Name: maas_planlari_personelId_yil_ay_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "maas_planlari_personelId_yil_ay_key" ON public.maas_planlari USING btree ("personelId", yil, ay);


--
-- Name: maas_planlari_personelId_yil_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "maas_planlari_personelId_yil_idx" ON public.maas_planlari USING btree ("personelId", yil);


--
-- Name: maas_planlari_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "maas_planlari_tenantId_idx" ON public.maas_planlari USING btree ("tenantId");


--
-- Name: maas_planlari_yil_ay_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX maas_planlari_yil_ay_idx ON public.maas_planlari USING btree (yil, ay);


--
-- Name: manager_approvals_deletedAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "manager_approvals_deletedAt_idx" ON public.manager_approvals USING btree ("deletedAt");


--
-- Name: manager_approvals_tenantId_approvedAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "manager_approvals_tenantId_approvedAt_idx" ON public.manager_approvals USING btree ("tenantId", "approvedAt");


--
-- Name: manager_approvals_tenantId_workOrderId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "manager_approvals_tenantId_workOrderId_idx" ON public.manager_approvals USING btree ("tenantId", "workOrderId");


--
-- Name: manager_approvals_workOrderId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "manager_approvals_workOrderId_key" ON public.manager_approvals USING btree ("workOrderId");


--
-- Name: manager_rejections_tenantId_rejectedAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "manager_rejections_tenantId_rejectedAt_idx" ON public.manager_rejections USING btree ("tenantId", "rejectedAt");


--
-- Name: manager_rejections_tenantId_workOrderId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "manager_rejections_tenantId_workOrderId_idx" ON public.manager_rejections USING btree ("tenantId", "workOrderId");


--
-- Name: masraf_kategoriler_kategoriAdi_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "masraf_kategoriler_kategoriAdi_key" ON public.masraf_kategoriler USING btree ("kategoriAdi");


--
-- Name: masraflar_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "masraflar_tenantId_idx" ON public.masraflar USING btree ("tenantId");


--
-- Name: masraflar_tenantId_tarih_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "masraflar_tenantId_tarih_idx" ON public.masraflar USING btree ("tenantId", tarih);


--
-- Name: module_licenses_moduleId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "module_licenses_moduleId_idx" ON public.module_licenses USING btree ("moduleId");


--
-- Name: module_licenses_subscriptionId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "module_licenses_subscriptionId_idx" ON public.module_licenses USING btree ("subscriptionId");


--
-- Name: modules_isActive_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "modules_isActive_idx" ON public.modules USING btree ("isActive");


--
-- Name: modules_slug_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX modules_slug_idx ON public.modules USING btree (slug);


--
-- Name: modules_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX modules_slug_key ON public.modules USING btree (slug);


--
-- Name: payments_conversationId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "payments_conversationId_idx" ON public.payments USING btree ("conversationId");


--
-- Name: payments_conversationId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "payments_conversationId_key" ON public.payments USING btree ("conversationId");


--
-- Name: payments_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "payments_createdAt_idx" ON public.payments USING btree ("createdAt");


--
-- Name: payments_iyzicoPaymentId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "payments_iyzicoPaymentId_idx" ON public.payments USING btree ("iyzicoPaymentId");


--
-- Name: payments_iyzicoPaymentId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "payments_iyzicoPaymentId_key" ON public.payments USING btree ("iyzicoPaymentId");


--
-- Name: payments_iyzicoToken_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "payments_iyzicoToken_key" ON public.payments USING btree ("iyzicoToken");


--
-- Name: payments_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX payments_status_idx ON public.payments USING btree (status);


--
-- Name: payments_subscriptionId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "payments_subscriptionId_idx" ON public.payments USING btree ("subscriptionId");


--
-- Name: permissions_module_action_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX permissions_module_action_key ON public.permissions USING btree (module, action);


--
-- Name: personel_odemeler_personelId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "personel_odemeler_personelId_idx" ON public.personel_odemeler USING btree ("personelId");


--
-- Name: personel_odemeler_tarih_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX personel_odemeler_tarih_idx ON public.personel_odemeler USING btree (tarih);


--
-- Name: personel_odemeler_tip_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX personel_odemeler_tip_idx ON public.personel_odemeler USING btree (tip);


--
-- Name: personeller_aktif_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX personeller_aktif_idx ON public.personeller USING btree (aktif);


--
-- Name: personeller_departman_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX personeller_departman_idx ON public.personeller USING btree (departman);


--
-- Name: personeller_personelKodu_tenantId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "personeller_personelKodu_tenantId_key" ON public.personeller USING btree ("personelKodu", "tenantId");


--
-- Name: personeller_tcKimlikNo_tenantId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "personeller_tcKimlikNo_tenantId_key" ON public.personeller USING btree ("tcKimlikNo", "tenantId");


--
-- Name: personeller_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "personeller_tenantId_idx" ON public.personeller USING btree ("tenantId");


--
-- Name: personeller_tenantId_personelKodu_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "personeller_tenantId_personelKodu_idx" ON public.personeller USING btree ("tenantId", "personelKodu");


--
-- Name: plans_isActive_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "plans_isActive_idx" ON public.plans USING btree ("isActive");


--
-- Name: plans_isBasePlan_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "plans_isBasePlan_idx" ON public.plans USING btree ("isBasePlan");


--
-- Name: plans_slug_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX plans_slug_idx ON public.plans USING btree (slug);


--
-- Name: plans_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX plans_slug_key ON public.plans USING btree (slug);


--
-- Name: postal_codes_city_district_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX postal_codes_city_district_idx ON public.postal_codes USING btree (city, district);


--
-- Name: postal_codes_city_district_neighborhood_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX postal_codes_city_district_neighborhood_idx ON public.postal_codes USING btree (city, district, neighborhood);


--
-- Name: postal_codes_city_district_neighborhood_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX postal_codes_city_district_neighborhood_key ON public.postal_codes USING btree (city, district, neighborhood);


--
-- Name: postal_codes_city_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX postal_codes_city_idx ON public.postal_codes USING btree (city);


--
-- Name: postal_codes_district_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX postal_codes_district_idx ON public.postal_codes USING btree (district);


--
-- Name: postal_codes_neighborhood_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX postal_codes_neighborhood_idx ON public.postal_codes USING btree (neighborhood);


--
-- Name: postal_codes_postalCode_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "postal_codes_postalCode_idx" ON public.postal_codes USING btree ("postalCode");


--
-- Name: price_cards_stok_id_type_created_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX price_cards_stok_id_type_created_at_idx ON public.price_cards USING btree (stok_id, type, created_at);


--
-- Name: price_quotes_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "price_quotes_createdAt_idx" ON public.price_quotes USING btree ("createdAt");


--
-- Name: price_quotes_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "price_quotes_tenantId_idx" ON public.price_quotes USING btree ("tenantId");


--
-- Name: price_quotes_workOrderId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "price_quotes_workOrderId_idx" ON public.price_quotes USING btree ("workOrderId");


--
-- Name: product_barcodes_barcode_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX product_barcodes_barcode_idx ON public.product_barcodes USING btree (barcode);


--
-- Name: product_barcodes_barcode_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX product_barcodes_barcode_key ON public.product_barcodes USING btree (barcode);


--
-- Name: product_barcodes_productId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "product_barcodes_productId_idx" ON public.product_barcodes USING btree ("productId");


--
-- Name: product_location_stocks_locationId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "product_location_stocks_locationId_idx" ON public.product_location_stocks USING btree ("locationId");


--
-- Name: product_location_stocks_productId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "product_location_stocks_productId_idx" ON public.product_location_stocks USING btree ("productId");


--
-- Name: product_location_stocks_warehouseId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "product_location_stocks_warehouseId_idx" ON public.product_location_stocks USING btree ("warehouseId");


--
-- Name: product_location_stocks_warehouseId_locationId_productId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "product_location_stocks_warehouseId_locationId_productId_key" ON public.product_location_stocks USING btree ("warehouseId", "locationId", "productId");


--
-- Name: purchase_order_items_product_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX purchase_order_items_product_id_idx ON public.purchase_order_items USING btree (product_id);


--
-- Name: purchase_order_items_purchase_order_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX purchase_order_items_purchase_order_id_idx ON public.purchase_order_items USING btree (purchase_order_id);


--
-- Name: purchase_orders_orderNumber_tenantId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "purchase_orders_orderNumber_tenantId_key" ON public.purchase_orders USING btree ("orderNumber", "tenantId");


--
-- Name: purchase_orders_order_date_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX purchase_orders_order_date_idx ON public.purchase_orders USING btree (order_date);


--
-- Name: purchase_orders_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX purchase_orders_status_idx ON public.purchase_orders USING btree (status);


--
-- Name: purchase_orders_supplier_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX purchase_orders_supplier_id_idx ON public.purchase_orders USING btree (supplier_id);


--
-- Name: purchase_orders_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "purchase_orders_tenantId_idx" ON public.purchase_orders USING btree ("tenantId");


--
-- Name: purchase_orders_tenantId_orderNumber_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "purchase_orders_tenantId_orderNumber_idx" ON public.purchase_orders USING btree ("tenantId", "orderNumber");


--
-- Name: raflar_depoId_rafKodu_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "raflar_depoId_rafKodu_key" ON public.raflar USING btree ("depoId", "rafKodu");


--
-- Name: role_permissions_roleId_permissionId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "role_permissions_roleId_permissionId_key" ON public.role_permissions USING btree ("roleId", "permissionId");


--
-- Name: roles_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "roles_tenantId_idx" ON public.roles USING btree ("tenantId");


--
-- Name: roles_tenantId_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "roles_tenantId_name_key" ON public.roles USING btree ("tenantId", name);


--
-- Name: satin_alma_irsaliyeleri_cariId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "satin_alma_irsaliyeleri_cariId_idx" ON public.satin_alma_irsaliyeleri USING btree ("cariId");


--
-- Name: satin_alma_irsaliyeleri_durum_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX satin_alma_irsaliyeleri_durum_idx ON public.satin_alma_irsaliyeleri USING btree (durum);


--
-- Name: satin_alma_irsaliyeleri_irsaliyeNo_tenantId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "satin_alma_irsaliyeleri_irsaliyeNo_tenantId_key" ON public.satin_alma_irsaliyeleri USING btree ("irsaliyeNo", "tenantId");


--
-- Name: satin_alma_irsaliyeleri_kaynakId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "satin_alma_irsaliyeleri_kaynakId_idx" ON public.satin_alma_irsaliyeleri USING btree ("kaynakId");


--
-- Name: satin_alma_irsaliyeleri_tenantId_durum_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "satin_alma_irsaliyeleri_tenantId_durum_idx" ON public.satin_alma_irsaliyeleri USING btree ("tenantId", durum);


--
-- Name: satin_alma_irsaliyeleri_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "satin_alma_irsaliyeleri_tenantId_idx" ON public.satin_alma_irsaliyeleri USING btree ("tenantId");


--
-- Name: satin_alma_irsaliyeleri_tenantId_irsaliyeNo_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "satin_alma_irsaliyeleri_tenantId_irsaliyeNo_idx" ON public.satin_alma_irsaliyeleri USING btree ("tenantId", "irsaliyeNo");


--
-- Name: satin_alma_irsaliyeleri_tenantId_irsaliyeTarihi_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "satin_alma_irsaliyeleri_tenantId_irsaliyeTarihi_idx" ON public.satin_alma_irsaliyeleri USING btree ("tenantId", "irsaliyeTarihi");


--
-- Name: satin_alma_irsaliyesi_kalemleri_irsaliyeId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "satin_alma_irsaliyesi_kalemleri_irsaliyeId_idx" ON public.satin_alma_irsaliyesi_kalemleri USING btree ("irsaliyeId");


--
-- Name: satin_alma_irsaliyesi_kalemleri_stokId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "satin_alma_irsaliyesi_kalemleri_stokId_idx" ON public.satin_alma_irsaliyesi_kalemleri USING btree ("stokId");


--
-- Name: satin_alma_irsaliyesi_logs_irsaliyeId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "satin_alma_irsaliyesi_logs_irsaliyeId_idx" ON public.satin_alma_irsaliyesi_logs USING btree ("irsaliyeId");


--
-- Name: satin_alma_irsaliyesi_logs_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "satin_alma_irsaliyesi_logs_userId_idx" ON public.satin_alma_irsaliyesi_logs USING btree ("userId");


--
-- Name: satin_alma_siparis_kalemleri_satınAlmaSiparisId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "satin_alma_siparis_kalemleri_satınAlmaSiparisId_idx" ON public.satin_alma_siparis_kalemleri USING btree ("satınAlmaSiparisId");


--
-- Name: satin_alma_siparis_kalemleri_stokId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "satin_alma_siparis_kalemleri_stokId_idx" ON public.satin_alma_siparis_kalemleri USING btree ("stokId");


--
-- Name: satin_alma_siparis_logs_satınAlmaSiparisId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "satin_alma_siparis_logs_satınAlmaSiparisId_idx" ON public.satin_alma_siparis_logs USING btree ("satınAlmaSiparisId");


--
-- Name: satin_alma_siparis_logs_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "satin_alma_siparis_logs_userId_idx" ON public.satin_alma_siparis_logs USING btree ("userId");


--
-- Name: satin_alma_siparisleri_cariId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "satin_alma_siparisleri_cariId_idx" ON public.satin_alma_siparisleri USING btree ("cariId");


--
-- Name: satin_alma_siparisleri_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "satin_alma_siparisleri_createdAt_idx" ON public.satin_alma_siparisleri USING btree ("createdAt");


--
-- Name: satin_alma_siparisleri_deliveryNoteId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "satin_alma_siparisleri_deliveryNoteId_key" ON public.satin_alma_siparisleri USING btree ("deliveryNoteId");


--
-- Name: satin_alma_siparisleri_durum_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX satin_alma_siparisleri_durum_idx ON public.satin_alma_siparisleri USING btree (durum);


--
-- Name: satin_alma_siparisleri_siparisNo_tenantId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "satin_alma_siparisleri_siparisNo_tenantId_key" ON public.satin_alma_siparisleri USING btree ("siparisNo", "tenantId");


--
-- Name: satin_alma_siparisleri_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "satin_alma_siparisleri_tenantId_idx" ON public.satin_alma_siparisleri USING btree ("tenantId");


--
-- Name: satin_alma_siparisleri_tenantId_siparisNo_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "satin_alma_siparisleri_tenantId_siparisNo_idx" ON public.satin_alma_siparisleri USING btree ("tenantId", "siparisNo");


--
-- Name: satis_elemanlari_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "satis_elemanlari_tenantId_idx" ON public.satis_elemanlari USING btree ("tenantId");


--
-- Name: satis_irsaliyeleri_cariId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "satis_irsaliyeleri_cariId_idx" ON public.satis_irsaliyeleri USING btree ("cariId");


--
-- Name: satis_irsaliyeleri_durum_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX satis_irsaliyeleri_durum_idx ON public.satis_irsaliyeleri USING btree (durum);


--
-- Name: satis_irsaliyeleri_irsaliyeNo_tenantId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "satis_irsaliyeleri_irsaliyeNo_tenantId_key" ON public.satis_irsaliyeleri USING btree ("irsaliyeNo", "tenantId");


--
-- Name: satis_irsaliyeleri_kaynakId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "satis_irsaliyeleri_kaynakId_idx" ON public.satis_irsaliyeleri USING btree ("kaynakId");


--
-- Name: satis_irsaliyeleri_tenantId_durum_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "satis_irsaliyeleri_tenantId_durum_idx" ON public.satis_irsaliyeleri USING btree ("tenantId", durum);


--
-- Name: satis_irsaliyeleri_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "satis_irsaliyeleri_tenantId_idx" ON public.satis_irsaliyeleri USING btree ("tenantId");


--
-- Name: satis_irsaliyeleri_tenantId_irsaliyeNo_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "satis_irsaliyeleri_tenantId_irsaliyeNo_idx" ON public.satis_irsaliyeleri USING btree ("tenantId", "irsaliyeNo");


--
-- Name: satis_irsaliyeleri_tenantId_irsaliyeTarihi_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "satis_irsaliyeleri_tenantId_irsaliyeTarihi_idx" ON public.satis_irsaliyeleri USING btree ("tenantId", "irsaliyeTarihi");


--
-- Name: satis_irsaliyesi_kalemleri_irsaliyeId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "satis_irsaliyesi_kalemleri_irsaliyeId_idx" ON public.satis_irsaliyesi_kalemleri USING btree ("irsaliyeId");


--
-- Name: satis_irsaliyesi_kalemleri_stokId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "satis_irsaliyesi_kalemleri_stokId_idx" ON public.satis_irsaliyesi_kalemleri USING btree ("stokId");


--
-- Name: satis_irsaliyesi_logs_irsaliyeId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "satis_irsaliyesi_logs_irsaliyeId_idx" ON public.satis_irsaliyesi_logs USING btree ("irsaliyeId");


--
-- Name: satis_irsaliyesi_logs_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "satis_irsaliyesi_logs_userId_idx" ON public.satis_irsaliyesi_logs USING btree ("userId");


--
-- Name: sayim_kalemleri_locationId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "sayim_kalemleri_locationId_idx" ON public.sayim_kalemleri USING btree ("locationId");


--
-- Name: sayim_kalemleri_sayimId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "sayim_kalemleri_sayimId_idx" ON public.sayim_kalemleri USING btree ("sayimId");


--
-- Name: sayim_kalemleri_stokId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "sayim_kalemleri_stokId_idx" ON public.sayim_kalemleri USING btree ("stokId");


--
-- Name: sayimlar_sayimNo_tenantId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "sayimlar_sayimNo_tenantId_key" ON public.sayimlar USING btree ("sayimNo", "tenantId");


--
-- Name: sayimlar_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "sayimlar_tenantId_idx" ON public.sayimlar USING btree ("tenantId");


--
-- Name: sayimlar_tenantId_sayimNo_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "sayimlar_tenantId_sayimNo_idx" ON public.sayimlar USING btree ("tenantId", "sayimNo");


--
-- Name: sessions_expiresAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "sessions_expiresAt_idx" ON public.sessions USING btree ("expiresAt");


--
-- Name: sessions_refreshToken_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "sessions_refreshToken_idx" ON public.sessions USING btree ("refreshToken");


--
-- Name: sessions_refreshToken_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "sessions_refreshToken_key" ON public.sessions USING btree ("refreshToken");


--
-- Name: sessions_token_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX sessions_token_idx ON public.sessions USING btree (token);


--
-- Name: sessions_token_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX sessions_token_key ON public.sessions USING btree (token);


--
-- Name: sessions_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "sessions_userId_idx" ON public.sessions USING btree ("userId");


--
-- Name: siparis_hazirliklar_locationId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "siparis_hazirliklar_locationId_idx" ON public.siparis_hazirliklar USING btree ("locationId");


--
-- Name: siparis_hazirliklar_siparisId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "siparis_hazirliklar_siparisId_idx" ON public.siparis_hazirliklar USING btree ("siparisId");


--
-- Name: siparis_hazirliklar_siparisKalemiId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "siparis_hazirliklar_siparisKalemiId_idx" ON public.siparis_hazirliklar USING btree ("siparisKalemiId");


--
-- Name: siparis_logs_siparisId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "siparis_logs_siparisId_idx" ON public.siparis_logs USING btree ("siparisId");


--
-- Name: siparis_logs_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "siparis_logs_userId_idx" ON public.siparis_logs USING btree ("userId");


--
-- Name: siparisler_deliveryNoteId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "siparisler_deliveryNoteId_idx" ON public.siparisler USING btree ("deliveryNoteId");


--
-- Name: siparisler_deliveryNoteId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "siparisler_deliveryNoteId_key" ON public.siparisler USING btree ("deliveryNoteId");


--
-- Name: siparisler_siparisNo_tenantId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "siparisler_siparisNo_tenantId_key" ON public.siparisler USING btree ("siparisNo", "tenantId");


--
-- Name: siparisler_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "siparisler_tenantId_idx" ON public.siparisler USING btree ("tenantId");


--
-- Name: siparisler_tenantId_siparisNo_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "siparisler_tenantId_siparisNo_idx" ON public.siparisler USING btree ("tenantId", "siparisNo");


--
-- Name: solution_package_parts_solutionPackageId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "solution_package_parts_solutionPackageId_idx" ON public.solution_package_parts USING btree ("solutionPackageId");


--
-- Name: solution_package_parts_solutionPackageId_productId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "solution_package_parts_solutionPackageId_productId_key" ON public.solution_package_parts USING btree ("solutionPackageId", "productId");


--
-- Name: solution_packages_tenantId_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "solution_packages_tenantId_createdAt_idx" ON public.solution_packages USING btree ("tenantId", "createdAt");


--
-- Name: solution_packages_tenantId_workOrderId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "solution_packages_tenantId_workOrderId_idx" ON public.solution_packages USING btree ("tenantId", "workOrderId");


--
-- Name: stock_cost_history_stok_id_computed_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX stock_cost_history_stok_id_computed_at_idx ON public.stock_cost_history USING btree (stok_id, computed_at);


--
-- Name: stock_moves_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "stock_moves_createdAt_idx" ON public.stock_moves USING btree ("createdAt");


--
-- Name: stock_moves_fromWarehouseId_fromLocationId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "stock_moves_fromWarehouseId_fromLocationId_idx" ON public.stock_moves USING btree ("fromWarehouseId", "fromLocationId");


--
-- Name: stock_moves_moveType_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "stock_moves_moveType_idx" ON public.stock_moves USING btree ("moveType");


--
-- Name: stock_moves_productId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "stock_moves_productId_idx" ON public.stock_moves USING btree ("productId");


--
-- Name: stock_moves_refType_refId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "stock_moves_refType_refId_idx" ON public.stock_moves USING btree ("refType", "refId");


--
-- Name: stock_moves_toWarehouseId_toLocationId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "stock_moves_toWarehouseId_toLocationId_idx" ON public.stock_moves USING btree ("toWarehouseId", "toLocationId");


--
-- Name: stok_esdegers_stok1Id_stok2Id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "stok_esdegers_stok1Id_stok2Id_key" ON public.stok_esdegers USING btree ("stok1Id", "stok2Id");


--
-- Name: stok_hareketleri_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "stok_hareketleri_tenantId_idx" ON public.stok_hareketleri USING btree ("tenantId");


--
-- Name: stoklar_barkod_tenantId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "stoklar_barkod_tenantId_key" ON public.stoklar USING btree (barkod, "tenantId");


--
-- Name: stoklar_stokKodu_tenantId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "stoklar_stokKodu_tenantId_key" ON public.stoklar USING btree ("stokKodu", "tenantId");


--
-- Name: stoklar_tenantId_barkod_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "stoklar_tenantId_barkod_idx" ON public.stoklar USING btree ("tenantId", barkod);


--
-- Name: stoklar_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "stoklar_tenantId_idx" ON public.stoklar USING btree ("tenantId");


--
-- Name: stoklar_tenantId_stokKodu_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "stoklar_tenantId_stokKodu_idx" ON public.stoklar USING btree ("tenantId", "stokKodu");


--
-- Name: subscriptions_endDate_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "subscriptions_endDate_idx" ON public.subscriptions USING btree ("endDate");


--
-- Name: subscriptions_iyzicoSubscriptionRef_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "subscriptions_iyzicoSubscriptionRef_key" ON public.subscriptions USING btree ("iyzicoSubscriptionRef");


--
-- Name: subscriptions_nextBillingDate_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "subscriptions_nextBillingDate_idx" ON public.subscriptions USING btree ("nextBillingDate");


--
-- Name: subscriptions_planId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "subscriptions_planId_idx" ON public.subscriptions USING btree ("planId");


--
-- Name: subscriptions_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX subscriptions_status_idx ON public.subscriptions USING btree (status);


--
-- Name: subscriptions_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "subscriptions_tenantId_idx" ON public.subscriptions USING btree ("tenantId");


--
-- Name: subscriptions_tenantId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "subscriptions_tenantId_key" ON public.subscriptions USING btree ("tenantId");


--
-- Name: system_parameters_category_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX system_parameters_category_idx ON public.system_parameters USING btree (category);


--
-- Name: system_parameters_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "system_parameters_tenantId_idx" ON public.system_parameters USING btree ("tenantId");


--
-- Name: system_parameters_tenantId_key_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "system_parameters_tenantId_key_key" ON public.system_parameters USING btree ("tenantId", key);


--
-- Name: tahsilatlar_tenantId_deletedAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "tahsilatlar_tenantId_deletedAt_idx" ON public.tahsilatlar USING btree ("tenantId", "deletedAt");


--
-- Name: tahsilatlar_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "tahsilatlar_tenantId_idx" ON public.tahsilatlar USING btree ("tenantId");


--
-- Name: tahsilatlar_tenantId_tarih_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "tahsilatlar_tenantId_tarih_idx" ON public.tahsilatlar USING btree ("tenantId", tarih);


--
-- Name: tahsilatlar_workOrderId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "tahsilatlar_workOrderId_idx" ON public.tahsilatlar USING btree ("workOrderId");


--
-- Name: technical_findings_tenantId_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "technical_findings_tenantId_createdAt_idx" ON public.technical_findings USING btree ("tenantId", "createdAt");


--
-- Name: technical_findings_tenantId_workOrderId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "technical_findings_tenantId_workOrderId_idx" ON public.technical_findings USING btree ("tenantId", "workOrderId");


--
-- Name: teklif_logs_teklifId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "teklif_logs_teklifId_idx" ON public.teklif_logs USING btree ("teklifId");


--
-- Name: teklif_logs_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "teklif_logs_userId_idx" ON public.teklif_logs USING btree ("userId");


--
-- Name: teklifler_teklifNo_tenantId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "teklifler_teklifNo_tenantId_key" ON public.teklifler USING btree ("teklifNo", "tenantId");


--
-- Name: teklifler_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "teklifler_tenantId_idx" ON public.teklifler USING btree ("tenantId");


--
-- Name: teklifler_tenantId_teklifNo_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "teklifler_tenantId_teklifNo_idx" ON public.teklifler USING btree ("tenantId", "teklifNo");


--
-- Name: tenant_purge_audits_adminId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "tenant_purge_audits_adminId_idx" ON public.tenant_purge_audits USING btree ("adminId");


--
-- Name: tenant_purge_audits_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "tenant_purge_audits_createdAt_idx" ON public.tenant_purge_audits USING btree ("createdAt");


--
-- Name: tenant_purge_audits_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "tenant_purge_audits_tenantId_idx" ON public.tenant_purge_audits USING btree ("tenantId");


--
-- Name: tenant_settings_tenantId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "tenant_settings_tenantId_key" ON public.tenant_settings USING btree ("tenantId");


--
-- Name: tenants_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "tenants_createdAt_idx" ON public.tenants USING btree ("createdAt");


--
-- Name: tenants_domain_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX tenants_domain_idx ON public.tenants USING btree (domain);


--
-- Name: tenants_domain_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX tenants_domain_key ON public.tenants USING btree (domain);


--
-- Name: tenants_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX tenants_status_idx ON public.tenants USING btree (status);


--
-- Name: tenants_subdomain_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX tenants_subdomain_idx ON public.tenants USING btree (subdomain);


--
-- Name: tenants_subdomain_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX tenants_subdomain_key ON public.tenants USING btree (subdomain);


--
-- Name: tenants_uuid_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX tenants_uuid_key ON public.tenants USING btree (uuid);


--
-- Name: urun_raflar_stokId_rafId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "urun_raflar_stokId_rafId_key" ON public.urun_raflar USING btree ("stokId", "rafId");


--
-- Name: user_licenses_licenseType_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "user_licenses_licenseType_idx" ON public.user_licenses USING btree ("licenseType");


--
-- Name: user_licenses_moduleId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "user_licenses_moduleId_idx" ON public.user_licenses USING btree ("moduleId");


--
-- Name: user_licenses_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "user_licenses_userId_idx" ON public.user_licenses USING btree ("userId");


--
-- Name: user_licenses_userId_licenseType_moduleId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "user_licenses_userId_licenseType_moduleId_key" ON public.user_licenses USING btree ("userId", "licenseType", "moduleId");


--
-- Name: users_email_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX users_email_idx ON public.users USING btree (email);


--
-- Name: users_email_tenantId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "users_email_tenantId_key" ON public.users USING btree (email, "tenantId");


--
-- Name: users_role_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX users_role_idx ON public.users USING btree (role);


--
-- Name: users_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX users_status_idx ON public.users USING btree (status);


--
-- Name: users_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "users_tenantId_idx" ON public.users USING btree ("tenantId");


--
-- Name: users_username_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX users_username_idx ON public.users USING btree (username);


--
-- Name: users_uuid_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX users_uuid_key ON public.users USING btree (uuid);


--
-- Name: warehouse_critical_stocks_productId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "warehouse_critical_stocks_productId_idx" ON public.warehouse_critical_stocks USING btree ("productId");


--
-- Name: warehouse_critical_stocks_warehouseId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "warehouse_critical_stocks_warehouseId_idx" ON public.warehouse_critical_stocks USING btree ("warehouseId");


--
-- Name: warehouse_critical_stocks_warehouseId_productId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "warehouse_critical_stocks_warehouseId_productId_key" ON public.warehouse_critical_stocks USING btree ("warehouseId", "productId");


--
-- Name: warehouse_transfer_items_stokId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "warehouse_transfer_items_stokId_idx" ON public.warehouse_transfer_items USING btree ("stokId");


--
-- Name: warehouse_transfer_items_transferId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "warehouse_transfer_items_transferId_idx" ON public.warehouse_transfer_items USING btree ("transferId");


--
-- Name: warehouse_transfer_logs_transferId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "warehouse_transfer_logs_transferId_idx" ON public.warehouse_transfer_logs USING btree ("transferId");


--
-- Name: warehouse_transfer_logs_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "warehouse_transfer_logs_userId_idx" ON public.warehouse_transfer_logs USING btree ("userId");


--
-- Name: warehouse_transfers_fromWarehouseId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "warehouse_transfers_fromWarehouseId_idx" ON public.warehouse_transfers USING btree ("fromWarehouseId");


--
-- Name: warehouse_transfers_tarih_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX warehouse_transfers_tarih_idx ON public.warehouse_transfers USING btree (tarih);


--
-- Name: warehouse_transfers_tenantId_durum_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "warehouse_transfers_tenantId_durum_idx" ON public.warehouse_transfers USING btree ("tenantId", durum);


--
-- Name: warehouse_transfers_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "warehouse_transfers_tenantId_idx" ON public.warehouse_transfers USING btree ("tenantId");


--
-- Name: warehouse_transfers_toWarehouseId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "warehouse_transfers_toWarehouseId_idx" ON public.warehouse_transfers USING btree ("toWarehouseId");


--
-- Name: warehouse_transfers_transferNo_tenantId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "warehouse_transfers_transferNo_tenantId_key" ON public.warehouse_transfers USING btree ("transferNo", "tenantId");


--
-- Name: warehouses_code_tenantId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "warehouses_code_tenantId_key" ON public.warehouses USING btree (code, "tenantId");


--
-- Name: warehouses_tenantId_code_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "warehouses_tenantId_code_idx" ON public.warehouses USING btree ("tenantId", code);


--
-- Name: warehouses_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "warehouses_tenantId_idx" ON public.warehouses USING btree ("tenantId");


--
-- Name: audit_logs audit_logs_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT "audit_logs_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: avans_mahsuplasmalar avans_mahsuplasmalar_avansId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.avans_mahsuplasmalar
    ADD CONSTRAINT "avans_mahsuplasmalar_avansId_fkey" FOREIGN KEY ("avansId") REFERENCES public.avanslar(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: avans_mahsuplasmalar avans_mahsuplasmalar_planId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.avans_mahsuplasmalar
    ADD CONSTRAINT "avans_mahsuplasmalar_planId_fkey" FOREIGN KEY ("planId") REFERENCES public.maas_planlari(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: avans_mahsuplasmalar avans_mahsuplasmalar_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.avans_mahsuplasmalar
    ADD CONSTRAINT "avans_mahsuplasmalar_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: avanslar avanslar_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.avanslar
    ADD CONSTRAINT "avanslar_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: avanslar avanslar_kasaId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.avanslar
    ADD CONSTRAINT "avanslar_kasaId_fkey" FOREIGN KEY ("kasaId") REFERENCES public.kasalar(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: avanslar avanslar_personelId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.avanslar
    ADD CONSTRAINT "avanslar_personelId_fkey" FOREIGN KEY ("personelId") REFERENCES public.personeller(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: avanslar avanslar_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.avanslar
    ADD CONSTRAINT "avanslar_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: banka_havale_logs banka_havale_logs_bankaHavaleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.banka_havale_logs
    ADD CONSTRAINT "banka_havale_logs_bankaHavaleId_fkey" FOREIGN KEY ("bankaHavaleId") REFERENCES public.banka_havaleler(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: banka_havale_logs banka_havale_logs_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.banka_havale_logs
    ADD CONSTRAINT "banka_havale_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: banka_havaleler banka_havaleler_bankaHesabiId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.banka_havaleler
    ADD CONSTRAINT "banka_havaleler_bankaHesabiId_fkey" FOREIGN KEY ("bankaHesabiId") REFERENCES public.kasalar(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: banka_havaleler banka_havaleler_bankaHesapId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.banka_havaleler
    ADD CONSTRAINT "banka_havaleler_bankaHesapId_fkey" FOREIGN KEY ("bankaHesapId") REFERENCES public.banka_hesaplari(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: banka_havaleler banka_havaleler_cariId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.banka_havaleler
    ADD CONSTRAINT "banka_havaleler_cariId_fkey" FOREIGN KEY ("cariId") REFERENCES public.cariler(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: banka_havaleler banka_havaleler_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.banka_havaleler
    ADD CONSTRAINT "banka_havaleler_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: banka_havaleler banka_havaleler_deletedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.banka_havaleler
    ADD CONSTRAINT "banka_havaleler_deletedBy_fkey" FOREIGN KEY ("deletedBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: banka_havaleler banka_havaleler_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.banka_havaleler
    ADD CONSTRAINT "banka_havaleler_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: banka_havaleler banka_havaleler_updatedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.banka_havaleler
    ADD CONSTRAINT "banka_havaleler_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: banka_hesap_hareketler banka_hesap_hareketler_cariId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.banka_hesap_hareketler
    ADD CONSTRAINT "banka_hesap_hareketler_cariId_fkey" FOREIGN KEY ("cariId") REFERENCES public.cariler(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: banka_hesap_hareketler banka_hesap_hareketler_hesapId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.banka_hesap_hareketler
    ADD CONSTRAINT "banka_hesap_hareketler_hesapId_fkey" FOREIGN KEY ("hesapId") REFERENCES public.banka_hesaplari(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: banka_hesaplari banka_hesaplari_bankaId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.banka_hesaplari
    ADD CONSTRAINT "banka_hesaplari_bankaId_fkey" FOREIGN KEY ("bankaId") REFERENCES public.bankalar(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: banka_kredi_planlari banka_kredi_planlari_krediId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.banka_kredi_planlari
    ADD CONSTRAINT "banka_kredi_planlari_krediId_fkey" FOREIGN KEY ("krediId") REFERENCES public.banka_krediler(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: banka_krediler banka_krediler_bankaHesapId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.banka_krediler
    ADD CONSTRAINT "banka_krediler_bankaHesapId_fkey" FOREIGN KEY ("bankaHesapId") REFERENCES public.banka_hesaplari(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: bankalar bankalar_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bankalar
    ADD CONSTRAINT "bankalar_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: basit_siparisler basit_siparisler_firmaId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.basit_siparisler
    ADD CONSTRAINT "basit_siparisler_firmaId_fkey" FOREIGN KEY ("firmaId") REFERENCES public.cariler(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: basit_siparisler basit_siparisler_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.basit_siparisler
    ADD CONSTRAINT "basit_siparisler_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: basit_siparisler basit_siparisler_urunId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.basit_siparisler
    ADD CONSTRAINT "basit_siparisler_urunId_fkey" FOREIGN KEY ("urunId") REFERENCES public.stoklar(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: bordrolar bordrolar_bankaHesabiId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bordrolar
    ADD CONSTRAINT "bordrolar_bankaHesabiId_fkey" FOREIGN KEY ("bankaHesabiId") REFERENCES public.banka_hesaplari(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: bordrolar bordrolar_cariId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bordrolar
    ADD CONSTRAINT "bordrolar_cariId_fkey" FOREIGN KEY ("cariId") REFERENCES public.cariler(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: bordrolar bordrolar_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bordrolar
    ADD CONSTRAINT "bordrolar_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: bordrolar bordrolar_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bordrolar
    ADD CONSTRAINT "bordrolar_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: cari_adresler cari_adresler_cariId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cari_adresler
    ADD CONSTRAINT "cari_adresler_cariId_fkey" FOREIGN KEY ("cariId") REFERENCES public.cariler(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: cari_bankalar cari_bankalar_cariId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cari_bankalar
    ADD CONSTRAINT "cari_bankalar_cariId_fkey" FOREIGN KEY ("cariId") REFERENCES public.cariler(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: cari_hareketler cari_hareketler_cariId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cari_hareketler
    ADD CONSTRAINT "cari_hareketler_cariId_fkey" FOREIGN KEY ("cariId") REFERENCES public.cariler(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: cari_hareketler cari_hareketler_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cari_hareketler
    ADD CONSTRAINT "cari_hareketler_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: cari_yetkililer cari_yetkililer_cariId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cari_yetkililer
    ADD CONSTRAINT "cari_yetkililer_cariId_fkey" FOREIGN KEY ("cariId") REFERENCES public.cariler(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: cariler cariler_satisElemaniId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cariler
    ADD CONSTRAINT "cariler_satisElemaniId_fkey" FOREIGN KEY ("satisElemaniId") REFERENCES public.satis_elemanlari(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: cariler cariler_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cariler
    ADD CONSTRAINT "cariler_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: cek_senet_logs cek_senet_logs_cekSenetId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cek_senet_logs
    ADD CONSTRAINT "cek_senet_logs_cekSenetId_fkey" FOREIGN KEY ("cekSenetId") REFERENCES public.cek_senetler(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: cek_senet_logs cek_senet_logs_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cek_senet_logs
    ADD CONSTRAINT "cek_senet_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: cek_senetler cek_senetler_cariId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cek_senetler
    ADD CONSTRAINT "cek_senetler_cariId_fkey" FOREIGN KEY ("cariId") REFERENCES public.cariler(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: cek_senetler cek_senetler_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cek_senetler
    ADD CONSTRAINT "cek_senetler_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: cek_senetler cek_senetler_deletedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cek_senetler
    ADD CONSTRAINT "cek_senetler_deletedBy_fkey" FOREIGN KEY ("deletedBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: cek_senetler cek_senetler_sonBordroId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cek_senetler
    ADD CONSTRAINT "cek_senetler_sonBordroId_fkey" FOREIGN KEY ("sonBordroId") REFERENCES public.bordrolar(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: cek_senetler cek_senetler_tahsilKasaId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cek_senetler
    ADD CONSTRAINT "cek_senetler_tahsilKasaId_fkey" FOREIGN KEY ("tahsilKasaId") REFERENCES public.kasalar(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: cek_senetler cek_senetler_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cek_senetler
    ADD CONSTRAINT "cek_senetler_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: cek_senetler cek_senetler_updatedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cek_senetler
    ADD CONSTRAINT "cek_senetler_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: code_templates code_templates_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.code_templates
    ADD CONSTRAINT "code_templates_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: deleted_banka_havaleler deleted_banka_havaleler_deletedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.deleted_banka_havaleler
    ADD CONSTRAINT "deleted_banka_havaleler_deletedBy_fkey" FOREIGN KEY ("deletedBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: deleted_cek_senetler deleted_cek_senetler_deletedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.deleted_cek_senetler
    ADD CONSTRAINT "deleted_cek_senetler_deletedBy_fkey" FOREIGN KEY ("deletedBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: efatura_xml efatura_xml_faturaId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.efatura_xml
    ADD CONSTRAINT "efatura_xml_faturaId_fkey" FOREIGN KEY ("faturaId") REFERENCES public.faturalar(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: fatura_kalemleri fatura_kalemleri_faturaId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fatura_kalemleri
    ADD CONSTRAINT "fatura_kalemleri_faturaId_fkey" FOREIGN KEY ("faturaId") REFERENCES public.faturalar(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: fatura_kalemleri fatura_kalemleri_purchaseOrderItemId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fatura_kalemleri
    ADD CONSTRAINT "fatura_kalemleri_purchaseOrderItemId_fkey" FOREIGN KEY ("purchaseOrderItemId") REFERENCES public.purchase_order_items(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: fatura_kalemleri fatura_kalemleri_stokId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fatura_kalemleri
    ADD CONSTRAINT "fatura_kalemleri_stokId_fkey" FOREIGN KEY ("stokId") REFERENCES public.stoklar(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: fatura_logs fatura_logs_faturaId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fatura_logs
    ADD CONSTRAINT "fatura_logs_faturaId_fkey" FOREIGN KEY ("faturaId") REFERENCES public.faturalar(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: fatura_logs fatura_logs_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fatura_logs
    ADD CONSTRAINT "fatura_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: fatura_tahsilatlar fatura_tahsilatlar_faturaId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fatura_tahsilatlar
    ADD CONSTRAINT "fatura_tahsilatlar_faturaId_fkey" FOREIGN KEY ("faturaId") REFERENCES public.faturalar(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: fatura_tahsilatlar fatura_tahsilatlar_tahsilatId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fatura_tahsilatlar
    ADD CONSTRAINT "fatura_tahsilatlar_tahsilatId_fkey" FOREIGN KEY ("tahsilatId") REFERENCES public.tahsilatlar(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: fatura_tahsilatlar fatura_tahsilatlar_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fatura_tahsilatlar
    ADD CONSTRAINT "fatura_tahsilatlar_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: faturalar faturalar_cariId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.faturalar
    ADD CONSTRAINT "faturalar_cariId_fkey" FOREIGN KEY ("cariId") REFERENCES public.cariler(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: faturalar faturalar_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.faturalar
    ADD CONSTRAINT "faturalar_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: faturalar faturalar_deletedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.faturalar
    ADD CONSTRAINT "faturalar_deletedBy_fkey" FOREIGN KEY ("deletedBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: faturalar faturalar_deliveryNoteId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.faturalar
    ADD CONSTRAINT "faturalar_deliveryNoteId_fkey" FOREIGN KEY ("deliveryNoteId") REFERENCES public.satis_irsaliyeleri(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: faturalar faturalar_purchaseOrderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.faturalar
    ADD CONSTRAINT "faturalar_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES public.purchase_orders(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: faturalar faturalar_satinAlmaIrsaliyeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.faturalar
    ADD CONSTRAINT "faturalar_satinAlmaIrsaliyeId_fkey" FOREIGN KEY ("satinAlmaIrsaliyeId") REFERENCES public.satin_alma_irsaliyeleri(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: faturalar faturalar_satinAlmaSiparisiId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.faturalar
    ADD CONSTRAINT "faturalar_satinAlmaSiparisiId_fkey" FOREIGN KEY ("satinAlmaSiparisiId") REFERENCES public.satin_alma_siparisleri(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: faturalar faturalar_satisElemaniId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.faturalar
    ADD CONSTRAINT "faturalar_satisElemaniId_fkey" FOREIGN KEY ("satisElemaniId") REFERENCES public.satis_elemanlari(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: faturalar faturalar_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.faturalar
    ADD CONSTRAINT "faturalar_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: faturalar faturalar_updatedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.faturalar
    ADD CONSTRAINT "faturalar_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: firma_kredi_karti_hareketler firma_kredi_karti_hareketler_cariId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.firma_kredi_karti_hareketler
    ADD CONSTRAINT "firma_kredi_karti_hareketler_cariId_fkey" FOREIGN KEY ("cariId") REFERENCES public.cariler(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: firma_kredi_karti_hareketler firma_kredi_karti_hareketler_kartId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.firma_kredi_karti_hareketler
    ADD CONSTRAINT "firma_kredi_karti_hareketler_kartId_fkey" FOREIGN KEY ("kartId") REFERENCES public.firma_kredi_kartlari(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: firma_kredi_karti_hatirlaticilar firma_kredi_karti_hatirlaticilar_kartId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.firma_kredi_karti_hatirlaticilar
    ADD CONSTRAINT "firma_kredi_karti_hatirlaticilar_kartId_fkey" FOREIGN KEY ("kartId") REFERENCES public.firma_kredi_kartlari(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: firma_kredi_kartlari firma_kredi_kartlari_kasaId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.firma_kredi_kartlari
    ADD CONSTRAINT "firma_kredi_kartlari_kasaId_fkey" FOREIGN KEY ("kasaId") REFERENCES public.kasalar(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: invitations invitations_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invitations
    ADD CONSTRAINT "invitations_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: invoice_profit invoice_profit_faturaId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoice_profit
    ADD CONSTRAINT "invoice_profit_faturaId_fkey" FOREIGN KEY ("faturaId") REFERENCES public.faturalar(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: invoice_profit invoice_profit_faturaKalemiId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoice_profit
    ADD CONSTRAINT "invoice_profit_faturaKalemiId_fkey" FOREIGN KEY ("faturaKalemiId") REFERENCES public.fatura_kalemleri(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: invoice_profit invoice_profit_stokId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoice_profit
    ADD CONSTRAINT "invoice_profit_stokId_fkey" FOREIGN KEY ("stokId") REFERENCES public.stoklar(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: invoice_profit invoice_profit_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoice_profit
    ADD CONSTRAINT "invoice_profit_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: kasa_hareketler kasa_hareketler_cariId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kasa_hareketler
    ADD CONSTRAINT "kasa_hareketler_cariId_fkey" FOREIGN KEY ("cariId") REFERENCES public.cariler(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: kasa_hareketler kasa_hareketler_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kasa_hareketler
    ADD CONSTRAINT "kasa_hareketler_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: kasa_hareketler kasa_hareketler_kasaId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kasa_hareketler
    ADD CONSTRAINT "kasa_hareketler_kasaId_fkey" FOREIGN KEY ("kasaId") REFERENCES public.kasalar(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: kasalar kasalar_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kasalar
    ADD CONSTRAINT "kasalar_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: kasalar kasalar_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kasalar
    ADD CONSTRAINT "kasalar_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: kasalar kasalar_updatedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kasalar
    ADD CONSTRAINT "kasalar_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: locations locations_warehouseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.locations
    ADD CONSTRAINT "locations_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES public.warehouses(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: maas_odeme_detaylari maas_odeme_detaylari_bankaHesapId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maas_odeme_detaylari
    ADD CONSTRAINT "maas_odeme_detaylari_bankaHesapId_fkey" FOREIGN KEY ("bankaHesapId") REFERENCES public.banka_hesaplari(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: maas_odeme_detaylari maas_odeme_detaylari_kasaId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maas_odeme_detaylari
    ADD CONSTRAINT "maas_odeme_detaylari_kasaId_fkey" FOREIGN KEY ("kasaId") REFERENCES public.kasalar(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: maas_odeme_detaylari maas_odeme_detaylari_odemeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maas_odeme_detaylari
    ADD CONSTRAINT "maas_odeme_detaylari_odemeId_fkey" FOREIGN KEY ("odemeId") REFERENCES public.maas_odemeler(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: maas_odeme_detaylari maas_odeme_detaylari_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maas_odeme_detaylari
    ADD CONSTRAINT "maas_odeme_detaylari_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: maas_odemeler maas_odemeler_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maas_odemeler
    ADD CONSTRAINT "maas_odemeler_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: maas_odemeler maas_odemeler_personelId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maas_odemeler
    ADD CONSTRAINT "maas_odemeler_personelId_fkey" FOREIGN KEY ("personelId") REFERENCES public.personeller(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: maas_odemeler maas_odemeler_planId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maas_odemeler
    ADD CONSTRAINT "maas_odemeler_planId_fkey" FOREIGN KEY ("planId") REFERENCES public.maas_planlari(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: maas_odemeler maas_odemeler_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maas_odemeler
    ADD CONSTRAINT "maas_odemeler_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: maas_planlari maas_planlari_personelId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maas_planlari
    ADD CONSTRAINT "maas_planlari_personelId_fkey" FOREIGN KEY ("personelId") REFERENCES public.personeller(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: maas_planlari maas_planlari_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maas_planlari
    ADD CONSTRAINT "maas_planlari_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: manager_approvals manager_approvals_solutionPackageId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.manager_approvals
    ADD CONSTRAINT "manager_approvals_solutionPackageId_fkey" FOREIGN KEY ("solutionPackageId") REFERENCES public.solution_packages(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: manager_rejections manager_rejections_solutionPackageId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.manager_rejections
    ADD CONSTRAINT "manager_rejections_solutionPackageId_fkey" FOREIGN KEY ("solutionPackageId") REFERENCES public.solution_packages(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: masraflar masraflar_kategoriId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.masraflar
    ADD CONSTRAINT "masraflar_kategoriId_fkey" FOREIGN KEY ("kategoriId") REFERENCES public.masraf_kategoriler(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: masraflar masraflar_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.masraflar
    ADD CONSTRAINT "masraflar_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: module_licenses module_licenses_moduleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.module_licenses
    ADD CONSTRAINT "module_licenses_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES public.modules(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: module_licenses module_licenses_subscriptionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.module_licenses
    ADD CONSTRAINT "module_licenses_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES public.subscriptions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: payments payments_subscriptionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT "payments_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES public.subscriptions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: personel_odemeler personel_odemeler_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.personel_odemeler
    ADD CONSTRAINT "personel_odemeler_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: personel_odemeler personel_odemeler_kasaId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.personel_odemeler
    ADD CONSTRAINT "personel_odemeler_kasaId_fkey" FOREIGN KEY ("kasaId") REFERENCES public.kasalar(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: personel_odemeler personel_odemeler_personelId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.personel_odemeler
    ADD CONSTRAINT "personel_odemeler_personelId_fkey" FOREIGN KEY ("personelId") REFERENCES public.personeller(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: personeller personeller_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.personeller
    ADD CONSTRAINT "personeller_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: personeller personeller_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.personeller
    ADD CONSTRAINT "personeller_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: personeller personeller_updatedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.personeller
    ADD CONSTRAINT "personeller_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: price_cards price_cards_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.price_cards
    ADD CONSTRAINT price_cards_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: price_cards price_cards_stok_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.price_cards
    ADD CONSTRAINT price_cards_stok_id_fkey FOREIGN KEY (stok_id) REFERENCES public.stoklar(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: price_cards price_cards_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.price_cards
    ADD CONSTRAINT price_cards_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: product_barcodes product_barcodes_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_barcodes
    ADD CONSTRAINT "product_barcodes_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.stoklar(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_location_stocks product_location_stocks_locationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_location_stocks
    ADD CONSTRAINT "product_location_stocks_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES public.locations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_location_stocks product_location_stocks_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_location_stocks
    ADD CONSTRAINT "product_location_stocks_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.stoklar(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_location_stocks product_location_stocks_warehouseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_location_stocks
    ADD CONSTRAINT "product_location_stocks_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES public.warehouses(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: purchase_order_items purchase_order_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_order_items
    ADD CONSTRAINT purchase_order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.stoklar(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: purchase_order_items purchase_order_items_purchase_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_order_items
    ADD CONSTRAINT purchase_order_items_purchase_order_id_fkey FOREIGN KEY (purchase_order_id) REFERENCES public.purchase_orders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: purchase_orders purchase_orders_supplier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES public.cariler(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: purchase_orders purchase_orders_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT "purchase_orders_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: raflar raflar_depoId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.raflar
    ADD CONSTRAINT "raflar_depoId_fkey" FOREIGN KEY ("depoId") REFERENCES public.depolar(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: role_permissions role_permissions_permissionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT "role_permissions_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES public.permissions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: role_permissions role_permissions_roleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT "role_permissions_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES public.roles(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: roles roles_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT "roles_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: satin_alma_irsaliyeleri satin_alma_irsaliyeleri_cariId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.satin_alma_irsaliyeleri
    ADD CONSTRAINT "satin_alma_irsaliyeleri_cariId_fkey" FOREIGN KEY ("cariId") REFERENCES public.cariler(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: satin_alma_irsaliyeleri satin_alma_irsaliyeleri_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.satin_alma_irsaliyeleri
    ADD CONSTRAINT "satin_alma_irsaliyeleri_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: satin_alma_irsaliyeleri satin_alma_irsaliyeleri_deletedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.satin_alma_irsaliyeleri
    ADD CONSTRAINT "satin_alma_irsaliyeleri_deletedBy_fkey" FOREIGN KEY ("deletedBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: satin_alma_irsaliyeleri satin_alma_irsaliyeleri_depoId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.satin_alma_irsaliyeleri
    ADD CONSTRAINT "satin_alma_irsaliyeleri_depoId_fkey" FOREIGN KEY ("depoId") REFERENCES public.warehouses(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: satin_alma_irsaliyeleri satin_alma_irsaliyeleri_kaynakId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.satin_alma_irsaliyeleri
    ADD CONSTRAINT "satin_alma_irsaliyeleri_kaynakId_fkey" FOREIGN KEY ("kaynakId") REFERENCES public.satin_alma_siparisleri(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: satin_alma_irsaliyeleri satin_alma_irsaliyeleri_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.satin_alma_irsaliyeleri
    ADD CONSTRAINT "satin_alma_irsaliyeleri_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: satin_alma_irsaliyeleri satin_alma_irsaliyeleri_updatedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.satin_alma_irsaliyeleri
    ADD CONSTRAINT "satin_alma_irsaliyeleri_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: satin_alma_irsaliyesi_kalemleri satin_alma_irsaliyesi_kalemleri_irsaliyeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.satin_alma_irsaliyesi_kalemleri
    ADD CONSTRAINT "satin_alma_irsaliyesi_kalemleri_irsaliyeId_fkey" FOREIGN KEY ("irsaliyeId") REFERENCES public.satin_alma_irsaliyeleri(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: satin_alma_irsaliyesi_kalemleri satin_alma_irsaliyesi_kalemleri_stokId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.satin_alma_irsaliyesi_kalemleri
    ADD CONSTRAINT "satin_alma_irsaliyesi_kalemleri_stokId_fkey" FOREIGN KEY ("stokId") REFERENCES public.stoklar(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: satin_alma_irsaliyesi_logs satin_alma_irsaliyesi_logs_irsaliyeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.satin_alma_irsaliyesi_logs
    ADD CONSTRAINT "satin_alma_irsaliyesi_logs_irsaliyeId_fkey" FOREIGN KEY ("irsaliyeId") REFERENCES public.satin_alma_irsaliyeleri(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: satin_alma_irsaliyesi_logs satin_alma_irsaliyesi_logs_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.satin_alma_irsaliyesi_logs
    ADD CONSTRAINT "satin_alma_irsaliyesi_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: satin_alma_siparis_kalemleri satin_alma_siparis_kalemleri_satınAlmaSiparisId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.satin_alma_siparis_kalemleri
    ADD CONSTRAINT "satin_alma_siparis_kalemleri_satınAlmaSiparisId_fkey" FOREIGN KEY ("satınAlmaSiparisId") REFERENCES public.satin_alma_siparisleri(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: satin_alma_siparis_kalemleri satin_alma_siparis_kalemleri_stokId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.satin_alma_siparis_kalemleri
    ADD CONSTRAINT "satin_alma_siparis_kalemleri_stokId_fkey" FOREIGN KEY ("stokId") REFERENCES public.stoklar(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: satin_alma_siparis_logs satin_alma_siparis_logs_satınAlmaSiparisId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.satin_alma_siparis_logs
    ADD CONSTRAINT "satin_alma_siparis_logs_satınAlmaSiparisId_fkey" FOREIGN KEY ("satınAlmaSiparisId") REFERENCES public.satin_alma_siparisleri(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: satin_alma_siparis_logs satin_alma_siparis_logs_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.satin_alma_siparis_logs
    ADD CONSTRAINT "satin_alma_siparis_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: satin_alma_siparisleri satin_alma_siparisleri_cariId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.satin_alma_siparisleri
    ADD CONSTRAINT "satin_alma_siparisleri_cariId_fkey" FOREIGN KEY ("cariId") REFERENCES public.cariler(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: satin_alma_siparisleri satin_alma_siparisleri_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.satin_alma_siparisleri
    ADD CONSTRAINT "satin_alma_siparisleri_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: satin_alma_siparisleri satin_alma_siparisleri_deletedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.satin_alma_siparisleri
    ADD CONSTRAINT "satin_alma_siparisleri_deletedBy_fkey" FOREIGN KEY ("deletedBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: satin_alma_siparisleri satin_alma_siparisleri_deliveryNoteId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.satin_alma_siparisleri
    ADD CONSTRAINT "satin_alma_siparisleri_deliveryNoteId_fkey" FOREIGN KEY ("deliveryNoteId") REFERENCES public.satin_alma_irsaliyeleri(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: satin_alma_siparisleri satin_alma_siparisleri_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.satin_alma_siparisleri
    ADD CONSTRAINT "satin_alma_siparisleri_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: satin_alma_siparisleri satin_alma_siparisleri_updatedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.satin_alma_siparisleri
    ADD CONSTRAINT "satin_alma_siparisleri_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: satis_elemanlari satis_elemanlari_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.satis_elemanlari
    ADD CONSTRAINT "satis_elemanlari_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: satis_irsaliyeleri satis_irsaliyeleri_cariId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.satis_irsaliyeleri
    ADD CONSTRAINT "satis_irsaliyeleri_cariId_fkey" FOREIGN KEY ("cariId") REFERENCES public.cariler(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: satis_irsaliyeleri satis_irsaliyeleri_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.satis_irsaliyeleri
    ADD CONSTRAINT "satis_irsaliyeleri_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: satis_irsaliyeleri satis_irsaliyeleri_deletedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.satis_irsaliyeleri
    ADD CONSTRAINT "satis_irsaliyeleri_deletedBy_fkey" FOREIGN KEY ("deletedBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: satis_irsaliyeleri satis_irsaliyeleri_depoId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.satis_irsaliyeleri
    ADD CONSTRAINT "satis_irsaliyeleri_depoId_fkey" FOREIGN KEY ("depoId") REFERENCES public.warehouses(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: satis_irsaliyeleri satis_irsaliyeleri_kaynakId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.satis_irsaliyeleri
    ADD CONSTRAINT "satis_irsaliyeleri_kaynakId_fkey" FOREIGN KEY ("kaynakId") REFERENCES public.siparisler(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: satis_irsaliyeleri satis_irsaliyeleri_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.satis_irsaliyeleri
    ADD CONSTRAINT "satis_irsaliyeleri_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: satis_irsaliyeleri satis_irsaliyeleri_updatedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.satis_irsaliyeleri
    ADD CONSTRAINT "satis_irsaliyeleri_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: satis_irsaliyesi_kalemleri satis_irsaliyesi_kalemleri_irsaliyeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.satis_irsaliyesi_kalemleri
    ADD CONSTRAINT "satis_irsaliyesi_kalemleri_irsaliyeId_fkey" FOREIGN KEY ("irsaliyeId") REFERENCES public.satis_irsaliyeleri(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: satis_irsaliyesi_kalemleri satis_irsaliyesi_kalemleri_stokId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.satis_irsaliyesi_kalemleri
    ADD CONSTRAINT "satis_irsaliyesi_kalemleri_stokId_fkey" FOREIGN KEY ("stokId") REFERENCES public.stoklar(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: satis_irsaliyesi_logs satis_irsaliyesi_logs_irsaliyeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.satis_irsaliyesi_logs
    ADD CONSTRAINT "satis_irsaliyesi_logs_irsaliyeId_fkey" FOREIGN KEY ("irsaliyeId") REFERENCES public.satis_irsaliyeleri(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: satis_irsaliyesi_logs satis_irsaliyesi_logs_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.satis_irsaliyesi_logs
    ADD CONSTRAINT "satis_irsaliyesi_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: sayim_kalemleri sayim_kalemleri_locationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sayim_kalemleri
    ADD CONSTRAINT "sayim_kalemleri_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES public.locations(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: sayim_kalemleri sayim_kalemleri_sayimId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sayim_kalemleri
    ADD CONSTRAINT "sayim_kalemleri_sayimId_fkey" FOREIGN KEY ("sayimId") REFERENCES public.sayimlar(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: sayim_kalemleri sayim_kalemleri_stokId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sayim_kalemleri
    ADD CONSTRAINT "sayim_kalemleri_stokId_fkey" FOREIGN KEY ("stokId") REFERENCES public.stoklar(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: sayimlar sayimlar_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sayimlar
    ADD CONSTRAINT "sayimlar_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: sayimlar sayimlar_onaylayanId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sayimlar
    ADD CONSTRAINT "sayimlar_onaylayanId_fkey" FOREIGN KEY ("onaylayanId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: sayimlar sayimlar_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sayimlar
    ADD CONSTRAINT "sayimlar_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: sayimlar sayimlar_updatedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sayimlar
    ADD CONSTRAINT "sayimlar_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: sessions sessions_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: siparis_hazirliklar siparis_hazirliklar_hazirlayan_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.siparis_hazirliklar
    ADD CONSTRAINT siparis_hazirliklar_hazirlayan_fkey FOREIGN KEY (hazirlayan) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: siparis_hazirliklar siparis_hazirliklar_locationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.siparis_hazirliklar
    ADD CONSTRAINT "siparis_hazirliklar_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES public.locations(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: siparis_hazirliklar siparis_hazirliklar_siparisId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.siparis_hazirliklar
    ADD CONSTRAINT "siparis_hazirliklar_siparisId_fkey" FOREIGN KEY ("siparisId") REFERENCES public.siparisler(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: siparis_hazirliklar siparis_hazirliklar_siparisKalemiId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.siparis_hazirliklar
    ADD CONSTRAINT "siparis_hazirliklar_siparisKalemiId_fkey" FOREIGN KEY ("siparisKalemiId") REFERENCES public.siparis_kalemleri(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: siparis_kalemleri siparis_kalemleri_siparisId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.siparis_kalemleri
    ADD CONSTRAINT "siparis_kalemleri_siparisId_fkey" FOREIGN KEY ("siparisId") REFERENCES public.siparisler(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: siparis_kalemleri siparis_kalemleri_stokId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.siparis_kalemleri
    ADD CONSTRAINT "siparis_kalemleri_stokId_fkey" FOREIGN KEY ("stokId") REFERENCES public.stoklar(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: siparis_logs siparis_logs_siparisId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.siparis_logs
    ADD CONSTRAINT "siparis_logs_siparisId_fkey" FOREIGN KEY ("siparisId") REFERENCES public.siparisler(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: siparis_logs siparis_logs_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.siparis_logs
    ADD CONSTRAINT "siparis_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: siparisler siparisler_cariId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.siparisler
    ADD CONSTRAINT "siparisler_cariId_fkey" FOREIGN KEY ("cariId") REFERENCES public.cariler(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: siparisler siparisler_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.siparisler
    ADD CONSTRAINT "siparisler_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: siparisler siparisler_deletedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.siparisler
    ADD CONSTRAINT "siparisler_deletedBy_fkey" FOREIGN KEY ("deletedBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: siparisler siparisler_deliveryNoteId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.siparisler
    ADD CONSTRAINT "siparisler_deliveryNoteId_fkey" FOREIGN KEY ("deliveryNoteId") REFERENCES public.satis_irsaliyeleri(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: siparisler siparisler_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.siparisler
    ADD CONSTRAINT "siparisler_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: siparisler siparisler_updatedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.siparisler
    ADD CONSTRAINT "siparisler_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: solution_package_parts solution_package_parts_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.solution_package_parts
    ADD CONSTRAINT "solution_package_parts_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.stoklar(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: solution_package_parts solution_package_parts_solutionPackageId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.solution_package_parts
    ADD CONSTRAINT "solution_package_parts_solutionPackageId_fkey" FOREIGN KEY ("solutionPackageId") REFERENCES public.solution_packages(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: stock_cost_history stock_cost_history_stok_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_cost_history
    ADD CONSTRAINT stock_cost_history_stok_id_fkey FOREIGN KEY (stok_id) REFERENCES public.stoklar(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: stock_moves stock_moves_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_moves
    ADD CONSTRAINT "stock_moves_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: stock_moves stock_moves_fromLocationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_moves
    ADD CONSTRAINT "stock_moves_fromLocationId_fkey" FOREIGN KEY ("fromLocationId") REFERENCES public.locations(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: stock_moves stock_moves_fromWarehouseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_moves
    ADD CONSTRAINT "stock_moves_fromWarehouseId_fkey" FOREIGN KEY ("fromWarehouseId") REFERENCES public.warehouses(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: stock_moves stock_moves_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_moves
    ADD CONSTRAINT "stock_moves_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.stoklar(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: stock_moves stock_moves_toLocationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_moves
    ADD CONSTRAINT "stock_moves_toLocationId_fkey" FOREIGN KEY ("toLocationId") REFERENCES public.locations(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: stock_moves stock_moves_toWarehouseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_moves
    ADD CONSTRAINT "stock_moves_toWarehouseId_fkey" FOREIGN KEY ("toWarehouseId") REFERENCES public.warehouses(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: stok_esdegers stok_esdegers_stok1Id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stok_esdegers
    ADD CONSTRAINT "stok_esdegers_stok1Id_fkey" FOREIGN KEY ("stok1Id") REFERENCES public.stoklar(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: stok_esdegers stok_esdegers_stok2Id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stok_esdegers
    ADD CONSTRAINT "stok_esdegers_stok2Id_fkey" FOREIGN KEY ("stok2Id") REFERENCES public.stoklar(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: stok_hareketleri stok_hareketleri_stokId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stok_hareketleri
    ADD CONSTRAINT "stok_hareketleri_stokId_fkey" FOREIGN KEY ("stokId") REFERENCES public.stoklar(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: stok_hareketleri stok_hareketleri_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stok_hareketleri
    ADD CONSTRAINT "stok_hareketleri_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: stok_hareketleri stok_hareketleri_warehouseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stok_hareketleri
    ADD CONSTRAINT "stok_hareketleri_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES public.warehouses(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: stoklar stoklar_esdegerGrupId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stoklar
    ADD CONSTRAINT "stoklar_esdegerGrupId_fkey" FOREIGN KEY ("esdegerGrupId") REFERENCES public.esdeger_gruplar(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: stoklar stoklar_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stoklar
    ADD CONSTRAINT "stoklar_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: subscriptions subscriptions_planId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT "subscriptions_planId_fkey" FOREIGN KEY ("planId") REFERENCES public.plans(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: subscriptions subscriptions_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT "subscriptions_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: system_parameters system_parameters_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.system_parameters
    ADD CONSTRAINT "system_parameters_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: tahsilatlar tahsilatlar_bankaHesapId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tahsilatlar
    ADD CONSTRAINT "tahsilatlar_bankaHesapId_fkey" FOREIGN KEY ("bankaHesapId") REFERENCES public.banka_hesaplari(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: tahsilatlar tahsilatlar_cariId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tahsilatlar
    ADD CONSTRAINT "tahsilatlar_cariId_fkey" FOREIGN KEY ("cariId") REFERENCES public.cariler(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: tahsilatlar tahsilatlar_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tahsilatlar
    ADD CONSTRAINT "tahsilatlar_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: tahsilatlar tahsilatlar_deletedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tahsilatlar
    ADD CONSTRAINT "tahsilatlar_deletedBy_fkey" FOREIGN KEY ("deletedBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: tahsilatlar tahsilatlar_faturaId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tahsilatlar
    ADD CONSTRAINT "tahsilatlar_faturaId_fkey" FOREIGN KEY ("faturaId") REFERENCES public.faturalar(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: tahsilatlar tahsilatlar_firmaKrediKartiId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tahsilatlar
    ADD CONSTRAINT "tahsilatlar_firmaKrediKartiId_fkey" FOREIGN KEY ("firmaKrediKartiId") REFERENCES public.firma_kredi_kartlari(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: tahsilatlar tahsilatlar_kasaId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tahsilatlar
    ADD CONSTRAINT "tahsilatlar_kasaId_fkey" FOREIGN KEY ("kasaId") REFERENCES public.kasalar(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: tahsilatlar tahsilatlar_satisElemaniId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tahsilatlar
    ADD CONSTRAINT "tahsilatlar_satisElemaniId_fkey" FOREIGN KEY ("satisElemaniId") REFERENCES public.satis_elemanlari(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: tahsilatlar tahsilatlar_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tahsilatlar
    ADD CONSTRAINT "tahsilatlar_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: teklif_kalemleri teklif_kalemleri_stokId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teklif_kalemleri
    ADD CONSTRAINT "teklif_kalemleri_stokId_fkey" FOREIGN KEY ("stokId") REFERENCES public.stoklar(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: teklif_kalemleri teklif_kalemleri_teklifId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teklif_kalemleri
    ADD CONSTRAINT "teklif_kalemleri_teklifId_fkey" FOREIGN KEY ("teklifId") REFERENCES public.teklifler(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: teklif_logs teklif_logs_teklifId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teklif_logs
    ADD CONSTRAINT "teklif_logs_teklifId_fkey" FOREIGN KEY ("teklifId") REFERENCES public.teklifler(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: teklif_logs teklif_logs_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teklif_logs
    ADD CONSTRAINT "teklif_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: teklifler teklifler_cariId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teklifler
    ADD CONSTRAINT "teklifler_cariId_fkey" FOREIGN KEY ("cariId") REFERENCES public.cariler(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: teklifler teklifler_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teklifler
    ADD CONSTRAINT "teklifler_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: teklifler teklifler_deletedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teklifler
    ADD CONSTRAINT "teklifler_deletedBy_fkey" FOREIGN KEY ("deletedBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: teklifler teklifler_siparisId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teklifler
    ADD CONSTRAINT "teklifler_siparisId_fkey" FOREIGN KEY ("siparisId") REFERENCES public.siparisler(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: teklifler teklifler_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teklifler
    ADD CONSTRAINT "teklifler_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: teklifler teklifler_updatedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teklifler
    ADD CONSTRAINT "teklifler_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: tenant_purge_audits tenant_purge_audits_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tenant_purge_audits
    ADD CONSTRAINT "tenant_purge_audits_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: tenant_settings tenant_settings_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tenant_settings
    ADD CONSTRAINT "tenant_settings_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: urun_raflar urun_raflar_rafId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.urun_raflar
    ADD CONSTRAINT "urun_raflar_rafId_fkey" FOREIGN KEY ("rafId") REFERENCES public.raflar(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: urun_raflar urun_raflar_stokId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.urun_raflar
    ADD CONSTRAINT "urun_raflar_stokId_fkey" FOREIGN KEY ("stokId") REFERENCES public.stoklar(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_licenses user_licenses_moduleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_licenses
    ADD CONSTRAINT "user_licenses_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES public.modules(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: user_licenses user_licenses_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_licenses
    ADD CONSTRAINT "user_licenses_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: users users_roleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "users_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES public.roles(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: users users_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "users_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: warehouse_critical_stocks warehouse_critical_stocks_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.warehouse_critical_stocks
    ADD CONSTRAINT "warehouse_critical_stocks_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.stoklar(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: warehouse_critical_stocks warehouse_critical_stocks_warehouseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.warehouse_critical_stocks
    ADD CONSTRAINT "warehouse_critical_stocks_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES public.warehouses(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: warehouse_transfer_items warehouse_transfer_items_fromLocationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.warehouse_transfer_items
    ADD CONSTRAINT "warehouse_transfer_items_fromLocationId_fkey" FOREIGN KEY ("fromLocationId") REFERENCES public.locations(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: warehouse_transfer_items warehouse_transfer_items_stokId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.warehouse_transfer_items
    ADD CONSTRAINT "warehouse_transfer_items_stokId_fkey" FOREIGN KEY ("stokId") REFERENCES public.stoklar(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: warehouse_transfer_items warehouse_transfer_items_toLocationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.warehouse_transfer_items
    ADD CONSTRAINT "warehouse_transfer_items_toLocationId_fkey" FOREIGN KEY ("toLocationId") REFERENCES public.locations(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: warehouse_transfer_items warehouse_transfer_items_transferId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.warehouse_transfer_items
    ADD CONSTRAINT "warehouse_transfer_items_transferId_fkey" FOREIGN KEY ("transferId") REFERENCES public.warehouse_transfers(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: warehouse_transfer_logs warehouse_transfer_logs_transferId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.warehouse_transfer_logs
    ADD CONSTRAINT "warehouse_transfer_logs_transferId_fkey" FOREIGN KEY ("transferId") REFERENCES public.warehouse_transfers(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: warehouse_transfer_logs warehouse_transfer_logs_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.warehouse_transfer_logs
    ADD CONSTRAINT "warehouse_transfer_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: warehouse_transfers warehouse_transfers_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.warehouse_transfers
    ADD CONSTRAINT "warehouse_transfers_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: warehouse_transfers warehouse_transfers_deletedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.warehouse_transfers
    ADD CONSTRAINT "warehouse_transfers_deletedBy_fkey" FOREIGN KEY ("deletedBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: warehouse_transfers warehouse_transfers_fromWarehouseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.warehouse_transfers
    ADD CONSTRAINT "warehouse_transfers_fromWarehouseId_fkey" FOREIGN KEY ("fromWarehouseId") REFERENCES public.warehouses(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: warehouse_transfers warehouse_transfers_hazirlayanUserId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.warehouse_transfers
    ADD CONSTRAINT "warehouse_transfers_hazirlayanUserId_fkey" FOREIGN KEY ("hazirlayanUserId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: warehouse_transfers warehouse_transfers_onaylayanUserId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.warehouse_transfers
    ADD CONSTRAINT "warehouse_transfers_onaylayanUserId_fkey" FOREIGN KEY ("onaylayanUserId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: warehouse_transfers warehouse_transfers_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.warehouse_transfers
    ADD CONSTRAINT "warehouse_transfers_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: warehouse_transfers warehouse_transfers_teslimAlanUserId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.warehouse_transfers
    ADD CONSTRAINT "warehouse_transfers_teslimAlanUserId_fkey" FOREIGN KEY ("teslimAlanUserId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: warehouse_transfers warehouse_transfers_toWarehouseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.warehouse_transfers
    ADD CONSTRAINT "warehouse_transfers_toWarehouseId_fkey" FOREIGN KEY ("toWarehouseId") REFERENCES public.warehouses(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: warehouse_transfers warehouse_transfers_updatedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.warehouse_transfers
    ADD CONSTRAINT "warehouse_transfers_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: warehouses warehouses_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.warehouses
    ADD CONSTRAINT "warehouses_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict nLvJxL9O6roGMkgbQMVqmTsY0pfPCeArXIOT58KqTLzOjyFULeaxymV5FDLd0iB

