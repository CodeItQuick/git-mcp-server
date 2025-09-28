"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mocha_1 = require("mocha");
const chai_1 = require("chai");
const github_commit_retriever_1 = require("../src/batch-processing/github-commit/github-commit-retriever");
const OctoKitListCommitter = {
    repos: {
        listCommits: (params) => {
            return Promise.resolve({
                data: [
                    {
                        sha: "abc123def456789",
                        commit: {
                            message: "Initial commit - Add basic project structure",
                            author: {
                                name: "John Developer",
                                email: "john.dev@example.com",
                                date: "2023-09-28T10:30:00Z"
                            },
                            committer: {
                                name: "John Developer",
                                email: "john.dev@example.com",
                                date: "2023-09-28T10:30:00Z"
                            }
                        },
                        author: {
                            login: "johndev",
                            id: 12345
                        },
                        committer: {
                            login: "johndev",
                            id: 12345
                        },
                        html_url: "https://github.com/owner/repo/commit/abc123def456789"
                    },
                    {
                        sha: "def789ghi012345",
                        commit: {
                            message: "Fix: Update dependency versions and resolve security issues",
                            author: {
                                name: "Jane Smith",
                                email: "jane.smith@example.com",
                                date: "2023-09-28T14:15:30Z"
                            },
                            committer: {
                                name: "Jane Smith",
                                email: "jane.smith@example.com",
                                date: "2023-09-28T14:15:30Z"
                            }
                        },
                        author: {
                            login: "janesmith",
                            id: 67890
                        },
                        committer: {
                            login: "janesmith",
                            id: 67890
                        },
                        html_url: "https://github.com/owner/repo/commit/def789ghi012345"
                    }
                ]
            });
        }
    }
};
(0, mocha_1.describe)('GitHubCommitRetriever', () => {
    (0, mocha_1.it)('when GithubCommitRetriever is injected with a OctoKitListCommitter returns two commits', async () => {
        // Arrange
        const retriever = new github_commit_retriever_1.GitHubCommitRetriever('fake-token', 100, OctoKitListCommitter);
        // Act
        const commits = await retriever.fetchCommits('owner/repo');
        // Assert
        chai_1.assert.equal(commits.length, 2, 'Should return exactly 2 commits');
        chai_1.assert.equal(commits[0].sha, 'abc123def456789', 'First commit SHA should match');
        chai_1.assert.equal(commits[0].commit.message, 'Initial commit - Add basic project structure', 'First commit message should match');
        chai_1.assert.equal(commits[0].commit.author.name, 'John Developer', 'First commit author should match');
        chai_1.assert.equal(commits[1].sha, 'def789ghi012345', 'Second commit SHA should match');
        chai_1.assert.equal(commits[1].commit.message, 'Fix: Update dependency versions and resolve security issues', 'Second commit message should match');
        chai_1.assert.equal(commits[1].commit.author.name, 'Jane Smith', 'Second commit author should match');
    });
});
