import { MongoClient } from "mongodb";
import { ContentDataStorage, FileContent } from "./content-data-adapter";

export class MongoDBContentStorage implements ContentDataStorage {
    private mongoUrl: string;
    private dbName: string;
    private collectionName: string;

    constructor(
        mongoUrl: string = "mongodb://localhost:27017/",
        dbName: string = "github_data",
        collectionName: string = "repository_content"
    ) {
        this.mongoUrl = mongoUrl;
        this.dbName = dbName;
        this.collectionName = collectionName;
    }

    async storeContent(content: FileContent[], repository: string): Promise<void> {
        const client = new MongoClient(this.mongoUrl);

        try {
            await client.connect();
            const db = client.db(this.dbName);
            const collection = db.collection(this.collectionName);

            // Clear existing content for this repository
            await collection.deleteMany({ "repository": repository });

            // Add repository info and timestamp to each file content item
            const contentWithRepo = content.map(fileContent => ({
                ...fileContent,
                repository: repository,
                fetched_at: new Date()
            }));

            if (contentWithRepo.length > 0) {
                await collection.insertMany(contentWithRepo);
                console.log(`Stored ${contentWithRepo.length} files for ${repository} in MongoDB`);
            } else {
                console.log(`No content to store for ${repository}`);
            }

        } catch (error) {
            throw new Error(`MongoDB storage error: ${error}`);
        } finally {
            await client.close();
        }
    }
}
