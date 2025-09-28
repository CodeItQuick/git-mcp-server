import { CommitDataRetriever, CommitDataStorage } from "./adapters/commit-data-adapter";
import { GitHubCommitRetriever } from "./adapters/github-commit-retriever";
import { MongoDBCommitStorage } from "./adapters/mongodb-commit-storage";
import dotenv from "dotenv";
dotenv.config();

// Configuration - can be made environment-based
const GITHUB_TOKEN = process.env.GITHUB_TOKEN_REPOSITORY || process.env.DEFAULT_GITHUB_TOKEN;
const RATE_LIMIT_DELAY = parseInt(process.env.RATE_LIMIT_DELAY || "1200");

// Factory functions to create adapters
const createCommitRetriever = (): CommitDataRetriever => {
    if (!GITHUB_TOKEN) {
        throw new Error("GITHUB_TOKEN not found in environment");
    }
    return new GitHubCommitRetriever(GITHUB_TOKEN, RATE_LIMIT_DELAY);
};

const createCommitStorage = (): CommitDataStorage => {
    return new MongoDBCommitStorage();
};

export const fetchAndStoreCommits = async (repository?: string) => {
    let repo = undefined;
    if (repository === "CodeItQuick/CodeItQuick.github.io") {
        repo = "CodeItQuick/CodeItQuick.github.io";
    } else if (repository === "CodeItQuick/blackjack-ensemble-blue") {
        repo = "CodeItQuick/blackjack-ensemble-blue";
    } else {
        throw new Error("only enabled for two repositories");
    }

    // Create adapter instances
    const commitRetriever = createCommitRetriever();
    const commitStorage = createCommitStorage();

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
