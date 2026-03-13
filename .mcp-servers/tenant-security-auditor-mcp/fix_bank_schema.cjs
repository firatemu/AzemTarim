const fs = require('fs');
const path = require('path');

const schemaPath = "/home/azem/projects/otomuhasebe/api-stage/server/prisma/schema.prisma";
let content = fs.readFileSync(schemaPath, 'utf8');

const modelsToFix = ["BankAccount", "BankAccountMovement", "BankLoan", "BankLoanPlan"];

modelsToFix.forEach(modelName => {
    const modelRegex = new RegExp(`model ${modelName} \\{[\\s\\S]*?\\}`, 'g');
    content = content.replace(modelRegex, (match) => {
        let newMatch = match;

        // Add tenantId if missing
        if (!newMatch.includes('tenantId')) {
            newMatch = newMatch.replace(/\}$/, '  tenantId  String?\n}');
        }

        // Add index if missing
        if (!newMatch.includes('@@index([tenantId])')) {
            newMatch = newMatch.replace(/\}$/, '  @@index([tenantId])\n}');
        }

        // Add relation if missing (and tenantId exists)
        if (!newMatch.includes('tenant Tenant')) {
            // Find where to insert relation
            newMatch = newMatch.replace(/\}$/, `  tenant    Tenant?   @relation(fields: [tenantId], references: [id], onDelete: Cascade)\n}`);
        }

        return newMatch;
    });
});

fs.writeFileSync(schemaPath, content);
console.log("Prisma schema updated for bank models.");
