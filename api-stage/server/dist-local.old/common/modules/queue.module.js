"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "QueueModule", {
    enumerable: true,
    get: function() {
        return QueueModule;
    }
});
const _common = require("@nestjs/common");
const _bullmq = require("@nestjs/bullmq");
const _config = require("@nestjs/config");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
let QueueModule = class QueueModule {
};
QueueModule = _ts_decorate([
    (0, _common.Global)(),
    (0, _common.Module)({
        imports: [
            _bullmq.BullModule.forRootAsync({
                imports: [
                    _config.ConfigModule
                ],
                useFactory: async (configService)=>({
                        connection: {
                            url: configService.get('REDIS_URL'),
                            host: configService.get('REDIS_HOST') || 'redis',
                            port: configService.get('REDIS_PORT') || 6379
                        },
                        defaultJobOptions: {
                            attempts: 3,
                            backoff: {
                                type: 'exponential',
                                delay: 1000
                            },
                            removeOnComplete: true,
                            removeOnFail: 100
                        }
                    }),
                inject: [
                    _config.ConfigService
                ]
            }),
            // Register specific queues here
            _bullmq.BullModule.registerQueue({
                name: 'default'
            })
        ],
        exports: [
            _bullmq.BullModule
        ]
    })
], QueueModule);

//# sourceMappingURL=queue.module.js.map