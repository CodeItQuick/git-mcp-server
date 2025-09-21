"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mcp_js_1 = require("@modelcontextprotocol/sdk/server/mcp.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const zod_1 = require("zod");
const weather_1 = require("./weather/weather");
// Create server instance
const server = new mcp_js_1.McpServer({
    name: "weather",
    version: "1.0.0",
});
server.tool("get-alerts", "Get weather alerts for a state", {
    state: zod_1.z.string().length(2).describe("Two-letter state code (e.g. CA, NY)"),
}, (params) => (0, weather_1.getAlerts)(params));
server.tool("get-forecast", "Get weather forecast for a location", {
    latitude: zod_1.z.number().min(-90).max(90).describe("Latitude of the location"),
    longitude: zod_1.z
        .number()
        .min(-180)
        .max(180)
        .describe("Longitude of the location"),
}, (params) => (0, weather_1.getForecast)(params));
// Start the server
async function main() {
    const transport = new stdio_js_1.StdioServerTransport();
    await server.connect(transport);
    console.error("Weather MCP Server running on stdio");
}
main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
});
