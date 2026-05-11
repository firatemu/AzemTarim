"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "NotificationProcessor", {
    enumerable: true,
    get: function() {
        return NotificationProcessor;
    }
});
const _bullmq = require("@nestjs/bullmq");
const _common = require("@nestjs/common");
const _baseprocessor = require("../../common/processors/base.processor");
const _tenantcontextservice = require("../../common/services/tenant-context.service");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let NotificationProcessor = class NotificationProcessor extends _baseprocessor.BaseProcessor {
    async handle(job) {
        const { action, payload } = job.data;
        // Here we can use Prisma or other services
        // The tenant context is already set by BaseProcessor
        switch(action){
            case 'SEND_EMAIL':
                this.logger.log(`Sending email to ${payload.to}`);
                break;
            case 'SEND_SMS':
                this.logger.log(`Sending SMS to ${payload.to}`);
                break;
        }
        return {
            sent: true
        };
    }
    constructor(tenantContext){
        super(tenantContext), this.logger = new _common.Logger(NotificationProcessor.name);
    }
};
NotificationProcessor = _ts_decorate([
    (0, _bullmq.Processor)('notifications'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _tenantcontextservice.TenantContextService === "undefined" ? Object : _tenantcontextservice.TenantContextService
    ])
], NotificationProcessor);

//# sourceMappingURL=notification.processor.js.map