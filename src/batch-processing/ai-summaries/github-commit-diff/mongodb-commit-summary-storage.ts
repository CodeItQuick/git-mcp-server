import { IMongoClient } from "../../../git/IMongoClient";
import { MongoClient } from "mongodb";
import { CommitSummary } from "./open-a-i-summarizer";

interface CommitDiff {
    sha: string;
    repository: string;
    diff?: string;
    commit_message?: string;
    author?: string;
    date?: string;
}

export class MongoDBCommitSummaryStorage {
    private client: IMongoClient;
    private dbName: string;
    private sourceCollection: string;
    private targetCollection: string;

    constructor(
        client: IMongoClient = new MongoClient("mongodb://localhost:27017/") as unknown as IMongoClient,
        dbName: string = "github_data",
        sourceCollection: string = "commit_diffs",
        targetCollection: string = "commit_summaries"
    ) {
        this.client = client;
        this.dbName = dbName;
        this.sourceCollection = sourceCollection;
        this.targetCollection = targetCollection;
    }

    async getCommitDiffs(repository?: string, limit: number = 100): Promise<CommitDiff[]> {
        try {
            await this.client.connect();
            const db = this.client.db(this.dbName);
            const collection = db.collection(this.sourceCollection);

            const query = repository ? { repository } : {};
            const commits = await collection.find(query).toArray();

            return commits.slice(0, limit) as CommitDiff[];

        } catch (error) {
            console.error("Error fetching commit diffs:", error);
            throw error;
        } finally {
            await this.client.close();
        }
    }

    async isCommitSummarized(sha: string, repository: string): Promise<boolean> {
        try {
            await this.client.connect();
            const db = this.client.db(this.dbName);
            const collection = db.collection(this.targetCollection);

            const existing = await collection.findOne({ sha, repository });
            return existing !== null;

        } catch (error) {
            console.error(`Error checking if commit ${sha} is summarized:`, error);
            throw error;
        } finally {
            await this.client.close();
        }
    }

    async storeSummaries(summaries: CommitSummary[]): Promise<void> {
        if (summaries.length === 0) {
            console.log("No summaries to store");
            return;
        }

        try {
            await this.client.connect();
            const db = this.client.db(this.dbName);
            const collection = db.collection(this.targetCollection);

            await collection.insertMany(summaries);
            console.log(`Stored ${summaries.length} commit summaries to ${this.dbName}.${this.targetCollection}`);

        } catch (error) {
            console.error("Error storing commit summaries:", error);
            throw error;
        } finally {
            await this.client.close();
        }
    }

    async clearSummaries(repository?: string): Promise<void> {
        try {
            await this.client.connect();
            const db = this.client.db(this.dbName);
            const collection = db.collection(this.targetCollection);

            const query = repository ? { repository } : {};
            const result = await collection.deleteMany(query);

            const repoText = repository ? `for ${repository}` : "all";
            console.log(`Cleared ${result.deletedCount} existing summaries ${repoText}`);

        } catch (error) {
            console.error("Error clearing summaries:", error);
            throw error;
        } finally {
            await this.client.close();
        }
    }
}
interface CommitData {
    sha: string;
    repository: string;
    diff?: string;
    commit_message?: string;
    author?: string;
    date?: string;
}

export interface IAISummarizer {
    summarizeCommit(commit: CommitData): Promise<string>;
}

/**
 * GitHub AI API client for summarizing commit diffs
 */
export class GithubAISummarizer implements IAISummarizer {
    private githubToken: string;
    private delayMs: number;
    private model: string;

    constructor(
        githubToken: string,
        delayMs: number = 1000,
        model: string = "gpt-4o-mini"
    ) {
        this.githubToken = githubToken;
        this.delayMs = delayMs;
        this.model = model;
    }

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async summarizeCommit(commit: CommitData): Promise<string> {
        const diffText = commit.diff || "No diff available";
        const message = commit.commit_message || "No commit message";

        const prompt = `Summarize this git commit in one concise line (max 100 characters):

Commit Message: ${message}
Author: ${commit.author || 'Unknown'}

Diff:
${diffText.substring(0, 8000)}

Provide only the one-line summary, nothing else.`;

        try {
            const response = await fetch('https://models.github.com/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.githubToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: this.model,
                    messages: [
                        {
                            role: 'system',
                            content: 'You are a helpful assistant that creates concise one-line summaries of git commits.'
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    temperature: 0.3,
                    max_tokens: 100
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`GitHub AI API error: ${response.status} ${response.statusText} - ${errorText}`);
            }

            const data = await response.json();
            const summary = data.choices[0].message.content.trim();

            // Add delay to respect rate limits
            await this.delay(this.delayMs);

            return summary;

        } catch (error) {
            console.error(`Error summarizing commit ${commit.sha.substring(0, 7)}:`, error);
            throw error;
        }
    }
}

