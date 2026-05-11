"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "UpdateOrderDto", {
    enumerable: true,
    get: function() {
        return UpdateOrderDto;
    }
});
const _swagger = require("@nestjs/swagger");
const _createorderdto = require("./create-order.dto");
let UpdateOrderDto = class UpdateOrderDto extends (0, _swagger.PartialType)((0, _swagger.OmitType)(_createorderdto.CreateOrderDto, [
    'orderNo'
])) {
};

//# sourceMappingURL=update-order.dto.js.map