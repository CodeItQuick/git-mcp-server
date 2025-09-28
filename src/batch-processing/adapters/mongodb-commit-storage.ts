// filepath: c:\Users\evano\WebstormProjects\git-mcp-server\src\batch-processing\adapters\mongodb-commit-storage.ts

import { MongoClient } from "mongodb";
import { CommitDataStorage, CommitData } from "./commit-data-adapter";

export class MongoDBCommitStorage implements CommitDataStorage {
    private mongoUrl: string;
    private dbName: string;
    private collectionName: string;

    constructor(
        mongoUrl: string = "mongodb://localhost:27017/",
        dbName: string = "github_data",
        collectionName: string = "commits"
    ) {
        this.mongoUrl = mongoUrl;
        this.dbName = dbName;
        this.collectionName = collectionName;
    }

    async storeCommits(commits: CommitData[], repository: string): Promise<void> {
        const client = new MongoClient(this.mongoUrl);

        try {
            await client.connect();
            const db = client.db(this.dbName);
            const collection = db.collection(this.collectionName);

            // Clear existing data for this repository
            await collection.deleteMany({ "repository": repository });

            // Add repository info and timestamp to each commit
            const commitsWithRepo = commits.map(commit => ({
                ...commit,
                repository: repository,
                fetched_at: new Date()
            }));

            if (commitsWithRepo.length > 0) {
                await collection.insertMany(commitsWithRepo);
                console.log(`Stored ${commitsWithRepo.length} commits for ${repository} in MongoDB`);
            }

        } catch (error) {
            throw new Error(`MongoDB storage error: ${error}`);
        } finally {
            await client.close();
        }
    }
}
