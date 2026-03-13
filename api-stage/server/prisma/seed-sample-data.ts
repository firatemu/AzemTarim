import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Örnek veriler ekleniyor...');

    const user = await prisma.user.findFirst({
        where: { email: 'info@azemyazilim.com' },
        include: { tenant: true },
    });

    if (!user || !user.tenantId) {
        throw new Error('Geçerli bir tenant bulunamadı!');
    }

    const tenantId = user.tenantId;
    console.log(`🏢 İşlem yapılacak Tenant ID: ${tenantId}`);

    // 2. Markaları (Brands) Oluştur
    const brandsData = [
        { tenantId, name: 'Bosch', slug: 'bosch', isActive: true },
        { tenantId, name: 'Valeo', slug: 'valeo', isActive: true },
        { tenantId, name: 'Castrol', slug: 'castrol', isActive: true },
        { tenantId, name: 'Brembo', slug: 'brembo', isActive: true },
    ];

    const createdBrands: any[] = [];
    for (const b of brandsData) {
        const brand = await prisma.brand.upsert({
            where: { tenantId_name: { tenantId, name: b.name } },
            update: {},
            create: b,
        });
        createdBrands.push(brand);
    }
    console.log(`✅ ${createdBrands.length} marka oluşturuldu/doğrulandı.`);

    // 3. Kategorileri (Categories) Oluştur
    const categoriesData = [
        { tenantId, name: 'Filtreler', slug: 'filtreler', isActive: true, level: 0 },
        { tenantId, name: 'Motor Yağları', slug: 'motor-yaglari', isActive: true, level: 0 },
        { tenantId, name: 'Fren Sistemi', slug: 'fren-sistemi', isActive: true, level: 0 },
    ];

    const createdCategories: any[] = [];
    for (const c of categoriesData) {
        const category = await prisma.category.upsert({
            where: { tenantId_slug: { tenantId, slug: c.slug } },
            update: {},
            create: c,
        });
        createdCategories.push(category);
    }
    console.log(`✅ ${createdCategories.length} kategori oluşturuldu/doğrulandı.`);

    // 4. Ürünleri (Products) Oluştur
    const productsData = [
        {
            code: 'BSCH-FLT-001',
            name: 'Bosch Yağ Filtresi',
            barcode: '8690000000001',
            unit: 'Adet',
            criticalQty: 10,
            brandId: createdBrands.find(b => b.name === 'Bosch')?.id,
            brand: 'Bosch',
            categoryId: createdCategories.find(c => c.name === 'Filtreler')?.id,
            category: 'Filtreler',
            mainCategory: 'Filtreler',
            purchasePrice: 150.00,
            salePrice: 220.00,
            vatRate: 20,
        },
        {
            code: 'CST-OIL-5W30',
            name: 'Castrol Edge 5W-30 4LT Motor Yağı',
            barcode: '8690000000002',
            unit: 'Adet',
            criticalQty: 5,
            brandId: createdBrands.find(b => b.name === 'Castrol')?.id,
            brand: 'Castrol',
            categoryId: createdCategories.find(c => c.name === 'Motor Yağları')?.id,
            category: 'Motor Yağları',
            mainCategory: 'Motor Yağları',
            purchasePrice: 950.00,
            salePrice: 1350.00,
            vatRate: 20,
        },
        {
            code: 'BRM-PD-001',
            name: 'Brembo Ön Fren Balata Takımı',
            barcode: '8690000000003',
            unit: 'Adet',
            criticalQty: 8,
            brandId: createdBrands.find(b => b.name === 'Brembo')?.id,
            brand: 'Brembo',
            categoryId: createdCategories.find(c => c.name === 'Fren Sistemi')?.id,
            category: 'Fren Sistemi',
            mainCategory: 'Fren Sistemi',
            purchasePrice: 650.00,
            salePrice: 900.00,
            vatRate: 20,
        },
        {
            code: 'VLO-WIP-001',
            name: 'Valeo Silecek Süpürgesi 55cm',
            barcode: '8690000000004',
            unit: 'Adet',
            criticalQty: 15,
            brandId: createdBrands.find(b => b.name === 'Valeo')?.id,
            brand: 'Valeo',
            categoryId: null,
            category: null,
            purchasePrice: 180.00,
            salePrice: 250.00,
            vatRate: 20,
        }
    ];

    let createdProductCount = 0;
    for (const p of productsData) {
        const { purchasePrice, salePrice, vatRate, ...productFields } = p;

        const product = await prisma.product.upsert({
            where: { code_tenantId: { code: p.code, tenantId } },
            update: {
                categoryId: p.categoryId,
                brandId: p.brandId,
                brand: p.brand,
                category: p.category,
            },
            create: {
                ...productFields,
                tenantId,
            },
        });

        await prisma.productPrice.upsert({
            where: { productId: product.id },
            update: {
                purchasePrice,
                salePrice,
                vatRate,
            },
            create: {
                tenantId,
                productId: product.id,
                purchasePrice,
                salePrice,
                vatRate,
                currency: 'TRY',
            }
        });

        createdProductCount++;
    }

    console.log(`✅ ${createdProductCount} ürün ve fiyat kartı (ProductPrice) başarıyla oluşturuldu.`);
    console.log('🎉 Veritabanı örnek verilerle dolduruldu!');
}

main()
    .catch((e) => {
        console.error('❌ Hata oluştu:', e);
        // @ts-ignore
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
