// filepath: c:\Users\evano\WebstormProjects\git-mcp-server\src\batch-processing\adapters\mongodb-commit-diff-storage.ts

import { MongoClient } from "mongodb";
import {CommitDiffStorage, CommitDiff, CommitData} from "../commit-data-adapter";

export interface IDatabase {
    collection(collectionName: string): {
        deleteMany: (filter: any) => Promise<any>;
        insertMany: (docs: any[]) => Promise<any>;
        find: (param: { repository: string }) => Promise<CommitDiff[]>;
    };
}

export interface IDeleteInsertMany {
    connect(): Promise<void>;
    db(dbName: string): IDatabase;
    close(): Promise<void>;
}

export class MongoDBCommitDiffStorage implements CommitDiffStorage {
    private mongoUrl: string;
    private dbName: string;
    private collectionName: string;
    private batchSize: number;
    private client: IDeleteInsertMany;

    constructor(
        mongoUrl: string = "mongodb://localhost:27017/",
        dbName: string = "github_data",
        collectionName: string = "commit_diffs",
        batchSize: number = 50,
        client: IDeleteInsertMany = new MongoClient("mongodb://localhost:27017/") as unknown as IDeleteInsertMany
    ) {
        this.mongoUrl = mongoUrl;
        this.dbName = dbName;
        this.collectionName = collectionName;
        this.batchSize = batchSize;
        this.client = client;
    }

    async clearCommitDiffs(repository: string): Promise<void> {
        try {
            await this.client.connect();
            const db = this.client.db(this.dbName);
            const collection = db.collection(this.collectionName);

            await collection.deleteMany({ repository: repository });
            console.log(`Cleared existing commit diffs for ${repository}`);

        } catch (error) {
            throw new Error(`MongoDB clear error: ${error}`);
        } finally {
            await this.client.close();
        }
    }

    async storeCommitDiffs(diffs: CommitDiff[], repository: string): Promise<void> {
        if (diffs.length === 0) return;

        try {
            await this.client.connect();
            const db = this.client.db(this.dbName);
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
            await this.client.close();
        }
    }

    async getCommits(repository: string): Promise<CommitDiff[]> {

        try {
            await this.client.connect();
            const db = this.client.db(this.dbName);
            const collection = db.collection(this.collectionName);

            const commits: CommitDiff[] = await collection.find({ repository: repository });
            console.log(`Found ${commits.length} commits in database for ${repository}`);

            return commits;

        } catch (error) {
            return Promise.reject(Error(`MongoDB retrieval error: ${error}`));
        } finally {
            await this.client.close();
        }
    }
}
