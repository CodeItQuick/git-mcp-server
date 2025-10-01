import { describe, it } from 'mocha';
import { assert } from 'chai';
import { getFileHistory } from '../../src/git/git-file-history';
import { TestableMongoClient } from './MongoClientStubs/testable-mongo-client';

describe('git-file-history', () => {
    it('when getFileHistory is called with valid filename and repository returns complete file history', async () => {
        // Arrange
        const mockMongoClient = new TestableMongoClient();
        const fileInput = {
            filename: 'src/index.ts',
            repository: 'CodeItQuick/blackjack-ensemble-blue' as const
        };

        // Act
        const result = await getFileHistory(fileInput, mockMongoClient);

        // Assert
        assert.property(result, 'content', 'Result should have content property');
        assert.isArray(result.content, 'Content should be an array');
        assert.equal(result.content.length, 1, 'Content should have exactly one item');
        assert.equal(result.content[0].type, 'text', 'Content type should be text');
        assert.include(result.content[0].text, 'File History for "src/index.ts" in CodeItQuick/blackjack-ensemble-blue:', 'Should show the filename and repository');
        assert.include(result.content[0].text, '#1 Commit: commit123', 'Should show the commit number and SHA');
        assert.include(result.content[0].text, 'Author: John Doe', 'Should show the author');
        assert.include(result.content[0].text, 'Message: Add new feature', 'Should show the commit message');
        assert.include(result.content[0].text, 'All Files Changed: src/index.ts, src/utils.ts', 'Should show all files in the commit');
        assert.include(result.content[0].text, 'File: src/index.ts', 'Should show the specific file details');
        assert.include(result.content[0].text, 'Status: modified', 'Should show the file status');
        assert.include(result.content[0].text, 'Changes: +5 -2', 'Should show additions and deletions');
        assert.include(result.content[0].text, 'Patch Preview:', 'Should show patch preview section');
    });

    it('when getFileHistory is called with undefined repository returns error message', async () => {
        // Arrange
        const mockMongoClient = new TestableMongoClient();
        const fileInput = undefined;

        // Act
        const result = await getFileHistory(fileInput, mockMongoClient);

        // Assert
        assert.property(result, 'content', 'Result should have content property');
        assert.isArray(result.content, 'Content should be an array');
        assert.equal(result.content.length, 1, 'Content should have exactly one item');
        assert.equal(result.content[0].type, 'text', 'Content type should be text');
        assert.include(result.content[0].text, 'Error retrieving repository context from undefined', 'Should show error message for undefined repository');
    });

    it('when getFileHistory is called with missing filename returns error message', async () => {
        // Arrange
        const mockMongoClient = new TestableMongoClient();
        const fileInput = {
            filename: '',
            repository: 'CodeItQuick/blackjack-ensemble-blue' as const
        };

        // Act
        const result = await getFileHistory(fileInput, mockMongoClient);

        // Assert
        assert.property(result, 'content', 'Result should have content property');
        assert.isArray(result.content, 'Content should be an array');
        assert.equal(result.content.length, 1, 'Content should have exactly one item');
        assert.equal(result.content[0].type, 'text', 'Content type should be text');
        assert.include(result.content[0].text, 'Error: filename parameter is required', 'Should show error message for missing filename');
    });

    it('when getFileHistory is called with file that has no commits returns no history message', async () => {
        // Arrange
        const mockMongoClient = new TestableMongoClient();
        const fileInput = {
            filename: 'non-existent-file.ts',
            repository: 'CodeItQuick/blackjack-ensemble-blue' as const
        };

        // Act
        const result = await getFileHistory(fileInput, mockMongoClient);

        // Assert
        assert.property(result, 'content', 'Result should have content property');
        assert.isArray(result.content, 'Content should be an array');
        assert.equal(result.content.length, 1, 'Content should have exactly one item');
        assert.equal(result.content[0].type, 'text', 'Content type should be text');
        assert.include(result.content[0].text, 'No commit history found for file "non-existent-file.ts"', 'Should show no history message');
    });

    it('when getFileHistory is called with file that exists in multiple commits returns chronological history', async () => {
        // Arrange
        const mockMongoClient = new TestableMongoClient();
        // Add multiple commits that modify src/index.ts
        const multipleCommits = [
            {
                sha: "commit789",
                commit_message: "Refactor index file",
                author: "Bob Wilson",
                date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago (most recent)
                repository: "CodeItQuick/blackjack-ensemble-blue",
                files: [
                    {
                        filename: "src/index.ts",
                        status: "modified",
                        sha: "file789",
                        additions: 2,
                        deletions: 1,
                        patch: "@@ -5,3 +5,4 @@\n console.log('Hello World');\n+// Refactored code\n-// Old implementation"
                    }
                ]
            },
            {
                sha: "commit123",
                commit_message: "Add new feature",
                author: "John Doe",
                date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
                repository: "CodeItQuick/blackjack-ensemble-blue",
                files: [
                    {
                        filename: "src/index.ts",
                        status: "modified",
                        sha: "file123",
                        additions: 5,
                        deletions: 2,
                        patch: "@@ -1,3 +1,6 @@\n console.log('Hello World');\n+console.log('New feature added');\n+// Additional functionality\n-// Old comment"
                    }
                ]
            },
            {
                sha: "commit456",
                commit_message: "Initial file creation",
                author: "Alice Smith",
                date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago (oldest)
                repository: "CodeItQuick/blackjack-ensemble-blue",
                files: [
                    {
                        filename: "src/index.ts",
                        status: "added",
                        sha: "file456",
                        additions: 10,
                        deletions: 0,
                        patch: "@@ -0,0 +1,10 @@\n+console.log('Hello World');\n+// Initial implementation"
                    }
                ]
            }
        ];
        mockMongoClient.setMockCommits(multipleCommits);

        const fileInput = {
            filename: 'src/index.ts',
            repository: 'CodeItQuick/blackjack-ensemble-blue' as const
        };

        // Act
        const result = await getFileHistory(fileInput, mockMongoClient);

        // Assert
        assert.property(result, 'content', 'Result should have content property');
        assert.isArray(result.content, 'Content should be an array');
        assert.equal(result.content.length, 1, 'Content should have exactly one item');
        assert.equal(result.content[0].type, 'text', 'Content type should be text');
        assert.include(result.content[0].text, 'File History for "src/index.ts"', 'Should show the filename');
        assert.include(result.content[0].text, '#1 Commit: commit789', 'Should show the most recent commit first');
        assert.include(result.content[0].text, 'Author: Bob Wilson', 'Should show the most recent author');
        assert.include(result.content[0].text, '#2 Commit: commit123', 'Should show the second commit');
        assert.include(result.content[0].text, 'Author: John Doe', 'Should show the second author');
        assert.include(result.content[0].text, '#3 Commit: commit456', 'Should show the oldest commit last');
        assert.include(result.content[0].text, 'Author: Alice Smith', 'Should show the oldest author');
        assert.include(result.content[0].text, 'Status: added', 'Should show the initial file creation status');
        assert.include(result.content[0].text, '='.repeat(80), 'Should have separator lines between commits');
    });
});
