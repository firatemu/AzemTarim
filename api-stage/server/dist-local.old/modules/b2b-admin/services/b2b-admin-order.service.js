"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "B2bAdminOrderService", {
    enumerable: true,
    get: function() {
        return B2bAdminOrderService;
    }
});
const _common = require("@nestjs/common");
const _client = require("@prisma/client");
const _exceljs = /*#__PURE__*/ _interop_require_wildcard(require("exceljs"));
const _prismaservice = require("../../../common/prisma.service");
const _b2bsyncservice = require("../../b2b-sync/b2b-sync.service");
const _b2borderstatusutil = require("../b2b-order-status.util");
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
let B2bAdminOrderService = class B2bAdminOrderService {
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
        const where = {
            tenantId
        };
        if (q.status) where.status = q.status;
        if (q.customerId) where.customerId = q.customerId;
        if (q.salespersonId) where.salespersonId = q.salespersonId;
        if (q.from || q.to) {
            where.createdAt = {};
            if (q.from) where.createdAt.gte = new Date(q.from);
            if (q.to) where.createdAt.lte = new Date(q.to);
        }
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
                    customer: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    },
                    deliveryMethod: {
                        select: {
                            name: true
                        }
                    },
                    salesperson: {
                        select: {
                            id: true,
                            name: true
                        }
                    }
                }
            })
        ]);
        return this.paginate(data, total, page, limit);
    }
    async getOne(tenantId, id) {
        const order = await this.prisma.b2BOrder.findFirst({
            where: {
                id,
                tenantId
            },
            include: {
                items: {
                    include: {
                        product: true
                    }
                },
                customer: {
                    include: {
                        customerClass: true
                    }
                },
                deliveryMethod: true,
                salesperson: true
            }
        });
        if (!order) throw new _common.NotFoundException('Order not found');
        return order;
    }
    async approve(tenantId, id) {
        const order = await this.prisma.b2BOrder.findFirst({
            where: {
                id,
                tenantId
            }
        });
        if (!order) throw new _common.NotFoundException('Order not found');
        if (order.status === _client.B2BOrderStatus.PENDING) {
            await this.prisma.b2BOrder.update({
                where: {
                    id
                },
                data: {
                    status: _client.B2BOrderStatus.APPROVED
                }
            });
        } else if (order.status !== _client.B2BOrderStatus.APPROVED) {
            throw new _common.BadRequestException('Only PENDING or APPROVED orders can be exported');
        }
        return this.b2bSync.enqueueExportOrder(tenantId, id);
    }
    async reject(tenantId, id, reason) {
        const order = await this.prisma.b2BOrder.findFirst({
            where: {
                id,
                tenantId
            }
        });
        if (!order) throw new _common.NotFoundException('Order not found');
        if (order.status !== _client.B2BOrderStatus.PENDING) {
            throw new _common.BadRequestException('Only PENDING orders can be rejected');
        }
        const note = order.note ? `${order.note}\n[REJECT] ${reason}` : `[REJECT] ${reason}`;
        await this.prisma.b2BOrder.update({
            where: {
                id
            },
            data: {
                status: _client.B2BOrderStatus.REJECTED,
                note
            }
        });
        return {
            ok: true
        };
    }
    async patchStatus(tenantId, id, dto) {
        const order = await this.prisma.b2BOrder.findFirst({
            where: {
                id,
                tenantId
            }
        });
        if (!order) throw new _common.NotFoundException('Order not found');
        (0, _b2borderstatusutil.assertB2bOrderStatusTransition)(order.status, dto.status);
        return this.prisma.b2BOrder.update({
            where: {
                id
            },
            data: {
                status: dto.status
            }
        });
    }
    async exportExcel(tenantId, q) {
        const page = 1;
        const limit = 10_000;
        const { data } = await this.list(tenantId, {
            ...q,
            page,
            limit
        });
        const workbook = new _exceljs.Workbook();
        const sheet = workbook.addWorksheet('B2B Orders');
        sheet.columns = [
            {
                header: 'Order No',
                key: 'orderNumber',
                width: 18
            },
            {
                header: 'Customer',
                key: 'customer',
                width: 28
            },
            {
                header: 'Status',
                key: 'status',
                width: 14
            },
            {
                header: 'Created',
                key: 'createdAt',
                width: 22
            },
            {
                header: 'Total',
                key: 'total',
                width: 14
            },
            {
                header: 'Delivery',
                key: 'delivery',
                width: 20
            }
        ];
        for (const row of data){
            sheet.addRow({
                orderNumber: row.orderNumber,
                customer: row.customer?.name,
                status: row.status,
                createdAt: row.createdAt?.toISOString?.() ?? row.createdAt,
                total: Number(row.totalFinalPrice),
                delivery: row.deliveryMethod?.name
            });
        }
        return Buffer.from(await workbook.xlsx.writeBuffer());
    }
    constructor(prisma, b2bSync){
        this.prisma = prisma;
        this.b2bSync = b2bSync;
    }
};
B2bAdminOrderService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService,
        typeof _b2bsyncservice.B2bSyncService === "undefined" ? Object : _b2bsyncservice.B2bSyncService
    ])
], B2bAdminOrderService);

//# sourceMappingURL=b2b-admin-order.service.js.map