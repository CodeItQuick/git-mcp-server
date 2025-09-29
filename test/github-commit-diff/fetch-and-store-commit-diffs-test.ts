import { describe, it } from 'mocha';
import { assert } from 'chai';
import { fetchAndStoreCommitDiffs } from "../../src/batch-processing/github-commit-diff/fetch-and-store-commit-diffs";
import { OctoKitCommitDiffSupplierOne } from "./GitHubCommitDiffSupplierStubs/stubOneCommitDiff";
import { GithubCommitDiffSupplier } from "../../src/batch-processing/github-commit-diff/github-commit-diff-supplier";
import { MongoDBCommitDiffStorage } from "../../src/batch-processing/github-commit-diff/mongodb-commit-diff-storage";
import {TestableDeleteInsertMany} from "./MongoClientStubs/testable-delete-insert-many";


describe('fetch-and-store-commit-diffs', () => {
    it('when fetchAndStoreCommitDiffs is called with valid repository and mocked dependencies returns success message', async () => {
        // Arrange
        const mockCommitDiffRetriever = new GithubCommitDiffSupplier('fake-token', 0,
            OctoKitCommitDiffSupplierOne);
        const mockMongoClient = new TestableDeleteInsertMany();
        const mongoDBCommitDiffStorage = new MongoDBCommitDiffStorage(
            "mongodb://localhost:27017/",
            "github_data",
            "commit_diffs",
            50,
            mockMongoClient
        );

        // Act
        const result = await fetchAndStoreCommitDiffs(
            'CodeItQuick/blackjack-ensemble-blue',
            mockCommitDiffRetriever,
            mongoDBCommitDiffStorage
        );

        // Assert
        assert.property(result, 'content', 'Result should have content property');
        assert.isArray(result.content, 'Content should be an array');
        assert.equal(result.content.length, 1, 'Content should have exactly one item');
        assert.equal(result.content[0].type, 'text', 'Content type should be text');
        assert.include(result.content[0].text, 'Stored 2 commit diffs', 'Should mention storing 2 commit diffs');
        assert.include(result.content[0].text, 'CodeItQuick/blackjack-ensemble-blue', 'Should mention the repository name');
        assert.include(result.content[0].text, 'MongoDB', 'Should mention MongoDB storage');
        assert.include(result.content[0].text, 'Retrieved from 2 commits', 'Should mention retrieving from 2 commits');

        // Verify that commit diffs were actually stored in the mock
        const storedCommitDiffs = mockMongoClient.getStoredCommits();
        assert.equal(storedCommitDiffs.length, 2, 'Should have stored 2 commit diffs in mock database');
        assert.equal(storedCommitDiffs[0].repository, 'CodeItQuick/blackjack-ensemble-blue', 'First commit diff should have correct repository');
        assert.equal(storedCommitDiffs[1].repository, 'CodeItQuick/blackjack-ensemble-blue', 'Second commit diff should have correct repository');
        assert.property(storedCommitDiffs[0], 'fetched_at', 'First commit diff should have fetched_at timestamp');
        assert.property(storedCommitDiffs[1], 'fetched_at', 'Second commit diff should have fetched_at timestamp');
    });
});
