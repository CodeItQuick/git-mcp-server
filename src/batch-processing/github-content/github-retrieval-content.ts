import { ContentDataRetriever, ContentDataStorage } from "./content-data-adapter";
import { GitHubContentRetriever } from "./github-content-retriever";
import { MongoDBContentStorage } from "./mongodb-content-storage";
import dotenv from "dotenv";
dotenv.config();

// Configuration - can be made environment-based
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || process.env.DEFAULT_GITHUB_TOKEN;
const RATE_LIMIT_DELAY = parseInt(process.env.RATE_LIMIT_DELAY || "200");

// Factory functions to create adapters
const createContentRetriever = (): ContentDataRetriever => {
    if (!GITHUB_TOKEN) {
        throw new Error("GITHUB_TOKEN not found in environment");
    }
    return new GitHubContentRetriever(GITHUB_TOKEN, RATE_LIMIT_DELAY);
};

const createContentStorage = (): ContentDataStorage => {
    return new MongoDBContentStorage();
};

export const fetchAndStoreRepositoryContent = async (repository?: string):
    Promise<{ content: { type: "text"; text: string; }[] }> => {
    let repo = undefined;
    if (repository === "CodeItQuick/CodeItQuick.github.io") {
        repo = "CodeItQuick/CodeItQuick.github.io";
    } else if (repository === "CodeItQuick/blackjack-ensemble-blue") {
        repo = "CodeItQuick/blackjack-ensemble-blue";
    } else {
        repo = "CodeItQuick/blackjack-ensemble-blue"; // Default repository
    }

    // Create adapter instances
    const contentRetriever = createContentRetriever();
    const contentStorage = createContentStorage();

    try {
        console.log(`Starting to fetch repository content for ${repo}...`);

        // Fetch repository content using the retriever adapter
        const content = await contentRetriever.fetchRepositoryContent(repo);

        // Store content using the storage adapter
        await contentStorage.storeContent(content, repo);

        const successMessage = `Successfully completed fetching and storing repository content for ${repo}. Total files processed: ${content.length}`;
        console.log(successMessage);

        return {
            content: [{
                type: "text",
                text: successMessage
            }]
        };

    } catch (error) {
        console.error("Error in fetchAndStoreRepositoryContent:", error);
        const errorMessage = `Error in fetchAndStoreRepositoryContent: ${error}`;

        return {
            content: [{
                type: "text",
                text: errorMessage
            }]
        };
    }
};
