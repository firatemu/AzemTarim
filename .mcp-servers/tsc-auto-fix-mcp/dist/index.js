import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema, } from "@modelcontextprotocol/sdk/types.js";
import fs from "fs/promises";
import path from "path";
const server = new Server({
    name: "tsc-auto-fix-mcp",
    version: "1.0.0",
}, {
    capabilities: {
        tools: {},
    },
});
const ERROR_LOG_PATH = "/home/azem/projects/otomuhasebe/api-stage/server/tsc_errors.log";
async function analyzeTscErrors() {
    const content = await fs.readFile(ERROR_LOG_PATH, "utf-8");
    const lines = content.split("\n");
    const summary = {};
    lines.forEach(line => {
        const match = line.match(/^(.+?)\(\d+,\d+\):/);
        if (match) {
            const file = match[1];
            summary[file] = (summary[file] || 0) + 1;
        }
    });
    return { content: [{ type: "text", text: JSON.stringify(summary, null, 2) }] };
}
async function applyPrismaMappingFix(filePath, targetField, replacementField) {
    const fullPath = path.isAbsolute(filePath) ? filePath : path.join("/home/azem/projects/otomuhasebe/api-stage/server", filePath);
    let content = await fs.readFile(fullPath, "utf-8");
    const regex = new RegExp(`\\.${targetField}\\b`, "g");
    const newContent = content.replace(regex, `.${replacementField}`);
    await fs.writeFile(fullPath, newContent, "utf-8");
    return { content: [{ type: "text", text: `Successfully replaced ${targetField} with ${replacementField} in ${filePath}` }] };
}
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "analyze_tsc_errors",
                description: "Analyze tsc_errors.log and group errors by file",
                inputSchema: { type: "object", properties: {} },
            },
            {
                name: "apply_prisma_mapping_fix",
                description: "Fix common Prisma mapping errors like field rename",
                inputSchema: {
                    type: "object",
                    properties: {
                        filePath: { type: "string" },
                        targetField: { type: "string" },
                        replacementField: { type: "string" },
                    },
                    required: ["filePath", "targetField", "replacementField"],
                },
            },
        ],
    };
});
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    try {
        switch (request.params.name) {
            case "analyze_tsc_errors":
                return await analyzeTscErrors();
            case "apply_prisma_mapping_fix":
                const { filePath, targetField, replacementField } = request.params.arguments;
                return await applyPrismaMappingFix(filePath, targetField, replacementField);
            default:
                throw new Error("Unknown tool");
        }
    }
    catch (error) {
        return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
    }
});
async function main() {
    const args = process.argv.slice(2);
    if (args.length > 0) {
        const [toolName, toolArgsJson] = args;
        const toolArgs = JSON.parse(toolArgsJson || "{}");
        try {
            if (toolName === "analyze_tsc_errors") {
                console.log(JSON.stringify(await analyzeTscErrors()));
            }
            else if (toolName === "apply_prisma_mapping_fix") {
                const { filePath, targetField, replacementField } = toolArgs;
                console.log(JSON.stringify(await applyPrismaMappingFix(filePath, targetField, replacementField)));
            }
        }
        catch (e) {
            console.error(e.message);
            process.exit(1);
        }
        return;
    }
    const transport = new StdioServerTransport();
    await server.connect(transport);
}
main().catch((error) => {
    console.error("Server error:", error);
    process.exit(1);
});
