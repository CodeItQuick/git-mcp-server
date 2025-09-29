import { describe, it } from 'mocha';
import { assert } from 'chai';
import { fetchAndStoreCommits } from "../../src/batch-processing/github-commit/github-retrieval";
import { OctoKitListCommitterTwo } from "./GitHubCommitRetrieverStubs/stubTwoCommits";
import { GitHubCommitRetriever } from "../../src/batch-processing/github-commit/github-commit-retriever";
import { IDatabase, IDeleteInsertMany, MongoDBCommitStorage } from "../../src/batch-processing/github-commit/mongodb-commit-storage";
import { CommitDataStorage } from "../../src/batch-processing/commit-data-adapter";

// Mock storage that simulates successful storage
class TestableDeleteInsertMany implements IDeleteInsertMany {
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
                    return { deletedCount: 1 };
                },
                insertMany: async (docs: any[]) => {
                    // Mock successful insertion and store the commits for verification
                    this.storedCommits = [...docs];
                    console.log(`Mock: Inserted ${docs.length} documents`);
                    return { insertedCount: docs.length };
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

describe('github-retrieval', () => {
    it('when fetchAndStoreCommits is called with valid repository and mocked dependencies returns success message', async () => {
        // Arrange
        const mockRetriever = new GitHubCommitRetriever('fake-token', 0, OctoKitListCommitterTwo);
        const mockMongoClient = new TestableDeleteInsertMany();
        const mongoDbCommitStorage = new MongoDBCommitStorage(mockMongoClient);

        // Act
        const result = await fetchAndStoreCommits(
            'CodeItQuick/blackjack-ensemble-blue',
            mockRetriever,
            mongoDbCommitStorage
        );

        // Assert
        assert.property(result, 'content', 'Result should have content property');
        assert.isArray(result.content, 'Content should be an array');
        assert.equal(result.content.length, 1, 'Content should have exactly one item');
        assert.equal(result.content[0].type, 'text', 'Content type should be text');
        assert.include(result.content[0].text, 'Stored 2 commits', 'Should mention storing 2 commits');
        assert.include(result.content[0].text, 'CodeItQuick/blackjack-ensemble-blue', 'Should mention the repository name');
        assert.include(result.content[0].text, 'MongoDB', 'Should mention MongoDB storage');
        assert.include(result.content[0].text, '1 pages', 'Should mention 1 page for 2 commits');

        // Verify that commits were actually stored in the mock
        const storedCommits = mockMongoClient.getStoredCommits();
        assert.equal(storedCommits.length, 2, 'Should have stored 2 commits in mock database');
        assert.equal(storedCommits[0].repository, 'CodeItQuick/blackjack-ensemble-blue', 'First commit should have correct repository');
        assert.equal(storedCommits[1].repository, 'CodeItQuick/blackjack-ensemble-blue', 'Second commit should have correct repository');
        assert.property(storedCommits[0], 'fetched_at', 'First commit should have fetched_at timestamp');
        assert.property(storedCommits[1], 'fetched_at', 'Second commit should have fetched_at timestamp');
    });
});
