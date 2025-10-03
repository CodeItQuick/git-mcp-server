import { MultipleRepositoryGithubCommitDiffSupplier } from "./github-commit-diff-supplier";
import { MultipleRepositoryMongoDBCommitDiffStorage } from "./mongodb-commit-diff-storage";
import { CommitDiffRetriever } from "../../commit-data-adapter";

export const fetchAndStoreMultipleRepositoryCommitDiffs = async (
    sinceDate: Date,
    commitDiffRetriever: CommitDiffRetriever,
    commitDiffStorage = new MultipleRepositoryMongoDBCommitDiffStorage(),
    batchSize: number = 50
) => {
    try {
        console.log(`Starting to fetch commit diffs from all CodeItQuick repositories since ${sinceDate.toDateString()}...`);

        // Get all repositories for the user
        const repositories = await (commitDiffRetriever as MultipleRepositoryGithubCommitDiffSupplier).fetchRepositories();

        if (repositories.length === 0) {
            return {
                content: [{
                    type: "text",
                    text: "No repositories found for CodeItQuick user."
                }]
            };
        }

        console.log(`Found ${repositories.length} repositories: ${repositories.join(", ")}`);

        // Get commits from all repositories within the date range
        const allRepositoryCommits = await commitDiffStorage.getAllRepositoryCommits(repositories, sinceDate);

        let totalProcessedDiffs = 0;
        let totalRepositoriesProcessed = 0;
        const results: string[] = [];

        // Process each repository
        for (const repository of repositories) {
            const commits = allRepositoryCommits[repository] || [];

            if (commits.length === 0) {
                console.log(`No commits found for ${repository} since ${sinceDate.toDateString()}`);
                continue;
            }

            console.log(`\n=== Processing ${repository} (${commits.length} commits) ===`);

            // Clear existing diff data for this repository
            await commitDiffStorage.clearCommitDiffs(repository);

            let processedDiffs = [];
            let processedCount = 0;

            for (const commit of commits) {
                try {
                    console.log(`Fetching diff for commit ${processedCount + 1}/${commits.length}: ${commit.sha?.substring(0, 7)}...`);

                    // Fetch commit diff using the retriever adapter
                    const commitDiff = await commitDiffRetriever.fetchCommitDiff(commit.sha, repository);

                    if (commitDiff) {
                        processedDiffs.push(commitDiff);
                        processedCount++;

                        // Batch storage to avoid memory issues
                        if (processedDiffs.length >= batchSize) {
                            await commitDiffStorage.storeCommitDiffs(processedDiffs, repository);
                            processedDiffs = [];
                        }
                    }

                } catch (error) {
                    console.error(`Error processing commit ${commit.sha} in ${repository}:`, error);
                    // Continue processing other commits
                }
            }

            // Store remaining diffs
            if (processedDiffs.length > 0) {
                await commitDiffStorage.storeCommitDiffs(processedDiffs, repository);
            }

            totalProcessedDiffs += processedCount;
            totalRepositoriesProcessed++;

            const repositoryResult = `${repository}: ${processedCount}/${commits.length} commit diffs processed`;
            results.push(repositoryResult);
            console.log(`Completed ${repository}: ${processedCount} commit diffs stored`);
        }

        const summary = [
            `Successfully processed ${totalRepositoriesProcessed} repositories`,
            `Total commit diffs stored: ${totalProcessedDiffs}`,
            `Date range: ${sinceDate.toDateString()} to ${new Date().toDateString()}`,
            "",
            "Repository breakdown:",
            ...results
        ].join("\n");

        return {
            content: [{
                type: "text",
                text: summary
            }]
        };

    } catch (error) {
        console.error('Error in fetchAndStoreMultipleRepositoryCommitDiffs:', error);
        return {
            content: [{
                type: "text",
                text: `Error fetching and storing commit diffs: ${error}`
            }]
        };
    }
};
