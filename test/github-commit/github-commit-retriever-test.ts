import {describe, it} from 'mocha';
import {assert} from 'chai';
import {GithubCommitSupplier} from "../../src/batch-processing/github-commit/github-commit-supplier";
import {OctoKitListCommitterTwo} from "./GitHubCommitRetrieverStubs/stubTwoCommits";
import {OctoKitListCommitterZero} from "./GitHubCommitRetrieverStubs/stubZeroCommits";
import {OctoKitListCommitterMany} from "./GitHubCommitRetrieverStubs/stubManyCommits";
import {OctoKitListCommitterRateLimit} from "./GitHubCommitRetrieverStubs/stubRateLimitError";

describe('GitHubCommitRetriever', () => {
    it('when GithubCommitRetriever is injected with a OctoKitListCommitterZero returns zero commits', async () => {
        // Arrange
        const retriever = new GithubCommitSupplier('fake-token', 0, OctoKitListCommitterZero);

        // Act
        const commits = await retriever.fetchCommits('owner/repo');

        // Assert
        assert.equal(commits.length, 0, 'Should return exactly 0 commits');
        assert.isArray(commits, 'Should return an array');
        assert.isEmpty(commits, 'Array should be empty');
    });
    it('when GithubCommitRetriever is injected with a OctoKitListCommitter returns two commits', async () => {
        // Arrange
        const retriever = new GithubCommitSupplier('fake-token', 0, OctoKitListCommitterTwo);

        // Act
        const commits = await retriever.fetchCommits('owner/repo');

        // Assert
        assert.equal(commits.length, 2, 'Should return exactly 2 commits');
        assert.equal(commits[0].sha, 'abc123def456789', 'First commit SHA should match');
        assert.equal(commits[0].commit.message, 'Initial commit - Add basic project structure', 'First commit message should match');
        assert.equal(commits[0].commit.author.name, 'John Developer', 'First commit author should match');

        assert.equal(commits[1].sha, 'def789ghi012345', 'Second commit SHA should match');
        assert.equal(commits[1].commit.message, 'Fix: Update dependency versions and resolve security issues', 'Second commit message should match');
        assert.equal(commits[1].commit.author.name, 'Jane Smith', 'Second commit author should match');
    });
    it('when GithubCommitRetriever is injected with a OctoKitListCommitterMany returns five commits', async () => {
        const retriever = new GithubCommitSupplier('fake-token', 0, OctoKitListCommitterMany);

        const commits = await retriever.fetchCommits('owner/repo');

        assert.equal(commits.length, 5, 'Should return exactly 5 commits');
        assert.isArray(commits, 'Should return an array');

        assert.include(commits[0].sha, 'commit1sha', 'First commit SHA should contain commit1sha');
        assert.equal(commits[0].commit.message, 'Commit 1: Feature implementation and bug fixes', 'First commit message should match');
        assert.equal(commits[0].commit.author.name, 'Developer 1', 'First commit author should match');

        assert.include(commits[4].sha, 'commit5sha', 'Fifth commit SHA should contain commit5sha');
        assert.equal(commits[4].commit.message, 'Commit 5: Feature implementation and bug fixes', 'Fifth commit message should match');
        assert.equal(commits[4].commit.author.name, 'Developer 5', 'Fifth commit author should match');

        commits.forEach((commit, index) => {
            assert.property(commit, 'sha', `Commit ${index + 1} should have sha property`);
            assert.property(commit, 'commit', `Commit ${index + 1} should have commit property`);
            assert.property(commit, 'html_url', `Commit ${index + 1} should have html_url property`);
            assert.property(commit.commit, 'author', `Commit ${index + 1} should have author`);
            assert.property(commit.commit, 'committer', `Commit ${index + 1} should have committer`);
        });
    });
    it('when GithubCommitRetriever is injected with OctoKitListCommitterRateLimit throws rate limit error', async () => {
        const retriever = new GithubCommitSupplier('fake-token', 5, OctoKitListCommitterRateLimit);

        try {
            await retriever.fetchCommits('owner/repo');
            assert.fail('Expected fetchCommits to throw a rate limit error');
        } catch (error: any) {
            assert.include(error.message, 'API rate limit exceeded', 'Error message should mention rate limit');
        }
    });
});
