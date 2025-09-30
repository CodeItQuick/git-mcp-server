# Git MCP Server

A Model Context Protocol (MCP) server that provides Git repository analysis and GitHub data retrieval capabilities. This server enables AI assistants to interact with Git repositories, retrieve commit histories, analyze file changes, and synchronize data with MongoDB for enhanced repository insights.

## Features

### Git Operations
- **Commit Message Logs**: Retrieve commit messages for a specified number of days
- **Patch Logs**: Get detailed patch information for specific files
- **Directory Listings**: Explore project structure and file listings
- **File Content**: Access current content of any file in the repository

### GitHub Integration
- **Repository Data Sync**: Batch processing to sync GitHub repository data to MongoDB
- **Content Retrieval**: Download and store repository content
- **Commit Diff Analysis**: Retrieve detailed commit diffs via GitHub REST API
- **Rate Limit Handling**: Intelligent pagination and API rate limit management

### Database Storage
- MongoDB integration for persistent data storage
- Collections for commits, content, and diffs
- Base64 content decoding for file content storage

## Prerequisites

- Node.js (v22)
- Docker and Docker Compose
- MongoDB (provided via Docker Compose)
- GitHub Personal Access Token (for GitHub API features)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd git-mcp-server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**  
   Create a `.env` file in the root directory:
   ```env
   GITHUB_TOKEN=your_github_personal_access_token_here
   ```

4. **Start MongoDB**  
   Start your mongodb locally, the default connection string has no authentication on it.

5. **Build the project**
   ```bash
   npm run build
   ```

6. Install as an MCP server using the following file:

```json
{
  "servers": {
    "git-mcp-server": {
      "type": "stdio",
      "command": "node",
      "args": [
        "C:\\Users\\evano\\WebstormProjects\\git-mcp-server\\build\\src\\index.js"
      ]
    },
    "ESLint": {
      "type": "stdio",
      "command": "npx",
      "args": [
        "@eslint/mcp@latest"
      ]
    }
  }
}
```


## Usage

### As an MCP Server

The server implements the Model Context Protocol and can be used with compatible AI assistants. It exposes the following tools:

- `get-commit-message-logs`: Get commit messages for the last N days
- `get-commit-patch-logs`: Get patch logs for a specific file
- `get-directory-filenames`: List files in a directory
- `get-file-content`: Get current content of a file

### Manual CLI Operations

The project includes several CLI runners for manual operations. This allows for easier testing during development:

#### Git Operations
```bash
# Get commit messages
npm run git-message

# Get patch logs
npm run git-patch

# Get directory listings
npm run git-directory

# Get file content
npm run git-file-content
```

#### GitHub Batch Processing
```bash
# Sync repository metadata
npm run batch-processing

# Sync repository content
npm run batch-processing-content

# Sync commit diffs
npm run batch-processing-commit-diff
```

## Project Structure

```
src/
├── index.ts                    # Main MCP server entry point
├── git/                        # Git-related operations
│   ├── git-message-logs.ts     # Commit message retrieval
│   ├── git-patch-logs.ts       # Patch log analysis
│   ├── git-directory-logs.ts   # Directory listing
│   ├── git-file-content.ts     # File content retrieval
│   └── *-runner.ts            # CLI runners for manual execution
└── batch-processing/           # GitHub API integration
    ├── github-retrieval.ts     # Repository data sync
    ├── github-retrieval-content.ts    # Content sync
    ├── github-retrieval-commit-diff.ts # Commit diff sync
    └── *-runner.ts            # CLI runners for batch operations
```

## Database Schema

### MongoDB Collections

- **commits**: Repository commit metadata
- **content**: File content from repositories (base64 decoded)
- **diffs**: Detailed commit diff information

## Configuration

### MongoDB Setup
The project uses Docker Compose to set up MongoDB with Mongo Express for database management:

- **MongoDB**: `localhost:27017`
- **Mongo Express**: `localhost:8081`
  - Username: `mongoexpressuser`
  - Password: `mongoexpresspass`

### GitHub API Configuration
- Requires a GitHub Personal Access Token with appropriate repository permissions
- Implements rate limiting to stay within GitHub API limits (5000 requests/hour)
- Supports pagination for large datasets

## Development

### TypeScript Configuration
The project is written in TypeScript with strict type checking enabled.

### Build Process
```bash
npm run build
```
This compiles TypeScript to JavaScript and sets appropriate permissions.

### Adding New Features
1. Create new modules in the appropriate directory (`git/` or `batch-processing/`)
2. Add corresponding runner files for CLI access
3. Register new tools in `src/index.ts` if they should be exposed via MCP
4. Update the build scripts in `package.json`

## API Reference

### MCP Tools

#### get-commit-message-logs
- **Parameters**: `number_days` (1-180)
- **Returns**: Commit messages for the specified time period

#### get-commit-patch-logs
- **Parameters**: `filename` (string)
- **Returns**: Patch information for the specified file

#### get-directory-filenames
- **Parameters**: `directory` (string, empty for root)
- **Returns**: List of files and subdirectories

#### get-file-content
- **Parameters**: `filename` (string)
- **Returns**: Current content of the specified file
