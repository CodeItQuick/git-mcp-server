import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {StdioServerTransport} from "@modelcontextprotocol/sdk/server/stdio.js";
import {z} from "zod";
import {getCommitMessageLogs} from "./git/tools/git-message-logs";
import {getPatchLogs} from "./git/tools/git-patch-logs";
import {getDirectoryLogs} from "./git/tools/git-directory-logs";
import {getFileContent} from "./git/tools/git-file-content";
import {getFileHistory} from "./git/tools/git-file-history";
import {getUserHistory} from "./git/tools/git-user-history";
import {getRepositoryHistory} from "./git/tools/git-repository-history";
import {getSummaryLogs} from "./git/tools/git-summary-logs";

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
server.tool(
    "get-repository-history",
    "Get a users past commit history and commit blame since a day given in YYYY-MM-DD",
    {
        username: z.enum(['CodeItQuick']).describe("the user to search for"),
        since_date: z.string()
            .describe("Day to search for in format YYYY-MM-DD")
    },
    (params) => getRepositoryHistory(params) as Promise<any>
)

server.tool(
    "get-summary-repository-logs",
    "Get AI summary logs for a particular repository given a start date and end date in format YYYY-MM-DD. Gives commit sha, author, date of commit, AI summary, and original commit message.",
    {
        start_date: z.string().describe("the start date to query in format YYYY-MM-DD"),
        end_date: z.string().describe("the end date to query in format YYYY-MM-DD"),
        repository: z.string()
            .describe("the repository starting with 'CodeItQuick/'")
    },
    (params) => getSummaryLogs(params)
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