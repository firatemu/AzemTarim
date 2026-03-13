import { execSync } from 'child_process';

const modelsToFix = [
    "Payment", "ProductCostHistory", "ProductEquivalent", "AccountContact",
    "AccountAddress", "AccountBank", "BankAccount", "CompanyCreditCard",
    "CompanyCreditCardMovement", "InvoiceLog", "InvoiceItem", "InvoicePaymentPlan",
    "EInvoiceXML", "SalesOrderLog", "OrderPicking", "SalesDeliveryNoteLog",
    "QuoteItem", "QuoteLog", "StocktakeItem", "Shelf", "ProductShelf",
    "Location", "ProductBarcode", "ProductLocationStock", "StockMove",
    "DeletedCheckBill", "CheckBillLog", "EmployeePayment", "WorkOrderActivity",
    "WorkOrderItem", "JournalEntryLine", "CompanyCreditCardReminder",
    "WarehouseCriticalStock", "WarehouseTransferItem", "WarehouseTransferLog",
    "PriceListItem", "Coupon"
];

const MCP_DIR = "/home/azem/projects/otomuhasebe/.mcp-servers/tenant-security-auditor-mcp";

modelsToFix.forEach(model => {
    console.log(`Fixing model: ${model}`);
    try {
        const output = execSync(`node dist/index.js fix_prisma_schema '{"modelName": "${model}"}'`, { cwd: MCP_DIR });
        console.log(output.toString());
    } catch (e) {
        console.error(`Failed to fix ${model}: ${e.message}`);
    }
});
