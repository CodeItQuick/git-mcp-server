import { OpenAISummarizer, CommitSummary } from "./open-a-i-summarizer";
import { MongoDBCommitSummaryStorage } from "./mongodb-commit-summary-storage";

export const fetchAndStoreCommitSummaries = async (
    aiSummarizer: OpenAISummarizer,
    storage: MongoDBCommitSummaryStorage = new MongoDBCommitSummaryStorage(),
    options: {
        repository?: string;
        maxCommits?: number;
        batchSize?: number;
        skipExisting?: boolean;
        clearExisting?: boolean;
    } = {}
) => {
    const {
        repository,
        maxCommits = 100,
        batchSize = 10,
        skipExisting = true,
        clearExisting = false
    } = options;

    try {
        console.log("Starting AI commit summarization process...");

        if (repository) {
            console.log(`Processing repository: ${repository}`);
        } else {
            console.log("Processing all repositories");
        }

        // Clear existing summaries if requested
        if (clearExisting) {
            await storage.clearSummaries(repository);
        }

        // Fetch commit diffs from MongoDB
        console.log(`Fetching up to ${maxCommits} commit diffs...`);
        const commitDiffs = await storage.getCommitDiffs(repository, maxCommits);

        if (commitDiffs.length === 0) {
            const message = "No commit diffs found to process";
            console.log(message);
            return {
                content: [{
                    type: "text",
                    text: message
                }]
            };
        }

        console.log(`Found ${commitDiffs.length} commit diffs to process\n`);

        let processedCount = 0;
        let summarizedCount = 0;
        let skippedCount = 0;
        let errorCount = 0;
        const summaries: CommitSummary[] = [];
        const results: string[] = [];

        // Process each commit
        for (let i = 0; i < commitDiffs.length; i++) {
            const commit = commitDiffs[i];
            processedCount++;

            try {
                // Check if already summarized
                if (skipExisting) {
                    const alreadySummarized = await storage.isCommitSummarized(
                        commit.sha,
                        commit.repository
                    );

                    if (alreadySummarized) {
                        console.log(`[${i + 1}/${commitDiffs.length}] Skipping ${commit.sha.substring(0, 7)} from ${commit.repository} - already summarized`);
                        skippedCount++;
                        continue;
                    }
                }

                // Summarize the commit using AI
                console.log(`[${i + 1}/${commitDiffs.length}] Summarizing ${commit.sha.substring(0, 7)} from ${commit.repository}...`);
                const summary = await aiSummarizer.summarizeCommit(commit);

                summaries.push({
                    sha: commit.sha,
                    repository: commit.repository,
                    summary,
                    original_message: commit.commit_message,
                    author: commit.author,
                    date: commit.date,
                    created_at: new Date()
                });

                summarizedCount++;
                console.log(`✓ "${summary}"`);

                // Store summaries in batches
                if (summaries.length >= batchSize) {
                    console.log(`\nStoring batch of ${summaries.length} summaries...`);
                    await storage.storeSummaries(summaries);
                    summaries.length = 0; // Clear array
                    console.log("");
                }

            } catch (error) {
                console.error(`✗ Failed to process commit ${commit.sha.substring(0, 7)}: ${error}`);
                errorCount++;
            }
        }

        // Store remaining summaries
        if (summaries.length > 0) {
            console.log(`\nStoring final batch of ${summaries.length} summaries...`);
            await storage.storeSummaries(summaries);
        }

        // Build summary report
        const summaryText = [
            "=== AI Commit Summarization Complete ===",
            `Total processed: ${processedCount}`,
            `Successfully summarized: ${summarizedCount}`,
            `Skipped (already exists): ${skippedCount}`,
            `Errors: ${errorCount}`,
            repository ? `Repository: ${repository}` : "All repositories processed"
        ].join("\n");

        console.log("\n" + summaryText);

        return {
            content: [{
                type: "text",
                text: summaryText
            }]
        };

    } catch (error) {
        console.error("Error in fetchAndStoreCommitSummaries:", error);
        return {
            content: [{
                type: "text",
                text: `Error processing commit summaries: ${error}`
            }]
        };
    }
};

