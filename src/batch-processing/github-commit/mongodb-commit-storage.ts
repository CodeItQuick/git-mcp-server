import { MongoClient } from "mongodb";
import { CommitDataStorage, CommitData } from "../commit-data-adapter";

export interface IDatabase {
    collection(collectionName: string): {
        deleteMany: (filter: any) => Promise<any>;
        insertMany: (docs: any[]) => Promise<any>;
    };
}

export interface IDeleteInsertMany {
    connect(): Promise<void>;
    db(dbName: string): IDatabase;
    close(): Promise<void>;
}

export class MongoDBCommitStorage implements CommitDataStorage {
    private dbName: string = "github_data";
    private collectionName: string = "commits";
    private client: IDeleteInsertMany;

    constructor(
        mongoClient: IDeleteInsertMany = new MongoClient("mongodb://localhost:27017/") as unknown as IDeleteInsertMany
    ) {
        this.client = mongoClient;
    }

    async storeCommits(commits: CommitData[], repository: string): Promise<void> {
        try {
            await this.client.connect();
            const db = this.client.db(this.dbName);
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
            await this.client.close();
        }
    }
}
