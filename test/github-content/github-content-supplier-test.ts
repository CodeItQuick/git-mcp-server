import { describe, it } from 'mocha';
import { assert } from 'chai';
import { GithubContentSupplier } from "../../src/batch-processing/single-repository/github-content/github-content-supplier";
import { OctoKitContentSupplierZero } from "./GitHubContentSupplierStubs/stubZeroContent";
import { OctoKitContentSupplierTwo } from "./GitHubContentSupplierStubs/stubTwoContent";
import { OctoKitContentSupplierMany } from "./GitHubContentSupplierStubs/stubManyContent";
import { OctoKitContentSupplierRateLimit } from "./GitHubContentSupplierStubs/stubRateLimitError";

describe('GithubContentSupplier', () => {
    it('when GithubContentSupplier is injected with a OctoKitContentSupplierZero returns zero content items', async () => {
        // Arrange
        const supplier = new GithubContentSupplier('fake-token', 0, OctoKitContentSupplierZero);

        // Act
        const content = await supplier.fetchRepositoryContent('owner/repo');

        // Assert
        assert.equal(content.length, 0, 'Should return exactly 0 content items');
        assert.isArray(content, 'Should return an array');
        assert.isEmpty(content, 'Array should be empty');
    });

    it('when GithubContentSupplier is injected with a OctoKitContentSupplierTwo returns two content items', async () => {
        // Arrange
        const supplier = new GithubContentSupplier('fake-token', 0, OctoKitContentSupplierTwo);

        // Act
        const content = await supplier.fetchRepositoryContent('owner/repo');

        // Assert
        assert.equal(content.length, 2, 'Should return exactly 2 content items');
        assert.equal(content[0].name, 'README.md', 'First content item name should match');
        assert.equal(content[0].path, 'README.md', 'First content item path should match');
        assert.equal(content[0].type, 'file', 'First content item type should be file');
        assert.equal(content[0].sha, 'abc123def456789', 'First content item SHA should match');

        assert.equal(content[1].name, 'package.json', 'Second content item name should match');
        assert.equal(content[1].path, 'package.json', 'Second content item path should match');
        assert.equal(content[1].type, 'file', 'Second content item type should be file');
        assert.equal(content[1].sha, 'def789ghi012345', 'Second content item SHA should match');
    });

    it('when GithubContentSupplier is injected with a OctoKitContentSupplierMany returns five content items', async () => {
        // Arrange
        const supplier = new GithubContentSupplier('fake-token', 0, OctoKitContentSupplierMany);

        // Act
        const content = await supplier.fetchRepositoryContent('owner/repo');

        // Assert
        assert.equal(content.length, 5, 'Should return exactly 5 content items');
        assert.isArray(content, 'Should return an array');

        assert.include(content[0].sha, 'content1sha', 'First content item SHA should contain content1sha');
        assert.equal(content[0].name, 'file1.ts', 'First content item name should match');
        assert.equal(content[0].path, 'src/file1.ts', 'First content item path should match');

        assert.include(content[4].sha, 'content5sha', 'Fifth content item SHA should contain content5sha');
        assert.equal(content[4].name, 'file5.ts', 'Fifth content item name should match');
        assert.equal(content[4].path, 'src/file5.ts', 'Fifth content item path should match');

        // Verify all content items have required properties
        content.forEach((item, index) => {
            assert.property(item, 'name', `Content item ${index + 1} should have name property`);
            assert.property(item, 'path', `Content item ${index + 1} should have path property`);
            assert.property(item, 'sha', `Content item ${index + 1} should have sha property`);
            assert.property(item, 'type', `Content item ${index + 1} should have type property`);
            assert.property(item, 'url', `Content item ${index + 1} should have url property`);
            assert.property(item, 'html_url', `Content item ${index + 1} should have html_url property`);
            assert.property(item, 'repository', `Content item ${index + 1} should have repository property`);
            assert.property(item, 'fetched_at', `Content item ${index + 1} should have fetched_at property`);
        });
    });

    it('when GithubContentSupplier is injected with OctoKitContentSupplierRateLimit throws rate limit error', async () => {
        // Arrange
        const supplier = new GithubContentSupplier('fake-token', 100, OctoKitContentSupplierRateLimit);

        // Act & Assert
        try {
            await supplier.fetchRepositoryContent('owner/repo');
            assert.fail('Expected fetchRepositoryContent to throw a rate limit error');
        } catch (error: any) {
            // Verify it's the expected rate limit error
            assert.include(error.message, 'API rate limit exceeded', 'Error message should mention rate limit');
        }
    });

    it('when GithubContentSupplier is called with invalid repository format throws error', async () => {
        // Arrange
        const supplier = new GithubContentSupplier('fake-token', 0, OctoKitContentSupplierTwo);

        // Act & Assert
        try {
            await supplier.fetchRepositoryContent('invalid-format');
            assert.fail('Expected fetchRepositoryContent to throw an error for invalid repository format');
        } catch (error: any) {
            assert.include(error.message, 'Invalid repository format', 'Error message should mention invalid format');
        }
    });
});
