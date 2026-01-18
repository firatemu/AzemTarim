import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { TenantContextService } from '../../common/services/tenant-context.service';
import { Prisma } from '@prisma/client';
import { CreateVehicleDto, UpdateVehicleDto } from './dto';
import { isStagingEnvironment, buildTenantWhereClause } from '../../common/utils/staging.util';

@Injectable()
export class VehicleService {
  constructor(
    private prisma: PrismaService,
    private tenantContext: TenantContextService,
  ) { }

  /**
   * Tenant ID'yi al - staging'de default tenant ID'yi kullan
   */
  private getTenantIdOrThrow(): string | undefined {
    const tenantId = this.tenantContext.getTenantId();
    const isStaging = isStagingEnvironment();

    console.log('🔍 [VehicleService.getTenantIdOrThrow] tenantId:', tenantId, 'isStaging:', isStaging);

    // Staging ortamında tenant ID yoksa, default tenant ID'yi kullan
    if (isStaging && !tenantId) {
      const stagingDefaultTenantId = process.env.STAGING_DEFAULT_TENANT_ID;
      if (stagingDefaultTenantId) {
        console.log('✅ [VehicleService.getTenantIdOrThrow] Using default staging tenant ID:', stagingDefaultTenantId);
        return stagingDefaultTenantId;
      }
    }

    // Production'da tenant ID zorunlu
    if (!tenantId && !isStaging) {
      throw new BadRequestException('Tenant ID is required');
    }
    return tenantId;
  }

  // ============= CRUD OPERATIONS =============

  /**
   * Yeni araç oluştur
   */
  async create(dto: CreateVehicleDto) {
    console.log('🔍 [VehicleService.create] DTO:', JSON.stringify(dto, null, 2));
    console.log('🔍 [VehicleService.create] Creating vehicle...');

    const tenantId = this.getTenantIdOrThrow();
    console.log('🔍 [VehicleService.create] tenantId:', tenantId);

    // Müşteri kontrolü - staging'de tenantId opsiyonel
    const customerWhere: any = { id: dto.customerId };
    // Staging ortamında müşteri tenant kontrolünü kaldırıyoruz, çünkü bazı müşterilerin tenantId'si null olabilir
    if (tenantId && !isStagingEnvironment()) {
      customerWhere.tenantId = tenantId;
    }

    console.log('🔍 [VehicleService.create] CustomerWhere:', customerWhere);

    const customer = await this.prisma.cari.findFirst({
      where: customerWhere,
    });
    console.log('🔍 [VehicleService.create] Customer found:', !!customer);

    if (!customer) {
      console.log('❌ [VehicleService.create] Customer NOT found, throwing error');
      throw new NotFoundException('Müşteri bulunamadı');
    }

    // Plaka benzersizlik kontrolü - staging'de tenantId opsiyonel
    const vehicleWhere: any = { plateNumber: dto.plateNumber };
    if (tenantId) {
      vehicleWhere.tenantId = tenantId;
    }

    const existingVehicle = await this.prisma.vehicle.findFirst({
      where: vehicleWhere,
    });
    if (existingVehicle) {
      throw new ConflictException('Bu plaka numarası zaten kayıtlı');
    }

    // VIN benzersizlik kontrolü (opsiyonel)
    if (dto.vin) {
      const vinWhere: any = { vin: dto.vin };
      if (tenantId) {
        vinWhere.tenantId = tenantId;
      }

      const existingVin = await this.prisma.vehicle.findFirst({
        where: vinWhere,
      });
      if (existingVin) {
        throw new ConflictException('Bu şasi numarası zaten kayıtlı');
      }
    }

    // tenantId'yi manuel olarak ekle (DTO'da yok)
    const createData: any = {
      ...dto,
      tenantId: tenantId,
    };

    console.log('🔍 [VehicleService.create] Creating vehicle with tenantId:', tenantId);

    return this.prisma.vehicle.create({
      data: createData,
      include: {
        customer: {
          select: {
            id: true,
            cariKodu: true,
            unvan: true,
            telefon: true,
          },
        },
      },
    });
  }

  /**
   * Araç güncelle
   */
  async update(id: string, dto: UpdateVehicleDto) {
    const tenantId = this.getTenantIdOrThrow();

    // Staging'de tenantId opsiyonel
    const vehicleWhere: any = { id };
    if (tenantId) {
      vehicleWhere.tenantId = tenantId;
    }

    const vehicle = await this.prisma.vehicle.findFirst({
      where: vehicleWhere,
    });
    if (!vehicle) {
      throw new NotFoundException('Araç bulunamadı');
    }

    // Plaka benzersizlik kontrolü - staging'de tenantId opsiyonel
    if (dto.plateNumber && dto.plateNumber !== vehicle.plateNumber) {
      const existingWhere: any = { plateNumber: dto.plateNumber, NOT: { id } };
      if (tenantId) {
        existingWhere.tenantId = tenantId;
      }

      const existingVehicle = await this.prisma.vehicle.findFirst({
        where: existingWhere,
      });
      if (existingVehicle) {
        throw new ConflictException('Bu plaka numarası zaten kayıtlı');
      }
    }

    return this.prisma.vehicle.update({
      where: { id },
      data: dto,
      include: {
        customer: {
          select: {
            id: true,
            cariKodu: true,
            unvan: true,
            telefon: true,
          },
        },
      },
    });
  }

  /**
   * Araç sil
   */
  async delete(id: string) {
    const tenantId = this.getTenantIdOrThrow();

    // Staging'de tenantId opsiyonel
    const vehicleWhere: any = { id };
    if (tenantId) {
      vehicleWhere.tenantId = tenantId;
    }

    const vehicle = await this.prisma.vehicle.findFirst({
      where: vehicleWhere,
      include: { workOrders: { take: 1 } },
    });
    if (!vehicle) {
      throw new NotFoundException('Araç bulunamadı');
    }

    // İş emri varsa silme
    if (vehicle.workOrders.length > 0) {
      throw new BadRequestException(
        'Bu araçla ilişkili iş emirleri var. Önce iş emirlerini silin.',
      );
    }

    return this.prisma.vehicle.delete({
      where: { id },
    });
  }

  /**
   * Araç detayını getir
   */
  async findOne(id: string) {
    const tenantId = this.getTenantIdOrThrow();

    // Staging'de tenantId opsiyonel
    const vehicleWhere: any = { id };
    if (tenantId) {
      vehicleWhere.tenantId = tenantId;
    }

    const vehicle = await this.prisma.vehicle.findFirst({
      where: vehicleWhere,
      include: {
        customer: {
          select: {
            id: true,
            cariKodu: true,
            unvan: true,
            telefon: true,
            email: true,
          },
        },
        maintenanceReminder: true,
      },
    });

    if (!vehicle) {
      throw new NotFoundException('Araç bulunamadı');
    }

    return vehicle;
  }

  /**
   * Araçları listele
   */
  async findAll(
    page = 1,
    limit = 50,
    search?: string,
    customerId?: string,
    brand?: string,
  ) {
    const tenantId = this.getTenantIdOrThrow();
    const skip = (page - 1) * limit;

    // Staging'de tenantId opsiyonel
    const where: Prisma.VehicleWhereInput = {} as any;
    if (tenantId) {
      where.tenantId = tenantId;
    }

    if (customerId) where.customerId = customerId;
    if (brand) where.brand = { contains: brand, mode: 'insensitive' };

    if (search) {
      where.OR = [
        { plateNumber: { contains: search, mode: 'insensitive' } },
        { vin: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
        { model: { contains: search, mode: 'insensitive' } },
        { customer: { unvan: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.vehicle.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: {
            select: {
              id: true,
              cariKodu: true,
              unvan: true,
            },
          },
          maintenanceReminder: {
            select: {
              id: true,
              nextReminderDate: true,
              reminderSent: true,
            },
          },
          _count: {
            select: {
              workOrders: true,
            },
          },
        },
      }),
      this.prisma.vehicle.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ============= PHASE 4: VEHICLE HISTORY =============

  /**
   * Araç geçmişini getir
   * Tüm iş emirleri, işçilikler, kullanılan parçalar, teknisyenler ve faturalar
   */
  async getVehicleHistory(vehicleId: string) {
    const tenantId = this.getTenantIdOrThrow();

    // Araç kontrolü
    const vehicle = await this.prisma.vehicle.findFirst({
      where: { id: vehicleId, tenantId },
      include: {
        customer: {
          select: {
            id: true,
            cariKodu: true,
            unvan: true,
            telefon: true,
            email: true,
          },
        },
        maintenanceReminder: true,
      },
    });

    if (!vehicle) {
      throw new NotFoundException('Araç bulunamadı');
    }

    // Tüm iş emirlerini getir
    const workOrders = await this.prisma.workOrder.findMany({
      where: { vehicleId, tenantId },
      orderBy: { acceptedAt: 'desc' },
      include: {
        // Teknisyen bilgisi
        technician: {
          select: {
            id: true,
            code: true,
            firstName: true,
            lastName: true,
            specialization: true,
          },
        },
        // İş emri kalemleri (işçilik ve parçalar)
        lines: {
          include: {
            product: {
              select: {
                id: true,
                stokKodu: true,
                stokAdi: true,
                marka: true,
              },
            },
          },
        },
        // Fatura bilgisi
        invoice: {
          select: {
            id: true,
            faturaNo: true,
            faturaTipi: true,
            tarih: true,
            genelToplam: true,
            durum: true,
          },
        },
      },
    });

    // İstatistikleri hesapla
    const stats = {
      totalWorkOrders: workOrders.length,
      completedWorkOrders: workOrders.filter(
        (wo) => wo.status === 'CLOSED',
      ).length,
      totalLaborHours: 0,
      totalPartsUsed: 0,
      totalSpent: 0,
      uniqueTechnicians: new Set<string>(),
    };

    // İşçilik ve parça detayları
    const laborOperations: any[] = [];
    const usedParts: any[] = [];

    for (const wo of workOrders) {
      // Toplam harcama
      stats.totalSpent += Number(wo.grandTotal);

      // Teknisyen takibi
      if (wo.technicianId) {
        stats.uniqueTechnicians.add(wo.technicianId);
      }

      for (const line of wo.lines) {
        if (line.lineType === 'LABOR') {
          stats.totalLaborHours += Number(line.laborHours || 0);
          laborOperations.push({
            workOrderId: wo.id,
            workOrderNo: wo.workOrderNo,
            date: wo.acceptedAt,
            description: line.description,
            laborHours: Number(line.laborHours),
            hourlyRate: Number(line.hourlyRate),
            total: Number(line.lineTotal),
            technician: wo.technician,
          });
        } else if (line.lineType === 'PART' && line.isUsed) {
          stats.totalPartsUsed += line.quantity;
          usedParts.push({
            workOrderId: wo.id,
            workOrderNo: wo.workOrderNo,
            date: line.usedAt || wo.acceptedAt,
            product: line.product,
            quantity: line.quantity,
            unitPrice: Number(line.unitPrice),
            total: Number(line.lineTotal),
          });
        }
      }
    }

    // Benzersiz teknisyenler
    const technicians = await this.prisma.technician.findMany({
      where: {
        id: { in: Array.from(stats.uniqueTechnicians) },
      },
      select: {
        id: true,
        code: true,
        firstName: true,
        lastName: true,
        specialization: true,
      },
    });

    // Faturalar
    const invoices = workOrders
      .filter((wo) => wo.invoice)
      .map((wo) => wo.invoice);

    return {
      vehicle,
      summary: {
        totalWorkOrders: stats.totalWorkOrders,
        completedWorkOrders: stats.completedWorkOrders,
        totalLaborHours: Math.round(stats.totalLaborHours * 100) / 100,
        totalPartsUsed: stats.totalPartsUsed,
        totalSpent: Math.round(stats.totalSpent * 100) / 100,
        uniqueTechniciansCount: stats.uniqueTechnicians.size,
      },
      workOrders: workOrders.map((wo) => ({
        id: wo.id,
        workOrderNo: wo.workOrderNo,
        status: wo.status,
        acceptedAt: wo.acceptedAt,
        closedAt: wo.closedAt,
        complaint: wo.complaint,
        findings: wo.findings,
        technician: wo.technician,
        laborTotal: Number(wo.laborTotal),
        partsTotal: Number(wo.partsTotal),
        grandTotal: Number(wo.grandTotal),
        invoiceNo: wo.invoice?.faturaNo,
      })),
      laborOperations,
      usedParts,
      technicians,
      invoices,
    };
  }

  // ============= PHASE 4: MAINTENANCE REMINDER =============

  /**
   * Bakım hatırlatmasını güncelle veya oluştur
   * KURAL: Her araç için sadece BİR aktif hatırlatma olabilir
   * Tetikleme: WorkOrder CLOSED durumuna geçtiğinde
   */
  async updateMaintenanceReminder(
    vehicleId: string,
    workOrderId: string,
    closedAt: Date,
    mileage?: number,
  ) {
    const tenantId = this.getTenantIdOrThrow();

    // Araç kontrolü
    const vehicle = await this.prisma.vehicle.findFirst({
      where: { id: vehicleId, tenantId },
    });
    if (!vehicle) {
      throw new NotFoundException('Araç bulunamadı');
    }

    // Sonraki hatırlatma tarihi = Kapatılma tarihi + 1 yıl
    const nextReminderDate = new Date(closedAt);
    nextReminderDate.setFullYear(nextReminderDate.getFullYear() + 1);

    // Mevcut hatırlatmayı bul
    const existingReminder = await this.prisma.vehicleMaintenanceReminder.findUnique({
      where: { vehicleId },
    });

    if (existingReminder) {
      // GÜNCELLE - Mevcut hatırlatmayı güncelle (ASLA yeni oluşturma)
      return this.prisma.vehicleMaintenanceReminder.update({
        where: { vehicleId },
        data: {
          lastServiceDate: closedAt,
          lastWorkOrderId: workOrderId,
          lastMileage: mileage ?? vehicle.mileage,
          nextReminderDate,
          reminderSent: false, // Yeni servis yapıldı, hatırlatma sıfırla
          reminderSentAt: null,
        },
      });
    } else {
      // OLUŞTUR - İlk kez hatırlatma oluştur
      // Staging'de tenantId opsiyonel
      const reminderData: any = {
        vehicleId,
        lastServiceDate: closedAt,
        lastWorkOrderId: workOrderId,
        lastMileage: mileage ?? vehicle.mileage,
        nextReminderDate,
        reminderSent: false,
      };
      if (tenantId) {
        reminderData.tenantId = tenantId;
      }

      return this.prisma.vehicleMaintenanceReminder.create({
        data: reminderData,
      });
    }
  }

  /**
   * Yaklaşan bakım hatırlatmalarını getir
   * Önümüzdeki X gün içinde bakıma gelecek araçlar
   */
  async getUpcomingReminders(daysAhead = 30) {
    const tenantId = this.getTenantIdOrThrow();

    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    // Staging'de tenantId opsiyonel
    const where: any = {
      nextReminderDate: {
        gte: now,
        lte: futureDate,
      },
      reminderSent: false,
    };
    if (tenantId) {
      where.tenantId = tenantId;
    }

    const reminders = await this.prisma.vehicleMaintenanceReminder.findMany({
      where,
      orderBy: { nextReminderDate: 'asc' },
      include: {
        vehicle: {
          include: {
            customer: {
              select: {
                id: true,
                cariKodu: true,
                unvan: true,
                telefon: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return reminders.map((r) => ({
      id: r.id,
      vehicle: {
        id: r.vehicle.id,
        plateNumber: r.vehicle.plateNumber,
        brand: r.vehicle.brand,
        model: r.vehicle.model,
        year: r.vehicle.year,
        mileage: r.vehicle.mileage,
      },
      customer: r.vehicle.customer,
      lastServiceDate: r.lastServiceDate,
      lastMileage: r.lastMileage,
      nextReminderDate: r.nextReminderDate,
      daysUntilReminder: Math.ceil(
        (r.nextReminderDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
      ),
    }));
  }

  /**
   * Geçmiş (geçen) bakım hatırlatmalarını getir
   * Tarihi geçmiş ve gelmemiş araçlar
   */
  async getOverdueReminders() {
    const tenantId = this.getTenantIdOrThrow();

    const now = new Date();

    // Staging'de tenantId opsiyonel
    const where: any = {
      nextReminderDate: {
        lt: now,
      },
    };
    if (tenantId) {
      where.tenantId = tenantId;
    }

    const reminders = await this.prisma.vehicleMaintenanceReminder.findMany({
      where,
      orderBy: { nextReminderDate: 'asc' },
      include: {
        vehicle: {
          include: {
            customer: {
              select: {
                id: true,
                cariKodu: true,
                unvan: true,
                telefon: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return reminders.map((r) => ({
      id: r.id,
      vehicle: {
        id: r.vehicle.id,
        plateNumber: r.vehicle.plateNumber,
        brand: r.vehicle.brand,
        model: r.vehicle.model,
        year: r.vehicle.year,
        mileage: r.vehicle.mileage,
      },
      customer: r.vehicle.customer,
      lastServiceDate: r.lastServiceDate,
      lastMileage: r.lastMileage,
      nextReminderDate: r.nextReminderDate,
      daysOverdue: Math.ceil(
        (now.getTime() - r.nextReminderDate.getTime()) / (1000 * 60 * 60 * 24),
      ),
      reminderSent: r.reminderSent,
      reminderSentAt: r.reminderSentAt,
    }));
  }

  /**
   * Hatırlatma gönderildi olarak işaretle
   */
  async markReminderAsSent(reminderId: string) {
    const tenantId = this.getTenantIdOrThrow();

    // Staging'de tenantId opsiyonel
    const where: any = { id: reminderId };
    if (tenantId) {
      where.tenantId = tenantId;
    }

    const reminder = await this.prisma.vehicleMaintenanceReminder.findFirst({
      where,
    });

    if (!reminder) {
      throw new NotFoundException('Hatırlatma bulunamadı');
    }

    return this.prisma.vehicleMaintenanceReminder.update({
      where: { id: reminderId },
      data: {
        reminderSent: true,
        reminderSentAt: new Date(),
      },
    });
  }

  /**
   * Tüm bakım hatırlatmalarını listele
   */
  async getAllReminders(
    page = 1,
    limit = 50,
    filter?: 'upcoming' | 'overdue' | 'sent' | 'all',
  ) {
    const tenantId = this.getTenantIdOrThrow();
    const skip = (page - 1) * limit;
    const now = new Date();

    // Staging'de tenantId opsiyonel
    const where: Prisma.VehicleMaintenanceReminderWhereInput = {} as any;
    if (tenantId) {
      where.tenantId = tenantId;
    }

    switch (filter) {
      case 'upcoming':
        where.nextReminderDate = { gte: now };
        where.reminderSent = false;
        break;
      case 'overdue':
        where.nextReminderDate = { lt: now };
        break;
      case 'sent':
        where.reminderSent = true;
        break;
      // 'all' - no additional filter
    }

    const [data, total] = await Promise.all([
      this.prisma.vehicleMaintenanceReminder.findMany({
        where,
        skip,
        take: limit,
        orderBy: { nextReminderDate: 'asc' },
        include: {
          vehicle: {
            include: {
              customer: {
                select: {
                  id: true,
                  cariKodu: true,
                  unvan: true,
                  telefon: true,
                  email: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.vehicleMaintenanceReminder.count({ where }),
    ]);

    return {
      data: data.map((r) => ({
        id: r.id,
        vehicle: {
          id: r.vehicle.id,
          plateNumber: r.vehicle.plateNumber,
          brand: r.vehicle.brand,
          model: r.vehicle.model,
          year: r.vehicle.year,
        },
        customer: r.vehicle.customer,
        lastServiceDate: r.lastServiceDate,
        lastMileage: r.lastMileage,
        nextReminderDate: r.nextReminderDate,
        reminderSent: r.reminderSent,
        reminderSentAt: r.reminderSentAt,
        isOverdue: r.nextReminderDate < now,
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

