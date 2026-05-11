"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
_export_star(require("./create-account.dto"), exports);
_export_star(require("./update-account.dto"), exports);
_export_star(require("./debit-credit-report.dto"), exports);
function _export_star(from, to) {
    Object.keys(from).forEach(function(k) {
        if (k !== "default" && !Object.prototype.hasOwnProperty.call(to, k)) {
            Object.defineProperty(to, k, {
                enumerable: true,
                get: function() {
                    return from[k];
                }
            });
        }
    });
    return from;
}

//# sourceMappingURL=index.js.map