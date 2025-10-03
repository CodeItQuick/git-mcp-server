import { IMongoClient } from "../../../git/IMongoClient";
import { MongoClient } from "mongodb";
import { CommitData, CommitDataStorage } from "../../commit-data-adapter";

export class MultipleRepositoryMongoDBCommitStorage implements CommitDataStorage {
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

    async storeCommits(commits: CommitData[], repository: string): Promise<void> {
        if (commits.length === 0) {
            console.log(`No commits to store for ${repository}`);
            return;
        }

        try {
            await this.client.connect();
            const db = this.client.db(this.dbName);
            const collection = db.collection(this.collectionName);

            // Add metadata to each commit
            const commitsWithMetadata = commits.map(commit => ({
                ...commit,
                repository,
                stored_at: new Date()
            }));

            const result = await collection.insertMany(commitsWithMetadata);
            console.log(`Stored ${result.insertedCount} commits for ${repository}`);

        } catch (error) {
            console.error(`Error storing commits for ${repository}:`, error);
            throw error;
        } finally {
            await this.client.close();
        }
    }

    async clearCommits(repository: string): Promise<void> {
        try {
            await this.client.connect();
            const db = this.client.db(this.dbName);
            const collection = db.collection(this.collectionName);

            const result = await collection.deleteMany({ repository });
            console.log(`Cleared ${result.deletedCount} existing commits for ${repository}`);

        } catch (error) {
            console.error(`Error clearing commits for ${repository}:`, error);
            throw error;
        } finally {
            await this.client.close();
        }
    }

    async getCommitsForRepository(repository: string, sinceDate?: Date, untilDate?: Date): Promise<CommitData[]> {
        try {
            await this.client.connect();
            const db = this.client.db(this.dbName);
            const collection = db.collection(this.collectionName);

            const query: any = { repository };

            if (sinceDate || untilDate) {
                query["commit.author.date"] = {};
                if (sinceDate) {
                    query["commit.author.date"].$gte = sinceDate.toISOString();
                }
                if (untilDate) {
                    query["commit.author.date"].$lte = untilDate.toISOString();
                }
            }

            const commits = await collection.find(query).toArray();

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
            console.error(`Error getting commits for ${repository}:`, error);
            throw error;
        } finally {
            await this.client.close();
        }
    }

    async getAllRepositoriesCommits(repositories: string[], sinceDate?: Date, untilDate?: Date): Promise<{ [repository: string]: CommitData[] }> {
        try {
            await this.client.connect();
            const db = this.client.db(this.dbName);
            const collection = db.collection(this.collectionName);

            const result: { [repository: string]: CommitData[] } = {};

            for (const repository of repositories) {
                const query: any = { repository };

                if (sinceDate || untilDate) {
                    query["commit.author.date"] = {};
                    if (sinceDate) {
                        query["commit.author.date"].$gte = sinceDate.toISOString();
                    }
                    if (untilDate) {
                        query["commit.author.date"].$lte = untilDate.toISOString();
                    }
                }

                const commits = await collection.find(query).toArray();

                result[repository] = commits.map(commit => ({
                    sha: commit.sha,
                    commit: commit.commit,
                    author: commit.author,
                    committer: commit.committer,
                    html_url: commit.html_url,
                    repository: commit.repository,
                    fetched_at: commit.fetched_at
                }));

                console.log(`Found ${result[repository].length} commits for ${repository} in date range`);
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
