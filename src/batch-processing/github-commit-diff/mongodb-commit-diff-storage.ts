// filepath: c:\Users\evano\WebstormProjects\git-mcp-server\src\batch-processing\adapters\mongodb-commit-diff-storage.ts

import {FindCursor, MongoClient} from "mongodb";
import {CommitDiffStorage, CommitDiff } from "../commit-data-adapter";

export interface IDatabase {
    collection(collectionName: string): {
        deleteMany: (filter: any) => Promise<any>;
        insertMany: (docs: any[]) => Promise<any>;
        find: (param: { repository: string }) => FindCursor;
    };
}

export interface IDeleteInsertMany {
    connect(): Promise<void>;
    db(dbName: string): IDatabase;
    close(): Promise<void>;
}

export class MongoDBCommitDiffStorage implements CommitDiffStorage {
    private dbName: string = "github_data";
    private collectionName: string = "commit_diffs";
    private batchSize: number = 50;
    private client: IDeleteInsertMany;

    constructor(
        client: IDeleteInsertMany = new MongoClient("mongodb://localhost:27017/") as unknown as IDeleteInsertMany
    ) {
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
            const collection = db.collection("commits");

            const commits: CommitDiff[] = await collection.find({ repository }).toArray();
            console.log(`Found ${commits.length} commits in database for ${repository}`);

            return commits;

        } catch (error) {
            return Promise.reject(Error(`MongoDB retrieval error: ${error}`));
        } finally {
            await this.client.close();
        }
    }
}
