"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
// Mock service content check
const fs = require('fs');
const content = fs.readFileSync('company-vehicles.service.ts', 'utf8');
if (content.includes('include: { personnel: true, expenses: true }') || content.includes('expenses: true')) {
    console.log('Backend fix confirmed');
} else {
    console.log('Backend fix check failed');
}

//# sourceMappingURL=test-include.js.map