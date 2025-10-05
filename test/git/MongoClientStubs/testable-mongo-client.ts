// Mock MongoDB client for testing git-directory-logs
import { IMongoClient, IDatabase } from "../../../src/git/IMongoClient";
import { FindCursor } from "mongodb";

export class TestableMongoClient implements IMongoClient {
    private mockFiles: any[] = [
        {
            path: "src/index.ts",
            type: "file",
            repository: "CodeItQuick/blackjack-ensemble-blue",
            sha: "abc123",
            name: "index.ts",
            content: "Y29uc29sZS5sb2coJ0hlbGxvIFdvcmxkJyk7" // base64 encoded "console.log('Hello World');"
        },
        {
            path: "src/utils.ts",
            type: "file",
            repository: "CodeItQuick/blackjack-ensemble-blue",
            sha: "def456",
            name: "utils.ts",
            content: "ZXhwb3J0IGNvbnN0IHV0aWxzID0gKCkgPT4ge307" // base64 encoded "export const utils = () => {};"
        }
    ];

    private mockCommits: any[] = [
        {
            sha: "commit123",
            commit_message: "Add new feature",
            author: "John Doe",
            date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
            repository: "CodeItQuick/blackjack-ensemble-blue",
            files: [
                {
                    filename: "src/index.ts",
                    status: "modified",
                    sha: "file123",
                    additions: 5,
                    deletions: 2,
                    patch: "@@ -1,3 +1,6 @@\n console.log('Hello World');\n+console.log('New feature added');\n+// Additional functionality\n-// Old comment"
                },
                {
                    filename: "src/utils.ts",
                    status: "modified",
                    sha: "file456",
                    additions: 3,
                    deletions: 1,
                    patch: "@@ -1,2 +1,4 @@\n export const utils = () => {};\n+export const newUtil = () => 'helper';\n-// Deprecated function"
                }
            ]
        },
        {
            sha: "commit456",
            commit_message: "Fix bug in authentication",
            author: "Jane Smith",
            date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
            repository: "CodeItQuick/blackjack-ensemble-blue",
            files: [
                {
                    filename: "src/auth.ts",
                    status: "added",
                    sha: "auth789",
                    additions: 10,
                    deletions: 0,
                    patch: "@@ -0,0 +1,10 @@\n+export const authenticate = (user: string) => {\n+  return user === 'admin';\n+};"
                }
            ]
        }
    ];

    private mockSummaries: any[] = [];

    setMockFiles(files: any[]) {
        this.mockFiles = files;
    }

    setMockCommits(commits: any[]) {
        this.mockCommits = commits;
    }

    setMockSummaries(summaries: any[]) {
        this.mockSummaries = summaries;
    }

    async connect(): Promise<void> {
        // Mock successful connection
    }

    async close(): Promise<void> {
        // Mock successful close
    }

    db(dbName: string): IDatabase {
        return {
            collection: (collectionName: string) => ({
                deleteMany: async (filter: any) => {
                    // Mock delete operation
                    return { deletedCount: 1 };
                },
                insertMany: async (docs: any[]) => {
                    // Mock insert operation
                    return { insertedCount: docs.length };
                },
                find: (query: any) => {
                    let filteredData: any[] = [];

                    if (collectionName === "repository_content") {
                        // Handle file queries for git-directory-logs and git-file-content
                        filteredData = this.mockFiles.filter(file =>
                            file.repository === query.repository &&
                            file.type === query.type &&
                            (!query.path || (query.path.$regex && new RegExp(query.path.$regex).test(file.path)))
                        );
                    } else if (collectionName === "commit_diffs") {
                        // Handle commit queries for git-message-logs and git-patch-logs
                        filteredData = this.mockCommits.filter(commit => {
                            let matches = commit.repository === query.repository;

                            // Handle date filtering for git-message-logs
                            if (query.date && query.date.$gte) {
                                matches = matches && commit.date >= query.date.$gte;
                            }

                            // Handle file filtering for git-patch-logs
                            if (query["files.filename"]) {
                                matches = matches && commit.files?.some((file: any) =>
                                    file.filename === query["files.filename"]
                                );
                            }

                            return matches;
                        });
                    } else if (collectionName === "commit_summaries") {
                        // Handle summary queries for git-summary-logs and git-user-history
                        filteredData = this.mockSummaries.filter(summary => {
                            let matches = true;

                            // Filter by repository (for git-summary-logs)
                            if (query.repository !== undefined) {
                                matches = matches && summary.repository === query.repository;
                            }

                            // Filter by author (for git-user-history)
                            if (query.author !== undefined) {
                                matches = matches && summary.author === query.author;
                            }

                            // Handle date range filtering for git-summary-logs and git-user-history
                            if (query.date) {
                                if (query.date.$gte) {
                                    matches = matches && summary.date >= query.date.$gte;
                                }
                                if (query.date.$lt) {
                                    matches = matches && summary.date < query.date.$lt;
                                }
                            }

                            return matches;
                        });
                    }

                    return {
                        sort: () => ({
                            toArray: async () => filteredData
                        })
                    } as any as FindCursor;
                },
                findOne: async (query: any) => {
                    // Mock findOne operation for git-file-content
                    return this.mockFiles.find(file =>
                        file.repository === query.repository &&
                        file.type === query.type &&
                        file.path === query.path
                    );
                }
            })
        };
    }
}
