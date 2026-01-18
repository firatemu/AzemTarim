import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, FaturaDurum, FaturaTipi } from '@prisma/client';
import { PrismaService } from '../../common/prisma.service';
import { GetCostingQueryDto } from './dto/get-costing-query.dto';

type TimelineEvent =
  | {
      type: 'increase';
      date: Date;
      quantity: number;
      unitCost: number;
    }
  | {
      type: 'decrease';
      date: Date;
      quantity: number;
    };

@Injectable()
export class CostingService {
  constructor(private readonly prisma: PrismaService) {}

  async getLatestCosts(query: GetCostingQueryDto) {
    const {
      search,
      marka,
      anaKategori,
      altKategori,
      limit: limitParam,
      page: pageParam,
    } = query;

    const parsedLimit =
      typeof limitParam === 'number' && !Number.isNaN(limitParam)
        ? limitParam
        : Number(limitParam);
    const parsedPage =
      typeof pageParam === 'number' && !Number.isNaN(pageParam)
        ? pageParam
        : Number(pageParam);

    const limit =
      Number.isFinite(parsedLimit) && parsedLimit > 0
        ? Math.min(Math.max(parsedLimit, 1), 500)
        : 100;
    const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;
    const skip = (page - 1) * limit;

    const stokWhere: Prisma.StokWhereInput = {};

    if (search?.trim()) {
      const term = search.trim();
      stokWhere.OR = [
        { stokKodu: { contains: term, mode: 'insensitive' } },
        { stokAdi: { contains: term, mode: 'insensitive' } },
      ];
    }

    if (marka) {
      stokWhere.marka = { equals: marka };
    }

    if (anaKategori) {
      stokWhere.anaKategori = { equals: anaKategori };
    }

    if (altKategori) {
      stokWhere.altKategori = { equals: altKategori };
    }

    const [total, stocks] = await this.prisma.$transaction([
      this.prisma.stok.count({ where: stokWhere }),
      this.prisma.stok.findMany({
        where: stokWhere,
        select: {
          id: true,
          stokKodu: true,
          stokAdi: true,
          marka: true,
          anaKategori: true,
          altKategori: true,
        },
        orderBy: { stokKodu: 'asc' },
        skip,
        take: limit,
      }),
    ]);

    if (stocks.length === 0) {
      return {
        data: [],
        total,
        page,
        limit,
      };
    }

    const stokIds = stocks.map((stock) => stock.id);

    const histories = await this.prisma.stockCostHistory.findMany({
      where: {
        stokId: { in: stokIds },
      },
      orderBy: { computedAt: 'desc' },
    });

    const latestHistoryMap = new Map<string, (typeof histories)[number]>();
    for (const history of histories) {
      if (!latestHistoryMap.has(history.stokId)) {
        latestHistoryMap.set(history.stokId, history);
      }
    }

    const data = stocks.map((stock) => {
      const latest = latestHistoryMap.get(stock.id);
      return {
        stokId: stock.id,
        stokKodu: stock.stokKodu,
        stokAdi: stock.stokAdi,
        marka: stock.marka,
        anaKategori: stock.anaKategori,
        altKategori: stock.altKategori,
        cost: latest ? Number(latest.cost) : null,
        computedAt: latest?.computedAt?.toISOString() ?? null,
        note: latest?.note ?? null,
      };
    });

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async calculateWeightedAverageCost(stokId: string) {
    const stok = await this.prisma.stok.findUnique({
      where: { id: stokId },
      select: {
        id: true,
        stokKodu: true,
        stokAdi: true,
        marka: true,
        anaKategori: true,
        altKategori: true,
      },
    });

    if (!stok) {
      throw new NotFoundException('Stok bulunamadı.');
    }

    const purchaseLines = await this.prisma.faturaKalemi.findMany({
      where: {
        stokId,
        fatura: {
          faturaTipi: FaturaTipi.ALIS,
          durum: FaturaDurum.ONAYLANDI,
        },
      },
      select: {
        miktar: true,
        birimFiyat: true,
        tutar: true,
        fatura: {
          select: { tarih: true },
        },
      },
    });

    const salesLines = await this.prisma.faturaKalemi.findMany({
      where: {
        stokId,
        fatura: {
          faturaTipi: { in: [FaturaTipi.SATIS, FaturaTipi.ALIS_IADE] },
          durum: FaturaDurum.ONAYLANDI,
        },
      },
      select: {
        miktar: true,
        fatura: {
          select: { tarih: true },
        },
      },
    });

    const salesReturnLines = await this.prisma.faturaKalemi.findMany({
      where: {
        stokId,
        fatura: {
          faturaTipi: FaturaTipi.SATIS_IADE,
          durum: FaturaDurum.ONAYLANDI,
        },
      },
      select: {
        miktar: true,
        birimFiyat: true,
        tutar: true,
        fatura: {
          select: { tarih: true },
        },
      },
    });

    const timeline: TimelineEvent[] = [];

    for (const line of purchaseLines) {
      const qty = Number(line.miktar);
      if (!qty || qty <= 0) continue;
      const total = line.tutar
        ? Number(line.tutar)
        : Number(line.birimFiyat) * qty;
      const unitCost = qty ? total / qty : 0;
      timeline.push({
        type: 'increase',
        date: line.fatura.tarih,
        quantity: qty,
        unitCost,
      });
    }

    for (const line of salesLines) {
      const qty = Number(line.miktar);
      if (!qty || qty <= 0) continue;
      timeline.push({
        type: 'decrease',
        date: line.fatura.tarih,
        quantity: qty,
      });
    }

    for (const line of salesReturnLines) {
      const qty = Number(line.miktar);
      if (!qty || qty <= 0) continue;
      const total = line.tutar
        ? Number(line.tutar)
        : Number(line.birimFiyat) * qty;
      const unitCost = qty ? total / qty : 0;
      timeline.push({
        type: 'increase',
        date: line.fatura.tarih,
        quantity: qty,
        unitCost,
      });
    }

    if (timeline.length === 0) {
      await this.prisma.stockCostHistory.create({
        data: {
          stokId,
          cost: new Prisma.Decimal(0),
          note: 'Geçerli satın alma hareketi bulunamadı.',
          marka: stok.marka ?? undefined,
          anaKategori: stok.anaKategori ?? undefined,
          altKategori: stok.altKategori ?? undefined,
        },
      });

      return {
        stokId: stok.id,
        stokKodu: stok.stokKodu,
        stokAdi: stok.stokAdi,
        cost: 0,
        method: 'WEIGHTED_AVERAGE',
        message: 'Geçerli satın alma hareketi bulunamadı.',
      };
    }

    timeline.sort((a, b) => {
      const diff = a.date.getTime() - b.date.getTime();
      if (diff !== 0) return diff;
      if (a.type === b.type) return 0;
      return a.type === 'increase' ? -1 : 1;
    });

    let qtyOnHand = 0;
    let averageCost = 0;

    for (const event of timeline) {
      if (event.type === 'increase') {
        const qty = event.quantity;
        const unitCost = event.unitCost;
        if (qty <= 0 || !Number.isFinite(unitCost)) {
          continue;
        }

        if (qtyOnHand <= 0) {
          averageCost = unitCost;
          qtyOnHand = qty;
        } else {
          const totalCost = averageCost * qtyOnHand + unitCost * qty;
          qtyOnHand += qty;
          averageCost = totalCost / qtyOnHand;
        }
      } else {
        qtyOnHand -= event.quantity;
        if (qtyOnHand <= 0) {
          qtyOnHand = 0;
          averageCost = 0;
        }
      }
    }

    const roundedCost = averageCost > 0 ? Number(averageCost.toFixed(4)) : 0;

    try {
      await this.prisma.stockCostHistory.create({
        data: {
          stokId,
          cost: new Prisma.Decimal(roundedCost),
          marka: stok.marka ?? undefined,
          anaKategori: stok.anaKategori ?? undefined,
          altKategori: stok.altKategori ?? undefined,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        // unique constraint violation if exists; continue
      } else {
        throw error;
      }
    }

    return {
      stokId: stok.id,
      stokKodu: stok.stokKodu,
      stokAdi: stok.stokAdi,
      cost: roundedCost,
      method: 'WEIGHTED_AVERAGE',
    };
  }
}
