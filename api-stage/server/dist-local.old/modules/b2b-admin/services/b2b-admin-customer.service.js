"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "B2bAdminCustomerService", {
    enumerable: true,
    get: function() {
        return B2bAdminCustomerService;
    }
});
const _common = require("@nestjs/common");
const _crypto = require("crypto");
const _bcrypt = /*#__PURE__*/ _interop_require_wildcard(require("bcrypt"));
const _client = require("@prisma/client");
const _prismaservice = require("../../../common/prisma.service");
const _b2bfifoservice = require("../../b2b-portal/services/b2b-fifo.service");
const _b2badapterfactory = require("../../b2b-sync/adapters/b2b-adapter.factory");
const _b2bsyncservice = require("../../b2b-sync/b2b-sync.service");
function _getRequireWildcardCache(nodeInterop) {
    if (typeof WeakMap !== "function") return null;
    var cacheBabelInterop = new WeakMap();
    var cacheNodeInterop = new WeakMap();
    return (_getRequireWildcardCache = function(nodeInterop) {
        return nodeInterop ? cacheNodeInterop : cacheBabelInterop;
    })(nodeInterop);
}
function _interop_require_wildcard(obj, nodeInterop) {
    if (!nodeInterop && obj && obj.__esModule) {
        return obj;
    }
    if (obj === null || typeof obj !== "object" && typeof obj !== "function") {
        return {
            default: obj
        };
    }
    var cache = _getRequireWildcardCache(nodeInterop);
    if (cache && cache.has(obj)) {
        return cache.get(obj);
    }
    var newObj = {
        __proto__: null
    };
    var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
    for(var key in obj){
        if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
            var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
            if (desc && (desc.get || desc.set)) {
                Object.defineProperty(newObj, key, desc);
            } else {
                newObj[key] = obj[key];
            }
        }
    }
    newObj.default = obj;
    if (cache) {
        cache.set(obj, newObj);
    }
    return newObj;
}
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let B2bAdminCustomerService = class B2bAdminCustomerService {
    decimalString(v) {
        return v instanceof _client.Prisma.Decimal ? v.toString() : String(v);
    }
    paginate(data, total, page, limit) {
        return {
            data,
            total,
            page,
            limit
        };
    }
    async list(tenantId, q) {
        const page = q.page ?? 1;
        const limit = q.limit ?? 25;
        const skip = (page - 1) * limit;
        const sortBy = q.sortBy ?? 'createdAt';
        const sortOrder = q.sortOrder ?? 'desc';
        const where = {
            tenantId
        };
        if (q.search?.trim()) {
            const s = q.search.trim();
            where.OR = [
                {
                    name: {
                        contains: s,
                        mode: 'insensitive'
                    }
                },
                {
                    email: {
                        contains: s,
                        mode: 'insensitive'
                    }
                },
                {
                    erpAccountId: {
                        contains: s,
                        mode: 'insensitive'
                    }
                }
            ];
        }
        const overdueRowsPromise = this.prisma.b2BAccountMovement.findMany({
            where: {
                tenantId,
                isPastDue: true
            },
            select: {
                customerId: true
            },
            distinct: [
                'customerId'
            ]
        });
        if (sortBy === 'balance') {
            const search = q.search?.trim();
            const searchSql = search ? _client.Prisma.sql`AND (
            c.name ILIKE ${'%' + search + '%'}
            OR c.email ILIKE ${'%' + search + '%'}
            OR c."erpAccountId" ILIKE ${'%' + search + '%'}
          )` : _client.Prisma.empty;
            const countRows = await this.prisma.$queryRaw`
        SELECT COUNT(*)::bigint AS c
        FROM "b2b_customers" c
        WHERE c."tenantId" = ${tenantId}
        ${searchSql}
      `;
            const total = Number(countRows[0]?.c ?? 0);
            const idRows = sortOrder === 'asc' ? await this.prisma.$queryRaw`
              SELECT c.id
              FROM "b2b_customers" c
              LEFT JOIN LATERAL (
                SELECT m.balance
                FROM "b2b_account_movements" m
                WHERE m."customerId" = c.id AND m."tenantId" = ${tenantId}
                ORDER BY m.date DESC, m.id DESC
                LIMIT 1
              ) lm ON true
              WHERE c."tenantId" = ${tenantId}
              ${searchSql}
              ORDER BY lm.balance ASC NULLS LAST, c."createdAt" DESC
              LIMIT ${limit} OFFSET ${skip}
            ` : await this.prisma.$queryRaw`
              SELECT c.id
              FROM "b2b_customers" c
              LEFT JOIN LATERAL (
                SELECT m.balance
                FROM "b2b_account_movements" m
                WHERE m."customerId" = c.id AND m."tenantId" = ${tenantId}
                ORDER BY m.date DESC, m.id DESC
                LIMIT 1
              ) lm ON true
              WHERE c."tenantId" = ${tenantId}
              ${searchSql}
              ORDER BY lm.balance DESC NULLS LAST, c."createdAt" DESC
              LIMIT ${limit} OFFSET ${skip}
            `;
            const overdueRows = await overdueRowsPromise;
            const overdueSet = new Set(overdueRows.map((r)=>r.customerId));
            const ids = idRows.map((r)=>r.id);
            if (ids.length === 0) {
                return this.paginate([], total, page, limit);
            }
            const rows = await this.prisma.b2BCustomer.findMany({
                where: {
                    id: {
                        in: ids
                    },
                    tenantId
                },
                include: this.customerListInclude
            });
            const rowMap = new Map(rows.map((r)=>[
                    r.id,
                    r
                ]));
            const ordered = ids.map((id)=>rowMap.get(id)).filter((x)=>x != null);
            const data = ordered.map((c)=>({
                    id: c.id,
                    erpNum: c.erpNum,
                    erpAccountId: c.erpAccountId,
                    name: c.name,
                    email: c.email,
                    isActive: c.isActive,
                    vatDays: c.vatDays,
                    createdAt: c.createdAt,
                    customerClass: c.customerClass,
                    lastOrderAt: c.orders[0]?.createdAt ?? null,
                    lastMovementAt: c.accountMovements[0]?.date ?? null,
                    riskStatus: overdueSet.has(c.id) ? 'OVERDUE' : 'OK',
                    salespersonName: c.salespersonLinks[0]?.salesperson?.name ?? '—',
                    balance: c.accountMovements[0]?.balance ?? 0
                }));
            return this.paginate(data, total, page, limit);
        }
        let orderBy = {
            createdAt: sortOrder
        };
        if (sortBy === 'name') {
            orderBy = {
                name: sortOrder
            };
        }
        const [total, rows, overdueRows] = await Promise.all([
            this.prisma.b2BCustomer.count({
                where
            }),
            this.prisma.b2BCustomer.findMany({
                where,
                skip,
                take: limit,
                orderBy,
                include: this.customerListInclude
            }),
            overdueRowsPromise
        ]);
        const overdueSet = new Set(overdueRows.map((r)=>r.customerId));
        const data = rows.map((c)=>({
                id: c.id,
                erpNum: c.erpNum,
                erpAccountId: c.erpAccountId,
                name: c.name,
                email: c.email,
                isActive: c.isActive,
                vatDays: c.vatDays,
                createdAt: c.createdAt,
                customerClass: c.customerClass,
                lastOrderAt: c.orders[0]?.createdAt ?? null,
                lastMovementAt: c.accountMovements[0]?.date ?? null,
                riskStatus: overdueSet.has(c.id) ? 'OVERDUE' : 'OK',
                salespersonName: c.salespersonLinks[0]?.salesperson?.name ?? '—',
                balance: c.accountMovements[0]?.balance ?? 0
            }));
        return this.paginate(data, total, page, limit);
    }
    async getOne(tenantId, id) {
        const c = await this.prisma.b2BCustomer.findFirst({
            where: {
                id,
                tenantId
            },
            include: {
                customerClass: true,
                discountGroup: true,
                salespersonLinks: {
                    include: {
                        salesperson: true
                    }
                }
            }
        });
        if (!c) throw new _common.NotFoundException('B2B customer not found');
        const [orderCount, overdue] = await Promise.all([
            this.prisma.b2BOrder.count({
                where: {
                    tenantId,
                    customerId: id
                }
            }),
            this.prisma.b2BAccountMovement.findFirst({
                where: {
                    tenantId,
                    customerId: id,
                    isPastDue: true
                },
                select: {
                    id: true
                }
            })
        ]);
        let balanceFromMovements = null;
        const lastM = await this.prisma.b2BAccountMovement.findFirst({
            where: {
                tenantId,
                customerId: id
            },
            orderBy: {
                date: 'desc'
            }
        });
        if (lastM) balanceFromMovements = Number(lastM.balance);
        return {
            ...c,
            stats: {
                totalOrders: orderCount,
                balanceFromSyncedMovements: balanceFromMovements,
                hasPastDueMovements: !!overdue
            }
        };
    }
    /**
   * Assert that the tenant has not exceeded their B2B customer limit.
   * Counts only active (isActive=true) customers.
   *
   * @throws ConflictException if limit reached
   */ async assertLicenseCapacity(tenantId) {
        const license = await this.prisma.b2BLicense.findUnique({
            where: {
                tenantId
            }
        });
        // No license or unlimited license (-1 means unlimited)
        if (!license || license.maxB2BCustomers < 0) {
            return;
        }
        // Count only active customers
        const activeCount = await this.prisma.b2BCustomer.count({
            where: {
                tenantId,
                isActive: true
            }
        });
        if (activeCount >= license.maxB2BCustomers) {
            throw new _common.ConflictException(`B2B customer limit reached (${activeCount}/${license.maxB2BCustomers}). ` + `Please upgrade your license to add more customers.`);
        }
    }
    /**
   * Assert license capacity within a transaction.
   * This should be called inside $transaction to prevent race conditions.
   *
   * @throws ConflictException if limit reached
   */ async assertLicenseCapacityInTransaction(prisma, tenantId) {
        const license = await prisma.b2BLicense.findUnique({
            where: {
                tenantId
            }
        });
        // No license or unlimited license
        if (!license || license.maxB2BCustomers < 0) {
            return;
        }
        // Count only active customers
        const activeCount = await prisma.b2BCustomer.count({
            where: {
                tenantId,
                isActive: true
            }
        });
        if (activeCount >= license.maxB2BCustomers) {
            throw new _common.ConflictException(`B2B customer limit reached (${activeCount}/${license.maxB2BCustomers}). ` + `Please upgrade your license to add more customers.`);
        }
    }
    async create(tenantId, dto) {
        let accountName = dto.name;
        if (!accountName && dto.erpAccountId) {
            const account = await this.prisma.account.findFirst({
                where: {
                    id: dto.erpAccountId,
                    tenantId,
                    deletedAt: null
                }
            });
            if (account) accountName = account.title;
        }
        if (!accountName) {
            throw new _common.ConflictException('Müşteri ünvanı (name) veya geçerli bir ERP hesabı sağlanmalıdır.');
        }
        if (dto.customerClassId) {
            const cls = await this.prisma.b2BCustomerClass.findFirst({
                where: {
                    id: dto.customerClassId,
                    tenantId
                }
            });
            if (!cls) throw new _common.NotFoundException('Customer class not found');
        }
        const result = await this.prisma.$transaction(async (tx)=>{
            await this.assertLicenseCapacityInTransaction(tx, tenantId);
            const existingMail = await tx.b2BCustomer.findUnique({
                where: {
                    tenantId_email: {
                        tenantId,
                        email: dto.email
                    }
                }
            });
            if (existingMail) {
                throw new _common.ConflictException('Email already used for another B2B customer');
            }
            if (dto.erpAccountId) {
                const existingErp = await tx.b2BCustomer.findUnique({
                    where: {
                        tenantId_erpAccountId: {
                            tenantId,
                            erpAccountId: dto.erpAccountId
                        }
                    }
                });
                if (existingErp) {
                    throw new _common.ConflictException('This ERP account is already linked to B2B');
                }
            }
            const plain = dto.password ?? (0, _crypto.randomBytes)(12).toString('base64url').slice(0, 16);
            const passwordHash = await _bcrypt.hash(plain, 10);
            const created = await tx.b2BCustomer.create({
                data: {
                    tenantId,
                    erpAccountId: dto.erpAccountId || `MANUAL_${Date.now()}`,
                    erpNum: dto.erpNum ?? null,
                    name: accountName,
                    email: dto.email,
                    passwordHash,
                    customerClassId: dto.customerClassId ?? null,
                    vatDays: dto.vatDays ?? 30,
                    city: dto.city ?? null,
                    district: dto.district ?? null,
                    canUseVirtualPos: dto.canUseVirtualPos ?? true,
                    blockOrderOnRisk: dto.blockOrderOnRisk ?? false,
                    customerGrade: dto.customerGrade ?? null,
                    discountGroupId: dto.discountGroupId ?? null
                },
                include: {
                    customerClass: true
                }
            });
            if (dto.salespersonId) {
                await tx.b2BSalespersonCustomer.create({
                    data: {
                        customerId: created.id,
                        salespersonId: dto.salespersonId
                    }
                });
            }
            return {
                customer: created,
                temporaryPassword: dto.password ? undefined : plain
            };
        });
        return result;
    }
    async update(tenantId, id, dto) {
        const existing = await this.prisma.b2BCustomer.findFirst({
            where: {
                id,
                tenantId
            }
        });
        if (!existing) throw new _common.NotFoundException('B2B customer not found');
        if (dto.email && dto.email !== existing.email) {
            const clash = await this.prisma.b2BCustomer.findUnique({
                where: {
                    tenantId_email: {
                        tenantId,
                        email: dto.email
                    }
                }
            });
            if (clash) throw new _common.ConflictException('Email already in use');
        }
        if (dto.customerClassId) {
            const cls = await this.prisma.b2BCustomerClass.findFirst({
                where: {
                    id: dto.customerClassId,
                    tenantId
                }
            });
            if (!cls) throw new _common.NotFoundException('Customer class not found');
        }
        // Start a transaction for update (handling related tables)
        return this.prisma.$transaction(async (tx)=>{
            if (dto.salespersonId !== undefined) {
                await tx.b2BSalespersonCustomer.deleteMany({
                    where: {
                        customerId: id
                    }
                });
                if (dto.salespersonId) {
                    await tx.b2BSalespersonCustomer.create({
                        data: {
                            customerId: id,
                            salespersonId: dto.salespersonId
                        }
                    });
                }
            }
            return tx.b2BCustomer.update({
                where: {
                    id
                },
                data: {
                    ...dto.email != null && {
                        email: dto.email
                    },
                    ...dto.isActive != null && {
                        isActive: dto.isActive
                    },
                    ...dto.customerClassId !== undefined && {
                        customerClassId: dto.customerClassId
                    },
                    ...dto.vatDays != null && {
                        vatDays: dto.vatDays
                    },
                    ...dto.city !== undefined && {
                        city: dto.city
                    },
                    ...dto.district !== undefined && {
                        district: dto.district
                    },
                    ...dto.canUseVirtualPos != null && {
                        canUseVirtualPos: dto.canUseVirtualPos
                    },
                    ...dto.blockOrderOnRisk != null && {
                        blockOrderOnRisk: dto.blockOrderOnRisk
                    },
                    ...dto.customerGrade !== undefined && {
                        customerGrade: dto.customerGrade
                    },
                    ...dto.discountGroupId !== undefined && {
                        discountGroupId: dto.discountGroupId
                    }
                },
                include: {
                    customerClass: true
                }
            });
        });
    }
    async resetPassword(tenantId, id) {
        const existing = await this.prisma.b2BCustomer.findFirst({
            where: {
                id,
                tenantId
            }
        });
        if (!existing) throw new _common.NotFoundException('B2B customer not found');
        const plain = (0, _crypto.randomBytes)(12).toString('base64url').slice(0, 14);
        const passwordHash = await _bcrypt.hash(plain, 10);
        await this.prisma.b2BCustomer.update({
            where: {
                id
            },
            data: {
                passwordHash
            }
        });
        return {
            temporaryPassword: plain
        };
    }
    async listOrders(tenantId, customerId, page, limit) {
        const c = await this.prisma.b2BCustomer.findFirst({
            where: {
                id: customerId,
                tenantId
            }
        });
        if (!c) throw new _common.NotFoundException('B2B customer not found');
        const skip = (page - 1) * limit;
        const where = {
            tenantId,
            customerId
        };
        const [total, data] = await Promise.all([
            this.prisma.b2BOrder.count({
                where
            }),
            this.prisma.b2BOrder.findMany({
                where,
                skip,
                take: limit,
                orderBy: {
                    createdAt: 'desc'
                },
                include: {
                    deliveryMethod: {
                        select: {
                            name: true
                        }
                    }
                }
            })
        ]);
        return this.paginate(data, total, page, limit);
    }
    async getFifoPreview(tenantId, customerId, asOf) {
        const c = await this.prisma.b2BCustomer.findFirst({
            where: {
                id: customerId,
                tenantId
            },
            select: {
                id: true,
                name: true,
                email: true,
                vatDays: true
            }
        });
        if (!c) throw new _common.NotFoundException('B2B customer not found');
        const inputs = await this.prisma.b2BAccountMovement.findMany({
            where: {
                tenantId,
                customerId
            },
            orderBy: [
                {
                    date: 'asc'
                },
                {
                    id: 'asc'
                }
            ],
            select: {
                id: true,
                date: true,
                type: true,
                debit: true,
                credit: true
            }
        });
        const ref = asOf ?? new Date();
        const fifoResult = this.fifo.calculateFifo(inputs, c.vatDays ?? 30, ref);
        return {
            customer: c,
            asOf: ref.toISOString(),
            vatDays: c.vatDays ?? 30,
            summary: {
                totalDebit: fifoResult.summary.totalDebit.toString(),
                totalCredit: fifoResult.summary.totalCredit.toString(),
                balance: fifoResult.summary.balance.toString(),
                overdueAmount: fifoResult.summary.overdueAmount.toString(),
                oldestOverdueDate: fifoResult.summary.oldestOverdueDate?.toISOString() ?? null,
                pastDueMovementCount: fifoResult.movements.filter((m)=>m.isPastDue).length
            },
            movements: fifoResult.movements.map((m)=>({
                    id: m.id,
                    date: m.date.toISOString(),
                    type: m.type,
                    debit: this.decimalString(m.debit),
                    credit: this.decimalString(m.credit),
                    dueDate: m.dueDate?.toISOString() ?? null,
                    remainingInvoiceDebit: m.remainingInvoiceDebit != null ? m.remainingInvoiceDebit.toString() : null,
                    isPastDue: m.isPastDue
                }))
        };
    }
    async listMovements(tenantId, customerId, q) {
        const c = await this.prisma.b2BCustomer.findFirst({
            where: {
                id: customerId,
                tenantId
            }
        });
        if (!c) throw new _common.NotFoundException('B2B customer not found');
        const page = q.page ?? 1;
        const limit = q.limit ?? 25;
        const skip = (page - 1) * limit;
        const where = {
            tenantId,
            customerId
        };
        if (q.from || q.to) {
            where.date = {};
            if (q.from) where.date.gte = new Date(q.from);
            if (q.to) where.date.lte = new Date(q.to);
        }
        const [total, data] = await Promise.all([
            this.prisma.b2BAccountMovement.count({
                where
            }),
            this.prisma.b2BAccountMovement.findMany({
                where,
                skip,
                take: limit,
                orderBy: {
                    date: 'desc'
                }
            })
        ]);
        return this.paginate(data, total, page, limit);
    }
    async getRisk(tenantId, id) {
        const c = await this.prisma.b2BCustomer.findFirst({
            where: {
                id,
                tenantId
            }
        });
        if (!c) throw new _common.NotFoundException('B2B customer not found');
        const config = await this.prisma.b2BTenantConfig.findUnique({
            where: {
                tenantId
            }
        });
        if (!config) throw new _common.NotFoundException('B2B tenant config not found');
        const adapter = this.adapterFactory.create(config.erpAdapterType, tenantId);
        return adapter.getAccountRisk(c.erpAccountId);
    }
    async syncMovements(tenantId, id) {
        const c = await this.prisma.b2BCustomer.findFirst({
            where: {
                id,
                tenantId
            }
        });
        if (!c) throw new _common.NotFoundException('B2B customer not found');
        return this.b2bSync.manualTrigger(tenantId, _client.B2BSyncType.ACCOUNT_MOVEMENTS, {
            erpAccountId: c.erpAccountId
        });
    }
    /** Tüm cariler için ERP hareketlerini tek işte kuyruğa alır (bakiye tablosu güncellemesi). */ async queueSyncAllAccountMovements(tenantId) {
        await this.prisma.b2BTenantConfig.updateMany({
            where: {
                tenantId
            },
            data: {
                lastSyncRequestedAt: new Date()
            }
        });
        return this.b2bSync.enqueueSyncAllAccountMovements(tenantId);
    }
    async importFromErp(tenantId) {
        const config = await this.prisma.b2BTenantConfig.findUnique({
            where: {
                tenantId
            }
        });
        if (!config) throw new _common.NotFoundException('B2B tenant config not found');
        const adapter = this.adapterFactory.create(config.erpAdapterType, tenantId);
        // 1. ADIM: Önce satış elemanlarını aktar (plasiyer olarak)
        const salespersons = await adapter.getSalespersons();
        let salespersonsAdded = 0;
        let salespersonsSkipped = 0;
        const existingSalespersons = await this.prisma.b2BSalesperson.findMany({
            where: {
                tenantId
            },
            select: {
                email: true
            }
        });
        const existingSalespersonEmails = new Set(existingSalespersons.map((s)=>s.email));
        for (const sp of salespersons){
            const email = sp.email || `${sp.erpSalespersonId}@salesperson.b2b.local`;
            if (existingSalespersonEmails.has(email)) {
                salespersonsSkipped++;
                continue;
            }
            const plain = (0, _crypto.randomBytes)(12).toString('base64url').slice(0, 16);
            const passwordHash = await _bcrypt.hash(plain, 10);
            await this.prisma.b2BSalesperson.create({
                data: {
                    tenantId,
                    name: sp.name,
                    email,
                    passwordHash,
                    isActive: sp.isActive
                }
            });
            salespersonsAdded++;
        }
        // 2. ADIM: ERP salesperson ID -> B2B salesperson email map oluştur
        const erpSalespersonMap = new Map();
        for (const sp of salespersons){
            const email = sp.email || `${sp.erpSalespersonId}@salesperson.b2b.local`;
            erpSalespersonMap.set(sp.erpSalespersonId, email);
        }
        // B2B'deki plasiyerleri email -> ID map'e çevir
        const b2bSalespersons = await this.prisma.b2BSalesperson.findMany({
            where: {
                tenantId
            },
            select: {
                id: true,
                email: true
            }
        });
        const salespersonEmailToId = new Map(b2bSalespersons.map((s)=>[
                s.email,
                s.id
            ]));
        // 3. ADIM: Cari hesapları aktar (satış elemanı ataması ile)
        const accounts = await adapter.getAccounts(config.lastSyncedAt);
        // Tek seferde mevcut cari kodları çekelim
        const existingCustomers = await this.prisma.b2BCustomer.findMany({
            where: {
                tenantId,
                erpAccountId: {
                    in: accounts.map((a)=>a.erpAccountId)
                }
            },
            select: {
                erpAccountId: true
            }
        });
        const existingCodes = new Set(existingCustomers.map((c)=>c.erpAccountId));
        let added = 0;
        let skipped = 0;
        let assignedSalesperson = 0;
        // Uzun sürebilecek işlem için timeout artıralım (default 5sn yetmeyebilir)
        await this.prisma.$transaction(async (tx)=>{
            for (const acc of accounts){
                if (existingCodes.has(acc.erpAccountId)) {
                    skipped++;
                    continue;
                }
                // Lisans kapasitesi kontrolü
                await this.assertLicenseCapacityInTransaction(tx, tenantId);
                const email = acc.email || `${acc.erpAccountId}@b2b.local`;
                const emailCheck = await tx.b2BCustomer.findUnique({
                    where: {
                        tenantId_email: {
                            tenantId,
                            email
                        }
                    }
                });
                let safeEmail = email;
                if (emailCheck) {
                    safeEmail = `${acc.erpAccountId}_${Date.now()}@b2b.local`;
                }
                // Şifreleme (bcrypt) yavaştır, bu yüzden her kayıtta bekletir.
                // Ancak işlem bütünlüğü için burada kalmalı.
                const plain = (0, _crypto.randomBytes)(12).toString('base64url').slice(0, 16);
                const passwordHash = await _bcrypt.hash(plain, 10);
                // Satış elemanı ataması
                let salespersonId;
                if (acc.salespersonId) {
                    const salespersonEmail = erpSalespersonMap.get(acc.salespersonId);
                    if (salespersonEmail) {
                        salespersonId = salespersonEmailToId.get(salespersonEmail);
                    }
                }
                const customerData = {
                    tenantId,
                    erpNum: acc.erpNum,
                    erpAccountId: acc.erpAccountId,
                    name: acc.name,
                    email: safeEmail,
                    passwordHash,
                    vatDays: 30
                };
                // Eğer satış elemanı ataması varsa, link tablosuna ekle
                if (salespersonId) {
                    await tx.b2BCustomer.create({
                        data: {
                            ...customerData,
                            salespersonLinks: {
                                create: {
                                    salespersonId
                                }
                            }
                        }
                    });
                    assignedSalesperson++;
                } else {
                    await tx.b2BCustomer.create({
                        data: customerData
                    });
                }
                added++;
            }
        }, {
            timeout: 120000
        }); // 120 saniye timeout (artırıldı)
        return {
            success: true,
            message: `${added} cari hesap eklendi (${assignedSalesperson} satış elemanı ataması ile), ${skipped} kayıt atlandı. ${salespersonsAdded} plasiyer eklendi.`,
            added,
            skipped,
            salespersonsAdded,
            salespersonsSkipped,
            assignedSalesperson
        };
    }
    async syncExistingFromErp(tenantId) {
        const config = await this.prisma.b2BTenantConfig.findUnique({
            where: {
                tenantId
            }
        });
        if (!config) throw new _common.NotFoundException('B2B tenant config not found');
        const adapter = this.adapterFactory.create(config.erpAdapterType, tenantId);
        // Önce satış elemanlarını güncelle (yeni eklenenleri ekle)
        const salespersons = await adapter.getSalespersons();
        const existingSalespersons = await this.prisma.b2BSalesperson.findMany({
            where: {
                tenantId
            },
            select: {
                email: true
            }
        });
        const existingSalespersonEmails = new Set(existingSalespersons.map((s)=>s.email));
        for (const sp of salespersons){
            const email = sp.email || `${sp.erpSalespersonId}@salesperson.b2b.local`;
            if (existingSalespersonEmails.has(email)) continue;
            const plain = (0, _crypto.randomBytes)(12).toString('base64url').slice(0, 16);
            const passwordHash = await _bcrypt.hash(plain, 10);
            await this.prisma.b2BSalesperson.create({
                data: {
                    tenantId,
                    name: sp.name,
                    email,
                    passwordHash,
                    isActive: sp.isActive
                }
            });
        }
        // ERP salesperson ID -> B2B salesperson email map oluştur
        const erpSalespersonMap = new Map();
        for (const sp of salespersons){
            const email = sp.email || `${sp.erpSalespersonId}@salesperson.b2b.local`;
            erpSalespersonMap.set(sp.erpSalespersonId, email);
        }
        // B2B'deki plasiyerleri email -> ID map'e çevir
        const b2bSalespersons = await this.prisma.b2BSalesperson.findMany({
            where: {
                tenantId
            },
            select: {
                id: true,
                email: true
            }
        });
        const salespersonEmailToId = new Map(b2bSalespersons.map((s)=>[
                s.email,
                s.id
            ]));
        // Mevcut B2B müşterilerini al
        const existingCustomers = await this.prisma.b2BCustomer.findMany({
            where: {
                tenantId
            },
            select: {
                id: true,
                erpAccountId: true,
                erpNum: true,
                name: true,
                email: true
            }
        });
        if (existingCustomers.length === 0) {
            return {
                success: true,
                message: 'Güncellenecek B2B müşterisi bulunamadı.',
                updated: 0,
                notFound: 0
            };
        }
        // ERP'den tüm cari hesapları çek
        const accounts = await adapter.getAccounts(undefined); // undefined = tüm kayıtları çek
        // erpAccountId'leri map'leyelim
        const accountMap = new Map(accounts.map((a)=>[
                a.erpAccountId,
                a
            ]));
        let updated = 0;
        let notFound = 0;
        let assignedSalesperson = 0;
        for (const customer of existingCustomers){
            const account = accountMap.get(customer.erpAccountId);
            if (!account) {
                notFound++;
                continue;
            }
            // Sadece değişen alanları güncelle
            const updateData = {
                ...account.erpNum && account.erpNum !== customer.erpNum && {
                    erpNum: account.erpNum
                },
                ...account.name && account.name !== customer.name && {
                    name: account.name
                },
                ...account.email && account.email !== customer.email && {
                    email: account.email
                }
            };
            // Satış elemanı atamasını kontrol et ve güncelle
            if (account.salespersonId) {
                const salespersonEmail = erpSalespersonMap.get(account.salespersonId);
                if (salespersonEmail) {
                    const salespersonId = salespersonEmailToId.get(salespersonEmail);
                    if (salespersonId) {
                        // Mevcut atamayı kontrol et
                        const existingLink = await this.prisma.b2BSalespersonCustomer.findFirst({
                            where: {
                                customerId: customer.id
                            }
                        });
                        if (!existingLink || existingLink.salespersonId !== salespersonId) {
                            // Eski atamayı sil, yenisini ekle
                            await this.prisma.$transaction(async (tx)=>{
                                if (existingLink) {
                                    await tx.b2BSalespersonCustomer.delete({
                                        where: {
                                            id: existingLink.id
                                        }
                                    });
                                }
                                await tx.b2BSalespersonCustomer.create({
                                    data: {
                                        customerId: customer.id,
                                        salespersonId
                                    }
                                });
                            });
                            assignedSalesperson++;
                        }
                    }
                }
            }
            if (Object.keys(updateData).length > 0) {
                await this.prisma.b2BCustomer.update({
                    where: {
                        id: customer.id
                    },
                    data: updateData
                });
                updated++;
            }
        }
        return {
            success: true,
            message: `${updated} müşteri güncellendi, ${assignedSalesperson} satış elemanı atandı, ${notFound} müşteri ERP'de bulunamadı.`,
            updated,
            notFound,
            assignedSalesperson
        };
    }
    constructor(prisma, adapterFactory, b2bSync, fifo){
        this.prisma = prisma;
        this.adapterFactory = adapterFactory;
        this.b2bSync = b2bSync;
        this.fifo = fifo;
        this.customerListInclude = {
            customerClass: true,
            salespersonLinks: {
                include: {
                    salesperson: {
                        select: {
                            name: true
                        }
                    }
                },
                take: 1
            },
            accountMovements: {
                orderBy: [
                    {
                        date: 'desc'
                    },
                    {
                        id: 'desc'
                    }
                ],
                take: 1,
                select: {
                    balance: true,
                    date: true
                }
            },
            orders: {
                take: 1,
                orderBy: {
                    createdAt: 'desc'
                },
                select: {
                    createdAt: true
                }
            }
        };
    }
};
B2bAdminCustomerService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService,
        typeof _b2badapterfactory.B2BAdapterFactory === "undefined" ? Object : _b2badapterfactory.B2BAdapterFactory,
        typeof _b2bsyncservice.B2bSyncService === "undefined" ? Object : _b2bsyncservice.B2bSyncService,
        typeof _b2bfifoservice.B2BFifoService === "undefined" ? Object : _b2bfifoservice.B2BFifoService
    ])
], B2bAdminCustomerService);

//# sourceMappingURL=b2b-admin-customer.service.js.map