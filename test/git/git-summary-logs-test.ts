import { describe, it } from 'mocha';
import { assert } from 'chai';
import { getSummaryLogs } from '../../src/git/tools/git-summary-logs';
import { TestableMongoClient } from './MongoClientStubs/testable-mongo-client';

describe('git-summary-logs', () => {
    it('when getSummaryLogs is called with valid repository and date range returns summary logs', async () => {
        // Arrange
        const mockMongoClient = new TestableMongoClient();
        mockMongoClient.setMockSummaries([
            {
                sha: "commit123",
                original_message: "Add new feature",
                summary: "Implemented user authentication with JWT tokens",
                author: "John Doe",
                date: new Date('2024-10-02').toISOString(),
                repository: "CodeItQuick/blackjack-ensemble-blue"
            },
            {
                sha: "commit456",
                original_message: "Fix bug in payment processing",
                summary: "Fixed null pointer exception in payment handler",
                author: "Jane Smith",
                date: new Date('2024-10-03').toISOString(),
                repository: "CodeItQuick/blackjack-ensemble-blue"
            }
        ]);
        const fileInput = {
            repository: 'CodeItQuick/blackjack-ensemble-blue',
            start_date: '2024-10-01',
            end_date: '2024-10-05'
        };

        // Act
        const result = await getSummaryLogs(fileInput, mockMongoClient);

        // Assert
        assert.property(result, 'content', 'Result should have content property');
        assert.isArray(result.content, 'Content should be an array');
        assert.equal(result.content.length, 1, 'Content should have exactly one item');
        assert.equal(result.content[0].type, 'text', 'Content type should be text');
        assert.include(result.content[0].text, 'Summary notes for repository "CodeItQuick/blackjack-ensemble-blue"', 'Should show the repository name');
        assert.include(result.content[0].text, 'commit123', 'Should show first commit SHA');
        assert.include(result.content[0].text, 'commit456', 'Should show second commit SHA');
        assert.include(result.content[0].text, 'Add new feature', 'Should show first commit message');
        assert.include(result.content[0].text, 'Implemented user authentication with JWT tokens', 'Should show first commit summary');
        assert.include(result.content[0].text, 'Fix bug in payment processing', 'Should show second commit message');
        assert.include(result.content[0].text, 'Fixed null pointer exception in payment handler', 'Should show second commit summary');
        assert.include(result.content[0].text, 'John Doe', 'Should show first author');
        assert.include(result.content[0].text, 'Jane Smith', 'Should show second author');
        assert.include(result.content[0].text, '#Commit Summary #1', 'Should show commit summary numbering');
        assert.include(result.content[0].text, '#Commit Summary #2', 'Should show second commit summary numbering');
    });

    it('when getSummaryLogs is called with undefined repository returns error message', async () => {
        // Arrange
        const mockMongoClient = new TestableMongoClient();
        const fileInput = undefined;

        // Act
        const result = await getSummaryLogs(fileInput, mockMongoClient);

        // Assert
        assert.property(result, 'content', 'Result should have content property');
        assert.isArray(result.content, 'Content should be an array');
        assert.equal(result.content.length, 1, 'Content should have exactly one item');
        assert.equal(result.content[0].type, 'text', 'Content type should be text');
        assert.include(result.content[0].text, 'Error retrieving repository context from undefined', 'Should show error message for undefined repository');
        assert.isTrue(result.isError, 'Result should be marked as error');
    });

    it('when getSummaryLogs is called with date range that has no summaries returns empty summary logs', async () => {
        // Arrange
        const mockMongoClient = new TestableMongoClient();
        mockMongoClient.setMockSummaries([]);
        const fileInput = {
            repository: 'CodeItQuick/blackjack-ensemble-blue',
            start_date: '2024-10-01',
            end_date: '2024-10-05'
        };

        // Act
        const result = await getSummaryLogs(fileInput, mockMongoClient);

        // Assert
        assert.property(result, 'content', 'Result should have content property');
        assert.isArray(result.content, 'Content should be an array');
        assert.equal(result.content.length, 1, 'Content should have exactly one item');
        assert.equal(result.content[0].type, 'text', 'Content type should be text');
        assert.include(result.content[0].text, 'Summary notes for repository "CodeItQuick/blackjack-ensemble-blue"', 'Should show the repository name');
        assert.notInclude(result.content[0].text, '#Commit Summary #1', 'Should not show any commit summaries');
    });

    it('when getSummaryLogs is called with summaries outside date range returns only summaries in range', async () => {
        // Arrange
        const mockMongoClient = new TestableMongoClient();
        mockMongoClient.setMockSummaries([
            {
                sha: "commit123",
                original_message: "Add new feature",
                summary: "Implemented user authentication",
                author: "John Doe",
                date: new Date('2024-10-02').toISOString(),
                repository: "CodeItQuick/blackjack-ensemble-blue"
            }
            // commit456 from Sept 30 should be filtered out by date range
        ]);
        const fileInput = {
            repository: 'CodeItQuick/blackjack-ensemble-blue',
            start_date: '2024-10-01',
            end_date: '2024-10-05'
        };

        // Act
        const result = await getSummaryLogs(fileInput, mockMongoClient);

        // Assert
        assert.property(result, 'content', 'Result should have content property');
        assert.isArray(result.content, 'Content should be an array');
        assert.equal(result.content.length, 1, 'Content should have exactly one item');
        assert.equal(result.content[0].type, 'text', 'Content type should be text');
        assert.include(result.content[0].text, 'commit123', 'Should show commit in date range');
        assert.include(result.content[0].text, '#Commit Summary #1', 'Should show exactly one commit summary');
        assert.notInclude(result.content[0].text, '#Commit Summary #2', 'Should not show second commit summary');
    });

    it('when getSummaryLogs is called and MongoDB throws error returns error message', async () => {
        // Arrange
        const mockMongoClient = new TestableMongoClient();
        // Override the db method to throw an error
        mockMongoClient.db = () => {
            throw new Error('MongoDB connection failed');
        };
        const fileInput = {
            repository: 'CodeItQuick/blackjack-ensemble-blue',
            start_date: '2024-10-01',
            end_date: '2024-10-05'
        };

        // Act
        const result = await getSummaryLogs(fileInput, mockMongoClient);

        // Assert
        assert.property(result, 'content', 'Result should have content property');
        assert.isArray(result.content, 'Content should be an array');
        assert.equal(result.content.length, 1, 'Content should have exactly one item');
        assert.equal(result.content[0].type, 'text', 'Content type should be text');
        assert.include(result.content[0].text, 'Error retrieving commit patches from MongoDB', 'Should show error message');
        assert.include(result.content[0].text, 'MongoDB connection failed', 'Should include the error details');
        assert.isTrue(result.isError, 'Result should be marked as error');
    });

    it('when getSummaryLogs is called with multiple summaries returns them sorted by date descending', async () => {
        // Arrange
        const mockMongoClient = new TestableMongoClient();
        mockMongoClient.setMockSummaries([
            {
                sha: "commit789",
                original_message: "Latest commit",
                summary: "Most recent changes",
                author: "Alice",
                date: new Date('2024-10-04').toISOString(),
                repository: "CodeItQuick/blackjack-ensemble-blue"
            },
            {
                sha: "commit456",
                original_message: "Middle commit",
                summary: "Middle changes",
                author: "Bob",
                date: new Date('2024-10-03').toISOString(),
                repository: "CodeItQuick/blackjack-ensemble-blue"
            },
            {
                sha: "commit123",
                original_message: "Oldest commit",
                summary: "Initial changes",
                author: "Charlie",
                date: new Date('2024-10-02').toISOString(),
                repository: "CodeItQuick/blackjack-ensemble-blue"
            }
        ]);
        const fileInput = {
            repository: 'CodeItQuick/blackjack-ensemble-blue',
            start_date: '2024-10-01',
            end_date: '2024-10-05'
        };

        // Act
        const result = await getSummaryLogs(fileInput, mockMongoClient);

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
        assert.isTrue(commit456Index < commit123Index, 'Middle commit should appear before oldest commit');
    });
});
