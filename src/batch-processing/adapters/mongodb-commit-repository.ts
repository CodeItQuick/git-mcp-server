// filepath: c:\Users\evano\WebstormProjects\git-mcp-server\src\batch-processing\adapters\mongodb-commit-repository.ts

import { MongoClient } from "mongodb";
import { CommitRepository, CommitData } from "./commit-data-adapter";

export class MongoDBCommitRepository implements CommitRepository {
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

    async getCommits(repository: string): Promise<CommitData[]> {
        const client = new MongoClient(this.mongoUrl);

        try {
            await client.connect();
            const db = client.db(this.dbName);
            const collection = db.collection(this.collectionName);

            const commits = await collection.find({ repository: repository }).toArray();
            console.log(`Found ${commits.length} commits in database for ${repository}`);

            return commits.map(commit => ({
                sha: commit.sha,
                commit: commit.commit,
                author: commit.author,
                committer: commit.committer,
                html_url: commit.html_url,
                repository: commit.repository,
                fetched_at: commit.fetched_at
            }));

        } catch (error) {
            throw new Error(`MongoDB retrieval error: ${error}`);
        } finally {
            await client.close();
        }
    }
}
