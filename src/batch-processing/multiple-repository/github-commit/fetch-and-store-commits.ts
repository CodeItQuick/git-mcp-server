import { MultipleRepositoryGithubCommitSupplier } from "./github-commit-supplier";
import { MultipleRepositoryMongoDBCommitStorage } from "./mongodb-commit-storage";
import { CommitDataRetriever } from "../../commit-data-adapter";

export const fetchAndStoreMultipleRepositoryCommits = async (
    sinceDate: Date,
    commitRetriever: CommitDataRetriever,
    commitStorage = new MultipleRepositoryMongoDBCommitStorage()
) => {
    try {
        console.log(`Starting to fetch commits from all CodeItQuick repositories since ${sinceDate.toDateString()}...`);

        // Get all repositories for the user
        const repositories = await (commitRetriever as MultipleRepositoryGithubCommitSupplier).fetchRepositories();

        if (repositories.length === 0) {
            return {
                content: [{
                    type: "text",
                    text: "No repositories found for CodeItQuick user."
                }]
            };
        }

        console.log(`Found ${repositories.length} repositories: ${repositories.join(", ")}`);

        let totalCommitsStored = 0;
        let totalRepositoriesProcessed = 0;
        const results: string[] = [];
        const today = new Date();

        // Process each repository
        for (const repository of repositories) {
            try {
                console.log(`\n=== Processing ${repository} ===`);

                // Clear existing commits for this repository in the date range
                console.log(`Clearing existing commits for ${repository}...`);
                await commitStorage.clearCommits(repository);

                // Fetch commits for this repository within the date range
                const commits = await commitRetriever.fetchCommits(repository, sinceDate, today);

                if (commits.length === 0) {
                    console.log(`No commits found for ${repository} since ${sinceDate.toDateString()}`);
                    results.push(`${repository}: 0 commits found`);
                    continue;
                }

                // Store commits for this repository
                await commitStorage.storeCommits(commits, repository);

                totalCommitsStored += commits.length;
                totalRepositoriesProcessed++;

                const repositoryResult = `${repository}: ${commits.length} commits stored`;
                results.push(repositoryResult);
                console.log(`Completed ${repository}: ${commits.length} commits stored`);

            } catch (error) {
                console.error(`Error processing repository ${repository}:`, error);
                results.push(`${repository}: Error - ${error}`);
                // Continue processing other repositories
            }
        }

        const summary = [
            `Successfully processed ${totalRepositoriesProcessed} repositories`,
            `Total commits stored: ${totalCommitsStored}`,
            `Date range: ${sinceDate.toDateString()} to ${today.toDateString()}`,
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
        console.error('Error in fetchAndStoreMultipleRepositoryCommits:', error);
        return {
            content: [{
                type: "text",
                text: `Error fetching and storing commits: ${error}`
            }]
        };
    }
};
