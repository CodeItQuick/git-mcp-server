import { describe, it } from 'mocha';
import { assert } from 'chai';
import { getUserHistory } from '../../src/git/tools/git-user-history';
import { TestableMongoClient } from './MongoClientStubs/testable-mongo-client';

describe('git-user-history', () => {
    it('when getUserHistory is called with valid username and start_date returns user history', async () => {
        // Arrange
        const mockMongoClient = new TestableMongoClient();
        mockMongoClient.setMockSummaries([
            {
                sha: "commit123",
                commit_message: "Add new feature",
                author: "CodeItQuick",
                date: new Date('2024-10-01T10:00:00Z').toISOString(),
                repository: "CodeItQuick/repo1",
                files: [
                    { filename: "src/index.ts" },
                    { filename: "src/utils.ts" }
                ],
                stats: { additions: 15, deletions: 3, total: 18 }
            },
            {
                sha: "commit456",
                commit_message: "Fix bug in payment",
                author: "CodeItQuick",
                date: new Date('2024-10-01T14:30:00Z').toISOString(),
                repository: "CodeItQuick/repo2",
                files: [
                    { filename: "src/payment.ts" }
                ],
                stats: { additions: 5, deletions: 2, total: 7 }
            }
        ]);
        const userQuery = {
            username: 'CodeItQuick' as const,
            start_date: '2024-10-01',
            end_date: '2024-10-02'
        };

        // Act
        const result = await getUserHistory(userQuery, mockMongoClient);

        // Assert
        assert.property(result, 'content', 'Result should have content property');
        assert.isArray(result.content, 'Content should be an array');
        assert.equal(result.content.length, 1, 'Content should have exactly one item');
        assert.equal(result.content[0].type, 'text', 'Content type should be text');
        assert.include(result.content[0].text, 'User History for \'CodeItQuick\'', 'Should show username in header');
        assert.include(result.content[0].text, '2024-10-01', 'Should show the date');
        assert.include(result.content[0].text, 'Found 2 commits', 'Should show commit count');
        assert.include(result.content[0].text, 'commit123', 'Should show first commit SHA');
        assert.include(result.content[0].text, 'commit456', 'Should show second commit SHA');
        assert.include(result.content[0].text, 'Add new feature', 'Should show first commit message');
        assert.include(result.content[0].text, 'Fix bug in payment', 'Should show second commit message');
        assert.include(result.content[0].text, 'Repository: CodeItQuick/repo1', 'Should show first repository');
        assert.include(result.content[0].text, 'Repository: CodeItQuick/repo2', 'Should show second repository');
        assert.include(result.content[0].text, 'Files Changed: src/index.ts, src/utils.ts', 'Should show files changed in first commit');
        assert.include(result.content[0].text, 'Files Changed: src/payment.ts', 'Should show files changed in second commit');
        assert.include(result.content[0].text, 'Stats: +15/-3 (~18 lines)', 'Should show first commit stats');
        assert.include(result.content[0].text, 'Stats: +5/-2 (~7 lines)', 'Should show second commit stats');
    });

    it('when getUserHistory is called with undefined input returns error message', async () => {
        // Arrange
        const mockMongoClient = new TestableMongoClient();
        const userQuery = undefined;

        // Act
        const result = await getUserHistory(userQuery, mockMongoClient);

        // Assert
        assert.property(result, 'content', 'Result should have content property');
        assert.isArray(result.content, 'Content should be an array');
        assert.equal(result.content.length, 1, 'Content should have exactly one item');
        assert.equal(result.content[0].type, 'text', 'Content type should be text');
        assert.include(result.content[0].text, 'Error: since_date parameter is required', 'Should show error message for undefined input');
        assert.include(result.content[0].text, 'YYYY-MM-DD', 'Should show expected date format');
        assert.isTrue(result.isError, 'Result should be marked as error');
    });

    it('when getUserHistory is called with missing start_date returns error message', async () => {
        // Arrange
        const mockMongoClient = new TestableMongoClient();
        const userQuery = {
            username: 'CodeItQuick' as const,
            start_date: '',
            end_date: '2024-10-02'
        };

        // Act
        const result = await getUserHistory(userQuery, mockMongoClient);

        // Assert
        assert.property(result, 'content', 'Result should have content property');
        assert.isArray(result.content, 'Content should be an array');
        assert.equal(result.content.length, 1, 'Content should have exactly one item');
        assert.equal(result.content[0].type, 'text', 'Content type should be text');
        assert.include(result.content[0].text, 'Error: since_date parameter is required', 'Should show error message for missing date');
        assert.isTrue(result.isError, 'Result should be marked as error');
    });

    it('when getUserHistory is called with invalid date format returns error message', async () => {
        // Arrange
        const mockMongoClient = new TestableMongoClient();
        const userQuery = {
            username: 'CodeItQuick' as const,
            start_date: 'invalid-date',
            end_date: '2024-10-02'
        };

        // Act
        const result = await getUserHistory(userQuery, mockMongoClient);

        // Assert
        assert.property(result, 'content', 'Result should have content property');
        assert.isArray(result.content, 'Content should be an array');
        assert.equal(result.content.length, 1, 'Content should have exactly one item');
        assert.equal(result.content[0].type, 'text', 'Content type should be text');
        assert.include(result.content[0].text, 'Error: Invalid date format', 'Should show error message for invalid date');
        assert.include(result.content[0].text, 'YYYY-MM-DD', 'Should show expected date format');
        assert.isTrue(result.isError, 'Result should be marked as error');
    });

    it('when getUserHistory is called with date that has no commits returns no commits message', async () => {
        // Arrange
        const mockMongoClient = new TestableMongoClient();
        mockMongoClient.setMockSummaries([]);
        const userQuery = {
            username: 'CodeItQuick' as const,
            start_date: '2024-10-01',
            end_date: '2024-10-02'
        };

        // Act
        const result = await getUserHistory(userQuery, mockMongoClient);

        // Assert
        assert.property(result, 'content', 'Result should have content property');
        assert.isArray(result.content, 'Content should be an array');
        assert.equal(result.content.length, 1, 'Content should have exactly one item');
        assert.equal(result.content[0].type, 'text', 'Content type should be text');
        assert.include(result.content[0].text, 'No commits found for user \'CodeItQuick\'', 'Should show no commits message');
    });

    it('when getUserHistory is called with commits that have no files returns no files indicator', async () => {
        // Arrange
        const mockMongoClient = new TestableMongoClient();
        mockMongoClient.setMockSummaries([
            {
                sha: "commit123",
                commit_message: "Empty commit",
                author: "CodeItQuick",
                date: new Date('2024-10-01T10:00:00Z').toISOString(),
                repository: "CodeItQuick/repo1",
                files: undefined as any,
                stats: { additions: 0, deletions: 0, total: 0 }
            }
        ]);
        const userQuery = {
            username: 'CodeItQuick' as const,
            start_date: '2024-10-01',
            end_date: '2024-10-02'
        };

        // Act
        const result = await getUserHistory(userQuery, mockMongoClient);

        // Assert
        assert.property(result, 'content', 'Result should have content property');
        assert.isArray(result.content, 'Content should be an array');
        assert.equal(result.content.length, 1, 'Content should have exactly one item');
        assert.equal(result.content[0].type, 'text', 'Content type should be text');
        assert.include(result.content[0].text, 'Files Changed: No files', 'Should show no files indicator');
        assert.include(result.content[0].text, 'Empty commit', 'Should show the commit message');
    });

    it('when getUserHistory is called with commits missing stats returns default stats', async () => {
        // Arrange
        const mockMongoClient = new TestableMongoClient();
        mockMongoClient.setMockSummaries([
            {
                sha: "commit123",
                commit_message: "Commit without stats",
                author: "CodeItQuick",
                date: new Date('2024-10-01T10:00:00Z').toISOString(),
                repository: "CodeItQuick/repo1",
                files: [{ filename: "src/test.ts" }],
                stats: undefined as any
            }
        ]);
        const userQuery = {
            username: 'CodeItQuick' as const,
            start_date: '2024-10-01',
            end_date: '2024-10-02'
        };

        // Act
        const result = await getUserHistory(userQuery, mockMongoClient);

        // Assert
        assert.property(result, 'content', 'Result should have content property');
        assert.isArray(result.content, 'Content should be an array');
        assert.equal(result.content.length, 1, 'Content should have exactly one item');
        assert.equal(result.content[0].type, 'text', 'Content type should be text');
        assert.include(result.content[0].text, 'Stats: +0/-0 (~0 lines)', 'Should show default stats of 0');
    });

    it('when getUserHistory is called and MongoDB throws error returns error message', async () => {
        // Arrange
        const mockMongoClient = new TestableMongoClient();
        // Override the db method to throw an error
        mockMongoClient.db = () => {
            throw new Error('MongoDB connection failed');
        };
        const userQuery = {
            username: 'CodeItQuick' as const,
            start_date: '2024-10-01',
            end_date: '2024-10-02'
        };

        // Act
        const result = await getUserHistory(userQuery, mockMongoClient);

        // Assert
        assert.property(result, 'content', 'Result should have content property');
        assert.isArray(result.content, 'Content should be an array');
        assert.equal(result.content.length, 1, 'Content should have exactly one item');
        assert.equal(result.content[0].type, 'text', 'Content type should be text');
        assert.include(result.content[0].text, 'Error retrieving user history', 'Should show error message');
        assert.include(result.content[0].text, 'MongoDB connection failed', 'Should include the error details');
    });

    it('when getUserHistory is called with multiple commits returns them sorted by date descending', async () => {
        // Arrange
        const mockMongoClient = new TestableMongoClient();
        mockMongoClient.setMockSummaries([
            {
                sha: "commit789",
                commit_message: "Latest commit",
                author: "CodeItQuick",
                date: new Date('2024-10-01T18:00:00Z').toISOString(),
                repository: "CodeItQuick/repo1",
                files: [{ filename: "src/latest.ts" }],
                stats: { additions: 10, deletions: 1, total: 11 }
            },
            {
                sha: "commit456",
                commit_message: "Middle commit",
                author: "CodeItQuick",
                date: new Date('2024-10-01T12:00:00Z').toISOString(),
                repository: "CodeItQuick/repo2",
                files: [{ filename: "src/middle.ts" }],
                stats: { additions: 5, deletions: 2, total: 7 }
            },
            {
                sha: "commit123",
                commit_message: "Earliest commit",
                author: "CodeItQuick",
                date: new Date('2024-10-01T08:00:00Z').toISOString(),
                repository: "CodeItQuick/repo1",
                files: [{ filename: "src/early.ts" }],
                stats: { additions: 3, deletions: 1, total: 4 }
            }
        ]);
        const userQuery = {
            username: 'CodeItQuick' as const,
            start_date: '2024-10-01',
            end_date: '2024-10-02'
        };

        // Act
        const result = await getUserHistory(userQuery, mockMongoClient);

        // Assert
        assert.property(result, 'content', 'Result should have content property');
        assert.isArray(result.content, 'Content should be an array');
        assert.equal(result.content.length, 1, 'Content should have exactly one item');
        assert.equal(result.content[0].type, 'text', 'Content type should be text');
        const text = result.content[0].text as string;

        // Check that commits appear in descending date order (most recent first)
        const commit789Index = text.indexOf('commit789');
        const commit456Index = text.indexOf('commit456');
        const commit123Index = text.indexOf('commit123');

        assert.isTrue(commit789Index < commit456Index, 'Latest commit should appear before middle commit');
        assert.isTrue(commit456Index < commit123Index, 'Middle commit should appear before earliest commit');
    });
});

