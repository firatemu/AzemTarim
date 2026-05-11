"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "EventsModule", {
    enumerable: true,
    get: function() {
        return EventsModule;
    }
});
const _common = require("@nestjs/common");
const _bullmq = require("@nestjs/bullmq");
const _prismamodule = require("../prisma.module");
const _outboxrelayservice = require("./outbox-relay.service");
const _dlqworker = require("./dlq.worker");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
let EventsModule = class EventsModule {
};
EventsModule = _ts_decorate([
    (0, _common.Module)({
        imports: [
            _prismamodule.PrismaModule,
            _bullmq.BullModule.registerQueue({
                name: 'work-order-events',
                defaultJobOptions: {
                    attempts: 5,
                    backoff: {
                        type: 'exponential',
                        delay: 2000
                    },
                    removeOnComplete: {
                        count: 500,
                        age: 7 * 24 * 3600
                    },
                    removeOnFail: false
                }
            }, {
                name: 'accounting-events',
                defaultJobOptions: {
                    attempts: 5,
                    backoff: {
                        type: 'exponential',
                        delay: 2000
                    },
                    removeOnComplete: {
                        count: 200
                    },
                    removeOnFail: false
                }
            }, {
                name: 'dead-letter-queue',
                defaultJobOptions: {
                    removeOnComplete: false,
                    removeOnFail: false
                }
            })
        ],
        providers: [
            _outboxrelayservice.OutboxRelayService,
            _dlqworker.DlqWorker
        ],
        exports: [
            _bullmq.BullModule,
            _outboxrelayservice.OutboxRelayService
        ]
    })
], EventsModule);

//# sourceMappingURL=events.module.js.map