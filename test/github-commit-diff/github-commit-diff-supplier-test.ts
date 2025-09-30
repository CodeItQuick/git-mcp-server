import { describe, it } from 'mocha';
import { assert } from 'chai';
import { GithubCommitDiffSupplier } from "../../src/batch-processing/github-commit-diff/github-commit-diff-supplier";
import { OctoKitCommitDiffSupplierZero } from "./GitHubCommitDiffSupplierStubs/stubZeroCommitDiff";
import { OctoKitCommitDiffSupplierOne } from "./GitHubCommitDiffSupplierStubs/stubOneCommitDiff";
import { OctoKitCommitDiffSupplierMany } from "./GitHubCommitDiffSupplierStubs/stubManyCommitDiffs";
import { OctoKitCommitDiffSupplierRateLimit } from "./GitHubCommitDiffSupplierStubs/stubRateLimitError";

describe('GithubCommitDiffSupplier', () => {
    it('when GithubCommitDiffSupplier is injected with OctoKitCommitDiffSupplierZero returns commit diff with no changes', async () => {
        // Arrange
        const supplier = new GithubCommitDiffSupplier(0, OctoKitCommitDiffSupplierZero);

        // Act
        const commitDiff = await supplier.fetchCommitDiff('test-sha', 'owner/repo');

        // Assert
        assert.isNotNull(commitDiff, 'Should return a commit diff object');
        assert.equal(commitDiff!.sha, 'test-sha', 'SHA should match the requested SHA');
        assert.equal(commitDiff!.repository, 'owner/repo', 'Repository should match');
        assert.equal(commitDiff!.stats.total, 0, 'Should have 0 total changes');
        assert.equal(commitDiff!.files.length, 0, 'Should have no files changed');
        assert.property(commitDiff!, 'fetched_at', 'Should have fetched_at timestamp');
    });

    it('when GithubCommitDiffSupplier is injected with OctoKitCommitDiffSupplierOne returns single commit diff', async () => {
        // Arrange
        const supplier = new GithubCommitDiffSupplier(0, OctoKitCommitDiffSupplierOne);

        // Act
        const commitDiff = await supplier.fetchCommitDiff('abc123def456789', 'owner/repo');

        // Assert
        assert.isNotNull(commitDiff, 'Should return a commit diff object');
        assert.equal(commitDiff!.sha, 'abc123def456789', 'SHA should match');
        assert.equal(commitDiff!.commit_message, 'Add new feature with comprehensive tests', 'Commit message should match');
        assert.equal(commitDiff!.author, 'John Developer', 'Author should match');
        assert.equal(commitDiff!.stats.additions, 150, 'Should have 150 additions');
        assert.equal(commitDiff!.stats.deletions, 25, 'Should have 25 deletions');
        assert.equal(commitDiff!.stats.total, 175, 'Should have 175 total changes');
        assert.equal(commitDiff!.files.length, 2, 'Should have 2 files changed');
        assert.include(commitDiff!.patch, 'export class NewFeature', 'Patch should contain feature code');
    });

    it('when GithubCommitDiffSupplier is injected with OctoKitCommitDiffSupplierMany returns commit diff with multiple files', async () => {
        // Arrange
        const supplier = new GithubCommitDiffSupplier(0, OctoKitCommitDiffSupplierMany);

        // Act
        const commitDiff = await supplier.fetchCommitDiff('commit1', 'owner/repo');

        // Assert
        assert.isNotNull(commitDiff, 'Should return a commit diff object');
        assert.equal(commitDiff!.sha, 'commit1', 'SHA should match');
        assert.include(commitDiff!.commit_message, 'Multiple file changes', 'Commit message should mention multiple files');
        assert.equal(commitDiff!.author, 'Developer 1', 'Author should match');
        assert.isAbove(commitDiff!.stats.total, 0, 'Should have changes');
        assert.isAbove(commitDiff!.files.length, 1, 'Should have multiple files');

        // Verify file structure
        commitDiff!.files.forEach((file, index) => {
            assert.property(file, 'filename', `File ${index} should have filename`);
            assert.property(file, 'additions', `File ${index} should have additions`);
            assert.property(file, 'deletions', `File ${index} should have deletions`);
            assert.property(file, 'patch', `File ${index} should have patch`);
        });
    });

    it('when GithubCommitDiffSupplier is injected with OctoKitCommitDiffSupplierRateLimit handles rate limit error gracefully', async () => {
        // Arrange
        const supplier = new GithubCommitDiffSupplier(0, OctoKitCommitDiffSupplierRateLimit);

        // Act & Assert
        try {
            await supplier.fetchCommitDiff('test-sha', 'owner/repo');
            assert.fail('Expected fetchCommitDiff to throw a rate limit error');
        } catch (error: any) {
            assert.include(error.message, 'API rate limit exceeded', 'Error message should mention rate limit');
        }
    });

    it('when GithubCommitDiffSupplier is called with invalid repository format throws error', async () => {
        // Arrange
        const supplier = new GithubCommitDiffSupplier(0, OctoKitCommitDiffSupplierOne);

        // Act & Assert
        try {
            await supplier.fetchCommitDiff('test-sha', 'invalid-format');
            assert.fail('Expected fetchCommitDiff to throw an error for invalid repository format');
        } catch (error: any) {
            assert.include(error.message, 'Invalid repository format', 'Error message should mention invalid format');
        }
    });
});
