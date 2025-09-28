// filepath: c:\Users\evano\WebstormProjects\git-mcp-server\src\batch-processing\adapters\mongodb-commit-diff-storage.ts

import { MongoClient } from "mongodb";
import { CommitDiffStorage, CommitDiff } from "./commit-data-adapter";

export class MongoDBCommitDiffStorage implements CommitDiffStorage {
    private mongoUrl: string;
    private dbName: string;
    private collectionName: string;
    private batchSize: number;

    constructor(
        mongoUrl: string = "mongodb://localhost:27017/",
        dbName: string = "github_data",
        collectionName: string = "commit_diffs",
        batchSize: number = 50
    ) {
        this.mongoUrl = mongoUrl;
        this.dbName = dbName;
        this.collectionName = collectionName;
        this.batchSize = batchSize;
    }

    async clearCommitDiffs(repository: string): Promise<void> {
        const client = new MongoClient(this.mongoUrl);

        try {
            await client.connect();
            const db = client.db(this.dbName);
            const collection = db.collection(this.collectionName);

            await collection.deleteMany({ repository: repository });
            console.log(`Cleared existing commit diffs for ${repository}`);

        } catch (error) {
            throw new Error(`MongoDB clear error: ${error}`);
        } finally {
            await client.close();
        }
    }

    async storeCommitDiffs(diffs: CommitDiff[], repository: string): Promise<void> {
        if (diffs.length === 0) return;

        const client = new MongoClient(this.mongoUrl);

        try {
            await client.connect();
            const db = client.db(this.dbName);
            const collection = db.collection(this.collectionName);

            // Process in batches to avoid memory issues
            for (let i = 0; i < diffs.length; i += this.batchSize) {
                const batch = diffs.slice(i, i + this.batchSize);
                await collection.insertMany(batch);
                console.log(`Stored batch of ${batch.length} commit diffs in database (${i + batch.length}/${diffs.length})`);
            }

        } catch (error) {
            throw new Error(`MongoDB storage error: ${error}`);
        } finally {
            await client.close();
        }
    }
}
