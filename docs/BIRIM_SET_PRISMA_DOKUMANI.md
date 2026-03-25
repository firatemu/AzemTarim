# OtoMuhasebe Birim Set Sistemi - Prisma Schema Dokümantasyonu

## 📋 İçindekiler

1. [Genel Bakış](#genel-bakış)
2. [Veri Modeli](#veri-modeli)
3. [Tablo Yapıları](#tablo-yapıları)
4. [İlişkiler](#ilişkiler)
5. [Kullanım Senaryoları](#kullanım-senaryoları)
6. [API Endpoints](#api-endpoints)
7. [Veri Örnekleri](#veri-örnekleri)
8. [Best Practices](#best-practices)
9. [Migration Notları](#migration-notları)

---

## Genel Bakış

Birim Set Sistemi, OtoMuhasebe'de ürünlerin ölçü birimlerini yönetmek için kullanılan esnek ve ölçeklenebilir bir yapıdır. Bu sistem, her kiracı (tenant) için özel birim setleri tanımlamasına ve ürünlerin bu birim setleriyle ilişkilendirmesine olanak tanır.

### Temel Özellikler

- ✅ **Multi-Tenant Desteği**: Her kiracı kendi birim setlerini tanımlayabilir
- ✅ **Birim Dönüştürme**: Birimler arası dönüşüm oranları (conversionRate)
- ✅ **Temel Birim**: Her set için bir temel birim (base unit) tanımlanabilir
- ✅ **GIB Kodu Desteği**: Türkiye Gelir İdaresi (GIB) birim kodları ile uyumluluk
- ✅ **Ürün Entegrasyonu**: Ürünlerin birim setleriyle ilişkilendirilmesi

### Mimari Kavramları

```
Tenant (1) ----< (N) UnitSet (1) ----< (N) Unit
                                         |
                                         |
                                         V
                                    Product (N)
```

---

## Veri Modeli

### Entity-Relation Diagram (ERD)

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│     Tenant      │       │    UnitSet     │       │      Unit       │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id (PK)        │◄─────│ id (PK)        │◄──────│ id (PK)        │
│ name           │       │ tenantId (FK)  │       │ unitSetId (FK) │
│ tenantType     │       │ name           │       │ name           │
│ status         │       │ description    │       │ code           │
│ ...           │       │ createdAt      │       │ conversionRate │
└─────────────────┘       │ updatedAt      │       │ isBaseUnit     │
                         └─────────────────┘       │ createdAt      │
                                                  │ updatedAt      │
                                                  └─────────────────┘
                                                         ▲
                                                         │
                                                   ┌─────────┴─────────┐
                                                   │    Product      │
                                                   ├─────────────────┤
                                                   │ unitId (FK)    │
                                                   │ unit (String)  │
                                                   │ ...            │
                                                   └─────────────────┘
```

---

## Tablo Yapıları

### 1. UnitSet (Birim Seti)

**Açıklama**: Her kiracı için tanımlanan birim setlerini içerir. Bir set, birbirleri arasında dönüştürülebilir birimleri gruplar.

| Alan | Tip | Zorunlu | Açıklama |
|------|-----|----------|-----------|
| `id` | String (UUID) | ✅ | Benzersiz tanımlayıcı |
| `tenantId` | String (FK) | ✅ | Kiracı ID'si (Tenant tablosuna FK) |
| `name` | String | ✅ | Birim seti adı (örn: "Ağırlık", "Hacim", "Uzunluk") |
| `description` | String? | ❌ | Birim seti açıklaması |
| `createdAt` | DateTime | ✅ | Oluşturulma tarihi (otomatik) |
| `updatedAt` | DateTime | ✅ | Güncelleme tarihi (otomatik) |

**İndeksler**:
- `tenantId`: Kiracı bazlı sorgular için optimize edilmiş

**Prisma Tanımı**:
```prisma
model UnitSet {
  id          String   @id @default(uuid())
  tenantId    String   @map("tenant_id")
  name        String   @map("name")
  description String?  @map("description")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  units       Unit[]
  tenant      Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@index([tenantId])
  @@map("unit_sets")
}
```

**Örnek Veri**:
```json
{
  "id": "clm1a2b3c4d5e6f7g8h9i0j1",
  "tenantId": "clm0a1b2c3d4e5f6g7h8i9j0k1",
  "name": "Ağırlık Birimleri",
  "description": "Ağırlık ölçüm birimleri seti",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

---

### 2. Unit (Birim)

**Açıklama**: Bir birim seti içindeki bireysel birimleri içerir. Her birim, dönüşüm oranları ve temel birim özelliği ile tanımlanır.

| Alan | Tip | Zorunlu | Açıklama |
|------|-----|----------|-----------|
| `id` | String (UUID) | ✅ | Benzersiz tanımlayıcı |
| `unitSetId` | String (FK) | ✅ | Birim seti ID'si (UnitSet tablosuna FK) |
| `name` | String | ✅ | Birim adı (örn: "Kilogram", "Gram") |
| `code` | String? | ❌ | GIB Birim Kodu (örn: "KG", "GR", "ADET") |
| `conversionRate` | Decimal | ✅ | Dönüşüm oranı (temel birim bazında) |
| `isBaseUnit` | Boolean | ✅ | Temel birim mi? (varsayılan: false) |
| `createdAt` | DateTime | ✅ | Oluşturulma tarihi (otomatik) |
| `updatedAt` | DateTime | ✅ | Güncelleme tarihi (otomatik) |

**İndeksler**:
- `unitSetId`: Birim seti bazlı sorgular için optimize edilmiş

**Prisma Tanımı**:
```prisma
model Unit {
  id             String    @id @default(uuid())
  unitSetId      String    @map("unit_set_id")
  name           String    @map("name")
  code           String?   @map("code")
  conversionRate Decimal   @default(1) @map("conversion_rate") @db.Decimal(12, 4)
  isBaseUnit     Boolean   @default(false) @map("is_base_unit")
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
  unitSet        UnitSet   @relation(fields: [unitSetId], references: [id], onDelete: Cascade)
  products       Product[]

  @@index([unitSetId])
  @@map("units")
}
```

**Dönüşüm Oranı (conversionRate) Mantığı**:

Birim dönüştürme işlemi şu formül kullanılır:

```
Temel Birim Miktarı = Mevcut Miktar × ConversionRate
```

**Örnek - Ağırlık Birimleri**:
- Temel Birim: Kilogram (KG), conversionRate = 1
- Gram (GR): conversionRate = 0.001 (1 KG = 1000 GR → 1 GR = 0.001 KG)
- Ton (TON): conversionRate = 1000 (1 TON = 1000 KG)

**Dönüşüm Örnekleri**:
```javascript
// 500 GR → KG
500 × 0.001 = 0.5 KG

// 2.5 TON → KG
2.5 × 1000 = 2500 KG

// 3.7 KG → Temel Birim (KG)
3.7 × 1 = 3.7 KG
```

**GIB Birim Kodları**:

Türkiye Gelir İdaresi standartlarına uygun birim kodları:

| Kod | Açıklama | Kategori |
|-----|-----------|---------|
| ADET | Adet | Adet |
| KG | Kilogram | Ağırlık |
| GR | Gram | Ağırlık |
| LT | Litre | Hacim |
| ML | Mililitre | Hacim |
| MT | Metre | Uzunluk |
| CM | Santimetre | Uzunluk |
| M2 | Metrekare | Alan |
| M3 | Metreküp | Hacim |
| SAAT | Saat | Zaman |
| DK | Dakika | Zaman |
| PAKET | Paket | Paket |
| KUTU | Kutu | Paket |

**Örnek Veri**:
```json
{
  "id": "clm2b3c4d5e6f7g8h9i0j1k2",
  "unitSetId": "clm1a2b3c4d5e6f7g8h9i0j1",
  "name": "Kilogram",
  "code": "KG",
  "conversionRate": 1.0,
  "isBaseUnit": true,
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

---

### 3. Product - İlişkili Alanlar

**Açıklama**: Product tablosunda birim set sistemi ile ilgili iki alan bulunur.

| Alan | Tip | Zorunlu | Açıklama |
|------|-----|----------|-----------|
| `unit` | String | ✅ | Ürünün ölçü birimi text formatında (legacy) |
| `unitId` | String (FK) | ❌ | Unit tablosuna foreign key (normalize edilmiş) |

**Not**: `unit` alanı geriye dönük uyumluluk için korunmaktadır. Yeni geliştirmelerde `unitId` kullanılmalıdır.

**Prisma Tanımı**:
```prisma
model Product {
  // ... diğer alanlar ...
  unit    String?  @map("unit_text")
  unitId  String?  @map("unit_id")
  unitRef Unit?    @relation(fields: [unitId], references: [id])
  // ... diğer alanlar ...
}
```

---

## İlişkiler

### 1. Tenant → UnitSet (1:N)

Bir kiracı birden fazla birim seti tanımlayabilir.

```prisma
model Tenant {
  // ...
  unitSets UnitSet[]
  // ...
}

model UnitSet {
  tenantId String
  tenant   Tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  // ...
}
```

**Cascade Silme**: Bir kiracı silindiğinde, tüm birim setleri de silinir.

### 2. UnitSet → Unit (1:N)

Bir birim seti birden fazla birim içerebilir.

```prisma
model UnitSet {
  // ...
  units Unit[]
  // ...
}

model Unit {
  unitSetId String
  unitSet   UnitSet @relation(fields: [unitSetId], references: [id], onDelete: Cascade)
  // ...
}
```

**Cascade Silme**: Bir birim seti silindiğinde, tüm birimleri de silinir.

### 3. Unit → Product (1:N)

Bir birim birden fazla ürün tarafından kullanılabilir.

```prisma
model Unit {
  // ...
  products Product[]
  // ...
}

model Product {
  unitId  String?
  unitRef Unit?   @relation(fields: [unitId], references: [id])
  // ...
}
```

**Set Null**: Bir birim silindiğinde, ürünlerin `unitId` alanı NULL yapılır.

---

## Kullanım Senaryoları

### Senaryo 1: Yeni Birim Seti Oluşturma

Bir perakende işletmesi, "Ağırlık Birimleri" seti oluşturmak istiyor.

**Adım 1: UnitSet Oluştur**
```typescript
const unitSet = await prisma.unitSet.create({
  data: {
    tenantId: 'clm0a1b2c3d4e5f6g7h8i9j0k1',
    name: 'Ağırlık Birimleri',
    description: 'Ağırlık ölçüm birimleri'
  }
});
```

**Adım 2: Birimleri Ekle**
```typescript
const units = await prisma.unit.createMany({
  data: [
    {
      unitSetId: unitSet.id,
      name: 'Kilogram',
      code: 'KG',
      conversionRate: 1.0,
      isBaseUnit: true
    },
    {
      unitSetId: unitSet.id,
      name: 'Gram',
      code: 'GR',
      conversionRate: 0.001,
      isBaseUnit: false
    },
    {
      unitSetId: unitSet.id,
      name: 'Ton',
      code: 'TON',
      conversionRate: 1000.0,
      isBaseUnit: false
    }
  ]
});
```

### Senaryo 2: Birim Dönüştürme

Müşteri, 500 gram ürünü kilograma çevirmek istiyor.

```typescript
async function convertToBaseUnit(quantity: number, fromUnitId: string) {
  const unit = await prisma.unit.findUnique({
    where: { id: fromUnitId }
  });
  
  if (!unit) {
    throw new Error('Birim bulunamadı');
  }
  
  const baseQuantity = quantity * Number(unit.conversionRate);
  return baseQuantity;
}

// Kullanım
const kgQuantity = await convertToBaseUnit(500, 'unit-gram-id');
// Sonuç: 0.5 KG
```

**Gelişmiş Dönüştürme Fonksiyonu**:
```typescript
async function convertUnits(
  quantity: number,
  fromUnitId: string,
  toUnitId: string
) {
  const [fromUnit, toUnit] = await Promise.all([
    prisma.unit.findUnique({ where: { id: fromUnitId } }),
    prisma.unit.findUnique({ where: { id: toUnitId } })
  ]);
  
  if (!fromUnit || !toUnit) {
    throw new Error('Birim bulunamadı');
  }
  
  if (fromUnit.unitSetId !== toUnit.unitSetId) {
    throw new Error('Birimler aynı sette değil');
  }
  
  // Önce temel birime, sonra hedef birime dönüştür
  const baseQuantity = quantity * Number(fromUnit.conversionRate);
  const targetQuantity = baseQuantity / Number(toUnit.conversionRate);
  
  return targetQuantity;
}

// Kullanım: 500 GR → KG
const kgQuantity = await convertUnits(500, 'unit-gram-id', 'unit-kg-id');
// Sonuç: 0.5 KG
```

### Senaryo 3: Ürünü Birim Setiyle İlişkilendirme

Yeni bir ürün oluştururken birim atama.

```typescript
const product = await prisma.product.create({
  data: {
    tenantId: 'clm0a1b2c3d4e5f6g7h8i9j0k1',
    code: 'PRD-001',
    name: 'Şeker',
    description: 'Toz şeker',
    unitId: 'unit-kg-id',
    unit: 'KG', // Legacy alan
    // ... diğer ürün alanları
  }
});
```

### Senaryo 4: Tenant Bazlı Birim Setlerini Listeleme

Bir kiracının tüm birim setlerini ve birimlerini getirme.

```typescript
const unitSets = await prisma.unitSet.findMany({
  where: {
    tenantId: 'clm0a1b2c3d4e5f6g7h8i9j0k1'
  },
  include: {
    units: {
      orderBy: {
        isBaseUnit: 'desc' // Temel birim önce
      }
    }
  },
  orderBy: {
    name: 'asc'
  }
});
```

**Sonuç**:
```json
{
  "unitSets": [
    {
      "id": "clm1a2b3c4d5e6f7g8h9i0j1",
      "name": "Ağırlık Birimleri",
      "units": [
        { "name": "Kilogram", "code": "KG", "isBaseUnit": true },
        { "name": "Gram", "code": "GR", "isBaseUnit": false },
        { "name": "Ton", "code": "TON", "isBaseUnit": false }
      ]
    },
    {
      "id": "clm1x2y3z4w5v6u7t8s9r0q1",
      "name": "Hacim Birimleri",
      "units": [
        { "name": "Litre", "code": "LT", "isBaseUnit": true },
        { "name": "Mililitre", "code": "ML", "isBaseUnit": false }
      ]
    }
  ]
}
```

---

## API Endpoints

### 1. Birim Seti Yönetimi

#### GET /api/units/sets
Tüm birim setlerini listele.

**Query Parametreleri**:
- `tenantId`: (opsiyonel) Kiracı ID'si (otomatik olarak mevcut tenant kullanılır)
- `includeUnits`: (opsiyonel) Birimleri de dahil et (true/false)

**Örnek İstek**:
```http
GET /api/units/sets?includeUnits=true
```

**Örnek Yanıt**:
```json
{
  "success": true,
  "data": [
    {
      "id": "clm1a2b3c4d5e6f7g8h9i0j1",
      "name": "Ağırlık Birimleri",
      "description": "Ağırlık ölçüm birimleri",
      "units": [
        {
          "id": "clm2b3c4d5e6f7g8h9i0j1k2",
          "name": "Kilogram",
          "code": "KG",
          "conversionRate": 1.0,
          "isBaseUnit": true
        }
      ]
    }
  ]
}
```

#### POST /api/units/sets
Yeni birim seti oluştur.

**Request Body**:
```json
{
  "name": "Uzunluk Birimleri",
  "description": "Uzunluk ölçüm birimleri seti"
}
```

**Örnek Yanıt**:
```json
{
  "success": true,
  "data": {
    "id": "clm1a2b3c4d5e6f7g8h9i0j1",
    "name": "Uzunluk Birimleri",
    "description": "Uzunluk ölçüm birimleri seti",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

#### PUT /api/units/sets/:id
Birim setini güncelle.

#### DELETE /api/units/sets/:id
Birim setini sil (tüm birimleri de silinir).

### 2. Birim Yönetimi

#### GET /api/units
Tüm birimleri listele.

**Query Parametreleri**:
- `unitSetId`: (opsiyonel) Sadece belirli birim setindeki birimleri getir
- `isBaseUnit`: (opsiyonel) Sadece temel birimleri getir (true/false)

**Örnek İstek**:
```http
GET /api/units?unitSetId=clm1a2b3c4d5e6f7g8h9i0j1
```

#### POST /api/units
Yeni birim oluştur.

**Request Body**:
```json
{
  "unitSetId": "clm1a2b3c4d5e6f7g8h9i0j1",
  "name": "Kilogram",
  "code": "KG",
  "conversionRate": 1.0,
  "isBaseUnit": true
}
```

**Validasyon Kuralları**:
- Bir sette sadece bir tane temel birim olabilir (`isBaseUnit: true`)
- `conversionRate` 0'dan büyük olmalı
- `code` alanı GIB standartlarına uygun olmalı

**Örnek Yanıt**:
```json
{
  "success": true,
  "data": {
    "id": "clm2b3c4d5e6f7g8h9i0j1k2",
    "unitSetId": "clm1a2b3c4d5e6f7g8h9i0j1",
    "name": "Kilogram",
    "code": "KG",
    "conversionRate": 1.0,
    "isBaseUnit": true,
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

#### PUT /api/units/:id
Birim güncelle.

#### DELETE /api/units/:id
Birim sil.

### 3. Birim Dönüştürme

#### POST /api/units/convert
Birim dönüştürme işlemi.

**Request Body**:
```json
{
  "quantity": 500,
  "fromUnitId": "clm2b3c4d5e6f7g8h9i0j1k2",
  "toUnitId": "clm3c4d5e6f7g8h9i0j1k2l3"
}
```

**Örnek Yanıt**:
```json
{
  "success": true,
  "data": {
    "fromUnit": "Gram",
    "toUnit": "Kilogram",
    "originalQuantity": 500,
    "convertedQuantity": 0.5,
    "conversionRate": 0.001
  }
}
```

---

## Veri Örnekleri

### Örnek 1: Perakende Mağaza Birim Setleri

```json
{
  "unitSets": [
    {
      "name": "Ağırlık Birimleri",
      "description": "Ağırlık ölçüm birimleri",
      "units": [
        {
          "name": "Kilogram",
          "code": "KG",
          "conversionRate": 1.0,
          "isBaseUnit": true
        },
        {
          "name": "Gram",
          "code": "GR",
          "conversionRate": 0.001,
          "isBaseUnit": false
        },
        {
          "name": "Ton",
          "code": "TON",
          "conversionRate": 1000.0,
          "isBaseUnit": false
        }
      ]
    },
    {
      "name": "Hacim Birimleri",
      "description": "Hacim ölçüm birimleri",
      "units": [
        {
          "name": "Litre",
          "code": "LT",
          "conversionRate": 1.0,
          "isBaseUnit": true
        },
        {
          "name": "Mililitre",
          "code": "ML",
          "conversionRate": 0.001,
          "isBaseUnit": false
        }
      ]
    },
    {
      "name": "Adet/Paket Birimleri",
      "description": "Adet ve paket ölçüm birimleri",
      "units": [
        {
          "name": "Adet",
          "code": "ADET",
          "conversionRate": 1.0,
          "isBaseUnit": true
        },
        {
          "name": "Paket",
          "code": "PAKET",
          "conversionRate": 12.0,
          "isBaseUnit": false
        },
        {
          "name": "Koli",
          "code": "KOLI",
          "conversionRate": 144.0,
          "isBaseUnit": false
        }
      ]
    }
  ]
}
```

### Örnek 2: İnşaat Malzemeleri Birim Setleri

```json
{
  "unitSets": [
    {
      "name": "Uzunluk Birimleri",
      "description": "Uzunluk ölçüm birimleri",
      "units": [
        {
          "name": "Metre",
          "code": "MT",
          "conversionRate": 1.0,
          "isBaseUnit": true
        },
        {
          "name": "Santimetre",
          "code": "CM",
          "conversionRate": 0.01,
          "isBaseUnit": false
        },
        {
          "name": "Milimetre",
          "code": "MM",
          "conversionRate": 0.001,
          "isBaseUnit": false
        }
      ]
    },
    {
      "name": "Alan Birimleri",
      "description": "Alan ölçüm birimleri",
      "units": [
        {
          "name": "Metrekare",
          "code": "M2",
          "conversionRate": 1.0,
          "isBaseUnit": true
        },
        {
          "name": "Santimetrekare",
          "code": "CM2",
          "conversionRate": 0.0001,
          "isBaseUnit": false
        }
      ]
    },
    {
      "name": "Hacim Birimleri",
      "description": "Hacim ölçüm birimleri",
      "units": [
        {
          "name": "Metreküp",
          "code": "M3",
          "conversionRate": 1.0,
          "isBaseUnit": true
        },
        {
          "name": "Litre",
          "code": "LT",
          "conversionRate": 0.001,
          "isBaseUnit": false
        }
      ]
    }
  ]
}
```

### Örnek 3: Zaman ve Süre Birimleri

```json
{
  "unitSets": [
    {
      "name": "Zaman Birimleri",
      "description": "Zaman ölçüm birimleri",
      "units": [
        {
          "name": "Saat",
          "code": "SAAT",
          "conversionRate": 1.0,
          "isBaseUnit": true
        },
        {
          "name": "Dakika",
          "code": "DK",
          "conversionRate": 0.0166667,
          "isBaseUnit": false
        },
        {
          "name": "Gün",
          "code": "GUN",
          "conversionRate": 24.0,
          "isBaseUnit": false
        }
      ]
    }
  ]
}
```

---

## Best Practices

### 1. Birim Seti Tasarımı

✅ **DOĞRU**:
- Her birim seti için tek bir temel birim tanımlayın
- Dönüşüm oranlarını temel birime göre hesaplayın
- GIB standart kodlarını kullanın

❌ **YANLIŞ**:
- Aynı anda birden fazla temel birim tanımlamak
- Dönüşüm oranlarını yanlış hesaplamak
- Standart olmayan kodlar kullanmak

### 2. Performans Optimizasyonu

**İndeks Kullanımı**:
```typescript
// ✅ DOĞRU - İndeks kullanımı
const units = await prisma.unit.findMany({
  where: { unitSetId: 'clm1a2b3c4d5e6f7g8h9i0j1' }
});

// ❌ YANLIŞ - İndeks kullanmadan tüm birimleri çekip filtreleme
const allUnits = await prisma.unit.findMany();
const filteredUnits = allUnits.filter(u => u.unitSetId === 'clm1a2b3c4d5e6f7g8h9i0j1');
```

**Include Kullanımı**:
```typescript
// ✅ DOĞRU - Include ile ilişkili verileri tek sorguda çekme
const unitSets = await prisma.unitSet.findMany({
  include: { units: true }
});

// ❌ YANLIŞ - N+1 sorgu problemi
const unitSets = await prisma.unitSet.findMany();
for (const set of unitSets) {
  set.units = await prisma.unit.findMany({
    where: { unitSetId: set.id }
  });
}
```

### 3. Veri Bütünlüğü

**Temel Birim Kontrolü**:
```typescript
async function createUnit(data: CreateUnitDto) {
  // Temel birim kontrolü
  if (data.isBaseUnit) {
    const existingBaseUnit = await prisma.unit.findFirst({
      where: {
        unitSetId: data.unitSetId,
        isBaseUnit: true
      }
    });
    
    if (existingBaseUnit) {
      throw new Error('Bu sette zaten bir temel birim var');
    }
  }
  
  return await prisma.unit.create({ data });
}
```

**Dönüşüm Oranı Doğrulama**:
```typescript
function validateConversionRate(rate: number) {
  if (rate <= 0) {
    throw new Error('Dönüşüm oranı 0\'dan büyük olmalı');
  }
  
  if (rate > 1000000) {
    throw new Error('Dönüşüm oranı çok büyük');
  }
  
  // Ondalık hassasiyet kontrolü
  const decimalPlaces = rate.toString().split('.')[1]?.length || 0;
  if (decimalPlaces > 4) {
    throw new Error('Dönüşüm oranı en fazla 4 ondalık basamaklı olabilir');
  }
}
```

### 4. Migration Stratejisi

**Yeni Birim Seti Ekleme**:
```typescript
async function migrateToUnitSets() {
  // 1. Var olan ürünleri analiz et
  const products = await prisma.product.findMany({
    where: { unitId: null },
    select: { unit: true, tenantId: true, distinct: ['unit'] }
  });
  
  // 2. Her tenant için varsayılan birim seti oluştur
  for (const product of products) {
    const existingSet = await prisma.unitSet.findFirst({
      where: {
        tenantId: product.tenantId,
        name: 'Varsayılan Birim Seti'
      }
    });
    
    let unitSetId = existingSet?.id;
    
    if (!existingSet) {
      const unitSet = await prisma.unitSet.create({
        data: {
          tenantId: product.tenantId,
          name: 'Varsayılan Birim Seti',
          description: 'Sistem tarafından otomatik oluşturuldu'
        }
      });
      unitSetId = unitSet.id;
    }
    
    // 3. Birimleri oluştur
    await prisma.unit.createMany({
      data: {
        unitSetId,
        name: product.unit,
        code: product.unit.substring(0, 10).toUpperCase(),
        conversionRate: 1.0,
        isBaseUnit: true
      },
      skipDuplicates: true
    });
  }
}
```

---

## Migration Notları

### Versiyon Geçmişi

#### v1.0 (Başlangıç)
- UnitSet ve Unit modelleri eklendi
- Temel birim ve dönüşüm oranı özellikleri tanımlandı
- Tenant bazlı izolasyon sağlandı

#### v1.1 (GIB Kodu Desteği)
- `code` alanı eklendi
- GIB standart birim kodları ile uyumluluk sağlandı

#### v1.2 (Product Entegrasyonu)
- Product tablosuna `unitId` alanı eklendi
- `unit` alanı legacy olarak korunmaya devam etti
- Unit → Product ilişkisi eklendi

### Gelecek Planlar

#### v2.0 (Planlanıyor)
- Birim dönüşüm kuralları tablosu (UnitConversionRule)
- Karmaşık dönüşüm formülleri desteği
- Birim seti şablonları (predefined templates)

#### v2.1 (Planlanıyor)
- Birim doğrulama API'leri
- Çoklu birim desteği (compound units)
- Birim öneri sistemi

### Migration Script Örnekleri

**Yeni Birim Seti Şablonu Oluşturma**:
```typescript
const predefinedTemplates = [
  {
    name: 'Standart Ağırlık',
    description: 'Standart ağırlık ölçüm birimleri',
    units: [
      { name: 'Kilogram', code: 'KG', conversionRate: 1.0, isBaseUnit: true },
      { name: 'Gram', code: 'GR', conversionRate: 0.001, isBaseUnit: false },
      { name: 'Ton', code: 'TON', conversionRate: 1000.0, isBaseUnit: false }
    ]
  },
  {
    name: 'Standart Hacim',
    description: 'Standart hacim ölçüm birimleri',
    units: [
      { name: 'Litre', code: 'LT', conversionRate: 1.0, isBaseUnit: true },
      { name: 'Mililitre', code: 'ML', conversionRate: 0.001, isBaseUnit: false }
    ]
  }
];

async function createPredefinedTemplates(tenantId: string) {
  for (const template of predefinedTemplates) {
    const unitSet = await prisma.unitSet.create({
      data: {
        tenantId,
        name: template.name,
        description: template.description
      }
    });
    
    await prisma.unit.createMany({
      data: template.units.map(unit => ({
        ...unit,
        unitSetId: unitSet.id
      }))
    });
  }
}
```

---

## SSS (Sıkça Sorulan Sorular)

### S1: Bir birim setinde kaç birim olabilir?

**Cevap**: Teknik olarak sınırsız, ancak pratikte 10-20 birim önerilir.

### S2: Bir birim setini sildiğimde ne olur?

**Cevap**: Cascade delete özelliği nedeniyle, birim setindeki tüm birimler de silinir. Ancak, bu birimleri kullanan ürünlerin `unitId` alanı NULL yapılır.

### S3: Dönüşüm oranını değiştirebilir miyim?

**Cevap**: Evet, ancak dikkatli olmalısınız. Dönüşüm oranını değiştirmek, geçmiş faturalar ve stok hareketlerini etkileyebilir. Değişiklikten önce yedek almanız önerilir.

### S4: Üst üste dönüşüm yapabilir miyim? (Örn: KG → GR → MG)

**Cevap**: Evet, ancak bunu iki adımda yapmalısınız: önce KG → GR, sonra GR → MG.

### S5: Özel birim kodları tanımlayabilir miyim?

**Cevap**: Evet, ancak GIB standartlarına uymak için standart kodları kullanmanız önerilir. Özel kodlar e-fatura entegrasyonunda sorunlara neden olabilir.

### S6: Bir ürünün birden fazla birimi olabilir mi?

**Cevap**: Şu anki yapıda bir ürün tek bir birime sahip olabilir. Çoklu birim desteği gelecek versiyonlarda planlanmaktadır.

---

## Kaynaklar

### Resmi Dokümantasyon
- [Prisma Dokümantasyonu](https://www.prisma.io/docs)
- [PostgreSQL Dokümantasyonu](https://www.postgresql.org/docs/)
- [GIB Birim Kodları](https://www.gib.gov.tr/)

### İlgili Modüller
- [Ürün Yönetimi](./URUN_YONETIMI.md)
- [Fatura Yönetimi](./FATURA_YONETIMI.md)
- [Stok Yönetimi](./STOK_YONETIMI.md)

---

## Değişiklik Geçmişi

| Tarih | Versiyon | Değişiklikler | Yazar |
|-------|----------|---------------|-------|
| 2024-01-15 | 1.0 | İlk sürüm | OtoMuhasebe Ekibi |
| 2024-02-20 | 1.1 | GIB kodu desteği eklendi | OtoMuhasebe Ekibi |
| 2024-03-10 | 1.2 | Product entegrasyonu eklendi | OtoMuhasebe Ekibi |

---

## İletişim

Sorularınız veya önerileriniz için:
- Email: support@otomuhasebe.com
- GitHub: https://github.com/firatemu/otomuhasebe/issues