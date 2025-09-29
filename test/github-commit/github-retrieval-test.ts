import {describe, it} from 'mocha';
import {assert} from 'chai';
import {fetchAndStoreCommits} from "../../src/batch-processing/github-commit/fetch-and-store-commits";
import {OctoKitListCommitterTwo} from "./GitHubCommitRetrieverStubs/stubTwoCommits";
import {GithubCommitSupplier} from "../../src/batch-processing/github-commit/github-commit-supplier";
import {MongoDBCommitStorage} from "../../src/batch-processing/github-commit/mongodb-commit-storage";
import {TestableDeleteInsertMany} from "./MongoClientStubs/testable-delete-insert-many";

describe('github-retrieval', () => {
    it('when fetchAndStoreCommits is called with valid repository and mocked dependencies returns success message', async () => {
        // Arrange
        const mockRetriever = new GithubCommitSupplier('fake-token', 0, OctoKitListCommitterTwo);
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
