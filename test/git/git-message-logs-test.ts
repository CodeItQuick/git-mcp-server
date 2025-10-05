import { describe, it } from 'mocha';
import { assert } from 'chai';
import { getCommitMessageLogs } from '../../src/git/tools/git-message-logs';
import {TestableCommitDiffsMongoClient} from "./MongoClientStubs/testable-commit-diffs-mongo-client";

describe('git-message-logs', () => {
    it('returns commit message logs for valid input', async () => {
        // Arrange
        const mockMongoClient = new TestableCommitDiffsMongoClient();
        // Mock commit diffs in the DB
        mockMongoClient.setMockCommitDiffs([
            {
                sha: 'sha1',
                commit_message: 'Initial commit',
                author: 'Alice',
                date: new Date().toISOString(),
                repository: 'repo1',
                files: [{ filename: 'file1.ts' }]
            },
            {
                sha: 'sha2',
                commit_message: 'Add feature',
                author: 'Bob',
                date: new Date().toISOString(),
                repository: 'repo1',
                files: [{ filename: 'file2.ts' }]
            }
        ]);
        const input = { number_days: 7, repository: 'repo1' };

        // Act
        const result = await getCommitMessageLogs(input, mockMongoClient);

        // Assert
        assert.property(result, 'content');
        assert.isArray(result.content);
        assert.equal(result.content[0].type, 'text');
        assert.include(result.content[0].text, 'The following commits have been made');
        assert.include(result.content[0].text, 'Initial commit');
        assert.include(result.content[0].text, 'Add feature');
    });

    it('returns error message for undefined input', async () => {
        // Arrange
        const mockMongoClient = new TestableCommitDiffsMongoClient();
        // No need to set mock data
        const input = undefined;

        // Act
        const result = await getCommitMessageLogs(input, mockMongoClient);

        // Assert
        assert.property(result, 'content');
        assert.isArray(result.content);
        assert.equal(result.content[0].type, 'text');
        assert.include(result.content[0].text, 'The following commits have been made');
    });
});

