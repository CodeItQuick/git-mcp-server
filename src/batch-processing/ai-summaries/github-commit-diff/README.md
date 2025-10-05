# AI Commit Summary Generator

This module retrieves commit diffs from MongoDB, summarizes them using the GitHub AI API, and stores the one-line summaries in a separate MongoDB collection.

## Architecture

Following the project's standard pattern, this module consists of:

- **`github-ai-summarizer.ts`** - AI supplier class that interfaces with GitHub's AI API
- **`mongodb-commit-summary-storage.ts`** - Storage class that handles MongoDB operations
- **`fetch-and-store-commits.ts`** - Main orchestrator function that coordinates the process
- **`fetch-and-store-commits-runner.ts`** - CLI entry point with dependency injection

## Features

- Fetches commit diffs from MongoDB `commit_diffs` collection
- Uses GitHub AI API (GPT-4o-mini) to generate concise one-line summaries
- Stores summaries in `commit_summaries` collection with metadata
- Supports batch processing with configurable rate limiting
- Can skip already-summarized commits to avoid duplicate processing
- Filters by repository or processes all repositories
- Option to clear existing summaries before processing

## Setup

1. Ensure you have a GitHub token with access to the Models API:
   ```bash
   set GITHUB_TOKEN=your_github_token_here
   ```

2. Make sure MongoDB is running and contains commit diffs in the `commit_diffs` collection

## Usage

### Build the project first
```bash
npm run build
```

### Run with npm script
```bash
npm run ai-summaries-github-commit-diff
```

### Run with default settings
```bash
node build/src/batch-processing/ai-summaries/github-commit-diff/fetch-and-store-commits-runner.js
```

### Run with custom options
```bash
node build/src/batch-processing/ai-summaries/github-commit-diff/fetch-and-store-commits-runner.js --repository CodeItQuick/some-repo --maxCommits 50 --batchSize 10 --skipExisting true
```

## Command Line Options

- `--repository <name>` - Filter by specific repository (e.g., "CodeItQuick/repo-name")
- `--maxCommits <number>` - Maximum number of commits to process (default: 100)
- `--batchSize <number>` - Number of summaries to store at once (default: 10)
- `--skipExisting <true|false>` - Skip already summarized commits (default: true)
- `--clearExisting <true|false>` - Clear existing summaries before processing (default: false)

## Environment Variables

- `GITHUB_TOKEN` or `ALL_GITHUB_TOKEN` - GitHub personal access token (required)
- `RATE_LIMIT_DELAY` - Milliseconds to wait between API calls (default: 1000)
- `BATCH_SIZE` - Default batch size (default: 10)
- `MAX_COMMITS` - Default max commits (default: 100)

## Programmatic Usage

```typescript
import { fetchAndStoreCommitSummaries } from "./fetch-and-store-commits";
import { GithubAISummarizer } from "./github-ai-summarizer";
import { MongoDBCommitSummaryStorage } from "./mongodb-commit-summary-storage";

// Create instances with dependency injection
const aiSummarizer = new GithubAISummarizer(githubToken, 1000);
const storage = new MongoDBCommitSummaryStorage();

// Execute the process
const result = await fetchAndStoreCommitSummaries(
    aiSummarizer,
    storage,
    {
        repository: "CodeItQuick/my-repo",
        maxCommits: 50,
        batchSize: 10,
        skipExisting: true,
        clearExisting: false
    }
);
```

## Output Schema

The summaries are stored in MongoDB with the following structure:

```typescript
{
    sha: string;              // Commit SHA
    repository: string;       // Repository name (owner/repo)
    summary: string;          // AI-generated one-line summary
    original_message: string; // Original commit message
    author: string;           // Commit author
    date: string;            // Commit date
    created_at: Date;        // When the summary was created
}
```

## Rate Limiting

The script includes configurable delays between API calls to respect GitHub's rate limits. The default is 1 second per request, which can be adjusted via the `RATE_LIMIT_DELAY` environment variable.

## Error Handling

- Failed summarizations are logged but don't stop the entire process
- The script provides a summary report at the end showing:
  - Total processed commits
  - Successfully summarized commits
  - Skipped commits (already summarized)
  - Errors encountered

## Example Output

```
Configuration:
  Max Commits: 100
  Batch Size: 10
  Skip Existing: true
  Clear Existing: false
  Repository: All
  Rate Limit Delay: 1000ms

Starting AI commit summarization process...
Processing all repositories
Fetching up to 100 commit diffs...
Found 45 commit diffs to process

[1/45] Summarizing a1b2c3d from CodeItQuick/repo1...
✓ "Add user authentication with JWT tokens"

[2/45] Summarizing e4f5g6h from CodeItQuick/repo1...
✓ "Fix bug in login validation logic"

Storing batch of 10 summaries...
Stored 10 commit summaries to github_data.commit_summaries

...

=== AI Commit Summarization Complete ===
Total processed: 45
Successfully summarized: 43
Skipped (already exists): 2
Errors: 0
All repositories processed

✓ Process completed successfully
```

