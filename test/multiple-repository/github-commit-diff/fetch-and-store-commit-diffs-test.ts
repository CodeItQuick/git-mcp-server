import { describe, it } from 'mocha';
import { assert } from 'chai';
import { fetchAndStoreMultipleRepositoryCommitDiffs } from "../../../src/batch-processing/multiple-repository/github-commit-diff/fetch-and-store-commit-diffs";
import {
    IGetCommitListForUser,
    MultipleRepositoryGithubCommitDiffSupplier
} from "../../../src/batch-processing/multiple-repository/github-commit-diff/github-commit-diff-supplier";
import { MultipleRepositoryMongoDBCommitDiffStorage } from "../../../src/batch-processing/multiple-repository/github-commit-diff/mongodb-commit-diff-storage";
import { TestableMultipleRepositoryDeleteInsertMany } from "./MongoClientStubs/testable-multiple-repository-delete-insert-many";
import {
    OctoKitMultipleRepositoryCommitDiffSupplier
} from "./GithubCommitDiffSupplierStubs/stubMultipleRepositoryCommitDiff";
import {Octokit} from "@octokit/rest";

describe('fetch-and-store-multiple-repository-commit-diffs', () => {
    it('when fetchAndStoreMultipleRepositoryCommitDiffs is called with valid date and mocked dependencies returns success message for multiple repositories', async () => {
        // Arrange
        const sinceDate = new Date('2024-09-01');
        const mockCommitDiffRetriever = new MultipleRepositoryGithubCommitDiffSupplier(
            'fake-token',
            'CodeItQuick',
            0, // No delay for testing
            OctoKitMultipleRepositoryCommitDiffSupplier as Octokit
        );
        const mockMongoClient = new TestableMultipleRepositoryDeleteInsertMany();
        const multipleRepositoryStorage = new MultipleRepositoryMongoDBCommitDiffStorage(mockMongoClient);

        // Act
        const result = await fetchAndStoreMultipleRepositoryCommitDiffs(
            sinceDate,
            mockCommitDiffRetriever,
            multipleRepositoryStorage,
            50 // batch size
        );

        // Assert
        assert.property(result, 'content', 'Result should have content property');
        assert.isArray(result.content, 'Content should be an array');
        assert.equal(result.content.length, 1, 'Content should have exactly one item');
        assert.equal(result.content[0].type, 'text', 'Content type should be text');

        const resultText = result.content[0].text;
        assert.include(resultText, 'Successfully processed 2 repositories', 'Should mention processing 2 repositories');
        assert.include(resultText, 'CodeItQuick/CodeItQuick.github.io', 'Should mention the blog repository');
        assert.include(resultText, 'CodeItQuick/blackjack-ensemble-blue', 'Should mention the blackjack repository');
        assert.include(resultText, 'Total commit diffs stored: 3', 'Should mention storing 3 commit diffs total');
        assert.include(resultText, 'Aug 31 2024', 'Should mention the start date');

        // Verify that commit diffs were actually stored in the mock
        const storedCommitDiffs = mockMongoClient.getStoredCommitDiffs();
        assert.equal(storedCommitDiffs.length, 3, 'Should have stored 3 commit diffs in mock database');

        // Check that we have diffs from both repositories
        const blogRepoDiffs = storedCommitDiffs.filter(diff => diff.repository === 'CodeItQuick/CodeItQuick.github.io');
        const blackjackRepoDiffs = storedCommitDiffs.filter(diff => diff.repository === 'CodeItQuick/blackjack-ensemble-blue');

        assert.equal(blogRepoDiffs.length, 2, 'Should have 2 commit diffs from blog repository');
        assert.equal(blackjackRepoDiffs.length, 1, 'Should have 1 commit diff from blackjack repository');

        // Verify metadata
        storedCommitDiffs.forEach(diff => {
            assert.property(diff, 'stored_at', 'Each commit diff should have stored_at timestamp');
            assert.property(diff, 'repository', 'Each commit diff should have repository field');
            assert.oneOf(diff.repository, [
                'CodeItQuick/CodeItQuick.github.io',
                'CodeItQuick/blackjack-ensemble-blue'
            ], 'Repository should be one of the expected values');
        });
    });

    it('when fetchAndStoreMultipleRepositoryCommitDiffs is called with no repositories found returns appropriate message', async () => {
        // Arrange
        const sinceDate = new Date('2024-09-01');
        const emptyOctokit = {
            repos: {
                listForUser: () => Promise.resolve({ data: [] }),
                getCommit: () => Promise.resolve({ data: {} })
            }
        } as unknown as IGetCommitListForUser;
        const mockCommitDiffRetriever = new MultipleRepositoryGithubCommitDiffSupplier(
            'fake-token',
            'CodeItQuick',
            0,
            emptyOctokit
        );
        const mockMongoClient = new TestableMultipleRepositoryDeleteInsertMany();
        const multipleRepositoryStorage = new MultipleRepositoryMongoDBCommitDiffStorage(mockMongoClient);

        // Act
        const result = await fetchAndStoreMultipleRepositoryCommitDiffs(
            sinceDate,
            mockCommitDiffRetriever,
            multipleRepositoryStorage
        );

        // Assert
        assert.property(result, 'content', 'Result should have content property');
        assert.isArray(result.content, 'Content should be an array');
        assert.equal(result.content.length, 1, 'Content should have exactly one item');
        assert.equal(result.content[0].type, 'text', 'Content type should be text');
        assert.include(result.content[0].text, 'No repositories found for CodeItQuick user', 'Should mention no repositories found');
    });

    it('when fetchAndStoreMultipleRepositoryCommitDiffs is called with repositories but no commits in date range returns appropriate message', async () => {
        // Arrange
        const sinceDate = new Date('2024-09-01');
        const mockCommitDiffRetriever = new MultipleRepositoryGithubCommitDiffSupplier(
            'fake-token',
            'CodeItQuick',
            0,
            OctoKitMultipleRepositoryCommitDiffSupplier
        );

        // Create mock that returns no commits for the date range
        const noCommitsMongoClient = new TestableMultipleRepositoryDeleteInsertMany();
        noCommitsMongoClient.db().collection = () => ({
            find: () => ({ toArray: () => Promise.resolve([]) }),
            insertMany: () => Promise.resolve({ insertedCount: 0 }),
            deleteMany: () => Promise.resolve({ deletedCount: 0 })
        });

        const multipleRepositoryStorage = new MultipleRepositoryMongoDBCommitDiffStorage(noCommitsMongoClient);

        // Act
        const result = await fetchAndStoreMultipleRepositoryCommitDiffs(
            sinceDate,
            mockCommitDiffRetriever,
            multipleRepositoryStorage
        );

        // Assert
        assert.property(result, 'content', 'Result should have content property');
        assert.isArray(result.content, 'Content should be an array');
        assert.equal(result.content.length, 1, 'Content should have exactly one item');
        assert.equal(result.content[0].type, 'text', 'Content type should be text');

        const resultText = result.content[0].text;
        assert.include(resultText, 'Successfully processed 0 repositories', 'Should mention processing 0 repositories');
        assert.include(resultText, 'Total commit diffs stored: 0', 'Should mention storing 0 commit diffs');
    });

    it('when fetchAndStoreMultipleRepositoryCommitDiffs handles errors gracefully and continues processing other repositories', async () => {
        // Arrange
        const sinceDate = new Date('2024-09-01');
        const errorOctokit = {
            repos: {
                listForUser: () => Promise.resolve({
                    data: [
                        { full_name: "CodeItQuick/CodeItQuick.github.io", fork: false },
                        { full_name: "CodeItQuick/blackjack-ensemble-blue", fork: false }
                    ]
                }),
                getCommit: (params: any) => {
                    if (params.ref === 'commit1sha') {
                        throw new Error('API Error for commit1sha');
                    }
                    return Promise.resolve({
                        data: {
                            sha: params.ref,
                            commit: {
                                message: "Test commit",
                                author: { name: "Test Author", date: "2024-10-01T10:00:00Z" }
                            },
                            files: [],
                            stats: { additions: 0, deletions: 0, total: 0 }
                        }
                    });
                }
            }
        } as unknown as IGetCommitListForUser;

        const mockCommitDiffRetriever = new MultipleRepositoryGithubCommitDiffSupplier(
            'fake-token',
            'CodeItQuick',
            0,
            errorOctokit
        );
        const mockMongoClient = new TestableMultipleRepositoryDeleteInsertMany();
        const multipleRepositoryStorage = new MultipleRepositoryMongoDBCommitDiffStorage(mockMongoClient);

        // Act
        const result = await fetchAndStoreMultipleRepositoryCommitDiffs(
            sinceDate,
            mockCommitDiffRetriever,
            multipleRepositoryStorage
        );

        // Assert - Should still process successfully despite individual commit errors
        assert.property(result, 'content', 'Result should have content property');
        assert.isArray(result.content, 'Content should be an array');
        assert.equal(result.content.length, 1, 'Content should have exactly one item');
        assert.equal(result.content[0].type, 'text', 'Content type should be text');

        const resultText = result.content[0].text;
        assert.include(resultText, 'Successfully processed', 'Should mention successful processing despite errors');
    });

    it('when fetchAndStoreMultipleRepositoryCommitDiffs filters out forked repositories correctly', async () => {
        // Arrange
        const sinceDate = new Date('2024-09-01');
        const mockCommitDiffRetriever = new MultipleRepositoryGithubCommitDiffSupplier(
            'fake-token',
            'CodeItQuick',
            0,
            OctoKitMultipleRepositoryCommitDiffSupplier // This stub includes a forked repo
        );
        const mockMongoClient = new TestableMultipleRepositoryDeleteInsertMany();
        const multipleRepositoryStorage = new MultipleRepositoryMongoDBCommitDiffStorage(mockMongoClient);

        // Act
        const result = await fetchAndStoreMultipleRepositoryCommitDiffs(
            sinceDate,
            mockCommitDiffRetriever,
            multipleRepositoryStorage
        );

        // Assert
        const storedCommitDiffs = mockMongoClient.getStoredCommitDiffs();

        // Should not include any commit diffs from forked repositories
        const forkedRepoDiffs = storedCommitDiffs.filter(diff =>
            diff.repository === 'CodeItQuick/forked-repo'
        );
        assert.equal(forkedRepoDiffs.length, 0, 'Should not store commit diffs from forked repositories');

        // Should only include diffs from non-forked repositories
        storedCommitDiffs.forEach(diff => {
            assert.oneOf(diff.repository, [
                'CodeItQuick/CodeItQuick.github.io',
                'CodeItQuick/blackjack-ensemble-blue'
            ], 'Should only include commit diffs from non-forked repositories');
        });
    });
});
