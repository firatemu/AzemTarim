import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import fs from "fs/promises";
import path from "path";

const server = new Server(
    {
        name: "tenant-security-auditor-mcp",
        version: "1.0.0",
    },
    {
        capabilities: {
            tools: {},
        },
    }
);

const PROJECT_ROOT = "/home/azem/projects/otomuhasebe/api-stage/server";
const PRISMA_SCHEMA_PATH = path.join(PROJECT_ROOT, "prisma/schema.prisma");

async function auditPrismaSchema() {
    const content = await fs.readFile(PRISMA_SCHEMA_PATH, "utf-8");
    const lines = content.split("\n");
    const issues: string[] = [];
    let currentModel: string | null = null;
    let hasTenantId = false;

    lines.forEach((line) => {
        const modelMatch = line.match(/^model\s+(\w+)\s+{/);
        if (modelMatch) {
            if (currentModel && !hasTenantId) {
                issues.push(`Model "${currentModel}" is missing tenantId field.`);
            }
            currentModel = modelMatch[1];
            hasTenantId = false;
        }

        if (currentModel && line.includes("tenantId")) {
            hasTenantId = true;
        }

        if (line.trim() === "}") {
            if (currentModel && !hasTenantId) {
                const skipModels = ["Tenant", "User", "AuditLog", "Permission", "Role", "Subscription", "Plan", "Session"];
                if (!skipModels.includes(currentModel)) {
                    issues.push(`Model "${currentModel}" is missing tenantId field.`);
                }
            }
            currentModel = null;
        }
    });

    return {
        content: [{
            type: "text",
            text: issues.length > 0
                ? `Prisma Schema Issues:\n${issues.join("\n")}`
                : "No tenantId issues found in Prisma schema."
        }]
    };
}

async function fixPrismaSchema(modelName: string) {
    let content = await fs.readFile(PRISMA_SCHEMA_PATH, "utf-8");
    const lines = content.split("\n");
    const newLines: string[] = [];
    let insideModel = false;
    let foundTenantId = false;
    let indexAdded = false;

    for (const line of lines) {
        if (line.startsWith(`model ${modelName} {`)) {
            insideModel = true;
        }

        if (insideModel) {
            if (line.includes("tenantId")) foundTenantId = true;
            if (line.includes("@@index([tenantId])")) indexAdded = true;

            if (line.trim() === "}") {
                if (!foundTenantId) {
                    newLines.push("  tenantId  String?");
                }
                if (!indexAdded) {
                    newLines.push("\n  @@index([tenantId])");
                }
                insideModel = false;
            }
        }
        newLines.push(line);
    }

    await fs.writeFile(PRISMA_SCHEMA_PATH, newLines.join("\n"), "utf-8");
    return { content: [{ type: "text", text: `Successfully added tenantId and index to model ${modelName}` }] };
}

async function auditServices() {
    const modulesPath = path.join(PROJECT_ROOT, "src/modules");
    const issues: string[] = [];

    async function scanDir(dir: string) {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                await scanDir(fullPath);
            } else if (entry.isFile() && entry.name.endsWith(".service.ts")) {
                const content = await fs.readFile(fullPath, "utf-8");
                if (content.includes("@Injectable()") && content.includes("this.prisma.")) {
                    if (!content.includes("TenantResolverService")) {
                        issues.push(fullPath);
                    }
                }
            }
        }
    }

    await scanDir(modulesPath);
    return {
        content: [{
            type: "text",
            text: issues.length > 0
                ? issues.join("\n")
                : "No tenant isolation issues found in Services."
        }]
    };
}

async function fixServiceInjection(filePath: string) {
    let content = await fs.readFile(filePath, "utf-8");

    if (!content.includes("TenantResolverService")) {
        content = `import { TenantResolverService } from '../../common/services/tenant-resolver.service';\n` + content;
    }

    const constructorMatch = content.match(/constructor\s*\(([^)]*)\)/);
    if (constructorMatch) {
        const args = constructorMatch[1].trim();
        const separator = args ? ", " : "";
        const newConstructor = `constructor(${args}${separator}private readonly tenantResolver: TenantResolverService)`;
        content = content.replace(constructorMatch[0], newConstructor);
    } else {
        content = content.replace(/class\s+\w+\s+Service\s*{/, (match) =>
            `${match}\n  constructor(private readonly tenantResolver: TenantResolverService) {}`
        );
    }

    await fs.writeFile(filePath, content, "utf-8");
    return { content: [{ type: "text", text: `Successfully injected TenantResolverService into ${filePath}` }] };
}

async function auditPrismaQueries() {
    const modulesPath = path.join(PROJECT_ROOT, "src/modules");
    const issues: any[] = [];

    async function scanDir(dir: string) {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                await scanDir(fullPath);
            } else if (entry.isFile() && (entry.name.endsWith(".service.ts") || entry.name.endsWith(".controller.ts"))) {
                const content = await fs.readFile(fullPath, "utf-8");
                const prismaQueryMatches = content.matchAll(/this\.prisma\.\w+\.(findMany|findUnique|findFirst|count|update|delete|updateMany|deleteMany)\({/g);

                for (const match of prismaQueryMatches) {
                    const startIndex = match.index!;
                    const closingBraceIndex = content.indexOf("})", startIndex);
                    if (closingBraceIndex !== -1) {
                        const queryBlock = content.substring(startIndex, closingBraceIndex + 2);
                        if (!queryBlock.includes("tenantId") && !queryBlock.includes("buildTenantWhereClause")) {
                            const linesBefore = content.substring(0, startIndex).split("\n").length;
                            issues.push({ filePath: fullPath, line: linesBefore, query: queryBlock });
                        }
                    }
                }
            }
        }
    }

    await scanDir(modulesPath);
    return {
        content: [{
            type: "text",
            text: JSON.stringify(issues, null, 2)
        }]
    };
}

async function fixPrismaQuery(filePath: string, line: number) {
    let content = await fs.readFile(filePath, "utf-8");
    const lines = content.split("\n");
    const targetLineIndex = line - 1;
    let targetLine = lines[targetLineIndex];

    // Check if we need to add tenantId resolution before the query
    const methodLineIndex = lines.slice(0, targetLineIndex).reverse().findIndex(l => l.includes("async ") && l.includes("("));
    const realMethodLineIndex = targetLineIndex - methodLineIndex - 1;

    let tenantIdAvailable = content.includes("const tenantId = await this.tenantResolver.resolveForQuery()");

    if (!tenantIdAvailable && realMethodLineIndex >= 0) {
        lines[realMethodLineIndex] += "\n    const tenantId = await this.tenantResolver.resolveForQuery();";
    }

    // Now inject tenantId into the query
    if (targetLine.includes("where:")) {
        lines[targetLineIndex] = targetLine.replace(/where:\s*{/, "where: { tenantId, ");
    } else {
        lines[targetLineIndex] = targetLine.replace(/\({/, "({ where: { tenantId }, ");
    }

    await fs.writeFile(filePath, lines.join("\n"), "utf-8");
    return { content: [{ type: "text", text: `Fixed query in ${filePath} at line ${line}` }] };
}

server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "audit_prisma_schema", description: "Audit Prisma schema", inputSchema: { type: "object", properties: {} }
            },
            {
                name: "audit_services", description: "Audit services for injection", inputSchema: { type: "object", properties: {} }
            },
            {
                name: "audit_prisma_queries", description: "Audit code for missing filters", inputSchema: { type: "object", properties: {} }
            },
            {
                name: "fix_prisma_schema", description: "Fix Prisma schema", inputSchema: { type: "object", properties: { modelName: { type: "string" } }, required: ["modelName"] }
            },
            {
                name: "fix_service_injection", description: "Inject service", inputSchema: { type: "object", properties: { filePath: { type: "string" } }, required: ["filePath"] }
            },
            {
                name: "fix_prisma_query", description: "Fix query", inputSchema: { type: "object", properties: { filePath: { type: "string" }, line: { type: "number" } }, required: ["filePath", "line"] }
            }
        ],
    };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
    try {
        switch (request.params.name) {
            case "audit_prisma_schema": return await auditPrismaSchema();
            case "audit_services": return await auditServices();
            case "audit_prisma_queries": return await auditPrismaQueries();
            case "fix_prisma_schema": return await fixPrismaSchema(request.params.arguments?.modelName as string);
            case "fix_service_injection": return await fixServiceInjection(request.params.arguments?.filePath as string);
            case "fix_prisma_query": return await fixPrismaQuery(request.params.arguments?.filePath as string, request.params.arguments?.line as number);
            default: throw new Error("Unknown tool");
        }
    } catch (error: any) {
        return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
    }
});

async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
}

main().catch((error) => {
    console.error("Server error:", error);
    process.exit(1);
});
