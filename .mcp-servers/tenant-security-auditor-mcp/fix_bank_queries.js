import { execSync } from 'child_process';

const filePath = "/home/azem/projects/otomuhasebe/api-stage/server/src/modules/bank/bank.service.ts";
const linesToFix = [88, 111, 155, 178, 183, 212, 252, 342, 365, 389, 475, 484];

const MCP_DIR = "/home/azem/projects/otomuhasebe/.mcp-servers/tenant-security-auditor-mcp";

linesToFix.sort((a, b) => b - a).forEach(line => {
    console.log(`Fixing query in ${filePath} at line ${line}`);
    try {
        const output = execSync(`node dist/index.js fix_prisma_query '{"filePath": "${filePath}", "line": ${line}}'`, { cwd: MCP_DIR });
        console.log(output.toString());
    } catch (e) {
        console.error(`Failed to fix line ${line}: ${e.message}`);
    }
});
