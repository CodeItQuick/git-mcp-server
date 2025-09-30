import { describe, it } from 'mocha';
import { assert } from 'chai';
import { getPatchLogs } from '../../src/git/git-patch-logs';
import { TestableMongoClient } from './MongoClientStubs/testable-mongo-client';

describe('git-patch-logs', () => {
    it('when getPatchLogs is called with valid filename and repository returns patch logs', async () => {
        // Arrange
        const mockMongoClient = new TestableMongoClient();
        const fileInput = {
            filename: 'src/index.ts',
            repository: 'CodeItQuick/blackjack-ensemble-blue' as const
        };

        // Act
        const result = await getPatchLogs(fileInput, mockMongoClient);

        // Assert
        assert.property(result, 'content', 'Result should have content property');
        assert.isArray(result.content, 'Content should be an array');
        assert.equal(result.content.length, 1, 'Content should have exactly one item');
        assert.equal(result.content[0].type, 'text', 'Content type should be text');
        assert.include(result.content[0].text, 'Patch notes for file "src/index.ts":', 'Should show the filename');
        assert.include(result.content[0].text, '#1 (commit_sha: commit123): Add new feature by John Doe', 'Should show the commit info');
        assert.include(result.content[0].text, 'src/index.ts, src/utils.ts', 'Should show all files changed in the commit');
        assert.include(result.content[0].text, 'src/index.ts(modified)(file_sha: file123)(+5-2):', 'Should show file status and changes');
        assert.include(result.content[0].text, 'console.log(\'New feature added\');', 'Should show the patch content');
    });

    it('when getPatchLogs is called with undefined repository returns error message', async () => {
        // Arrange
        const mockMongoClient = new TestableMongoClient();
        const fileInput = undefined;

        // Act
        const result = await getPatchLogs(fileInput, mockMongoClient);

        // Assert
        assert.property(result, 'content', 'Result should have content property');
        assert.isArray(result.content, 'Content should be an array');
        assert.equal(result.content.length, 1, 'Content should have exactly one item');
        assert.equal(result.content[0].type, 'text', 'Content type should be text');
        assert.include(result.content[0].text, 'Error retrieving repository context from undefined', 'Should show error message for undefined repository');
    });

    it('when getPatchLogs is called with missing filename throws error', async () => {
        // Arrange
        const mockMongoClient = new TestableMongoClient();
        const fileInput = {
            filename: '',
            repository: 'CodeItQuick/blackjack-ensemble-blue' as const
        };

        const result = await getPatchLogs(fileInput, mockMongoClient);

        assert.equal(result.content[0].text, "Error retrieving filename context from undefined")
    });

    it('when getPatchLogs is called with file that has no commits returns empty patch logs', async () => {
        // Arrange
        const mockMongoClient = new TestableMongoClient();
        const fileInput = {
            filename: 'non-existent-file.ts',
            repository: 'CodeItQuick/blackjack-ensemble-blue' as const
        };

        // Act
        const result = await getPatchLogs(fileInput, mockMongoClient);

        // Assert
        assert.property(result, 'content', 'Result should have content property');
        assert.isArray(result.content, 'Content should be an array');
        assert.equal(result.content.length, 1, 'Content should have exactly one item');
        assert.equal(result.content[0].type, 'text', 'Content type should be text');
        assert.include(result.content[0].text, 'Patch notes for file "non-existent-file.ts":', 'Should show the filename');
        assert.notInclude(result.content[0].text, 'commit123', 'Should not show any commits for non-existent file');
    });

    it('when getPatchLogs is called with file that exists in multiple commits returns all patches', async () => {
        // Arrange
        const mockMongoClient = new TestableMongoClient();
        // Add a commit that also modifies src/index.ts
        const additionalCommits = [
            {
                sha: "commit789",
                commit_message: "Refactor index file",
                author: "Bob Wilson",
                date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
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
            // Include the original commit
            {
                sha: "commit123",
                commit_message: "Add new feature",
                author: "John Doe",
                date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
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
            }
        ];
        mockMongoClient.setMockCommits(additionalCommits);

        const fileInput = {
            filename: 'src/index.ts',
            repository: 'CodeItQuick/blackjack-ensemble-blue' as const
        };

        // Act
        const result = await getPatchLogs(fileInput, mockMongoClient);

        // Assert
        assert.property(result, 'content', 'Result should have content property');
        assert.isArray(result.content, 'Content should be an array');
        assert.equal(result.content.length, 1, 'Content should have exactly one item');
        assert.equal(result.content[0].type, 'text', 'Content type should be text');
        assert.include(result.content[0].text, 'Patch notes for file "src/index.ts":', 'Should show the filename');
        assert.include(result.content[0].text, '#1 (commit_sha: commit789): Refactor index file by Bob Wilson', 'Should show the first commit (most recent)');
        assert.include(result.content[0].text, '#2 (commit_sha: commit123): Add new feature by John Doe', 'Should show the second commit');
        assert.include(result.content[0].text, 'src/index.ts(modified)(file_sha: file789)(+2-1):', 'Should show first commit file changes');
        assert.include(result.content[0].text, 'src/index.ts(modified)(file_sha: file123)(+5-2):', 'Should show second commit file changes');
        assert.include(result.content[0].text, '// Refactored code', 'Should show patch content from first commit');
        assert.include(result.content[0].text, 'console.log(\'New feature added\');', 'Should show patch content from second commit');
    });
});
