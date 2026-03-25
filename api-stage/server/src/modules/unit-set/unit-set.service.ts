import {
    Injectable,
    NotFoundException,
    ForbiddenException,
    BadRequestException,
    Logger,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { TenantResolverService } from '../../common/services/tenant-resolver.service';
import { CreateUnitSetDto, UpdateUnitSetDto } from './dto/unit-set.dto';

@Injectable()
export class UnitSetService {
    private readonly logger = new Logger(UnitSetService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly tenantResolver: TenantResolverService,
    ) { }

    // ─── Private helpers ─────────────────────────────────────────────────────

    private async assertNotSystemOwned(unitSetId: string): Promise<void> {
        const unitSet = await this.prisma.unitSet.findUnique({
            where: { id: unitSetId },
            select: { tenantId: true, isSystem: true },
        });

        if (!unitSet) {
            throw new NotFoundException('Birim seti bulunamadı.');
        }

        if (unitSet.tenantId === null || unitSet.isSystem === true) {
            throw new ForbiddenException(
                'Sistem birim setleri değiştirilemez ve silinemez.',
            );
        }
    }

    private mapUnitSetToDto(unitSet: any) {
        const units = (unitSet.units || []).map((u: any) => ({
            id: u.id,
            name: u.name,
            code: u.code ?? undefined,
            conversionRate: u.conversionRate != null ? Number(u.conversionRate) : 1,
            isBaseUnit: u.isBaseUnit ?? false,
            isDivisible: u.isDivisible ?? true,
            createdAt: u.createdAt,
            updatedAt: u.updatedAt,
        }));

        return {
            id: unitSet.id,
            tenantId: unitSet.tenantId,
            name: unitSet.name,
            description: unitSet.description ?? undefined,
            isSystem: unitSet.isSystem ?? false,
            units,
            createdAt: unitSet.createdAt,
            updatedAt: unitSet.updatedAt,
        };
    }

    // ─── Public CRUD ─────────────────────────────────────────────────────────

    async findAll() {
        const tenantId = await this.tenantResolver.resolveForQuery();

        const sets = await this.prisma.unitSet.findMany({
            where: {
                OR: [
                    { tenantId: null },          // Sistem setleri
                    { tenantId: tenantId ?? undefined }, // Tenant'a özel setler
                ],
            },
            include: {
                units: {
                    orderBy: [
                        { isBaseUnit: 'desc' },
                        { name: 'asc' },
                    ],
                },
            },
            orderBy: [
                { isSystem: 'desc' },
                { createdAt: 'asc' },
            ],
        });

        this.logger.log(`[findAll] ${sets.length} unit set(s) fetched | tenant:${tenantId}`);
        return sets.map((s) => this.mapUnitSetToDto(s));
    }

    async findOne(id: string) {
        const tenantId = await this.tenantResolver.resolveForQuery();

        const unitSet = await this.prisma.unitSet.findFirst({
            where: {
                id,
                OR: [
                    { tenantId: null },
                    { tenantId: tenantId ?? undefined },
                ],
            },
            include: {
                units: {
                    orderBy: [
                        { isBaseUnit: 'desc' },
                        { name: 'asc' },
                    ],
                },
            },
        });

        if (!unitSet) {
            throw new NotFoundException('Birim seti bulunamadı.');
        }

        return this.mapUnitSetToDto(unitSet);
    }

    async create(dto: CreateUnitSetDto) {
        const tenantId = await this.tenantResolver.resolveForCreate();
        if (!tenantId) {
            throw new NotFoundException('Tenant bulunamadı.');
        }

        const { units = [], ...rest } = dto;

        // Doğrulama: tam olarak bir ana birim olmalı
        const baseUnitCount = units.filter((u) => u.isBaseUnit === true).length;
        if (units.length > 0 && baseUnitCount !== 1) {
            throw new BadRequestException(
                'Tam olarak bir ana birim (isBaseUnit: true) tanımlanmalıdır.',
            );
        }

        const created = await this.prisma.$transaction(async (tx) => {
            return tx.unitSet.create({
                data: {
                    name: rest.name,
                    description: rest.description ?? null,
                    tenantId,
                    isSystem: false,
                    units: {
                        create: units.map((u) => ({
                            name: u.name,
                            code: u.code ?? null,
                            conversionRate: u.isBaseUnit ? 1 : (u.conversionRate ?? 1),
                            isBaseUnit: u.isBaseUnit ?? false,
                            isDivisible: u.isDivisible ?? true,
                        })),
                    },
                },
                include: {
                    units: {
                        orderBy: [
                            { isBaseUnit: 'desc' },
                            { name: 'asc' },
                        ],
                    },
                },
            });
        });

        this.logger.log(`[create] UnitSet created: ${created.id} | tenant:${tenantId}`);
        return this.mapUnitSetToDto(created);
    }

    async update(id: string, dto: UpdateUnitSetDto) {
        await this.assertNotSystemOwned(id);

        const { units, ...rest } = dto;

        // Doğrulama: birimler varsa tam olarak bir ana birim olmalı
        if (units && units.length > 0) {
            const baseUnitCount = units.filter((u) => u.isBaseUnit === true).length;
            if (baseUnitCount !== 1) {
                throw new BadRequestException(
                    'Tam olarak bir ana birim (isBaseUnit: true) tanımlanmalıdır.',
                );
            }
        }

        const updated = await this.prisma.$transaction(async (tx) => {
            // Mevcut birimleri sil ve yeniden oluştur (upsert yerine full replace)
            if (units !== undefined) {
                await tx.unit.deleteMany({ where: { unitSetId: id } });
            }

            return tx.unitSet.update({
                where: { id },
                data: {
                    ...(rest.name !== undefined && { name: rest.name }),
                    ...(rest.description !== undefined && { description: rest.description }),
                    ...(units !== undefined && {
                        units: {
                            create: units.map((u) => ({
                                name: u.name,
                                code: u.code ?? null,
                                conversionRate: u.isBaseUnit ? 1 : (u.conversionRate ?? 1),
                                isBaseUnit: u.isBaseUnit ?? false,
                                isDivisible: u.isDivisible ?? true,
                            })),
                        },
                    }),
                },
                include: {
                    units: {
                        orderBy: [
                            { isBaseUnit: 'desc' },
                            { name: 'asc' },
                        ],
                    },
                },
            });
        });

        this.logger.log(`[update] UnitSet updated: ${id}`);
        return this.mapUnitSetToDto(updated);
    }

    async remove(id: string) {
        await this.assertNotSystemOwned(id);

        // Ürünlere bağlı birim var mı kontrol et
        const unitSet = await this.prisma.unitSet.findUnique({
            where: { id },
            include: {
                units: {
                    include: {
                        products: { take: 1 },
                    },
                },
            },
        });

        if (!unitSet) {
            throw new NotFoundException('Birim seti bulunamadı.');
        }

        const hasLinkedProducts = unitSet.units.some((u) => u.products.length > 0);
        if (hasLinkedProducts) {
            throw new BadRequestException(
                'Bu birim setine bağlı ürünler var. Silmeden önce ürünlerin birim setini değiştirin.',
            );
        }

        await this.prisma.unitSet.delete({ where: { id } });

        this.logger.log(`[remove] UnitSet deleted: ${id}`);
        return { message: 'Birim seti başarıyla silindi.' };
    }

    // ─── Validation helper (used by other services) ───────────────────────────

    async validateQuantity(unitId: string, quantity: number): Promise<void> {
        const unit = await this.prisma.unit.findUnique({
            where: { id: unitId },
            select: { isDivisible: true, name: true },
        });

        if (!unit) {
            throw new NotFoundException(`Birim bulunamadı: ${unitId}`);
        }

        if (quantity <= 0) {
            throw new BadRequestException('Miktar sıfırdan büyük olmalıdır.');
        }

        if (!unit.isDivisible && !Number.isInteger(quantity)) {
            throw new BadRequestException(
                `"${unit.name}" birimi ondalıklı miktarı desteklememektedir. Lütfen tam sayı girin.`,
            );
        }
    }

    // ─── System defaults (used by seed/b2b-sync) ─────────────────────────────

    /**
     * Ensure default unit sets exist in the system.
     * Creates system-wide unit sets if they don't exist.
     * Used during tenant provisioning and B2B sync.
     */
    async ensureSystemDefaults(): Promise<void> {
        this.logger.log('[ensureSystemDefaults] Checking system default unit sets...');

        const existingCount = await this.prisma.unitSet.count({
            where: { tenantId: null, isSystem: true },
        });

        if (existingCount > 0) {
            this.logger.log(`[ensureSystemDefaults] Found ${existingCount} system unit sets, skipping creation.`);
            return;
        }

        this.logger.log('[ensureSystemDefaults] Creating default system unit sets...');

        await this.prisma.$transaction(async (tx) => {
            // 1. Adet (Quantity)
            await tx.unitSet.create({
                data: {
                    name: 'Adet',
                    description: 'Adet bazlı ürünler için',
                    tenantId: null,
                    isSystem: true,
                    units: {
                        create: [
                            { name: 'Adet', code: 'ADET', conversionRate: 1, isBaseUnit: true, isDivisible: false },
                            { name: 'Çift', code: 'CIFT', conversionRate: 2, isBaseUnit: false, isDivisible: false },
                            { name: 'Düzine', code: 'DUZINE', conversionRate: 12, isBaseUnit: false, isDivisible: false },
                        ],
                    },
                },
            });

            // 2. Ağırlık (Weight)
            await tx.unitSet.create({
                data: {
                    name: 'Ağırlık',
                    description: 'Ağırlık bazlı ürünler için',
                    tenantId: null,
                    isSystem: true,
                    units: {
                        create: [
                            { name: 'Kilogram', code: 'KG', conversionRate: 1, isBaseUnit: true, isDivisible: true },
                            { name: 'Gram', code: 'GR', conversionRate: 0.001, isBaseUnit: false, isDivisible: true },
                            { name: 'Ton', code: 'TON', conversionRate: 1000, isBaseUnit: false, isDivisible: true },
                        ],
                    },
                },
            });

            // 3. Hacim (Volume)
            await tx.unitSet.create({
                data: {
                    name: 'Hacim',
                    description: 'Hacim bazlı ürünler için',
                    tenantId: null,
                    isSystem: true,
                    units: {
                        create: [
                            { name: 'Litre', code: 'LT', conversionRate: 1, isBaseUnit: true, isDivisible: true },
                            { name: 'Mililitre', code: 'ML', conversionRate: 0.001, isBaseUnit: false, isDivisible: true },
                            { name: 'Galon', code: 'GL', conversionRate: 3.785, isBaseUnit: false, isDivisible: true },
                        ],
                    },
                },
            });

            // 4. Uzunluk (Length)
            await tx.unitSet.create({
                data: {
                    name: 'Uzunluk',
                    description: 'Uzunluk bazlı ürünler için',
                    tenantId: null,
                    isSystem: true,
                    units: {
                        create: [
                            { name: 'Metre', code: 'MT', conversionRate: 1, isBaseUnit: true, isDivisible: true },
                            { name: 'Santimetre', code: 'SM', conversionRate: 0.01, isBaseUnit: false, isDivisible: true },
                            { name: 'Desimetre', code: 'DM', conversionRate: 0.1, isBaseUnit: false, isDivisible: true },
                        ],
                    },
                },
            });

            // 5. Alan (Area)
            await tx.unitSet.create({
                data: {
                    name: 'Alan',
                    description: 'Alan bazlı ürünler için',
                    tenantId: null,
                    isSystem: true,
                    units: {
                        create: [
                            { name: 'Metrekare', code: 'M2', conversionRate: 1, isBaseUnit: true, isDivisible: true },
                            { name: 'Santimetrekare', code: 'CM2', conversionRate: 0.0001, isBaseUnit: false, isDivisible: true },
                        ],
                    },
                },
            });

            // 6. Ambalaj (Packaging)
            await tx.unitSet.create({
                data: {
                    name: 'Ambalaj',
                    description: 'Ambalaj bazlı ürünler için',
                    tenantId: null,
                    isSystem: true,
                    units: {
                        create: [
                            { name: 'Koli', code: 'KOLI', conversionRate: 1, isBaseUnit: true, isDivisible: false },
                            { name: 'Paket', code: 'PKT', conversionRate: 1, isBaseUnit: true, isDivisible: false },
                            { name: 'Kutu', code: 'KUTU', conversionRate: 1, isBaseUnit: true, isDivisible: false },
                        ],
                    },
                },
            });
        });

        this.logger.log('[ensureSystemDefaults] Created 6 default system unit sets');
    }

    /**
     * Get or create a default unit for B2B products.
     * Returns the base unit of the "Adet" (Quantity) unit set.
     */
    async getDefaultB2BUnit(): Promise<{ id: string; name: string; code: string }> {
        await this.ensureSystemDefaults();

        const adetSet = await this.prisma.unitSet.findFirst({
            where: { tenantId: null, isSystem: true, name: 'Adet' },
            include: {
                units: {
                    where: { isBaseUnit: true },
                    take: 1,
                },
            },
        });

        if (!adetSet || !adetSet.units[0]) {
            throw new Error('Failed to get default B2B unit');
        }

        return {
            id: adetSet.units[0].id,
            name: adetSet.units[0].name,
            code: adetSet.units[0].code ?? 'ADET',
        };
    }
}
