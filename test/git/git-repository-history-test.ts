import { describe, it } from 'mocha';
import { assert } from 'chai';
import { getRepositoryHistory } from '../../src/git/tools/git-repository-history';
import { TestableCommitDiffsMongoClient } from './MongoClientStubs/testable-commit-diffs-mongo-client';

describe('git-repository-history', () => {
    it('when getRepositoryHistory is called with valid username and since_date returns repository history', async () => {
        // Arrange
        const mockMongoClient = new TestableCommitDiffsMongoClient();
        mockMongoClient.setMockCommitDiffs([
            {
                sha: "commit1",
                commit_message: "Add feature A",
                author: "CodeItQuick",
                date: new Date('2024-10-01').toISOString(),
                repository: "CodeItQuick/repo1",
                files: [{ filename: "file1.ts" }],
                stats: { additions: 10, deletions: 2, total: 12 }
            },
            {
                sha: "commit2",
                commit_message: "Fix bug B",
                author: "CodeItQuick",
                date: new Date('2024-10-02').toISOString(),
                repository: "CodeItQuick/repo1",
                files: [{ filename: "file2.ts" }],
                stats: { additions: 5, deletions: 3, total: 8 }
            },
            {
                sha: "commit3",
                commit_message: "Update docs",
                author: "CodeItQuick",
                date: new Date('2024-10-03').toISOString(),
                repository: "CodeItQuick/repo2",
                files: [{ filename: "README.md" }],
                stats: { additions: 20, deletions: 1, total: 21 }
            }
        ]);
        const userQuery = {
            username: 'CodeItQuick' as const,
            since_date: '2024-10-01'
        };

        // Act
        const result = await getRepositoryHistory(userQuery, mockMongoClient);

        // Assert
        assert.property(result, 'content', 'Result should have content property');
        assert.isArray(result.content, 'Content should be an array');
        assert.equal(result.content.length, 1, 'Content should have exactly one item');
        assert.equal(result.content[0].type, 'text', 'Content type should be text');
        assert.include(result.content[0].text, 'Repository History for \'CodeItQuick\'', 'Should show username in header');
        assert.include(result.content[0].text, '2024-10-01', 'Should show the date');
        assert.include(result.content[0].text, '2 active repositories', 'Should show repository count');
        assert.include(result.content[0].text, '3 commits', 'Should show total commit count');
        assert.include(result.content[0].text, 'CodeItQuick/repo1', 'Should show first repository');
        assert.include(result.content[0].text, 'CodeItQuick/repo2', 'Should show second repository');
        assert.include(result.content[0].text, '+15/-5', 'Should show stats for first repo commits');
        assert.include(result.content[0].text, '+20/-1', 'Should show stats for second repo');
    });

    it('when getRepositoryHistory is called with undefined input returns error message', async () => {
        // Arrange
        const mockMongoClient = new TestableCommitDiffsMongoClient();
        const userQuery = undefined;

        // Act
        const result = await getRepositoryHistory(userQuery, mockMongoClient);

        // Assert
        assert.property(result, 'content', 'Result should have content property');
        assert.isArray(result.content, 'Content should be an array');
        assert.equal(result.content.length, 1, 'Content should have exactly one item');
        assert.equal(result.content[0].type, 'text', 'Content type should be text');
        assert.include(result.content[0].text, 'Error: exact_date parameter is required', 'Should show error message for undefined input');
        assert.include(result.content[0].text, 'YYYY-MM-DD', 'Should show expected date format');
    });

    it('when getRepositoryHistory is called with missing since_date returns error message', async () => {
        // Arrange
        const mockMongoClient = new TestableCommitDiffsMongoClient();
        const userQuery = {
            username: 'CodeItQuick' as const,
            since_date: ''
        };

        // Act
        const result = await getRepositoryHistory(userQuery, mockMongoClient);

        // Assert
        assert.property(result, 'content', 'Result should have content property');
        assert.isArray(result.content, 'Content should be an array');
        assert.equal(result.content.length, 1, 'Content should have exactly one item');
        assert.equal(result.content[0].type, 'text', 'Content type should be text');
        assert.include(result.content[0].text, 'Error: exact_date parameter is required', 'Should show error message for missing date');
    });

    it('when getRepositoryHistory is called with invalid date format returns error message', async () => {
        // Arrange
        const mockMongoClient = new TestableCommitDiffsMongoClient();
        const userQuery = {
            username: 'CodeItQuick' as const,
            since_date: 'invalid-date'
        };

        // Act
        const result = await getRepositoryHistory(userQuery, mockMongoClient);

        // Assert
        assert.property(result, 'content', 'Result should have content property');
        assert.isArray(result.content, 'Content should be an array');
        assert.equal(result.content.length, 1, 'Content should have exactly one item');
        assert.equal(result.content[0].type, 'text', 'Content type should be text');
        assert.include(result.content[0].text, 'Error: Invalid date format', 'Should show error message for invalid date');
        assert.include(result.content[0].text, 'YYYY-MM-DD', 'Should show expected date format');
        assert.isTrue(result.isError, 'Result should be marked as error');
    });

    it('when getRepositoryHistory is called with date that has no commits returns no commits message', async () => {
        // Arrange
        const mockMongoClient = new TestableCommitDiffsMongoClient();
        mockMongoClient.setMockCommitDiffs([]);
        const userQuery = {
            username: 'CodeItQuick' as const,
            since_date: '2024-10-01'
        };

        // Act
        const result = await getRepositoryHistory(userQuery, mockMongoClient);

        // Assert
        assert.property(result, 'content', 'Result should have content property');
        assert.isArray(result.content, 'Content should be an array');
        assert.equal(result.content.length, 1, 'Content should have exactly one item');
        assert.equal(result.content[0].type, 'text', 'Content type should be text');
        assert.include(result.content[0].text, 'No commits found for user \'CodeItQuick\'', 'Should show no commits message');
        assert.include(result.content[0].text, '2024-10-01', 'Should show the date');
    });

    it('when getRepositoryHistory is called with commits that have no repository field returns no repositories message', async () => {
        // Arrange
        const mockMongoClient = new TestableCommitDiffsMongoClient();
        mockMongoClient.setMockCommitDiffs([
            {
                sha: "commit1",
                commit_message: "Add feature",
                author: "CodeItQuick",
                date: new Date('2024-10-01').toISOString(),
                repository: undefined as any,
                files: [{ filename: "file1.ts" }],
                stats: { additions: 10, deletions: 2, total: 12 }
            }
        ]);
        const userQuery = {
            username: 'CodeItQuick' as const,
            since_date: '2024-10-01'
        };

        // Act
        const result = await getRepositoryHistory(userQuery, mockMongoClient);

        // Assert
        assert.property(result, 'content', 'Result should have content property');
        assert.isArray(result.content, 'Content should be an array');
        assert.equal(result.content.length, 1, 'Content should have exactly one item');
        assert.equal(result.content[0].type, 'text', 'Content type should be text');
        assert.include(result.content[0].text, 'No repositories found', 'Should show no repositories message');
        assert.include(result.content[0].text, 'found 1 commits but no repository information', 'Should explain why no repositories');
    });

    it('when getRepositoryHistory is called and MongoDB throws error returns error message', async () => {
        // Arrange
        const mockMongoClient = new TestableCommitDiffsMongoClient();
        // Override the db method to throw an error
        mockMongoClient.db = () => {
            throw new Error('MongoDB connection failed');
        };
        const userQuery = {
            username: 'CodeItQuick' as const,
            since_date: '2024-10-01'
        };

        // Act
        const result = await getRepositoryHistory(userQuery, mockMongoClient);

        // Assert
        assert.property(result, 'content', 'Result should have content property');
        assert.isArray(result.content, 'Content should be an array');
        assert.equal(result.content.length, 1, 'Content should have exactly one item');
        assert.equal(result.content[0].type, 'text', 'Content type should be text');
        assert.include(result.content[0].text, 'Error retrieving repository history', 'Should show error message');
        assert.include(result.content[0].text, 'MongoDB connection failed', 'Should include the error details');
        assert.isTrue(result.isError, 'Result should be marked as error');
    });
});

