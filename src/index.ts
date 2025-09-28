import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {StdioServerTransport} from "@modelcontextprotocol/sdk/server/stdio.js";
import {z} from "zod";
import {getCommitMessageLogs} from "./git/git-message-logs.js";
import {getPatchLogs} from "./git/git-patch-logs.js";
import {getDirectoryLogs} from "./git/git-directory-logs.js";

// Create server instance
const server = new McpServer({
    name: "git source control mcp server",
    version: "1.0.0",
});
server.tool(
    "get-commit-message-logs",
    "Get git commit message logs for the last number of days",
    {
        number_days: z.number().int().min(1).max(6 * 30).describe("integer number of days to retrieve, defaults to seven")
    },
    (params) => getCommitMessageLogs(params) as Promise<any>
)
server.tool(
    "get-commit-patch-logs",
    "Get git commit patch logs for a particular file",
    {
        filename: z.string().describe("path and filename to search for the commit patch logs")
    },
    (params) => getPatchLogs(params) as Promise<any>
)
server.tool(
    "get-directory-filenames",
    "Get project files within a directory for the project",
    {
        directory: z.string().describe("path of the files to retrieve. Empty string represents the root directory.")
    },
    (params) => getDirectoryLogs(params) as Promise<any>
)
// server.tool(
//     "get-alerts",
//     "Get weather alerts for a state",
//     {
//         state: z.string().length(2).describe("Two-letter state code (e.g. CA, NY)"),
//     },
//     (params) => getAlerts(params) as Promise<any>,
// );
//
//
// server.tool(
//     "get-forecast",
//     "Get weather forecast for a location",
//     {
//         latitude: z.number().min(-90).max(90).describe("Latitude of the location"),
//         longitude: z
//             .number()
//             .min(-180)
//             .max(180)
//             .describe("Longitude of the location"),
//     },
//     (params) => getForecast(params) as Promise<any>,
// );

// Start the server
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Git Source Control MCP Server running on stdio");
}

main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
});