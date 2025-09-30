import { MongoDBContentStorage } from "./mongodb-content-storage";
import {ContentDataRetriever} from "./content-data-adapter";

export const fetchAndStoreRepositoryContent = async (
    repository: string,
    contentRetriever: ContentDataRetriever,
    contentStorage = new MongoDBContentStorage()):
    Promise<{ content: { type: "text"; text: string; }[] }> => {
    let repo;
    if (repository === "CodeItQuick/CodeItQuick.github.io") {
        repo = "CodeItQuick/CodeItQuick.github.io";
    } else if (repository === "CodeItQuick/blackjack-ensemble-blue") {
        repo = "CodeItQuick/blackjack-ensemble-blue";
    } else {
        repo = "CodeItQuick/blackjack-ensemble-blue"; // Default repository
    }

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
