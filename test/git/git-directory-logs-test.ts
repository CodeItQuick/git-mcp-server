import { describe, it } from 'mocha';
import { assert } from 'chai';
import { getDirectoryLogs } from '../../src/git/git-directory-logs';
import { TestableDirectoryLogsMongo } from './MongoClientStubs/testable-directory-logs-mongo';

describe('git-directory-logs', () => {
    it('when getDirectoryLogs is called with valid directory and repository returns file listing', async () => {
        // Arrange
        const mockMongoClient = new TestableDirectoryLogsMongo();
        const dirInput = {
            directory: 'src',
            repository: 'CodeItQuick/blackjack-ensemble-blue' as const
        };

        // Act
        const result = await getDirectoryLogs(dirInput, mockMongoClient);

        // Assert
        assert.property(result, 'content', 'Result should have content property');
        assert.isArray(result.content, 'Content should be an array');
        assert.equal(result.content.length, 1, 'Content should have exactly one item');
        assert.equal(result.content[0].type, 'text', 'Content type should be text');
        assert.include(result.content[0].text, 'Directory: src', 'Should show the directory name');
        assert.include(result.content[0].text, 'Repository: CodeItQuick/blackjack-ensemble-blue', 'Should show the repository name');
        assert.include(result.content[0].text, 'Files found: 2', 'Should show the number of files found');
        assert.include(result.content[0].text, '#1(file_sha: abc123): index.ts', 'Should list the first file');
        assert.include(result.content[0].text, '#2(file_sha: def456): utils.ts', 'Should list the second file');
    });

    it('when getDirectoryLogs is called with undefined repository returns error message', async () => {
        // Arrange
        const mockMongoClient = new TestableDirectoryLogsMongo();
        const dirInput = undefined;

        // Act
        const result = await getDirectoryLogs(dirInput, mockMongoClient);

        // Assert
        assert.property(result, 'content', 'Result should have content property');
        assert.isArray(result.content, 'Content should be an array');
        assert.equal(result.content.length, 1, 'Content should have exactly one item');
        assert.equal(result.content[0].type, 'text', 'Content type should be text');
        assert.include(result.content[0].text, 'Error retrieving repository context from undefined', 'Should show error message for undefined repository');
    });

    it('when getDirectoryLogs is called with empty directory returns root directory files', async () => {
        // Arrange
        const mockMongoClient = new TestableDirectoryLogsMongo();
        mockMongoClient.setMockFiles([
            {
                path: "README.md",
                type: "file",
                repository: "CodeItQuick/blackjack-ensemble-blue",
                sha: "root123",
                name: "README.md"
            }
        ]);

        const dirInput = {
            directory: '',
            repository: 'CodeItQuick/blackjack-ensemble-blue' as const
        };

        // Act
        const result = await getDirectoryLogs(dirInput, mockMongoClient);

        // Assert
        assert.property(result, 'content', 'Result should have content property');
        assert.include(result.content[0].text, 'Directory: root', 'Should show root directory when empty string provided');
        assert.include(result.content[0].text, 'Files found: 1', 'Should find root level files');
        assert.include(result.content[0].text, '#1(file_sha: root123): README.md', 'Should list root level file');
    });
});
