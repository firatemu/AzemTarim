"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
_export_star(require("./create-work-order.dto"), exports);
_export_star(require("./update-work-order.dto"), exports);
_export_star(require("./change-status-work-order.dto"), exports);
_export_star(require("./change-vehicle-workflow.dto"), exports);
_export_star(require("./send-for-approval.dto"), exports);
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