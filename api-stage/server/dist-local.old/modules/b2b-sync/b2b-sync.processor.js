"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "B2bSyncProcessor", {
    enumerable: true,
    get: function() {
        return B2bSyncProcessor;
    }
});
const _bullmq = require("@nestjs/bullmq");
const _common = require("@nestjs/common");
const _client = require("@prisma/client");
const _prismaservice = require("../../common/prisma.service");
const _b2badapterfactory = require("./adapters/b2b-adapter.factory");
const _b2bsyncservice = require("./b2b-sync.service");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let B2bSyncProcessor = class B2bSyncProcessor extends _bullmq.WorkerHost {
    onFailed(job, err) {
        this.logger.error(`Job failed name=${job?.name} id=${job?.id}: ${err.message}`, err.stack);
    }
    async process(job) {
        const started = Date.now();
        switch(job.name){
            case 'SYNC_FULL':
                await this.handleSyncProducts(job.data, true);
                await this.handleSyncPrices(job.data, true);
                break;
            case 'SYNC_PRODUCTS':
                await this.handleSyncProducts(job.data, false);
                break;
            case 'SYNC_PRICES':
                await this.handleSyncPrices(job.data, false);
                break;
            case 'SYNC_ALL_ACCOUNT_MOVEMENTS':
                await this.handleSyncAllAccountMovements(job.data);
                break;
            case 'SYNC_ACCOUNT_MOVEMENTS':
                await this.handleSyncMovements(job.data);
                break;
            case 'EXPORT_ORDER_TO_ERP':
                await this.handleExportOrder(job.data);
                break;
            default:
                this.logger.warn(`Unknown b2b-sync job: ${job.name}`);
        }
        this.logger.log(`Job ${job.name} done in ${Date.now() - started}ms`);
    }
    resolveAdapter(tenantId, type) {
        return this.adapterFactory.create(type, tenantId);
    }
    async handleSyncProducts(data, isFullSync = false) {
        const { tenantId, erpAdapterType } = data;
        const log = await this.prisma.b2BSyncLog.create({
            data: {
                tenantId,
                syncType: _client.B2BSyncType.PRODUCTS,
                status: _client.B2BSyncStatus.RUNNING,
                startedAt: new Date()
            }
        });
        try {
            const loop = await this.prisma.b2BSyncLoop.findUnique({
                where: {
                    tenantId_syncType: {
                        tenantId,
                        syncType: _client.B2BSyncType.PRODUCTS
                    }
                }
            });
            const lastSyncedAt = isFullSync ? null : loop?.lastRunAt ?? null;
            const adapter = this.resolveAdapter(tenantId, erpAdapterType);
            const products = await adapter.getProducts(lastSyncedAt);
            let added = 0;
            let updated = 0;
            await this.prisma.$transaction(async (tx)=>{
                for (const p of products){
                    const existing = await tx.b2BProduct.findUnique({
                        where: {
                            tenantId_stockCode: {
                                tenantId,
                                stockCode: p.stockCode
                            }
                        }
                    });
                    await tx.b2BProduct.upsert({
                        where: {
                            tenantId_stockCode: {
                                tenantId,
                                stockCode: p.stockCode
                            }
                        },
                        create: {
                            tenantId,
                            erpProductId: p.erpProductId,
                            stockCode: p.stockCode,
                            name: p.name,
                            description: p.description ?? null,
                            brand: p.brand ?? null,
                            category: p.category ?? null,
                            oemCode: p.oemCode ?? null,
                            supplierCode: p.supplierCode ?? null,
                            unit: p.unit ?? null,
                            erpListPrice: new _client.Prisma.Decimal(p.listPrice),
                            erpCreatedAt: p.erpCreatedAt ?? null,
                            erpUpdatedAt: p.erpUpdatedAt ?? null
                        },
                        update: {
                            erpProductId: p.erpProductId,
                            name: p.name,
                            description: p.description ?? null,
                            brand: p.brand ?? null,
                            category: p.category ?? null,
                            oemCode: p.oemCode ?? null,
                            supplierCode: p.supplierCode ?? null,
                            unit: p.unit ?? null,
                            erpCreatedAt: p.erpCreatedAt ?? null,
                            erpUpdatedAt: p.erpUpdatedAt ?? null
                        }
                    });
                    if (existing) updated += 1;
                    else added += 1;
                }
                await tx.b2BSyncLoop.upsert({
                    where: {
                        tenantId_syncType: {
                            tenantId,
                            syncType: _client.B2BSyncType.PRODUCTS
                        }
                    },
                    create: {
                        tenantId,
                        syncType: _client.B2BSyncType.PRODUCTS,
                        lastRunAt: new Date()
                    },
                    update: {
                        lastRunAt: new Date()
                    }
                });
                await tx.b2BSyncLog.update({
                    where: {
                        id: log.id
                    },
                    data: {
                        status: _client.B2BSyncStatus.SUCCESS,
                        finishedAt: new Date(),
                        recordsProcessed: products.length,
                        recordsAdded: added,
                        recordsUpdated: updated
                    }
                });
            });
        } catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            await this.prisma.b2BSyncLog.update({
                where: {
                    id: log.id
                },
                data: {
                    status: _client.B2BSyncStatus.FAILED,
                    finishedAt: new Date(),
                    errorMessage: msg
                }
            });
            throw e;
        }
    }
    async handleSyncPrices(data, isFullSync = false) {
        const { tenantId, erpAdapterType } = data;
        const log = await this.prisma.b2BSyncLog.create({
            data: {
                tenantId,
                syncType: _client.B2BSyncType.PRICES,
                status: _client.B2BSyncStatus.RUNNING,
                startedAt: new Date()
            }
        });
        try {
            const loop = await this.prisma.b2BSyncLoop.findUnique({
                where: {
                    tenantId_syncType: {
                        tenantId,
                        syncType: _client.B2BSyncType.PRICES
                    }
                }
            });
            const lastSyncedAt = isFullSync ? null : loop?.lastRunAt ?? null;
            const adapter = this.resolveAdapter(tenantId, erpAdapterType);
            const prices = await adapter.getPrices(lastSyncedAt);
            let updated = 0;
            await this.prisma.$transaction(async (tx)=>{
                for (const p of prices){
                    const result = await tx.b2BProduct.updateMany({
                        where: {
                            tenantId,
                            erpProductId: p.erpProductId
                        },
                        data: {
                            erpListPrice: new _client.Prisma.Decimal(p.listPrice),
                            erpUpdatedAt: new Date()
                        }
                    });
                    updated += result.count;
                }
                await tx.b2BSyncLoop.upsert({
                    where: {
                        tenantId_syncType: {
                            tenantId,
                            syncType: _client.B2BSyncType.PRICES
                        }
                    },
                    create: {
                        tenantId,
                        syncType: _client.B2BSyncType.PRICES,
                        lastRunAt: new Date()
                    },
                    update: {
                        lastRunAt: new Date()
                    }
                });
                await tx.b2BSyncLog.update({
                    where: {
                        id: log.id
                    },
                    data: {
                        status: _client.B2BSyncStatus.SUCCESS,
                        finishedAt: new Date(),
                        recordsProcessed: prices.length,
                        recordsUpdated: updated,
                        recordsAdded: 0
                    }
                });
            });
        } catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            await this.prisma.b2BSyncLog.update({
                where: {
                    id: log.id
                },
                data: {
                    status: _client.B2BSyncStatus.FAILED,
                    finishedAt: new Date(),
                    errorMessage: msg
                }
            });
            throw e;
        }
    }
    async handleSyncMovements(data) {
        const { tenantId, erpAdapterType, erpAccountId } = data;
        const customer = await this.prisma.b2BCustomer.findFirst({
            where: {
                tenantId,
                erpAccountId
            }
        });
        if (!customer) {
            throw new Error(`B2B customer not found for erpAccountId=${erpAccountId}`);
        }
        const log = await this.prisma.b2BSyncLog.create({
            data: {
                tenantId,
                syncType: _client.B2BSyncType.ACCOUNT_MOVEMENTS,
                status: _client.B2BSyncStatus.RUNNING,
                startedAt: new Date()
            }
        });
        try {
            const lastOk = await this.prisma.b2BSyncLog.findFirst({
                where: {
                    tenantId,
                    syncType: _client.B2BSyncType.ACCOUNT_MOVEMENTS,
                    status: _client.B2BSyncStatus.SUCCESS,
                    id: {
                        not: log.id
                    }
                },
                orderBy: {
                    finishedAt: 'desc'
                }
            });
            const lastSyncedAt = lastOk?.finishedAt ?? null;
            const adapter = this.resolveAdapter(tenantId, erpAdapterType);
            const movements = await adapter.getAccountMovements(erpAccountId, lastSyncedAt);
            let inserted = 0;
            await this.prisma.$transaction(async (tx)=>{
                for (const m of movements){
                    const exists = await tx.b2BAccountMovement.findUnique({
                        where: {
                            tenantId_erpMovementId: {
                                tenantId,
                                erpMovementId: m.erpMovementId
                            }
                        }
                    });
                    if (exists) continue;
                    const dueDate = customer.vatDays > 0 ? new Date(m.date.getTime() + customer.vatDays * 86400000) : null;
                    await tx.b2BAccountMovement.create({
                        data: {
                            tenantId,
                            erpMovementId: m.erpMovementId,
                            customerId: customer.id,
                            date: m.date,
                            type: m.type,
                            description: m.description,
                            debit: new _client.Prisma.Decimal(m.debit),
                            credit: new _client.Prisma.Decimal(m.credit),
                            balance: new _client.Prisma.Decimal(m.balance),
                            erpInvoiceNo: m.erpInvoiceNo ?? null,
                            dueDate,
                            isPastDue: dueDate != null && dueDate < new Date() && m.debit > m.credit
                        }
                    });
                    inserted += 1;
                }
                await tx.b2BSyncLog.update({
                    where: {
                        id: log.id
                    },
                    data: {
                        status: _client.B2BSyncStatus.SUCCESS,
                        finishedAt: new Date(),
                        recordsProcessed: movements.length,
                        recordsAdded: inserted,
                        recordsUpdated: 0
                    }
                });
            });
            await this.prisma.b2BSyncLoop.upsert({
                where: {
                    tenantId_syncType: {
                        tenantId,
                        syncType: _client.B2BSyncType.ACCOUNT_MOVEMENTS
                    }
                },
                create: {
                    tenantId,
                    syncType: _client.B2BSyncType.ACCOUNT_MOVEMENTS,
                    lastRunAt: new Date()
                },
                update: {
                    lastRunAt: new Date()
                }
            });
        } catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            await this.prisma.b2BSyncLog.update({
                where: {
                    id: log.id
                },
                data: {
                    status: _client.B2BSyncStatus.FAILED,
                    finishedAt: new Date(),
                    errorMessage: msg
                }
            });
            throw e;
        }
    }
    /** Tüm B2B müşterileri için ERP’den cari hareket çekimi (tek log kaydı). */ async handleSyncAllAccountMovements(data) {
        const { tenantId, erpAdapterType } = data;
        const log = await this.prisma.b2BSyncLog.create({
            data: {
                tenantId,
                syncType: _client.B2BSyncType.ACCOUNT_MOVEMENTS,
                status: _client.B2BSyncStatus.RUNNING,
                startedAt: new Date()
            }
        });
        try {
            const lastOk = await this.prisma.b2BSyncLog.findFirst({
                where: {
                    tenantId,
                    syncType: _client.B2BSyncType.ACCOUNT_MOVEMENTS,
                    status: _client.B2BSyncStatus.SUCCESS,
                    id: {
                        not: log.id
                    }
                },
                orderBy: {
                    finishedAt: 'desc'
                }
            });
            const lastSyncedAt = lastOk?.finishedAt ?? null;
            const customers = await this.prisma.b2BCustomer.findMany({
                where: {
                    tenantId
                },
                select: {
                    id: true,
                    erpAccountId: true,
                    vatDays: true
                }
            });
            const adapter = this.resolveAdapter(tenantId, erpAdapterType);
            let totalProcessed = 0;
            let totalInserted = 0;
            for (const customer of customers){
                const movements = await adapter.getAccountMovements(customer.erpAccountId, lastSyncedAt);
                totalProcessed += movements.length;
                let inserted = 0;
                await this.prisma.$transaction(async (tx)=>{
                    for (const m of movements){
                        const exists = await tx.b2BAccountMovement.findUnique({
                            where: {
                                tenantId_erpMovementId: {
                                    tenantId,
                                    erpMovementId: m.erpMovementId
                                }
                            }
                        });
                        if (exists) continue;
                        const dueDate = customer.vatDays > 0 ? new Date(m.date.getTime() + customer.vatDays * 86400000) : null;
                        await tx.b2BAccountMovement.create({
                            data: {
                                tenantId,
                                erpMovementId: m.erpMovementId,
                                customerId: customer.id,
                                date: m.date,
                                type: m.type,
                                description: m.description,
                                debit: new _client.Prisma.Decimal(m.debit),
                                credit: new _client.Prisma.Decimal(m.credit),
                                balance: new _client.Prisma.Decimal(m.balance),
                                erpInvoiceNo: m.erpInvoiceNo ?? null,
                                dueDate,
                                isPastDue: dueDate != null && dueDate < new Date() && Number(m.debit) > Number(m.credit)
                            }
                        });
                        inserted += 1;
                    }
                });
                totalInserted += inserted;
            }
            await this.prisma.b2BSyncLog.update({
                where: {
                    id: log.id
                },
                data: {
                    status: _client.B2BSyncStatus.SUCCESS,
                    finishedAt: new Date(),
                    recordsProcessed: totalProcessed,
                    recordsAdded: totalInserted,
                    recordsUpdated: 0
                }
            });
            await this.prisma.b2BSyncLoop.upsert({
                where: {
                    tenantId_syncType: {
                        tenantId,
                        syncType: _client.B2BSyncType.ACCOUNT_MOVEMENTS
                    }
                },
                create: {
                    tenantId,
                    syncType: _client.B2BSyncType.ACCOUNT_MOVEMENTS,
                    lastRunAt: new Date()
                },
                update: {
                    lastRunAt: new Date()
                }
            });
        } catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            await this.prisma.b2BSyncLog.update({
                where: {
                    id: log.id
                },
                data: {
                    status: _client.B2BSyncStatus.FAILED,
                    finishedAt: new Date(),
                    errorMessage: msg
                }
            });
            throw e;
        }
    }
    async handleExportOrder(data) {
        const { tenantId, erpAdapterType, orderId } = data;
        const order = await this.prisma.b2BOrder.findFirst({
            where: {
                id: orderId,
                tenantId
            },
            include: {
                items: {
                    include: {
                        product: {
                            select: {
                                erpProductId: true
                            }
                        }
                    }
                },
                customer: true
            }
        });
        if (!order) {
            throw new Error(`B2B order not found: ${orderId}`);
        }
        const dto = {
            orderNumber: order.orderNumber,
            erpAccountId: order.customer.erpAccountId,
            items: order.items.map((i)=>({
                    erpProductId: i.product.erpProductId,
                    quantity: i.quantity,
                    unitPrice: Number(i.listPrice)
                })),
            note: order.note ?? undefined,
            deliveryBranchId: order.deliveryBranchId ?? undefined
        };
        const adapter = this.resolveAdapter(tenantId, erpAdapterType);
        const { erpOrderId } = await adapter.pushOrder(dto);
        await this.prisma.b2BOrder.update({
            where: {
                id: order.id
            },
            data: {
                status: _client.B2BOrderStatus.EXPORTED_TO_ERP,
                erpOrderId
            }
        });
    }
    constructor(prisma, adapterFactory){
        super(), this.prisma = prisma, this.adapterFactory = adapterFactory, this.logger = new _common.Logger(B2bSyncProcessor.name);
    }
};
_ts_decorate([
    (0, _bullmq.OnWorkerEvent)('failed'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object,
        typeof Error === "undefined" ? Object : Error
    ]),
    _ts_metadata("design:returntype", void 0)
], B2bSyncProcessor.prototype, "onFailed", null);
B2bSyncProcessor = _ts_decorate([
    (0, _bullmq.Processor)(_b2bsyncservice.B2B_SYNC_QUEUE),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService,
        typeof _b2badapterfactory.B2BAdapterFactory === "undefined" ? Object : _b2badapterfactory.B2BAdapterFactory
    ])
], B2bSyncProcessor);

//# sourceMappingURL=b2b-sync.processor.js.map