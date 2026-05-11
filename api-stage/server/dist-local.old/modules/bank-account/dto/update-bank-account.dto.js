"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "UpdateBankAccountDto", {
    enumerable: true,
    get: function() {
        return UpdateBankAccountDto;
    }
});
const _swagger = require("@nestjs/swagger");
const _createbankaccountdto = require("./create-bank-account.dto");
let UpdateBankAccountDto = class UpdateBankAccountDto extends (0, _swagger.PartialType)((0, _swagger.OmitType)(_createbankaccountdto.CreateBankAccountDto, [
    'bankId'
])) {
};

//# sourceMappingURL=update-bank-account.dto.js.map