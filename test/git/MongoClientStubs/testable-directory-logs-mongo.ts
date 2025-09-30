// Mock MongoDB client for testing git-directory-logs
import { IMongoClient, IDatabase } from "../../../src/git/git-directory-logs";
import { FindCursor } from "mongodb";

export class TestableDirectoryLogsMongo implements IMongoClient {
    private mockFiles: any[] = [
        {
            path: "src/index.ts",
            type: "file",
            repository: "CodeItQuick/blackjack-ensemble-blue",
            sha: "abc123",
            name: "index.ts"
        },
        {
            path: "src/utils.ts",
            type: "file",
            repository: "CodeItQuick/blackjack-ensemble-blue",
            sha: "def456",
            name: "utils.ts"
        }
    ];

    async connect(): Promise<void> {
        // Mock successful connection
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
                    // Return a mock FindCursor that behaves like MongoDB cursor
                    const filteredFiles = this.mockFiles.filter(file =>
                        file.repository === query.repository &&
                        file.type === query.type &&
                        new RegExp(query.path.$regex).test(file.path)
                    );

                    return {
                        sort: (sortOptions: any) => ({
                            toArray: async () => filteredFiles
                        })
                    } as FindCursor;
                }
            })
        };
    }

    async close(): Promise<void> {
        // Mock successful close
    }

    // Helper method to set mock data for different test scenarios
    setMockFiles(files: any[]) {
        this.mockFiles = files;
    }
}
