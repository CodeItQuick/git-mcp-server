import { GithubCommitDiffSupplier } from "./github-commit-diff-supplier";
import { MongoDBCommitDiffStorage } from "./mongodb-commit-diff-storage";
import dotenv from "dotenv";
import {CommitDiffRetriever} from "../commit-data-adapter";
dotenv.config();

// Configuration - can be made environment-based
const GITHUB_TOKEN = process.env.GITHUB_TOKEN_REPOSITORY || process.env.DEFAULT_GITHUB_TOKEN;
const RATE_LIMIT_DELAY = parseInt(process.env.RATE_LIMIT_DELAY || "1200");
const BATCH_SIZE = parseInt(process.env.BATCH_SIZE || "50");

export const fetchAndStoreCommitDiffs = async (
       repositoryName: string,
       commitDiffRetriever: CommitDiffRetriever,
       commitDiffStorage = new MongoDBCommitDiffStorage()) => {
    let repo = undefined;
    if (repositoryName === "CodeItQuick/CodeItQuick.github.io") {
        repo = "CodeItQuick/CodeItQuick.github.io";
    } else if (repositoryName === "CodeItQuick/blackjack-ensemble-blue") {
        repo = "CodeItQuick/blackjack-ensemble-blue";
    } else {
        throw new Error("only enabled for two repositories");
    }
    try {
        console.log(`Starting to fetch commit diffs for ${repo}...`);

        // Retrieve commits from database using the repositoryName adapter
        const commits = await commitDiffStorage.getCommits(repo);

        if (commits.length > 0) {
            // Clear existing diff data for this repositoryName
            console.log(`Commit diff already store for ${repo}, clearing the storage`)
            await commitDiffStorage.clearCommitDiffs(repo);
        }

        let processedDiffs = [];
        let processedCount = 0;

        for (const commit of commits) {
            try {
                console.log(`Fetching diff for commit ${processedCount + 1}/${commits.length}: ${commit.sha?.substring(0, 7)}...`);

                // Fetch commit diff using the retriever adapter
                const commitDiff = await commitDiffRetriever.fetchCommitDiff(commit.sha, repo);

                if (commitDiff) {
                    processedDiffs.push(commitDiff);
                    processedCount++;

                    // Batch storage to avoid memory issues
                    if (processedDiffs.length >= BATCH_SIZE) {
                        await commitDiffStorage.storeCommitDiffs(processedDiffs, repo);
                        processedDiffs = [];
                    }
                } else {
                    // Handle cases where commit diff couldn't be retrieved (e.g., 404)
                    processedCount++;
                }

            } catch (error: any) {
                console.error(`Error processing commit ${commit.sha}: ${error.message}`);
                processedCount++;
            }
        }

        // Store any remaining diffs
        if (processedDiffs.length > 0) {
            await commitDiffStorage.storeCommitDiffs(processedDiffs, repo);
        }

        console.log(`Finished fetching commit diffs. Total processed: ${processedCount}/${commits.length}`);

        return {
            content: [{
                type: "text",
                text: `Stored ${processedCount} commit diffs from ${repo} in MongoDB. Retrieved from ${commits.length} commits in database.`
            }]
        };

    } catch (error) {
        console.error('Error in fetchAndStoreCommitDiffs:', error);
        return {
            content: [{
                type: "text",
                text: `Error fetching and storing commit diffs: ${error}`
            }]
        };
    }
};
