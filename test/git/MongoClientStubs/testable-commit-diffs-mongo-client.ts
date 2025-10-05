import { IMongoClient, IDatabase } from "../../../src/git/IMongoClient";
import { FindCursor } from "mongodb";
import {CommitDiff} from "../../../src/batch-processing/commit-data-adapter";

export class TestableCommitDiffsMongoClient implements IMongoClient {
    private mockCommitDiffs: CommitDiff[] = [
        {
            sha: "sha1",
            commit_message: "Initial commit",
            author: "Alice",
            date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
            repository: "repo1",
            files: [
                {filename: "file1.ts"}
            ],
            stats: {
                additions: 0,
                deletions: 0,
                total: 0
            }
        },
        {
            sha: "sha2",
            commit_message: "Add feature",
            author: "Bob",
            date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
            repository: "repo1",
            files: [
                { filename: "file2.ts" }
            ],
            stats: {
                additions: 0,
                deletions: 0,
                total: 0
            }
        }
    ];

    setMockCommitDiffs(diffs: any[]) {
        this.mockCommitDiffs = diffs;
    }

    async connect(): Promise<void> {
        // Mock connect
    }

    async close(): Promise<void> {
        // Mock close
    }

    db(dbName: string): IDatabase {
        return {
            collection: (collectionName: string) => ({
                find: (query: any) => {
                    let filtered = this.mockCommitDiffs.filter(diff => {
                        let matches = diff.repository === query.repository;
                        if (query.date && query.date.$gte) {
                            matches = matches && diff.date >= query.date.$gte;
                        }
                        return matches;
                    });
                    return {
                        sort: () => ({
                            toArray: async () => filtered
                        })
                    } as any as FindCursor;
                },
                deleteMany: async (filter: any) => {
                    // Mock delete operation
                    return { deletedCount: 1 };
                },
                insertMany: async (docs: any[]) => {
                    // Mock insert operation
                    return { insertedCount: docs.length };
                },
                findOne: async (query: any) => {
                    // Mock findOne operation for git-file-content
                    return this.mockCommitDiffs.find(file =>
                        file.repository === query.repository
                    );
                }
            })
        };
    }
}

