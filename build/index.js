"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mcp_js_1 = require("@modelcontextprotocol/sdk/server/mcp.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const zod_1 = require("zod");
const git_message_logs_js_1 = require("./git/git-message-logs.js");
const git_patch_logs_js_1 = require("./git/git-patch-logs.js");
const git_directory_logs_js_1 = require("./git/git-directory-logs.js");
const git_file_content_1 = require("./git/git-file-content");
// Create server instance
const server = new mcp_js_1.McpServer({
    name: "git source control mcp server",
    version: "1.0.0",
});
server.tool("get-commit-message-logs", "Get git commit message logs for the last number of days. Gives general information on the commit messages.", {
    number_days: zod_1.z.number().int().min(1).max(36 * 31).describe("integer number of days to retrieve, defaults to seven")
}, (params) => (0, git_message_logs_js_1.getCommitMessageLogs)(params));
server.tool("get-commit-patch-logs", "Get git commit patch logs for a particular file. Gives patch notes, number of lines, filenames of changed code, sha.", {
    filename: zod_1.z.string().describe("path and filename to search for the commit patch logs")
}, (params) => (0, git_patch_logs_js_1.getPatchLogs)(params));
server.tool("get-directory-filenames", "Get project files within a directory for the project", {
    directory: zod_1.z.string().describe("path of the files to retrieve. Empty string represents the root directory.")
}, (params) => (0, git_directory_logs_js_1.getDirectoryLogs)(params));
server.tool("get-file-content", "Get a files current content", {
    filename: zod_1.z.string().describe("path of the file to retrieve the content for")
}, (params) => (0, git_file_content_1.getFileContent)(params));
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
    const transport = new stdio_js_1.StdioServerTransport();
    await server.connect(transport);
    console.error("Git Source Control MCP Server running on stdio");
}
main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
});
