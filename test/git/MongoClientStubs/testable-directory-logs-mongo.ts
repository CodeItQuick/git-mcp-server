// Mock MongoDB client for testing git-directory-logs
import { IMongoClient, IDatabase } from "../../../src/git/IMongoClient";
import { FindCursor } from "mongodb";

export class TestableDirectoryLogsMongo implements IMongoClient {
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

    setMockFiles(files: any[]) {
        this.mockFiles = files;
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
                    // Return a mock FindCursor that behaves like MongoDB cursor
                    const filteredFiles = this.mockFiles.filter(file =>
                        file.repository === query.repository &&
                        file.type === query.type &&
                        (!query.path || (query.path.$regex && new RegExp(query.path.$regex).test(file.path)))
                    );

                    return {
                        sort: () => ({
                            toArray: async () => filteredFiles
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
