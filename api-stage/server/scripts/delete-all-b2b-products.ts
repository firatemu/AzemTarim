/// <reference types="node" />

/**
 * Tüm B2B ürün kayıtlarını siler.
 *
 * B2BOrderItem -> B2BProduct ilişkisi onDelete: Restrict olduğu için önce sipariş kalemleri silinir.
 * B2BStock / B2BCartItem ürün silinince cascade ile gider.
 *
 * Çalıştırma:
 *   CONFIRM_PURGE_B2B=YES npx ts-node scripts/delete-all-b2b-products.ts
 * Tek tenant:
 *   CONFIRM_PURGE_B2B=YES TENANT_ID=<uuid> npx ts-node scripts/delete-all-b2b-products.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  if (process.env.CONFIRM_PURGE_B2B !== 'YES') {
    console.error(
      'Refused: set CONFIRM_PURGE_B2B=YES to execute (this deletes B2B order line rows that reference products, then all B2B products).',
    );
    process.exit(1);
  }

  const tenantId = process.env.TENANT_ID?.trim() || undefined;
  const whereProduct = tenantId ? { tenantId } : {};

  const countBefore = await prisma.b2BProduct.count({ where: whereProduct });
  console.log(`[purge-b2b-products] B2BProduct count (scope): ${countBefore}`);

  if (countBefore === 0) {
    console.log('[purge-b2b-products] Nothing to delete.');
    return;
  }

  const productIds = (
    await prisma.b2BProduct.findMany({
      where: whereProduct,
      select: { id: true },
    })
  ).map((p) => p.id);

  const { count: deletedOrderItems } = await prisma.b2BOrderItem.deleteMany({
    where: { productId: { in: productIds } },
  });
  console.log(`[purge-b2b-products] Deleted B2BOrderItem rows: ${deletedOrderItems}`);

  const { count: deletedProducts } = await prisma.b2BProduct.deleteMany({
    where: { id: { in: productIds } },
  });
  console.log(`[purge-b2b-products] Deleted B2BProduct rows: ${deletedProducts}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
