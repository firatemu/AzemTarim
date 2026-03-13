import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreatePriceCardDto, PriceType } from './dto/create-price-card.dto';
import { FindAllPriceCardsDto, FindPriceCardsDto } from './dto/find-price-cards.dto';
import { TenantResolverService } from '../../common/services/tenant-resolver.service';
import { buildTenantWhereClause } from '../../common/utils/staging.util';

@Injectable()
export class PriceCardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantResolver: TenantResolverService,
  ) { }

  async create(createDto: CreatePriceCardDto, userId?: string) {
    const {
      productId,
      priceType = PriceType.SALE,
      price,
      salePrice,
      currency = 'TRY',
      effectiveFrom,
      effectiveTo,
      notes,
      vatRate = 20,
      minQuantity = 1,
    } = createDto;

    const finalPrice = price ?? salePrice;

    const tenantId = await this.tenantResolver.resolveForCreate({ allowNull: true });

    return this.prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({ where: { id: productId } });
      if (!product) {
        throw new NotFoundException('Stock record not found');
      }

      const priceCard = await tx.priceCard.create({
        data: {
          tenantId: tenantId as string,
          productId,
          type: priceType as any,
          price: finalPrice,
          currency,
          effectiveFrom: effectiveFrom ? new Date(effectiveFrom) : undefined,
          effectiveTo: effectiveTo ? new Date(effectiveTo) : undefined,
          vatRate,
          minQuantity,
          note: notes || undefined,
          createdBy: userId,
          updatedBy: userId,
          isActive: true, // New cards are active by default
        } as any,
      });

      return priceCard;
    });
  }

  async findAll(query: FindAllPriceCardsDto) {
    const { page = 1, limit = 10, type } = query;
    const skip = (page - 1) * limit;
    const tenantId = await this.tenantResolver.resolveForQuery();

    const where = {
      ...buildTenantWhereClause(tenantId ?? undefined),
      ...(type && { type }),
    };

    const [items, total] = await Promise.all([
      this.prisma.priceCard.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          product: {
            select: {
              id: true,
              code: true,
              name: true,
              brand: true,
            },
          },
          createdByUser: {
            select: {
              id: true,
              fullName: true,
            },
          },
        },
      }),
      this.prisma.priceCard.count({ where }),
    ]);

    return {
      data: items.map((item: any) => ({
        ...item,
        salePrice: item.price,
        priceType: item.type,
        notes: item.note,
        status: item.isActive ? 'ACTIVE' : 'PASSIVE',
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const tenantId = await this.tenantResolver.resolveForQuery();
    const item = await this.prisma.priceCard.findFirst({
      where: {
        id,
        ...buildTenantWhereClause(tenantId ?? undefined),
      },
      include: {
        product: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
      },
    }) as any;

    if (!item) throw new NotFoundException('Price card not found');

    return {
      ...item,
      salePrice: item.price,
      priceType: item.type,
      notes: item.note,
      status: item.isActive ? 'ACTIVE' : 'PASSIVE',
    };
  }

  async update(id: string, updateDto: any, userId?: string) {
    const tenantId = await this.tenantResolver.resolveForQuery();
    const { priceType, notes, salePrice, price, status, ...rest } = updateDto;

    const finalPrice = price ?? salePrice;
    const isActive = status === 'ACTIVE' ? true : status === 'PASSIVE' ? false : undefined;

    return this.prisma.priceCard.update({
      where: {
        id,
        ...buildTenantWhereClause(tenantId ?? undefined),
      },
      data: {
        ...rest,
        ...(priceType && { type: priceType }),
        ...(notes !== undefined && { note: notes }),
        ...(finalPrice !== undefined && { price: finalPrice }),
        ...(isActive !== undefined && { isActive }),
        updatedBy: userId,
      },
    });
  }

  async remove(id: string) {
    const tenantId = await this.tenantResolver.resolveForQuery();
    return this.prisma.priceCard.delete({
      where: {
        id,
        ...buildTenantWhereClause(tenantId ?? undefined),
      },
    });
  }

  async findByStok(productId: string, query: FindPriceCardsDto) {
    const tenantId = await this.tenantResolver.resolveForQuery();
    const type = query.type ?? PriceType.SALE;
    return this.prisma.priceCard.findMany({
      where: {
        ...buildTenantWhereClause(tenantId ?? undefined),
        productId,
        type,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        createdByUser: {
          select: {
            id: true,
            fullName: true,
            username: true,
          },
        },
      },
    });
  }

  async findLatest(productId: string, type: PriceType = PriceType.SALE) {
    const tenantId = await this.tenantResolver.resolveForQuery();
    return this.prisma.priceCard.findFirst({
      where: {
        ...buildTenantWhereClause(tenantId ?? undefined),
        productId,
        type,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
