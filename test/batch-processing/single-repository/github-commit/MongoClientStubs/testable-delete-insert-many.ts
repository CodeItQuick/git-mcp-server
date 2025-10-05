// Mock storage that simulates successful storage
import {IDatabase, IDeleteInsertMany} from "../../../../../src/batch-processing/single-repository/github-commit/mongodb-commit-storage";

export class TestableDeleteInsertMany implements IDeleteInsertMany {
    private storedCommits: any[] = [];

    async connect(): Promise<void> {
        // Mock successful connection
        console.log("Mock: Connected to MongoDB");
    }

    db(dbName: string): IDatabase {
        return {
            collection: (collectionName: string) => ({
                deleteMany: async (filter: any) => {
                    // Mock successful deletion
                    this.storedCommits = [];
                    console.log(`Mock: Deleted documents with filter:`, filter);
                    return {deletedCount: 1};
                },
                insertMany: async (docs: any[]) => {
                    // Mock successful insertion and store the commits for verification
                    this.storedCommits = [...docs];
                    console.log(`Mock: Inserted ${docs.length} documents`);
                    return {insertedCount: docs.length};
                }
            })
        };
    }

    async close(): Promise<void> {
        // Mock successful connection close
        console.log("Mock: Closed MongoDB connection");
    }

    // Helper method for testing - get stored commits
    getStoredCommits(): any[] {
        return this.storedCommits;
    }
}