import {describe, it} from 'mocha';
import {assert} from 'chai';
import {GitHubCommitRetriever} from "../../src/batch-processing/github-commit/github-commit-retriever";
import {OctoKitListCommitter} from "./stubTwoCommits";
import {OctoKitListCommitterZero} from "./stubZeroCommits";

describe('GitHubCommitRetriever', () => {
    it('when GithubCommitRetriever is injected with a OctoKitListCommitterZero returns zero commits', async () => {
        // Arrange
        const retriever = new GitHubCommitRetriever('fake-token', 100, OctoKitListCommitterZero);

        // Act
        const commits = await retriever.fetchCommits('owner/repo');

        // Assert
        assert.equal(commits.length, 0, 'Should return exactly 0 commits');
        assert.isArray(commits, 'Should return an array');
        assert.isEmpty(commits, 'Array should be empty');
    });

    it('when GithubCommitRetriever is injected with a OctoKitListCommitter returns two commits', async () => {
        // Arrange
        const retriever = new GitHubCommitRetriever('fake-token', 100, OctoKitListCommitter);

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
});
