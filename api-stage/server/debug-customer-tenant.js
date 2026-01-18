const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const customerId = '3ae5acd6-661e-44ba-b228-c3ce83895392';
    const customer = await prisma.cari.findUnique({
        where: { id: customerId }
    });
    console.log('Customer:', JSON.stringify(customer, null, 2));

    // Also list all tenants to see what's available
    const tenants = await prisma.tenant.findMany();
    console.log('Tenants:', JSON.stringify(tenants, null, 2));

    await prisma.$disconnect();
}

main().catch(e => {
    console.error(e);
    process.exit(1);
});
