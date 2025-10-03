import { IMongoClient } from "../../../git/IMongoClient";
import { MongoClient } from "mongodb";
import { CommitDiff, CommitDiffStorage } from "../../commit-data-adapter";

export class MultipleRepositoryMongoDBCommitDiffStorage implements CommitDiffStorage {
    private client: IMongoClient;
    private dbName: string;
    private collectionName: string;

    constructor(
        client: IMongoClient = new MongoClient("mongodb://localhost:27017/") as unknown as IMongoClient,
        dbName: string = "github_data",
        collectionName: string = "commits"
    ) {
        this.client = client;
        this.dbName = dbName;
        this.collectionName = collectionName;
    }

    async storeCommitDiffs(diffs: CommitDiff[], repository: string): Promise<void> {
        if (diffs.length === 0) {
            console.log(`No commit diffs to store for ${repository}`);
            return;
        }

        try {
            await this.client.connect();
            const db = this.client.db(this.dbName);
            const collection = db.collection("commit_diffs");

            // Add metadata to each diff
            const diffsWithMetadata = diffs.map(diff => ({
                ...diff,
                repository,
                stored_at: new Date()
            }));

            const result = await collection.insertMany(diffsWithMetadata);
            console.log(`Stored ${result.insertedCount} commit diffs for ${repository}`);

        } catch (error) {
            console.error(`Error storing commit diffs for ${repository}:`, error);
            throw error;
        } finally {
            await this.client.close();
        }
    }

    async clearCommitDiffs(repository: string): Promise<void> {
        try {
            await this.client.connect();
            const db = this.client.db(this.dbName);
            const collection = db.collection("commit_diffs");

            const result = await collection.deleteMany({ repository });
            console.log(`Cleared ${result.deletedCount} existing commit diffs for ${repository}`);

        } catch (error) {
            console.error(`Error clearing commit diffs for ${repository}:`, error);
            throw error;
        } finally {
            await this.client.close();
        }
    }

    async getCommits(repository: string): Promise<CommitDiff[]> {
        try {
            await this.client.connect();
            const db = this.client.db(this.dbName);
            const commitsCollection = db.collection("commits");

            const commits = await commitsCollection.find({ repository }).toArray();

            return commits.map(commit => ({
                sha: commit.sha,
                repository: commit.repository,
                commit_message: commit.commit?.message || "",
                author: commit.commit?.author?.name || "Unknown",
                date: commit.commit?.author?.date || "",
                files: [],
                stats: { additions: 0, deletions: 0, total: 0 }
            }));

        } catch (error) {
            console.error(`Error getting commits for ${repository}:`, error);
            throw error;
        } finally {
            await this.client.close();
        }
    }

    async getAllRepositoryCommits(repositories: string[], sinceDate: Date): Promise<{ [repository: string]: CommitDiff[] }> {
        try {
            await this.client.connect();
            const db = this.client.db(this.dbName);
            const commitsCollection = db.collection("commits");

            const result: { [repository: string]: CommitDiff[] } = {};

            for (const repository of repositories) {
                const commits = await commitsCollection.find({
                    repository,
                    "commit.author.date": {
                        $gte: sinceDate.toISOString(),
                        $lte: new Date().toISOString()
                    }
                }).toArray();

                result[repository] = commits.map(commit => ({
                    sha: commit.sha,
                    repository: commit.repository,
                    commit_message: commit.commit?.message || "",
                    author: commit.commit?.author?.name || "Unknown",
                    date: commit.commit?.author?.date || "",
                    files: [],
                    stats: { additions: 0, deletions: 0, total: 0 }
                }));

                console.log(`Found ${result[repository].length} commits for ${repository} since ${sinceDate.toDateString()}`);
            }

            return result;

        } catch (error) {
            console.error("Error getting commits from multiple repositories:", error);
            throw error;
        } finally {
            await this.client.close();
        }
    }
}
