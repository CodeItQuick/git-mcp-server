import { describe, it } from 'mocha';
import { assert } from 'chai';
import { getCommitMessageLogs } from '../../src/git/tools/git-message-logs';
import { TestableMongoClient } from './MongoClientStubs/testable-mongo-client';

describe('git-message-logs', () => {
    it('when getCommitMessageLogs is called with valid days and repository returns commit logs', async () => {
        // Arrange
        const mockMongoClient = new TestableMongoClient();
        const daysInput = {
            number_days: 7,
            repository: 'CodeItQuick/blackjack-ensemble-blue' as const
        };

        // Act
        const result = await getCommitMessageLogs(daysInput, mockMongoClient);

        // Assert
        assert.property(result, 'content', 'Result should have content property');
        assert.isArray(result.content, 'Content should be an array');
        assert.equal(result.content.length, 1, 'Content should have exactly one item');
        assert.equal(result.content[0].type, 'text', 'Content type should be text');
        assert.include(result.content[0].text, 'The following commits have been made in the past 7 days:', 'Should show the time period');
        assert.include(result.content[0].text, '#1(commit123): Add new feature - John Doe', 'Should show the first commit');
        assert.include(result.content[0].text, 'src/index.ts, src/utils.ts', 'Should show the files from first commit');
        assert.include(result.content[0].text, '#2(commit456): Fix bug in authentication - Jane Smith', 'Should show the second commit');
        assert.include(result.content[0].text, 'src/auth.ts', 'Should show the files from second commit');
    });

    it('when getCommitMessageLogs is called with undefined repository returns empty result', async () => {
        // Arrange
        const mockMongoClient = new TestableMongoClient();
        const daysInput = undefined;

        // Act
        const result = await getCommitMessageLogs(daysInput, mockMongoClient);

        // Assert
        assert.property(result, 'content', 'Result should have content property');
        assert.isArray(result.content, 'Content should be an array');
        assert.equal(result.content.length, 1, 'Content should have exactly one item');
        assert.equal(result.content[0].type, 'text', 'Content type should be text');
        assert.include(result.content[0].text, 'The following commits have been made in the past 7 days:', 'Should use default 7 days');
        // Since repository is undefined, no commits should match
        assert.notInclude(result.content[0].text, 'commit123', 'Should not show commits when repository is undefined');
    });

    it('when getCommitMessageLogs is called with custom number of days returns commits for that period', async () => {
        // Arrange
        const mockMongoClient = new TestableMongoClient();
        const daysInput = {
            number_days: 2,
            repository: 'CodeItQuick/blackjack-ensemble-blue' as const
        };

        // Act
        const result = await getCommitMessageLogs(daysInput, mockMongoClient);

        // Assert
        assert.property(result, 'content', 'Result should have content property');
        assert.isArray(result.content, 'Content should be an array');
        assert.equal(result.content.length, 1, 'Content should have exactly one item');
        assert.equal(result.content[0].type, 'text', 'Content type should be text');
        assert.include(result.content[0].text, 'The following commits have been made in the past 2 days:', 'Should show the custom time period');
        assert.include(result.content[0].text, '#1(commit123): Add new feature - John Doe', 'Should show the recent commit (1 day ago)');
        // The commit from 3 days ago should not be included in 2-day period
        assert.notInclude(result.content[0].text, 'commit456', 'Should not show commits older than 2 days');
    });

    it('when getCommitMessageLogs is called with no commits in period returns empty message', async () => {
        // Arrange
        const mockMongoClient = new TestableMongoClient();
        // Set commits that are all older than the query period
        const oldCommits = [
            {
                sha: "oldcommit123",
                commit_message: "Very old commit",
                author: "Old Author",
                date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
                repository: "CodeItQuick/blackjack-ensemble-blue",
                files: [{ filename: "old-file.ts" }]
            }
        ];
        mockMongoClient.setMockCommits(oldCommits);

        const daysInput = {
            number_days: 7,
            repository: 'CodeItQuick/blackjack-ensemble-blue' as const
        };

        // Act
        const result = await getCommitMessageLogs(daysInput, mockMongoClient);

        // Assert
        assert.property(result, 'content', 'Result should have content property');
        assert.isArray(result.content, 'Content should be an array');
        assert.equal(result.content.length, 1, 'Content should have exactly one item');
        assert.equal(result.content[0].type, 'text', 'Content type should be text');
        assert.include(result.content[0].text, 'The following commits have been made in the past 7 days:', 'Should show the time period');
        assert.notInclude(result.content[0].text, 'oldcommit123', 'Should not show old commits outside the time period');
    });

    it('when getCommitMessageLogs is called with no number_days defaults to 7 days', async () => {
        // Arrange
        const mockMongoClient = new TestableMongoClient();
        const daysInput = {
            repository: 'CodeItQuick/blackjack-ensemble-blue' as const
        } as any; // Type assertion to allow missing number_days

        // Act
        const result = await getCommitMessageLogs(daysInput, mockMongoClient);

        // Assert
        assert.property(result, 'content', 'Result should have content property');
        assert.isArray(result.content, 'Content should be an array');
        assert.equal(result.content.length, 1, 'Content should have exactly one item');
        assert.equal(result.content[0].type, 'text', 'Content type should be text');
        assert.include(result.content[0].text, 'The following commits have been made in the past 7 days:', 'Should default to 7 days when number_days is missing');
    });
});
