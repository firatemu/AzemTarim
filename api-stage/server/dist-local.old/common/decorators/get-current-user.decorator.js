"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "GetCurrentUser", {
    enumerable: true,
    get: function() {
        return GetCurrentUser;
    }
});
const _common = require("@nestjs/common");
const GetCurrentUser = (0, _common.createParamDecorator)((data, context)=>{
    const request = context.switchToHttp().getRequest();
    if (!data) return request.user;
    return request.user[data];
});

//# sourceMappingURL=get-current-user.decorator.js.map