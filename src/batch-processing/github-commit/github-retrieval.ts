import { GitHubCommitRetriever } from "./github-commit-retriever";
import { MongoDBCommitStorage } from "./mongodb-commit-storage";
import dotenv from "dotenv";
dotenv.config();

// Configuration - can be made environment-based
const GITHUB_TOKEN = process.env.GITHUB_TOKEN_REPOSITORY || process.env.DEFAULT_GITHUB_TOKEN || "";
const RATE_LIMIT_DELAY = parseInt(process.env.RATE_LIMIT_DELAY || "1200");

export const fetchAndStoreCommits = async (
    repository?: string, commitRetriever = new GitHubCommitRetriever(GITHUB_TOKEN, RATE_LIMIT_DELAY),
    commitStorage = new MongoDBCommitStorage()) => {
    if (GITHUB_TOKEN === undefined) {
        throw new Error("Github token not configured");
    }
    let repo = undefined;
    if (repository === "CodeItQuick/CodeItQuick.github.io") {
        repo = "CodeItQuick/CodeItQuick.github.io";
    } else if (repository === "CodeItQuick/blackjack-ensemble-blue") {
        repo = "CodeItQuick/blackjack-ensemble-blue";
    } else {
        throw new Error("only enabled for two repositories");
    }

    try {
        // Fetch commits using the retriever adapter
        const commits = await commitRetriever.fetchCommits(repo);

        // Store commits using the storage adapter
        await commitStorage.storeCommits(commits, repo);

        const pageCount = Math.ceil(commits.length / 100);

        return {
            content: [{
                type: "text",
                text: `Stored ${commits.length} commits from ${repo} in MongoDB across ${pageCount} pages.`
            }]
        };

    } catch (error) {
        console.error('Error in fetchAndStoreCommits:', error);
        return {
            content: [{
                type: "text",
                text: `Error fetching and storing commits: ${error}`
            }]
        };
    }
};
