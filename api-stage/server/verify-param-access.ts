import { PrismaClient } from '@prisma/client';

async function verify() {
    const prisma = new PrismaClient();
    try {
        console.log('Testing global SystemParameter access...');

        // Explicitly query for null tenantId (global)
        const parameter = await (prisma as any).systemParameter.findFirst({
            where: {
                key: 'STAGING_DEFAULT_TENANT_ID',
                tenantId: null,
            },
        });

        console.log('Parameter found:', parameter);

        if (parameter) {
            console.log('Verification SUCCESS: Global parameter accessible.');
        } else {
            console.log('Verification NOTE: Parameter not found, but query succeeded.');
        }
    } catch (error: any) {
        if (error.message.includes('Tenant context missing')) {
            console.error('Verification FAILED: Still blocked by tenant guard.');
        } else {
            console.error('Error during verification:', error.message);
        }
    } finally {
        await prisma.$disconnect();
    }
}

verify();
