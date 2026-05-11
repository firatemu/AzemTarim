"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "InvitationService", {
    enumerable: true,
    get: function() {
        return InvitationService;
    }
});
const _common = require("@nestjs/common");
const _client = require("@prisma/client");
const _crypto = /*#__PURE__*/ _interop_require_wildcard(require("crypto"));
const _prismaservice = require("../prisma.service");
const _emailservice = require("./email.service");
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
let InvitationService = class InvitationService {
    /**
   * Kullanıcı davet et
   */ async inviteUser(email, tenantId, invitedBy) {
        // Kullanıcı zaten tenant'a üye mi kontrol et
        const existingUser = await this.prisma.user.findFirst({
            where: {
                email,
                tenantId
            }
        });
        if (existingUser) {
            throw new _common.BadRequestException('Bu kullanıcı zaten tenant\'a üye');
        }
        // Aktif davet var mı kontrol et
        const existingInvitation = await this.prisma.invitation.findFirst({
            where: {
                email,
                tenantId,
                status: _client.InvitationStatus.PENDING,
                expiresAt: {
                    gt: new Date()
                }
            }
        });
        if (existingInvitation) {
            throw new _common.BadRequestException('Bu kullanıcı için zaten aktif bir davet var');
        }
        // Davet token'ı oluştur
        const token = _crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 gün geçerli
        // Davet oluştur
        const invitation = await this.prisma.invitation.create({
            data: {
                email,
                tenantId,
                invitedBy,
                token,
                expiresAt,
                status: _client.InvitationStatus.PENDING
            },
            include: {
                tenant: {
                    select: {
                        name: true
                    }
                }
            }
        });
        // Email gönder
        const inviteUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/invite/accept?token=${token}`;
        try {
            await this.emailService.sendInvitationEmail(email, invitation.tenant.name, inviteUrl);
        } catch (error) {
            console.error('Davet emaili gönderilemedi:', error);
        // Email gönderilemese bile davet oluşturuldu
        }
        return {
            invitation,
            message: 'Davet başarıyla gönderildi'
        };
    }
    /**
   * Daveti kabul et
   */ async acceptInvitation(token, password, firstName, lastName) {
        const invitation = await this.prisma.invitation.findUnique({
            where: {
                token
            },
            include: {
                tenant: true
            }
        });
        if (!invitation) {
            throw new _common.NotFoundException('Davet bulunamadı');
        }
        if (invitation.status !== _client.InvitationStatus.PENDING) {
            throw new _common.BadRequestException('Bu davet zaten kullanılmış veya iptal edilmiş');
        }
        if (invitation.expiresAt < new Date()) {
            await this.prisma.invitation.update({
                where: {
                    id: invitation.id
                },
                data: {
                    status: _client.InvitationStatus.EXPIRED
                }
            });
            throw new _common.BadRequestException('Davet süresi dolmuş');
        }
        // Kullanıcı zaten var mı kontrol et
        let user = await this.prisma.user.findFirst({
            where: {
                email: invitation.email,
                tenantId: invitation.tenantId
            }
        });
        if (user) {
            // Kullanıcı zaten varsa, tenant'a ekle
            if (user.tenantId !== invitation.tenantId) {
                await this.prisma.user.update({
                    where: {
                        id: user.id
                    },
                    data: {
                        tenantId: invitation.tenantId
                    }
                });
            }
        } else {
            // Yeni kullanıcı oluştur
            const username = invitation.email.split('@')[0];
            const fullName = firstName && lastName ? `${firstName} ${lastName}` : username;
            user = await this.prisma.user.create({
                data: {
                    email: invitation.email,
                    username,
                    password: password,
                    fullName,
                    firstName,
                    lastName,
                    tenantId: invitation.tenantId,
                    role: 'USER'
                }
            });
        }
        // Daveti kabul edildi olarak işaretle
        await this.prisma.invitation.update({
            where: {
                id: invitation.id
            },
            data: {
                status: _client.InvitationStatus.ACCEPTED,
                acceptedAt: new Date(),
                acceptedBy: user.id
            }
        });
        return {
            user,
            message: 'Davet başarıyla kabul edildi'
        };
    }
    /**
   * Daveti iptal et
   */ async cancelInvitation(invitationId) {
        await this.prisma.invitation.update({
            where: {
                id: invitationId
            },
            data: {
                status: _client.InvitationStatus.CANCELLED
            }
        });
    }
    /**
   * Tenant'ın davetlerini listele
   */ async getTenantInvitations(tenantId) {
        return await this.prisma.invitation.findMany({
            where: {
                tenantId
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    }
    constructor(prisma, emailService){
        this.prisma = prisma;
        this.emailService = emailService;
    }
};
InvitationService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService,
        typeof _emailservice.EmailService === "undefined" ? Object : _emailservice.EmailService
    ])
], InvitationService);

//# sourceMappingURL=invitation.service.js.map