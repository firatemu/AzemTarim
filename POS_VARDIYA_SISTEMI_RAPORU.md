# 🛒 POS Vardiya Sistemi Raporu

**Tarih**: 2026-03-17  
**Modül**: Point of Sale (POS) Console  
**Konu**: Kasiyer Vardiya Yönetimi

---

## 📊 Genel Bakış

POS vardiya sistemi, kasiyerlerin günlük nakit yönetimini izlemek için kullanılır. Sistem tamamen backend tarafında implement edilmiş, ancak frontend UI'ı eksiktir.

---

## ✅ Backend Durumu (Tamamlandı)

### 1. Database Model

**Dosya**: `api-stage/server/prisma/schema.prisma`

```prisma
model PosSession {
  id            String           @id @default(uuid())
  sessionNo     String           @map("session_no")
  cashierId     String           @map("cashier_id")
  cashboxId     String           @map("cashbox_id")
  openingAmount Decimal          @map("opening_amount") @db.Decimal(12, 2)
  closingAmount Decimal?         @map("closing_amount") @db.Decimal(12, 2)
  closingNotes  String?          @map("closing_notes")
  status        PosSessionStatus @map("status")
  openedAt      DateTime         @default(now()) @map("opened_at")
  closedAt      DateTime?        @map("closed_at")
  createdAt     DateTime         @default(now())
  updatedAt     DateTime         @updatedAt
  tenantId      String?
  tenant        Tenant?          @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  createdBy     String?          @map("created_by")
  updatedBy     String?          @map("updated_by")

  @@unique([sessionNo, tenantId])
  @@index([tenantId])
  @@index([cashierId])
  @@index([status])
  @@map("pos_sessions")
}

enum PosSessionStatus {
  OPEN
  CLOSED
}
```

**Özellikler**:
- ✅ Session ID, Session No
- ✅ Kasiyer ID, Kasa ID
- ✅ Açılış/ Kapanış Tutarı
- ✅ Kapanış Notları
- ✅ Durum (OPEN/CLOSED)
- ✅ Zaman damgaları
- ✅ Tenant desteği
- ✅ İndeksler optimize edilmiş

---

### 2. API Endpoint'leri

**Dosya**: `api-stage/server/src/modules/pos/pos.controller.ts`

```typescript
@ApiTags('POS Console')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('pos')
export class PosController {
  constructor(private readonly posService: PosService) {}

  // --- Vardiya Yönetimi ---

  @Post('session/open')
  @ApiOperation({ summary: 'POS kasiyer session aç' })
  @ApiResponse({ status: 201, description: 'Session açıldı' })
  async openSession(@Body() dto: CreatePosSessionDto, @Request() req: any) {
    const userId = req.user?.id;
    return this.posService.createSession(dto, userId);
  }

  @Post('session/:sessionId/close')
  @ApiOperation({ summary: 'POS kasiyer session kapat' })
  @ApiResponse({ status: 200, description: 'Session kapatıldı' })
  async closeSession(
    @Param('sessionId') sessionId: string,
    @Body() dto: ClosePosSessionDto,
    @Request() req: any,
  ) {
    const userId = req.user?.id;
    return this.posService.closeSession(sessionId, dto, userId);
  }

  // --- Sepet Yönetimi ---

  @Post('cart/draft')
  @ApiOperation({ summary: 'Taslak POS sepeti oluştur' })
  @ApiResponse({ status: 201, description: 'Taslak fatura oluşturuldu' })
  async createDraftCart(@Body() dto: CreatePosSaleDto, @Request() req: any) {
    const userId = req.user?.id;
    return this.posService.createDraftSale(dto, userId);
  }

  @Post('cart/:invoiceId/complete')
  @ApiOperation({ summary: 'POS satışını tamamla' })
  @ApiResponse({ status: 200, description: 'Satış tamamlandı' })
  async completeSale(
    @Param('invoiceId') invoiceId: string,
    @Body('payments') payments: CreatePosSaleDto['payments'],
    @Body('cashboxId') cashboxId?: string,
    @Request() req: req: any,
  ) {
    const userId = req.user?.id;
    return this.posService.completeSale(invoiceId, payments, userId, cashboxId);
  }

  @Delete('cart/:invoiceId')
  @ApiOperation({ summary: 'Taslak sepeti sil' })
  @ApiResponse({ status: 200, description: 'Sepet silindi' })
  async deleteCart(@Param('invoiceId') invoiceId: string, @Request() req: any) {
    const userId = req.user?.id;
    return this.posService.deleteDraftCart(invoiceId, userId);
  }

  @Get('carts/active')
  @ApiOperation({ summary: 'Aktif POS sepetlerini getir' })
  @ApiResponse({ status: 200, description: 'Aktif sepetler getirildi' })
  async getActiveCarts(@Query('cashierId') cashierId?: string) {
    return this.posService.getActiveCarts(cashierId);
  }

  // --- Ürün Sorgulama ---

  @Get('products/barcode/:barcode')
  @ApiOperation({ summary: 'Barkoda göre ürünleri getir' })
  @ApiResponse({ status: 200, description: 'Ürünler listelendi' })
  async getProductsByBarcode(@Param('barcode') barcode: string) {
    return this.posService.getProductsByBarcode(barcode);
  }

  // --- İade İşlemleri ---

  @Post('return')
  @ApiOperation({ summary: 'POS iadesi oluştur' })
  @ApiResponse({ status: 201, description: 'İade oluşturuldu' })
  async createReturn(@Body() dto: CreatePosReturnDto, @Request() req: any) {
    const userId = req.user?.id;
    return this.posService.createReturn(dto, userId);
  }
}
```

**Endpoint Özeti**:

| Endpoint | Method | Açıklama | Durum |
|----------|--------|----------|-------|
| `/api/pos/session/open` | POST | Vardiya aç | ✅ Mevcut |
| `/api/pos/session/:sessionId/close` | POST | Vardiya kapat | ✅ Mevcut |
| `/api/pos/cart/draft` | POST | Taslak sepet oluştur | ✅ Mevcut |
| `/api/pos/cart/:invoiceId/complete` | POST | Satışı tamamla | ✅ Mevcut |
| `/api/pos/cart/:invoiceId` | DELETE | Sepeti sil | ✅ Mevcut |
| `/api/pos/carts/active` | GET | Aktif sepetleri getir | ✅ Mevcut |
| `/api/pos/products/barcode/:barcode` | GET | Barkod sorgula | ✅ Mevcut |
| `/api/pos/return` | POST | İade oluştur | ✅ Mevcut |

---

### 3. DTO'lar

**CreatePosSessionDto**:
```typescript
class CreatePosSessionDto {
  @IsNotEmpty()
  cashboxId: string;

  @IsNotEmpty()
  @IsNumber()
  openingAmount: number;
}
```

**ClosePosSessionDto**:
```typescript
class ClosePosSessionDto {
  @IsNotEmpty()
  @IsNumber()
  closingAmount: number;

  @IsOptional()
  closingNotes?: string;
}
```

---

## ⚠️ Frontend Durumu (Kısmi)

### 1. Store State

**Dosya**: `panel-stage/client/src/stores/posStore.ts`

```typescript
interface PosState {
  // Session State
  activeSessionId: string | null;
  cashierId: string | null;
  cashboxId: string | null;
  warehouseId: string | null;

  // Actions
  setSession: (
    sessionId: string | null,
    cashierId: string | null,
    cashboxId: string | null,
    warehouseId: string | null
  ) => void;
}
```

**Mevcut Durum**:
- ✅ `activeSessionId` state'i var
- ✅ `cashierId` state'i var
- ✅ `cashboxId` state'i var
- ✅ `setSession()` action'ı var
- ❌ Vardiya açma/kapatma fonksiyonları YOK
- ❌ Aktif session fetch fonksiyonu YOK

---

### 2. UI Bileşenleri

**Dosya**: `panel-stage/client/src/app/(main)/pos/page.tsx`

**Mevcut UI**:
- ✅ Ürün arama/barkod okuma
- ✅ Sepet yönetimi
- ✅ Müşteri seçimi
- ✅ Ödeme modal'ı
- ✅ Fiş görüntüleme

**Eksik UI**:
- ❌ Vardiya açma butonu
- ❌ Vardiya kapatma butonu
- ❌ Aktif vardiya göstergesi
- ❌ Kasa açılış/kapanış formu
- ❌ Vardiya özeti raporu

---

## 🎨 Frontend UI Önerileri

### 1. Vardiya Açma Modal

```typescript
interface OpenSessionDialogProps {
  open: boolean;
  onClose: () => void;
  onOpen: (cashboxId: string, openingAmount: number) => Promise<void>;
  cashboxes: Array<{ id: string; name: string }>;
}

function OpenSessionDialog({ open, onClose, onOpen, cashboxes }: OpenSessionDialogProps) {
  const [selectedCashbox, setSelectedCashbox] = useState('');
  const [openingAmount, setOpeningAmount] = useState(0);

  const handleSubmit = async () => {
    await onOpen(selectedCashbox, openingAmount);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Vardiya Aç</DialogTitle>
      <DialogContent>
        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel>Kasa Seç</InputLabel>
          <Select
            value={selectedCashbox}
            onChange={(e) => setSelectedCashbox(e.target.value)}
          >
            {cashboxes.map((box) => (
              <MenuItem key={box.id} value={box.id}>
                {box.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          fullWidth
          label="Açılış Tutarı (₺)"
          type="number"
          value={openingAmount}
          onChange={(e) => setOpeningAmount(Number(e.target.value))}
          sx={{ mt: 2 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>İptal</Button>
        <Button onClick={handleSubmit} variant="contained">Aç</Button>
      </DialogActions>
    </Dialog>
  );
}
```

### 2. Vardiya Kapatma Modal

```typescript
interface CloseSessionDialogProps {
  open: boolean;
  onClose: () => void;
  onCloseSession: (closingAmount: number, notes?: string) => Promise<void>;
  expectedAmount: number;
}

function CloseSessionDialog({ open, onClose, onCloseSession, expectedAmount }: CloseSessionDialogProps) {
  const [closingAmount, setClosingAmount] = useState(0);
  const [notes, setNotes] = useState('');

  const handleSubmit = async () => {
    await onCloseSession(closingAmount, notes);
    onClose();
  };

  const difference = closingAmount - expectedAmount;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Vardiya Kapat</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1">Beklenen Tutar:</Typography>
          <Typography variant="h4" color="primary">
            {expectedAmount.toLocaleString('tr-TR')} ₺
          </Typography>
        </Box>
        <TextField
          fullWidth
          label="Sayılan Tutar (₺)"
          type="number"
          value={closingAmount}
          onChange={(e) => setClosingAmount(Number(e.target.value))}
          sx={{ mb: 2 }}
        />
        {difference !== 0 && (
          <Alert severity={difference > 0 ? 'success' : 'error'} sx={{ mb: 2 }}>
            {difference > 0 ? '+' : ''}{difference.toLocaleString('tr-TR')} ₺
          </Alert>
        )}
        <TextField
          fullWidth
          label="Kapanış Notları"
          multiline
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>İptal</Button>
        <Button onClick={handleSubmit} variant="contained">Kapat</Button>
      </DialogActions>
    </Dialog>
  );
}
```

### 3. API Çağrıları

```typescript
// api/pos.ts (yeni dosya)

export async function openPosSession(cashboxId: string, openingAmount: number) {
  const response = await axios.post('/pos/session/open', {
    cashboxId,
    openingAmount,
  });
  return response.data;
}

export async function closePosSession(
  sessionId: string,
  closingAmount: number,
  closingNotes?: string
) {
  const response = await axios.post(`/pos/session/${sessionId}/close`, {
    closingAmount,
    closingNotes,
  });
  return response.data;
}

export async function getActivePosSession(cashierId?: string) {
  const response = await axios.get('/pos/carts/active', {
    params: { cashierId },
  });
  return response.data;
}
```

---

## 📋 Uygulama Check-Listesi

### Backend
- [x] Database modeli oluştur
- [x] Controller endpoint'leri ekle
- [x] Service layer implement et
- [x] DTO'lar oluştur
- [x] Auth guard ekle
- [x] Swagger dokümantasyonu ekle

### Frontend
- [x] Store state'leri tanımla
- [x] Store actions ekle
- [ ] API client fonksiyonları oluştur
- [ ] Vardiya açma modal'ı oluştur
- [ ] Vardiya kapatma modal'ı oluştur
- [ ] Aktif vardiya göstergesi ekle
- [ ] POS sayfasına butonları entegre et
- [ ] Vardiya özeti raporu sayfası
- [ ] Vardiya geçmişi listesi
- [ ] Kasa seçimi component'i

---

## 🔄 Kullanıcı Akışı

### Vardiya Açma Akışı

```
1. Kasiyer POS sayfasına girer
2. Aktif vardiya kontrol edilir
   - Yoksa: "Vardiya Aç" butonu göster
   - Varsa: "Vardiya: XXX (Kasa YYY)" göster
3. Kasiyer "Vardiya Aç" butonuna tıklar
4. Modal açılır:
   - Kasa seçimi (dropdown)
   - Açılış tutarı girişi (input)
5. Kasiyer bilgileri girer ve "Aç" butonuna tıklar
6. API çağrısı: POST /api/pos/session/open
7. Session ID store'a kaydedilir
8. POS sistemini kullanmaya başlar
```

### Vardiya Kapatma Akışı

```
1. Kasiyer gün sonunda "Vardiya Kapat" butonuna tıklar
2. Modal açılır:
   - Beklenen tutar gösterilir
   - Sayılan tutar girişi (input)
   - Fark hesaplanır (+/-)
   - Kapanış notları (textarea)
3. Kasiyer kasayı sayar, tutarı girer
4. "Kapat" butonuna tıklar
5. API çağrısı: POST /api/pos/session/:sessionId/close
6. Store temizlenir
7. Fiş/rapor gösterilir
8. Çıkış yapılır
```

---

## 📊 Vardiya Özeti Raporu

Önerilen rapor alanları:

| Alan | Açıklama |
|------|----------|
| **Vardiya Bilgileri** | |
| Session No | Vardiya numarası |
| Kasiyer Adı | Kasiyerin adı |
| Kasa Adı | Kasa tanımı |
| Açılış Zamanı | Vardiya açılış tarihi/saati |
| Kapanış Zamanı | Vardiya kapanış tarihi/saati |
| **Tutarlar** | |
| Açılış Tutarı | Kasa açılış bakiyesi |
| Toplam Satış | Günlük satış tutarı |
| Tahsilat Tutarı | Ödeme toplamı |
| İadeler | İade toplamı |
| Sayılan Tutar | Fiili sayım |
| Fark | (+/-) Fark |
| **Ödeme Dağılımı** | |
| Nakit | Nakit ödeme toplamı |
| Kredi Kartı | Kart ödeme toplamı |
| Havale/EFT | Banka transferi toplamı |
| Diğer | Diğer ödeme yöntemleri |
| **Notlar** | |
| Kapanış Notları | Kasiyer notları |

---

## 🔗 İlgili Dosyalar

### Backend
- `api-stage/server/src/modules/pos/pos.controller.ts`
- `api-stage/server/src/modules/pos/pos.service.ts`
- `api-stage/server/src/modules/pos/dto/`
- `api-stage/server/prisma/schema.prisma` (PosSession model)

### Frontend
- `panel-stage/client/src/stores/posStore.ts`
- `panel-stage/client/src/app/(main)/pos/page.tsx`
- `panel-stage/client/src/app/(main)/pos/` (yeni sayfalar eklenecek)

---

## ✅ Sonuç

**Backend**: %100 tamamlanmış, tüm endpoint'ler çalışır durumda.  
**Frontend**: %40 tamamlanmış, sadece store state'leri mevcut. UI eksik.

**Önerilen Eylem**: Frontend UI bileşenlerinin oluşturulması ve POS sayfasına entegrasyonu.