// filepath: c:\Users\evano\WebstormProjects\git-mcp-server\src\batch-processing\adapters\github-commit-diff-retriever.ts

import { Octokit } from "@octokit/rest";
import { CommitDiffRetriever, CommitDiff } from "../commit-data-adapter";

export class GitHubCommitDiffRetriever implements CommitDiffRetriever {
    private octokit: Octokit;
    private delayMs: number;

    constructor(githubToken: string, delayMs: number = 1200) {
        this.octokit = new Octokit({ auth: githubToken });
        this.delayMs = delayMs;
    }

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async fetchCommitDiff(sha: string, repository: string): Promise<CommitDiff | null> {
        const [owner, repoName] = repository.split("/");
        if (!owner || !repoName) {
            throw new Error(`Invalid repository format: ${repository}. Expected format: owner/repo`);
        }

        try {
            console.log(`Fetching diff for commit ${sha.substring(0, 7)}...`);

            const commitResponse = await this.octokit.repos.getCommit({
                owner,
                repo: repoName,
                ref: sha
            });

            const commitData = commitResponse.data;

            const commitDiff: CommitDiff = {
                sha: sha,
                repository: repository,
                commit_message: commitData.commit.message,
                author: commitData.commit.author?.name || "Unknown",
                date: commitData.commit.author?.date || "",
                files: commitData.files || [],
                stats: {
                    additions: commitData.stats?.additions || 0,
                    deletions: commitData.stats?.deletions || 0,
                    total: commitData.stats?.total || 0
                },
                patch: commitData.files?.map(file => file.patch).join('\n---\n') || "",
                fetched_at: new Date()
            };

            console.log(`Processed commit ${sha.substring(0, 7)} - ${commitDiff.stats.additions}+ ${commitDiff.stats.deletions}- changes across ${commitDiff.files.length} files`);

            // Rate limiting
            await this.delay(this.delayMs);

            return commitDiff;

        } catch (error: any) {
            if (error.status === 403 && error.headers && error.headers['x-ratelimit-remaining'] === '0') {
                const resetTime = new Date(parseInt(error.headers['x-ratelimit-reset']) * 1000);
                const waitTime = resetTime.getTime() - Date.now() + 1000;
                console.log(`Rate limit exceeded. Waiting until ${resetTime.toISOString()}...`);
                await this.delay(waitTime);
                // Retry the request
                return this.fetchCommitDiff(sha, repository);
            } else if (error.status === 404) {
                console.warn(`Commit ${sha.substring(0, 7)} not found (possibly deleted or inaccessible)`);
                return null;
            }
            throw error;
        }
    }
}
