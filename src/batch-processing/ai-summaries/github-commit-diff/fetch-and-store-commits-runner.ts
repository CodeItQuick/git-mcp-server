import { fetchAndStoreCommitSummaries } from "./fetch-and-store-commits";
import { OpenAISummarizer } from "./open-a-i-summarizer";
import { MongoDBCommitSummaryStorage } from "./mongodb-commit-summary-storage";
import dotenv from "dotenv";

dotenv.config();

// Configuration
const GITHUB_TOKEN = process.env.ALL_GITHUB_TOKEN || "";
const RATE_LIMIT_DELAY = parseInt(process.env.RATE_LIMIT_DELAY || "1000");
const BATCH_SIZE = parseInt(process.env.BATCH_SIZE || "10");
const MAX_COMMITS = parseInt(process.env.MAX_COMMITS || "100");

const main = async () => {
    try {
        if (!GITHUB_TOKEN) {
            throw new Error("GITHUB_TOKEN or ALL_GITHUB_TOKEN environment variable is required");
        }

        // Parse command line arguments
        const args = process.argv.slice(2);
        let repository: string | undefined;
        let maxCommits = MAX_COMMITS;
        let batchSize = BATCH_SIZE;
        let skipExisting = true;
        let clearExisting = false;

        for (let i = 0; i < args.length; i++) {
            const arg = args[i];
            if (arg === "--repository" && args[i + 1]) {
                repository = args[i + 1];
                i++;
            } else if (arg === "--maxCommits" && args[i + 1]) {
                maxCommits = parseInt(args[i + 1]);
                i++;
            } else if (arg === "--batchSize" && args[i + 1]) {
                batchSize = parseInt(args[i + 1]);
                i++;
            } else if (arg === "--skipExisting" && args[i + 1]) {
                skipExisting = args[i + 1] === "true";
                i++;
            } else if (arg === "--clearExisting" && args[i + 1]) {
                clearExisting = args[i + 1] === "true";
                i++;
            }
        }

        console.log("Configuration:");
        console.log(`  Max Commits: ${maxCommits}`);
        console.log(`  Batch Size: ${batchSize}`);
        console.log(`  Skip Existing: ${skipExisting}`);
        console.log(`  Clear Existing: ${clearExisting}`);
        console.log(`  Repository: ${repository || "All"}`);
        console.log(`  Rate Limit Delay: ${RATE_LIMIT_DELAY}ms\n`);

        // Create AI summarizer with dependency injection
        const aiSummarizer = new OpenAISummarizer(
            GITHUB_TOKEN,
            RATE_LIMIT_DELAY
        );

        // Create storage with dependency injection
        const storage = new MongoDBCommitSummaryStorage();

        // Execute the fetch and store operation
        const result = await fetchAndStoreCommitSummaries(
            aiSummarizer,
            storage,
            {
                repository,
                maxCommits,
                batchSize,
                skipExisting,
                clearExisting
            }
        );

        console.log("\n✓ Process completed successfully");
        process.exit(0);

    } catch (error) {
        console.error("\n✗ Process failed:", error);
        process.exit(1);
    }
};

main();

