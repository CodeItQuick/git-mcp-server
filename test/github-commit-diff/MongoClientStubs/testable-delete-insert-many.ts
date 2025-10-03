// Mock storage that simulates successful storage

import {
    IDatabase,
    IDeleteInsertMany
} from "../../../src/batch-processing/single-repository/github-commit-diff/mongodb-commit-diff-storage";
import * as async_hooks from "node:async_hooks";
import {CommitDiff} from "../../../src/batch-processing/commit-data-adapter";
import {FindCursor} from "mongodb";

export class TestableDeleteInsertMany implements IDeleteInsertMany {
    private storedCommits: CommitDiff[] = [{
            sha: "abc123def456789",
            repository: "CodeItQuick/blackjack-ensemble-blue",
            commit_message: "Add new feature with comprehensive tests",
            author: "John Developer",
            date: "2023-09-28T10:30:00Z",
            files: [
                {
                    filename: "src/feature.ts",
                    additions: 100,
                    deletions: 10,
                    changes: 110,
                    patch: "@@ -1,3 +1,103 @@\n+export class NewFeature {\n+  // implementation\n+}"
                },
                {
                    filename: "test/feature.test.ts",
                    additions: 50,
                    deletions: 15,
                    changes: 65,
                    patch: "@@ -1,2 +1,52 @@\n+describe('NewFeature', () => {\n+  // tests\n+});"
                }
            ],
            stats: {
                additions: 150,
                deletions: 25,
                total: 175
            },
            patch: "@@ -1,3 +1,103 @@\n+export class NewFeature {\n+  // implementation\n+}\n@@ -1,2 +1,52 @@\n+describe('NewFeature', () => {\n+  // tests\n+});",
            fetched_at: new Date("2023-09-28T10:30:00Z")
        },
        {
            sha: "def789ghi012345",
            repository: "CodeItQuick/blackjack-ensemble-blue",
            commit_message: "Fix: Update dependency versions and resolve security issues",
            author: "Jane Smith",
            date: "2023-09-28T14:15:30Z",
            files: [
                {
                    filename: "package.json",
                    additions: 5,
                    deletions: 5,
                    changes: 10,
                    patch: "@@ -15,7 +15,7 @@\n-    \"lodash\": \"^4.17.15\",\n+    \"lodash\": \"^4.17.21\","
                }
            ],
            stats: {
                additions: 5,
                deletions: 5,
                total: 10
            },
            patch: "@@ -15,7 +15,7 @@\n-    \"lodash\": \"^4.17.15\",\n+    \"lodash\": \"^4.17.21\",",
            fetched_at: new Date("2023-09-28T14:15:30Z")
        }
    ] as CommitDiff[];

    async connect(): Promise<void> {
        // Mock successful connection
        console.log("Mock: Connected to MongoDB");
    }

    db(dbName: string): IDatabase {
        return {
            collection: (collectionName: string) => ({
                deleteMany: async (filter: any) => {
                    // Mock successful deletion
                    const deletedCount = this.storedCommits.length
                    this.storedCommits = [];
                    console.log(`Mock: Deleted documents with filter:`, filter);
                    return {deletedCount};
                },
                insertMany: async (docs: any[]) => {
                    // Mock successful insertion and store the commits for verification
                    this.storedCommits = [...this.storedCommits, ...docs];
                    console.log(`Mock: Inserted ${docs.length} documents`);
                    return {insertedCount: docs.length};
                },
                find: (params: { repository: string; })=> {
                    return {
                        toArray: () => {
                            return this.storedCommits;
                        }
                    } as unknown as FindCursor;
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