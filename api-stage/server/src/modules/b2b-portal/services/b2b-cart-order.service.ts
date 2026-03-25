import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  B2BNotificationType,
  B2BOrderPlacedBy,
  B2BOrderStatus,
  Prisma,
} from '@prisma/client';
import { randomBytes } from 'crypto';
import { PrismaService } from '../../../common/prisma.service';
import type { B2bJwtPayload } from '../types/b2b-jwt-payload';
import { B2bPortalActorService } from './b2b-portal-actor.service';
import { B2bPriceService } from './b2b-price.service';
import { B2bRiskCheckService } from './b2b-risk-check.service';

@Injectable()
export class B2bCartOrderService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly priceService: B2bPriceService,
    private readonly riskService: B2bRiskCheckService,
    private readonly actor: B2bPortalActorService,
  ) {}

  private async assertCustomerAccess(
    tenantId: string,
    customerId: string,
    user: B2bJwtPayload,
  ): Promise<void> {
    const c = await this.prisma.b2BCustomer.findFirst({
      where: { id: customerId, tenantId, isActive: true },
      select: { id: true },
    });
    if (!c) {
      throw new NotFoundException('Müşteri bulunamadı');
    }
    if (user.userType === 'CUSTOMER') {
      if (user.sub !== customerId) {
        throw new ForbiddenException();
      }
      return;
    }
    await this.actor.assertSalespersonCanAccess(
      user.sub,
      customerId,
      tenantId,
    );
  }

  private async getOrCreateCart(tenantId: string, customerId: string) {
    let cart = await this.prisma.b2BCart.findUnique({
      where: { tenantId_customerId: { tenantId, customerId } },
    });
    if (!cart) {
      cart = await this.prisma.b2BCart.create({
        data: { tenantId, customerId },
      });
    }
    return cart;
  }

  async getCartSummary(tenantId: string, customerId: string) {
    const cart = await this.getOrCreateCart(tenantId, customerId);
    const items = await this.prisma.b2BCartItem.findMany({
      where: { cartId: cart.id, tenantId },
      include: { product: true },
      orderBy: { addedAt: 'asc' },
    });

    let totalList = new Prisma.Decimal(0);
    let totalDiscount = new Prisma.Decimal(0);
    let totalFinal = new Prisma.Decimal(0);

    const lines = await Promise.all(
      items.map(async (row) => {
        const br = await this.priceService.getUnitPriceBreakdown(
          tenantId,
          customerId,
          row.productId,
        );
        const qty = row.quantity;
        const lineList = br.listUnit.mul(qty);
        const lineClass = br.customerClassDiscountUnit.mul(qty);
        const lineCamp = br.campaignDiscountUnit.mul(qty);
        const lineFinal = br.finalUnit.mul(qty);
        totalList = totalList.add(lineList);
        totalDiscount = totalDiscount.add(lineClass).add(lineCamp);
        totalFinal = totalFinal.add(lineFinal);
        return {
          id: row.id,
          productId: row.productId,
          quantity: qty,
          stockCode: br.product.stockCode,
          productName: br.product.name,
          minOrderQuantity: br.product.minOrderQuantity,
          listUnit: br.listUnit,
          customerClassDiscountUnit: br.customerClassDiscountUnit,
          campaignDiscountUnit: br.campaignDiscountUnit,
          finalUnit: br.finalUnit,
          lineListPrice: lineList,
          lineCustomerClassDiscount: lineClass,
          lineCampaignDiscount: lineCamp,
          lineFinalPrice: lineFinal,
        };
      }),
    );

    return {
      cartId: cart.id,
      items: lines,
      totals: {
        totalListPrice: totalList,
        totalDiscountAmount: totalDiscount,
        totalFinalPrice: totalFinal,
      },
    };
  }

  async addItem(
    tenantId: string,
    customerId: string,
    productId: string,
    quantity: number,
  ) {
    await this.priceService.getUnitPriceBreakdown(tenantId, customerId, productId);
    const cart = await this.getOrCreateCart(tenantId, customerId);
    const product = await this.prisma.b2BProduct.findFirst({
      where: { id: productId, tenantId, isVisibleInB2B: true },
      select: { minOrderQuantity: true },
    });
    if (!product) {
      throw new NotFoundException('Ürün bulunamadı');
    }
    if (quantity < product.minOrderQuantity) {
      throw new BadRequestException(
        `Minimum sipariş miktarı: ${product.minOrderQuantity}`,
      );
    }

    const existing = await this.prisma.b2BCartItem.findUnique({
      where: {
        cartId_productId: { cartId: cart.id, productId },
      },
    });

    if (existing) {
      const nextQty = existing.quantity + quantity;
      if (nextQty < product.minOrderQuantity) {
        throw new BadRequestException(
          `Minimum sipariş miktarı: ${product.minOrderQuantity}`,
        );
      }
      await this.prisma.b2BCartItem.update({
        where: { id: existing.id },
        data: { quantity: nextQty },
      });
    } else {
      await this.prisma.b2BCartItem.create({
        data: {
          tenantId,
          cartId: cart.id,
          productId,
          quantity,
        },
      });
    }

    return this.getCartSummary(tenantId, customerId);
  }

  async updateItemQty(
    tenantId: string,
    customerId: string,
    itemId: string,
    quantity: number,
  ) {
    const cart = await this.getOrCreateCart(tenantId, customerId);
    const row = await this.prisma.b2BCartItem.findFirst({
      where: { id: itemId, cartId: cart.id, tenantId },
      include: { product: true },
    });
    if (!row) {
      throw new NotFoundException('Sepet satırı bulunamadı');
    }
    if (quantity < row.product.minOrderQuantity) {
      throw new BadRequestException(
        `Minimum sipariş miktarı: ${row.product.minOrderQuantity}`,
      );
    }
    await this.prisma.b2BCartItem.update({
      where: { id: row.id },
      data: { quantity },
    });
    return this.getCartSummary(tenantId, customerId);
  }

  async removeItem(tenantId: string, customerId: string, itemId: string) {
    const cart = await this.getOrCreateCart(tenantId, customerId);
    const row = await this.prisma.b2BCartItem.findFirst({
      where: { id: itemId, cartId: cart.id, tenantId },
    });
    if (!row) {
      throw new NotFoundException('Sepet satırı bulunamadı');
    }
    await this.prisma.b2BCartItem.delete({ where: { id: row.id } });
    return this.getCartSummary(tenantId, customerId);
  }

  async clearCart(tenantId: string, customerId: string) {
    const cart = await this.prisma.b2BCart.findUnique({
      where: { tenantId_customerId: { tenantId, customerId } },
    });
    if (cart) {
      await this.prisma.b2BCartItem.deleteMany({
        where: { cartId: cart.id, tenantId },
      });
    }
    return this.getCartSummary(tenantId, customerId);
  }

  async placeOrder(
    tenantId: string,
    user: B2bJwtPayload,
    customerId: string,
    dto: {
      deliveryMethodId: string;
      deliveryBranchId?: string;
      deliveryBranchName?: string;
      note?: string;
    },
  ) {
    await this.assertCustomerAccess(tenantId, customerId, user);

    const dm = await this.prisma.b2BDeliveryMethod.findFirst({
      where: { id: dto.deliveryMethodId, tenantId, isActive: true },
    });
    if (!dm) {
      throw new BadRequestException('Geçersiz teslimat yöntemi');
    }

    const summary = await this.getCartSummary(tenantId, customerId);
    if (summary.items.length === 0) {
      throw new BadRequestException('Sepet boş');
    }

    await this.riskService.assertOrderAllowed(
      tenantId,
      customerId,
      summary.totals.totalFinalPrice,
    );

    const orderNumber = `B2B-${Date.now().toString(36)}-${randomBytes(3).toString('hex').toUpperCase()}`;

    let placedBy: B2BOrderPlacedBy = B2BOrderPlacedBy.CUSTOMER;
    let salespersonId: string | null = null;
    let placedByLabel: string | null = null;
    if (user.userType === 'SALESPERSON') {
      placedBy = B2BOrderPlacedBy.SALESPERSON;
      salespersonId = user.sub;
      const sp = await this.prisma.b2BSalesperson.findFirst({
        where: { id: user.sub, tenantId },
        select: { name: true },
      });
      placedByLabel = sp?.name ? `P:${sp.name}` : 'P:?';
    }

    const order = await this.prisma.$transaction(async (tx) => {
      const created = await tx.b2BOrder.create({
        data: {
          tenantId,
          orderNumber,
          customerId,
          salespersonId,
          placedBy,
          placedByLabel,
          deliveryMethodId: dto.deliveryMethodId,
          deliveryBranchId: dto.deliveryBranchId ?? null,
          deliveryBranchName: dto.deliveryBranchName ?? null,
          note: dto.note ?? null,
          totalListPrice: summary.totals.totalListPrice,
          totalDiscountAmount: summary.totals.totalDiscountAmount,
          totalFinalPrice: summary.totals.totalFinalPrice,
          items: {
            create: summary.items.map((line) => ({
              tenantId,
              productId: line.productId,
              stockCode: line.stockCode,
              productName: line.productName,
              quantity: line.quantity,
              listPrice: line.listUnit,
              customerClassDiscount: line.customerClassDiscountUnit.mul(
                line.quantity,
              ),
              campaignDiscount: line.campaignDiscountUnit.mul(line.quantity),
              finalPrice: line.finalUnit.mul(line.quantity),
            })),
          },
        },
        include: { items: true },
      });

      await tx.b2BCartItem.deleteMany({
        where: { cartId: summary.cartId, tenantId },
      });

      await tx.b2BNotification.create({
        data: {
          tenantId,
          customerId,
          type: B2BNotificationType.ORDER_RECEIVED,
          message: `Siparişiniz alındı: ${orderNumber}`,
          orderId: created.id,
        },
      });

      return created;
    });

    return order;
  }

  async listOrders(
    tenantId: string,
    customerId: string,
    query?: { page?: number; pageSize?: number; status?: B2BOrderStatus },
  ) {
    const page = query?.page ?? 1;
    const pageSize = query?.pageSize ?? 25;
    const where: Prisma.B2BOrderWhereInput = {
      tenantId,
      customerId,
      ...(query?.status ? { status: query.status } : {}),
    };

    const [total, data] = await this.prisma.$transaction([
      this.prisma.b2BOrder.count({ where }),
      this.prisma.b2BOrder.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          deliveryMethod: { select: { id: true, name: true } },
          items: true,
        },
      }),
    ]);

    return {
      data,
      meta: { total, page, pageSize, pageCount: Math.ceil(total / pageSize) },
    };
  }

  async getOrder(tenantId: string, customerId: string, orderId: string) {
    const o = await this.prisma.b2BOrder.findFirst({
      where: { id: orderId, tenantId, customerId },
      include: {
        deliveryMethod: true,
        items: true,
        salesperson: { select: { id: true, name: true } },
      },
    });
    if (!o) {
      throw new NotFoundException('Sipariş bulunamadı');
    }
    const statusTimeline = this.buildOrderTimeline(o);
    return { ...o, statusTimeline };
  }

  async listSalespersonOrders(
    tenantId: string,
    salespersonId: string,
    query?: { page?: number; pageSize?: number; status?: B2BOrderStatus },
  ) {
    const page = query?.page ?? 1;
    const pageSize = query?.pageSize ?? 25;
    const where: Prisma.B2BOrderWhereInput = {
      tenantId,
      salespersonId,
      ...(query?.status ? { status: query.status } : {}),
    };

    const [total, data] = await this.prisma.$transaction([
      this.prisma.b2BOrder.count({ where }),
      this.prisma.b2BOrder.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          deliveryMethod: { select: { id: true, name: true } },
          customer: { select: { id: true, name: true } },
          items: true,
        },
      }),
    ]);

    return {
      data,
      meta: { total, page, pageSize, pageCount: Math.ceil(total / pageSize) },
    };
  }

  private buildOrderTimeline(o: {
    createdAt: Date;
    updatedAt: Date;
    status: B2BOrderStatus;
  }) {
    const steps: { key: string; label: string; at: Date }[] = [
      { key: 'RECEIVED', label: 'Siparis alindi', at: o.createdAt },
    ];
    switch (o.status) {
      case B2BOrderStatus.APPROVED:
      case B2BOrderStatus.EXPORTED_TO_ERP:
        steps.push({
          key: 'APPROVED',
          label: 'Onaylandi',
          at: o.updatedAt,
        });
        break;
      case B2BOrderStatus.REJECTED:
        steps.push({
          key: 'REJECTED',
          label: 'Reddedildi',
          at: o.updatedAt,
        });
        break;
      case B2BOrderStatus.CANCELLED:
        steps.push({
          key: 'CANCELLED',
          label: 'Iptal',
          at: o.updatedAt,
        });
        break;
      default:
        break;
    }
    return steps;
  }
}
