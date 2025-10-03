import { IMongoClient } from "../../../../src/git/IMongoClient";
import { CommitDiff } from "../../../../src/batch-processing/commit-data-adapter";

export class TestableMultipleRepositoryDeleteInsertMany implements IMongoClient {
    private storedCommitDiffs: CommitDiff[] = [];
    private storedCommits: any[] = [];
    private dbInstance: any;
    private collectionInstance: any;

    constructor() {
        this.collectionInstance = {
            insertMany: (docs: CommitDiff[]) => {
                this.storedCommitDiffs.push(...docs);
                return Promise.resolve({ insertedCount: docs.length });
            },
            deleteMany: (filter: any) => {
                const beforeCount = this.storedCommitDiffs.length;
                this.storedCommitDiffs = this.storedCommitDiffs.filter(diff =>
                    diff.repository !== filter.repository
                );
                const deletedCount = beforeCount - this.storedCommitDiffs.length;
                return Promise.resolve({ deletedCount });
            },
            find: (filter: any) => ({
                toArray: () => {
                    if (filter.repository === "CodeItQuick/CodeItQuick.github.io") {
                        return Promise.resolve([
                            {
                                sha: "commit1sha",
                                repository: "CodeItQuick/CodeItQuick.github.io",
                                commit: {
                                    message: "First commit",
                                    author: { name: "Test Author", date: "2024-10-01T10:00:00Z" }
                                }
                            },
                            {
                                sha: "commit2sha",
                                repository: "CodeItQuick/CodeItQuick.github.io",
                                commit: {
                                    message: "Second commit",
                                    author: { name: "Test Author", date: "2024-10-02T10:00:00Z" }
                                }
                            }
                        ]);
                    } else if (filter.repository === "CodeItQuick/blackjack-ensemble-blue") {
                        return Promise.resolve([
                            {
                                sha: "commit3sha",
                                repository: "CodeItQuick/blackjack-ensemble-blue",
                                commit: {
                                    message: "Blackjack commit",
                                    author: { name: "Test Author", date: "2024-10-01T11:00:00Z" }
                                }
                            }
                        ]);
                    }
                    return Promise.resolve([]);
                }
            })
        };

        this.dbInstance = {
            collection: (name: string) => this.collectionInstance
        };
    }

    connect(): Promise<void> {
        return Promise.resolve();
    }

    close(): Promise<void> {
        return Promise.resolve();
    }

    db(name?: string): any {
        return this.dbInstance;
    }

    getStoredCommitDiffs(): CommitDiff[] {
        return this.storedCommitDiffs;
    }

    clearStoredData(): void {
        this.storedCommitDiffs = [];
        this.storedCommits = [];
    }
}
