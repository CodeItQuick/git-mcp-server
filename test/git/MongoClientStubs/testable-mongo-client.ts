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
                { filename: "src/index.ts" },
                { filename: "src/utils.ts" }
            ]
        },
        {
            sha: "commit456",
            commit_message: "Fix bug in authentication",
            author: "Jane Smith",
            date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
            repository: "CodeItQuick/blackjack-ensemble-blue",
            files: [
                { filename: "src/auth.ts" }
            ]
        }
    ];

    setMockFiles(files: any[]) {
        this.mockFiles = files;
    }

    setMockCommits(commits: any[]) {
        this.mockCommits = commits;
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
                        // Handle commit queries for git-message-logs
                        filteredData = this.mockCommits.filter(commit =>
                            commit.repository === query.repository &&
                            (!query.date || (query.date.$gte && commit.date >= query.date.$gte))
                        );
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
