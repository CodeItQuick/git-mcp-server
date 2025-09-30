import { describe, it } from 'mocha';
import { assert } from 'chai';
import { getFileContent } from '../../src/git/git-file-content';
import { TestableMongoClient } from './MongoClientStubs/testable-mongo-client';

describe('git-file-content', () => {
    it('when getFileContent is called with valid filename and repository returns file content', async () => {
        // Arrange
        const mockMongoClient = new TestableMongoClient();
        const fileInput = {
            filename: 'src/index.ts',
            repository: 'CodeItQuick/blackjack-ensemble-blue' as const
        };

        // Act
        const result = await getFileContent(fileInput, mockMongoClient);

        // Assert
        assert.property(result, 'content', 'Result should have content property');
        assert.isArray(result.content, 'Content should be an array');
        assert.equal(result.content.length, 1, 'Content should have exactly one item');
        assert.equal(result.content[0].type, 'text', 'Content type should be text');
        assert.include(result.content[0].text, 'File: src/index.ts', 'Should show the filename');
        assert.include(result.content[0].text, 'Repository: CodeItQuick/blackjack-ensemble-blue', 'Should show the repository name');
        assert.include(result.content[0].text, 'commit_sha: abc123', 'Should show the commit SHA');
        assert.include(result.content[0].text, "console.log('Hello World');", 'Should show the decoded file content');
    });

    it('when getFileContent is called with undefined repository returns error message', async () => {
        // Arrange
        const mockMongoClient = new TestableMongoClient();
        const fileInput = undefined;

        // Act
        const result = await getFileContent(fileInput, mockMongoClient);

        // Assert
        assert.property(result, 'content', 'Result should have content property');
        assert.isArray(result.content, 'Content should be an array');
        assert.equal(result.content.length, 1, 'Content should have exactly one item');
        assert.equal(result.content[0].type, 'text', 'Content type should be text');
        assert.include(result.content[0].text, 'Error retrieving repository context from undefined', 'Should show error message for undefined repository');
    });

    it('when getFileContent is called with missing filename returns error message', async () => {
        // Arrange
        const mockMongoClient = new TestableMongoClient();
        const fileInput = {
            filename: '',
            repository: 'CodeItQuick/blackjack-ensemble-blue' as const
        };

        // Act
        const result = await getFileContent(fileInput, mockMongoClient);

        // Assert
        assert.property(result, 'content', 'Result should have content property');
        assert.isArray(result.content, 'Content should be an array');
        assert.equal(result.content.length, 1, 'Content should have exactly one item');
        assert.equal(result.content[0].type, 'text', 'Content type should be text');
        assert.include(result.content[0].text, 'Error: filename parameter is required', 'Should show error message for missing filename');
    });

    it('when getFileContent is called with non-existent file returns file not found message', async () => {
        // Arrange
        const mockMongoClient = new TestableMongoClient();
        const fileInput = {
            filename: 'non-existent-file.ts',
            repository: 'CodeItQuick/blackjack-ensemble-blue' as const
        };

        // Act
        const result = await getFileContent(fileInput, mockMongoClient);

        // Assert
        assert.property(result, 'content', 'Result should have content property');
        assert.isArray(result.content, 'Content should be an array');
        assert.equal(result.content.length, 1, 'Content should have exactly one item');
        assert.equal(result.content[0].type, 'text', 'Content type should be text');
        assert.include(result.content[0].text, 'File "non-existent-file.ts" not found in the repository', 'Should show file not found message');
    });

    it('when getFileContent is called with file that has no content returns empty content', async () => {
        // Arrange
        const mockMongoClient = new TestableMongoClient();
        mockMongoClient.setMockFiles([
            {
                path: "empty-file.ts",
                type: "file",
                repository: "CodeItQuick/blackjack-ensemble-blue",
                sha: "empty123",
                name: "empty-file.ts",
                content: null
            }
        ]);
        const fileInput = {
            filename: 'empty-file.ts',
            repository: 'CodeItQuick/blackjack-ensemble-blue' as const
        };

        // Act
        const result = await getFileContent(fileInput, mockMongoClient);

        // Assert
        assert.property(result, 'content', 'Result should have content property');
        assert.isArray(result.content, 'Content should be an array');
        assert.equal(result.content.length, 1, 'Content should have exactly one item');
        assert.equal(result.content[0].type, 'text', 'Content type should be text');
        assert.include(result.content[0].text, 'File: empty-file.ts', 'Should show the filename');
        assert.include(result.content[0].text, 'Repository: CodeItQuick/blackjack-ensemble-blue', 'Should show the repository name');
        assert.include(result.content[0].text, 'commit_sha: empty123', 'Should show the commit SHA');
        assert.include(result.content[0].text, '--- Content ---\n', 'Should show empty content section');
    });
});
