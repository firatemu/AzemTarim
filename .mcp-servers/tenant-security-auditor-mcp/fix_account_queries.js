import { execSync } from 'child_process';

const filePath = "/home/azem/projects/otomuhasebe/api-stage/server/src/modules/account/account.service.ts";
const linesToFix = [120, 138, 193, 206, 258, 291, 309, 318, 324, 683, 696];

const MCP_DIR = "/home/azem/projects/otomuhasebe/.mcp-servers/tenant-security-auditor-mcp";

// Fix lines in reverse order to keep line numbers stable if we add lines
linesToFix.sort((a, b) => b - a).forEach(line => {
    console.log(`Fixing query in ${filePath} at line ${line}`);
    try {
        const output = execSync(`node dist/index.js fix_prisma_query '{"filePath": "${filePath}", "line": ${line}}'`, { cwd: MCP_DIR });
        console.log(output.toString());
    } catch (e) {
        console.error(`Failed to fix line ${line}: ${e.message}`);
    }
});
