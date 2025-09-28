import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { getNumLogs } from "./git/git.js";
// Create server instance
const server = new McpServer({
    name: "git source control mcp server",
    version: "1.0.0",
});
server.tool("get-num-logs", "Get git commit logs for the last number of days", {
    number_days: z.number().int().min(1).max(6 * 30).describe("integer number of days to retrieve, defaults to seven")
}, (params) => getNumLogs(params));
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
