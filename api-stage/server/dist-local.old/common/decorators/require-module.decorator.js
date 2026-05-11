"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: Object.getOwnPropertyDescriptor(all, name).get
    });
}
_export(exports, {
    get MODULE_KEY () {
        return MODULE_KEY;
    },
    get RequireModule () {
        return RequireModule;
    }
});
const _common = require("@nestjs/common");
const MODULE_KEY = 'module';
const RequireModule = (moduleSlug)=>(0, _common.SetMetadata)(MODULE_KEY, moduleSlug);

//# sourceMappingURL=require-module.decorator.js.map