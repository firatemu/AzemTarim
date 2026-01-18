const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const customer = await prisma.cari.findFirst({
        select: { id: true, unvan: true }
    });
    console.log(JSON.stringify(customer));
    await prisma.$disconnect();
}

main().catch(e => {
    console.error(e);
    process.exit(1);
});
