import { fetchAndStoreMultipleRepositoryCommits } from './fetch-and-store-commits';
import { MultipleRepositoryGithubCommitSupplier } from "./github-commit-supplier";
import { Octokit } from "@octokit/rest";
import dotenv from "dotenv";
dotenv.config();

// Configuration - using ALL_GITHUB_TOKEN for access to all repositories
const ALL_GITHUB_TOKEN = process.env.ALL_GITHUB_TOKEN || "";
const USERNAME = "CodeItQuick";
const RATE_LIMIT_DELAY = parseInt(process.env.RATE_LIMIT_DELAY || "1200");

// Get starting date from command line args or default to 30 days ago
const getStartingDate = (): Date => {
    const args = process.argv.slice(2);
    if (args.length > 0) {
        const dateString = args[0];
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            throw new Error(`Invalid date format: ${dateString}. Use format: YYYY-MM-DD`);
        }
        return date;
    }

    // Default to 365 days ago
    const oneYearAgo = new Date();
    oneYearAgo.setDate(oneYearAgo.getDate() - 365);
    return oneYearAgo;
};

const main = async () => {
    try {
        if (!ALL_GITHUB_TOKEN) {
            throw new Error("ALL_GITHUB_TOKEN environment variable is required");
        }

        const startingDate = getStartingDate();
        console.log(`Fetching commits from all ${USERNAME} repositories since ${startingDate.toISOString()}`);

        // Create GitHub API client with authentication
        const octokit = new Octokit({ auth: ALL_GITHUB_TOKEN });

        // Create commit retriever with dependency injection
        const commitRetriever = new MultipleRepositoryGithubCommitSupplier(
            ALL_GITHUB_TOKEN,
            USERNAME,
            RATE_LIMIT_DELAY,
            octokit
        );

        // Execute the fetch and store operation
        const result = await fetchAndStoreMultipleRepositoryCommits(
            startingDate,
            commitRetriever
        );

        console.log('\n=== Final Results ===');
        console.log(result.content[0].text);

    } catch (error) {
        console.error('Fatal error:', error);
        process.exit(1);
    }
};

// Display usage information
if (process.argv.includes('--help') || process.argv.includes('-h')) {
    console.log(`
Usage: node fetch-and-store-commits-runner.js [starting-date]

Arguments:
  starting-date    Optional. Date to start fetching from (YYYY-MM-DD format)
                   Defaults to 30 days ago if not provided

Examples:
  node fetch-and-store-commits-runner.js 2024-01-01
  node fetch-and-store-commits-runner.js 2024-10-01
  node fetch-and-store-commits-runner.js

Environment Variables:
  ALL_GITHUB_TOKEN   Required. GitHub personal access token
  RATE_LIMIT_DELAY   Optional. Delay between API calls in ms (default: 1200)

Description:
  Fetches and stores commits from all CodeItQuick repositories since the
  specified date. Automatically discovers all non-forked repositories
  and processes them sequentially with proper rate limiting.
`);
    process.exit(0);
}

main();
