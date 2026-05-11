"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "AuthService", {
    enumerable: true,
    get: function() {
        return AuthService;
    }
});
const _tenantresolverservice = require("../../common/services/tenant-resolver.service");
const _common = require("@nestjs/common");
const _jwt = require("@nestjs/jwt");
const _prismaservice = require("../../common/prisma.service");
const _emailservice = require("../../common/services/email.service");
const _redisservice = require("../../common/services/redis.service");
const _licenseservice = require("../../common/services/license.service");
const _bcrypt = /*#__PURE__*/ _interop_require_wildcard(require("bcrypt"));
const _client = require("@prisma/client");
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
let AuthService = class AuthService {
    async register(dto) {
        // Username yoksa email'den oluştur
        const username = dto.username || dto.email.split('@')[0];
        // FullName yoksa firstName ve lastName'den oluştur
        const fullName = dto.fullName || `${dto.firstName} ${dto.lastName}`;
        // Kullanıcı kontrolü
        const existingUser = await this.prisma.user.findFirst({
            where: {
                OR: [
                    {
                        email: dto.email
                    },
                    ...dto.username ? [
                        {
                            username: dto.username
                        }
                    ] : []
                ]
            }
        });
        if (existingUser) {
            throw new _common.ConflictException('Email veya kullanıcı adı zaten kullanılıyor');
        }
        // Şifreyi hashle
        const hashedPassword = await _bcrypt.hash(dto.password, 10);
        // Tenant oluştur (eğer companyName varsa)
        let tenantId;
        if (dto.companyName) {
            // Plan slug'ını al (varsayılan olarak 'trial' kullan, eğer belirtilmediyse)
            const planSlug = dto.planSlug || 'trial';
            const plan = await this.prisma.plan.findFirst({
                where: {
                    slug: planSlug
                }
            });
            if (!plan) {
                throw new _common.ConflictException(`Plan 'planSlug' not found`);
            }
            // Plan ücretsiz (trial) mi kontrol et
            const isTrialPlan = planSlug === 'trial' || Number(plan.price) === 0;
            // Tenant status belirleme:
            // - Deneme paketi (trial) ise → PENDING (admin onay bekliyor)
            // - Ücretli plan ise → PENDING (ödeme bekliyor, ödeme başarılı olursa ACTIVE olacak)
            const tenantStatus = _client.TenantStatus.PENDING;
            // Subscription status belirleme:
            // - Deneme paketi ise → PENDING (admin onay bekliyor)
            // - Ücretli plan ise → PENDING (ödeme bekliyor)
            const subscriptionStatus = _client.SubscriptionStatus.PENDING;
            const tenant = await this.prisma.tenant.create({
                data: {
                    name: dto.companyName,
                    status: tenantStatus,
                    subscription: {
                        create: {
                            planId: plan.id,
                            status: subscriptionStatus,
                            startDate: new Date(),
                            trialEndsAt: isTrialPlan ? new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 gün deneme
                             : null,
                            endDate: isTrialPlan ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 gün
                             : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                            autoRenew: !isTrialPlan
                        }
                    }
                }
            });
            tenantId = tenant.id;
        }
        // Kullanıcı oluştur
        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                username,
                password: hashedPassword,
                fullName,
                firstName: dto.firstName,
                lastName: dto.lastName,
                phone: dto.phone,
                tenantId,
                role: dto.role || (tenantId ? 'TENANT_ADMIN' : 'USER')
            }
        });
        // Tenant oluşturulduysa ama henüz aktif değilse token verme
        // (Kullanıcı ödeme yapmalı veya admin onayı beklemeli)
        if (tenantId) {
            const tenant = await this.prisma.tenant.findUnique({
                where: {
                    id: tenantId
                },
                include: {
                    subscription: true
                }
            });
            if (tenant && tenant.status === _client.TenantStatus.PENDING) {
                // Hoş geldiniz maili gönder (asenkron - hata olsa bile register devam eder)
                console.log(`📧 [AuthService] Hoş geldiniz maili gönderiliyor: ${user.email}`);
                this.emailService.sendWelcomeEmail(user.email, dto.firstName, dto.lastName).then(()=>{
                    console.log(`✅ [AuthService] Hoş geldiniz maili gönderildi: ${user.email}`);
                }).catch((error)=>{
                    console.error(`❌ [AuthService] Hoş geldiniz maili gönderilemedi: ${user.email} - Hata: ${error.message}`);
                });
                // PENDING statusunda token verme, sadece kullanıcı bilgisini döndür
                return {
                    user: this.sanitizeUser(user),
                    requiresPayment: !(dto.planSlug === 'trial' || !dto.planSlug),
                    requiresApproval: dto.planSlug === 'trial' || !dto.planSlug,
                    message: tenant.subscription?.status === _client.SubscriptionStatus.PENDING ? dto.planSlug === 'trial' || !dto.planSlug ? 'Deneme paketiniz admin onayı bekliyor. Onaylandıktan sonra giriş yapabileceksiniz.' : 'Ödeme işlemini tamamlamanız gerekiyor. Ödeme başarılı olduktan sonra giriş yapabileceksiniz.' : 'Hesabınız aktifleştiriliyor...'
                };
            }
        }
        // Token version'ı artır (yeni kayıt = yeni token version)
        const newTokenVersion = (user.tokenVersion || 0) + 1;
        await this.prisma.user.update({
            where: {
                id: user.id
            },
            data: {
                tokenVersion: newTokenVersion
            }
        });
        const tokens = await this.generateTokens(user.id, user.email, user.role, user.tenantId || undefined, [], newTokenVersion);
        await this.updateRefreshToken(user.id, tokens.refreshToken);
        // Yeni token'ı Redis'e kaydet
        const redisKey = `session:${user.id}`;
        const tokenExpiry = 7 * 24 * 60 * 60; // 7 gün
        await this.redisService.set(redisKey, tokens.accessToken, tokenExpiry);
        // Hoş geldiniz maili gönder (asenkron - hata olsa bile register devam eder)
        console.log(`📧 [AuthService] Hoş geldiniz maili gönderiliyor: ${user.email}`);
        this.emailService.sendWelcomeEmail(user.email, dto.firstName, dto.lastName).then(()=>{
            console.log(`✅ [AuthService] Hoş geldiniz maili gönderildi: ${user.email}`);
        }).catch((error)=>{
            console.error(`❌ [AuthService] Hoş geldiniz maili gönderilemedi: ${user.email} - Hata: ${error.message}`);
        });
        return {
            user: this.sanitizeUser(user),
            ...tokens
        };
    }
    async login(dto) {
        try {
            // Kullanıcıyı bul - sadece email ile giriş yapılabilir
            const user = await this.prisma.user.findFirst({
                where: {
                    email: dto.username
                },
                include: {
                    tenant: {
                        include: {
                            subscription: true
                        }
                    }
                }
            });
            if (!user) {
                throw new _common.UnauthorizedException('Email veya şifre hatalı');
            }
            // Şifre kontrolü
            const passwordMatch = await _bcrypt.compare(dto.password, user.password);
            if (!passwordMatch) {
                throw new _common.UnauthorizedException('Kullanıcı adı veya şifre hatalı');
            }
            if (!user.isActive) {
                throw new _common.UnauthorizedException('Hesabınız aktif değil');
            }
            // Ana paket lisansı kontrolü (SUPER_ADMIN hariç)
            const isSuperAdmin = user.role === 'SUPER_ADMIN' || user.role === 'TENANT_ADMIN';
            if (!isSuperAdmin && user.tenantId) {
                const hasBaseLicense = await this.licenseService.hasBasePlanLicense(user.id);
                if (!hasBaseLicense) {
                    throw new _common.UnauthorizedException('Ana paket lisansınız bulunmuyor. Lütfen yöneticinizle iletişime geçin.');
                }
            }
            // SUPER_ADMIN ve TENANT_ADMIN kullanıcıları için tenant kontrolü yapma
            const isAdminUser = user.role === 'SUPER_ADMIN' || user.role === 'TENANT_ADMIN';
            // Tenant ve abonelik kontrolü - sadece normal kullanıcılar için
            if (!isAdminUser && user.tenantId && user.tenant) {
                // PENDING statusunda giriş yapılamaz
                if (user.tenant.status === _client.TenantStatus.PENDING) {
                    const subscription = user.tenant.subscription;
                    if (subscription?.status === _client.SubscriptionStatus.PENDING) {
                        // Deneme paketi mi kontrol et
                        const plan = await this.prisma.plan.findUnique({
                            where: {
                                id: subscription.planId
                            }
                        });
                        const isTrialPlan = plan && (plan.slug === 'trial' || Number(plan.price) === 0);
                        throw new _common.UnauthorizedException(isTrialPlan ? 'Deneme paketiniz henüz admin onayı bekliyor. Lütfen daha sonra tekrar deneyin.' : 'Ödeme işleminiz henüz tamamlanmadı. Lütfen ödeme işlemini tamamlayın veya daha sonra tekrar deneyin.');
                    }
                }
                if (user.tenant.status !== 'ACTIVE' && user.tenant.status !== 'TRIAL') {
                    throw new _common.UnauthorizedException('Tenant aktif değil');
                }
                if (user.tenant.subscription) {
                    const subscription = user.tenant.subscription;
                    const now = new Date();
                    // İptal edilmiş abonelik kontrolü
                    if (subscription.status === _client.SubscriptionStatus.CANCELED) {
                        throw new _common.UnauthorizedException('Aboneliğiniz iptal edilmiştir. Sisteme giriş yapabilmek için aboneliğinizin aktif olması gerekmektedir.');
                    }
                    if (subscription.status !== 'ACTIVE' && subscription.status !== 'TRIAL') {
                        throw new _common.UnauthorizedException('Abonelik aktif değil');
                    }
                    if (subscription.endDate < now) {
                        throw new _common.UnauthorizedException('Abonelik süresi dolmuş');
                    }
                }
            }
            const currentTokenVersion = user.tokenVersion || 0;
            const tokens = await this.generateTokens(user.id, user.email, user.role, user.tenantId || undefined, [], currentTokenVersion);
            await this.updateRefreshToken(user.id, tokens.refreshToken);
            const redisKey = `session:${user.id}`;
            const tokenExpiry = 7 * 24 * 60 * 60; // 7 gün
            await this.redisService.set(redisKey, tokens.accessToken, tokenExpiry);
            await this.prisma.user.update({
                where: {
                    id: user.id
                },
                data: {
                    lastLoginAt: new Date()
                }
            });
            return {
                user: this.sanitizeUser(user),
                ...tokens
            };
        } catch (error) {
            console.error(`[AUTH-LOGIN] Giriş hatası:`, error);
            throw error;
        }
    }
    async refreshTokens(userId, refreshToken) {
        const user = await this.prisma.user.findUnique({
            where: {
                id: userId
            }
        });
        if (!user || !user.refreshToken) {
            throw new _common.UnauthorizedException('Erişim reddedildi');
        }
        const refreshTokenMatches = await _bcrypt.compare(refreshToken, user.refreshToken);
        if (!refreshTokenMatches) {
            throw new _common.UnauthorizedException('Erişim reddedildi');
        }
        // Refresh token sırasında token version kontrolü yap
        // Eğer token version değiştiyse, refresh token geçersizdir
        const currentTokenVersion = user.tokenVersion || 0;
        const tokens = await this.generateTokens(user.id, user.email, user.role, user.tenantId || undefined, [], currentTokenVersion);
        await this.updateRefreshToken(user.id, tokens.refreshToken);
        // Redis'te token'ı güncelle
        const redisKey = `session:${user.id}`;
        const tokenExpiry = 7 * 24 * 60 * 60; // 7 gün
        await this.redisService.set(redisKey, tokens.accessToken, tokenExpiry);
        return tokens;
    }
    async logout(userId) {
        // Token version'ı artır (logout = token geçersiz)
        await this.prisma.user.update({
            where: {
                id: userId
            },
            data: {
                refreshToken: null,
                tokenVersion: {
                    increment: 1
                }
            }
        });
        // Redis'ten token'ı sil
        const redisKey = `session:${userId}`;
        await this.redisService.del(redisKey);
    }
    async getProfile(userId) {
        const user = await this.prisma.user.findUnique({
            where: {
                id: userId
            }
        });
        if (!user) {
            throw new _common.UnauthorizedException('User not found');
        }
        return this.sanitizeUser(user);
    }
    async generateTokens(userId, email, role, tenantId, permissions = [], tokenVersion) {
        const user = await this.prisma.user.findUnique({
            where: {
                id: userId
            },
            select: {
                tokenVersion: true
            }
        });
        const payload = {
            sub: userId,
            email,
            role,
            tokenVersion: tokenVersion ?? user?.tokenVersion ?? 0,
            ...tenantId && {
                tenantId
            },
            ...permissions.length > 0 && {
                permissions
            },
            isSuperAdmin: role === 'SUPER_ADMIN'
        };
        const refreshPayload = {
            sub: userId,
            email,
            tokenVersion: payload.tokenVersion,
            ...tenantId && {
                tenantId
            }
        };
        // JWT süresi devre dışı: varsayılan 10 yıl (pratikte süresiz). .env ile JWT_ACCESS_EXPIRATION / JWT_REFRESH_EXPIRATION verilirse kullanılır.
        const accessExpiry = process.env.JWT_ACCESS_EXPIRATION ?? '10y';
        const refreshExpiry = process.env.JWT_REFRESH_EXPIRATION ?? '10y';
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload, {
                secret: process.env.JWT_ACCESS_SECRET || 'secret',
                expiresIn: accessExpiry
            }),
            this.jwtService.signAsync(refreshPayload, {
                secret: process.env.JWT_REFRESH_SECRET || 'refresh_secret',
                expiresIn: refreshExpiry
            })
        ]);
        return {
            accessToken,
            refreshToken
        };
    }
    async updateRefreshToken(userId, refreshToken) {
        const hashedRefreshToken = await _bcrypt.hash(refreshToken, 10);
        await this.prisma.user.update({
            where: {
                id: userId
            },
            data: {
                refreshToken: hashedRefreshToken
            }
        });
    }
    async changePassword(userId, currentPassword, newPassword) {
        const user = await this.prisma.user.findUnique({
            where: {
                id: userId
            }
        });
        if (!user) {
            throw new _common.UnauthorizedException('User not found');
        }
        // Mevcut şifreyi kontrol et
        const passwordMatch = await _bcrypt.compare(currentPassword, user.password);
        if (!passwordMatch) {
            throw new _common.UnauthorizedException('Mevcut şifre hatalı');
        }
        // Yeni şifreyi hashle
        const hashedPassword = await _bcrypt.hash(newPassword, 10);
        // Şifreyi güncelle
        await this.prisma.user.update({
            where: {
                id: userId
            },
            data: {
                password: hashedPassword
            }
        });
        return {
            message: 'Şifre başarıyla değiştirildi'
        };
    }
    sanitizeUser(user) {
        const { password, refreshToken, ...result } = user;
        return result;
    }
    constructor(prisma, jwtService, emailService, redisService, licenseService, tenantResolver){
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.emailService = emailService;
        this.redisService = redisService;
        this.licenseService = licenseService;
        this.tenantResolver = tenantResolver;
    }
};
AuthService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService,
        typeof _jwt.JwtService === "undefined" ? Object : _jwt.JwtService,
        typeof _emailservice.EmailService === "undefined" ? Object : _emailservice.EmailService,
        typeof _redisservice.RedisService === "undefined" ? Object : _redisservice.RedisService,
        typeof _licenseservice.LicenseService === "undefined" ? Object : _licenseservice.LicenseService,
        typeof _tenantresolverservice.TenantResolverService === "undefined" ? Object : _tenantresolverservice.TenantResolverService
    ])
], AuthService);

//# sourceMappingURL=auth.service.js.map