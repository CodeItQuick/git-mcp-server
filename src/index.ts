import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {StdioServerTransport} from "@modelcontextprotocol/sdk/server/stdio.js";
import {z} from "zod";
import {getCommitMessageLogs} from "./git/git-message-logs.js";
import {getPatchLogs} from "./git/git-patch-logs.js";
import {getDirectoryLogs} from "./git/git-directory-logs.js";
import {getFileContent} from "./git/git-file-content";
import {getFileHistory} from "./git/git-file-history";
import {getUserHistory} from "./git/git-user-history";

// Create server instance
const server = new McpServer({
    name: "git source control mcp server",
    version: "1.0.0",
});
server.tool(
    "get-commit-message-logs",
    "Get git commit message logs for the last number of days. Gives general information on the commit messages.",
    {
        number_days: z.number().int().min(1).max(36 * 31).describe("integer number of days to retrieve, defaults to seven"),
        repository: z.enum(['CodeItQuick/CodeItQuick.github.io', 'CodeItQuick/blackjack-ensemble-blue'])
            .describe("the repository which is either 'CodeItQuick/CodeItQuick.github.io' or 'CodeItQuick/blackjack-ensemble-blue'")
    },
    (params) => getCommitMessageLogs(params) as Promise<any>
)
server.tool(
    "get-commit-patch-logs",
    "Get git commit patch logs for a particular file. Gives patch notes, number of lines, filenames of changed code, sha.",
    {
        filename: z.string().describe("path and filename to search for the commit patch logs"),
        repository: z.enum(['CodeItQuick/CodeItQuick.github.io', 'CodeItQuick/blackjack-ensemble-blue'])
            .describe("the repository which is either 'CodeItQuick/CodeItQuick.github.io' or 'CodeItQuick/blackjack-ensemble-blue'")
    },
    (params) => getPatchLogs(params) as Promise<any>
)
server.tool(
    "get-directory-filenames",
    "Get project files within a directory for the project",
    {
        directory: z.string().describe("path of the files to retrieve. Empty string represents the root directory."),
        repository: z.enum(['CodeItQuick/CodeItQuick.github.io', 'CodeItQuick/blackjack-ensemble-blue'])
            .describe("the repository which is either 'CodeItQuick/CodeItQuick.github.io' or 'CodeItQuick/blackjack-ensemble-blue'")
    },
    (params) => getDirectoryLogs(params) as Promise<any>
)
server.tool(
    "get-file-content",
    "Get a files current content",
    {
        filename: z.string().describe("path of the file to retrieve the content for"),
        repository: z.enum(['CodeItQuick/CodeItQuick.github.io', 'CodeItQuick/blackjack-ensemble-blue'])
            .describe("the repository which is either 'CodeItQuick/CodeItQuick.github.io' or 'CodeItQuick/blackjack-ensemble-blue'")
    },
    (params) => getFileContent(params) as Promise<any>
)
server.tool(
    "get-file-history",
    "Get a files past commit history and commit blame",
    {
        filename: z.string().describe("path of the file to retrieve the history for"),
        repository: z.enum(['CodeItQuick/CodeItQuick.github.io', 'CodeItQuick/blackjack-ensemble-blue'])
            .describe("the repository which is either 'CodeItQuick/CodeItQuick.github.io' or 'CodeItQuick/blackjack-ensemble-blue'")
    },
    (params) => getFileHistory(params) as Promise<any>
)
server.tool(
    "get-user-history",
    "Get a users past commit history and commit blame on a specific day",
    {
        username: z.enum(['CodeItQuick']).describe("the user to search for"),
        exact_date: z.string()
            .describe("Day to search for in format YYYY-MM-DD")
    },
    (params) => getUserHistory(params) as Promise<any>
)

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