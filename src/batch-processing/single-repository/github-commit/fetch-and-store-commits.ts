import { MongoDBCommitStorage } from "./mongodb-commit-storage";
import {CommitDataRetriever} from "../../commit-data-adapter";

export const fetchAndStoreCommits = async (
    repository: string, commitRetriever: CommitDataRetriever ,
    commitStorage = new MongoDBCommitStorage()) => {
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
