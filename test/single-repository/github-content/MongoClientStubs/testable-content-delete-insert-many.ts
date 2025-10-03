import {
    IDeleteInsertMany,
    IDatabase,
} from "../../../../src/batch-processing/single-repository/github-content/mongodb-content-storage";

export class TestableContentDeleteInsertMany implements IDeleteInsertMany {
    private storedContent: any[] = [];

    async connect(): Promise<void> {
        // Mock successful connection
        console.log("Mock: Connected to MongoDB for content");
    }

    db(dbName: string): IDatabase {
        return {
            collection: (collectionName: string) => ({
                deleteMany: async (filter: any) => {
                    // Mock successful deletion
                    console.log(`Mock: Deleted content documents with filter:`, filter);
                    return { deletedCount: 1 };
                },
                insertMany: async (docs: any[]) => {
                    // Mock successful insertion and store the content for verification
                    this.storedContent = [...docs];
                    console.log(`Mock: Inserted ${docs.length} content documents`);
                    return { insertedCount: docs.length };
                }
            })
        };
    }

    async close(): Promise<void> {
        // Mock successful connection close
        console.log("Mock: Closed MongoDB connection for content");
    }

    // Helper method for testing - get stored content
    getStoredContent(): any[] {
        return this.storedContent;
    }
}
