import { execSync } from 'child_process';

const servicesToFix = [
    "/home/azem/projects/otomuhasebe/api-stage/server/src/modules/account-movement/account-movement.service.ts",
    "/home/azem/projects/otomuhasebe/api-stage/server/src/modules/admin/tenant-purge.service.ts",
    "/home/azem/projects/otomuhasebe/api-stage/server/src/modules/analytics/analytics.service.ts",
    "/home/azem/projects/otomuhasebe/api-stage/server/src/modules/auth/auth.service.ts",
    "/home/azem/projects/otomuhasebe/api-stage/server/src/modules/bank/bank.service.ts",
    "/home/azem/projects/otomuhasebe/api-stage/server/src/modules/bank-account/bank-account.service.ts",
    "/home/azem/projects/otomuhasebe/api-stage/server/src/modules/bank-transfer/bank-transfer.service.ts",
    "/home/azem/projects/otomuhasebe/api-stage/server/src/modules/brand/brand.service.ts",
    "/home/azem/projects/otomuhasebe/api-stage/server/src/modules/category/category.service.ts",
    "/home/azem/projects/otomuhasebe/api-stage/server/src/modules/check-bill/check-bill-journal.service.ts",
    "/home/azem/projects/otomuhasebe/api-stage/server/src/modules/check-bill/check-bill.service.ts",
    "/home/azem/projects/otomuhasebe/api-stage/server/src/modules/check-bill/reminder-task.service.ts",
    "/home/azem/projects/otomuhasebe/api-stage/server/src/modules/collection/collection-export.service.ts",
    "/home/azem/projects/otomuhasebe/api-stage/server/src/modules/collection/collection.service.ts",
    "/home/azem/projects/otomuhasebe/api-stage/server/src/modules/company-credit-card/company-credit-card.service.ts",
    "/home/azem/projects/otomuhasebe/api-stage/server/src/modules/costing/costing.service.ts",
    "/home/azem/projects/otomuhasebe/api-stage/server/src/modules/dashboard/kpi.service.ts",
    "/home/azem/projects/otomuhasebe/api-stage/server/src/modules/inventory-count/inventory-count-export.service.ts",
    "/home/azem/projects/otomuhasebe/api-stage/server/src/modules/licenses/licenses.service.ts",
    "/home/azem/projects/otomuhasebe/api-stage/server/src/modules/payments/iyzico/iyzico.service.ts",
    "/home/azem/projects/otomuhasebe/api-stage/server/src/modules/payments/payments.service.ts",
    "/home/azem/projects/otomuhasebe/api-stage/server/src/modules/permissions/permissions.service.ts",
    "/home/azem/projects/otomuhasebe/api-stage/server/src/modules/plans/plans.service.ts",
    "/home/azem/projects/otomuhasebe/api-stage/server/src/modules/postal-code/postal-code.service.ts",
    "/home/azem/projects/otomuhasebe/api-stage/server/src/modules/price-list/price-list.service.ts",
    "/home/azem/projects/otomuhasebe/api-stage/server/src/modules/product/product-export.service.ts",
    "/home/azem/projects/otomuhasebe/api-stage/server/src/modules/product-barcode/product-barcode.service.ts",
    "/home/azem/projects/otomuhasebe/api-stage/server/src/modules/product-movement/product-movement.service.ts",
    "/home/azem/projects/otomuhasebe/api-stage/server/src/modules/reporting/reporting.service.ts",
    "/home/azem/projects/otomuhasebe/api-stage/server/src/modules/roles/roles.service.ts",
    "/home/azem/projects/otomuhasebe/api-stage/server/src/modules/salary-payment/salary-payment.service.ts",
    "/home/azem/projects/otomuhasebe/api-stage/server/src/modules/stock-move/stock-move.service.ts",
    "/home/azem/projects/otomuhasebe/api-stage/server/src/modules/subscriptions/subscriptions.service.ts",
    "/home/azem/projects/otomuhasebe/api-stage/server/src/modules/tenants/tenants.service.ts",
    "/home/azem/projects/otomuhasebe/api-stage/server/src/modules/users/users.service.ts",
    "/home/azem/projects/otomuhasebe/api-stage/server/src/modules/vehicle-brand/vehicle-brand.service.ts"
];

const MCP_DIR = "/home/azem/projects/otomuhasebe/.mcp-servers/tenant-security-auditor-mcp";

servicesToFix.forEach(filePath => {
    console.log(`Fixing service: ${filePath}`);
    try {
        const output = execSync(`node dist/index.js fix_service_injection '{"filePath": "${filePath}"}'`, { cwd: MCP_DIR });
        console.log(output.toString());
    } catch (e) {
        console.error(`Failed to fix ${filePath}: ${e.message}`);
    }
});
