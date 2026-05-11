"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "B2bNotificationsService", {
    enumerable: true,
    get: function() {
        return B2bNotificationsService;
    }
});
const _common = require("@nestjs/common");
const _prismaservice = require("../../../common/prisma.service");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let B2bNotificationsService = class B2bNotificationsService {
    async unreadCount(tenantId, customerId) {
        const count = await this.prisma.b2BNotification.count({
            where: {
                tenantId,
                customerId,
                isRead: false
            }
        });
        return {
            count
        };
    }
    async list(tenantId, customerId, page = 1, pageSize = 25) {
        const where = {
            tenantId,
            customerId
        };
        const [total, data] = await this.prisma.$transaction([
            this.prisma.b2BNotification.count({
                where
            }),
            this.prisma.b2BNotification.findMany({
                where,
                orderBy: [
                    {
                        isRead: 'asc'
                    },
                    {
                        createdAt: 'desc'
                    }
                ],
                skip: (page - 1) * pageSize,
                take: pageSize
            })
        ]);
        return {
            data,
            meta: {
                total,
                page,
                pageSize,
                pageCount: Math.ceil(total / pageSize)
            }
        };
    }
    async markRead(tenantId, customerId, notificationId) {
        const row = await this.prisma.b2BNotification.findFirst({
            where: {
                id: notificationId,
                tenantId,
                customerId
            }
        });
        if (!row) {
            throw new _common.NotFoundException('Bildirim bulunamadi');
        }
        return this.prisma.b2BNotification.update({
            where: {
                id: notificationId
            },
            data: {
                isRead: true
            }
        });
    }
    async markAllRead(tenantId, customerId) {
        await this.prisma.b2BNotification.updateMany({
            where: {
                tenantId,
                customerId,
                isRead: false
            },
            data: {
                isRead: true
            }
        });
        return {
            updated: true
        };
    }
    constructor(prisma){
        this.prisma = prisma;
    }
};
B2bNotificationsService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService
    ])
], B2bNotificationsService);

//# sourceMappingURL=b2b-notifications.service.js.map