import { Octokit } from "@octokit/rest";
import { CommitDiffRetriever, CommitDiff } from "../commit-data-adapter";

export type IGetCommit = Pick<Octokit, 'repos'> & {
    repos: Pick<Octokit['repos'], 'getCommit'>;
};

export type IListRepos = Pick<Octokit, 'repos'> & {
    repos: Pick<Octokit['repos'], 'listForUser'>;
};

export class MultipleRepositoryGithubCommitDiffSupplier implements CommitDiffRetriever {
    private octokit: IGetCommit & IListRepos;
    private delayMs: number;
    private username: string;

    constructor(githubToken: string, username: string = "CodeItQuick", delayMs: number = 1300, octokit?: IGetCommit & IListRepos) {
        this.octokit = octokit || new Octokit({ auth: githubToken });
        this.delayMs = delayMs;
        this.username = username;
    }

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async fetchRepositories(): Promise<string[]> {
        try {
            console.log(`Fetching repositories for user: ${this.username}...`);

            let allRepos: string[] = [];
            let page = 1;
            let hasNextPage = true;

            while (hasNextPage) {
                const reposResponse = await this.octokit.repos.listForUser({
                    username: this.username,
                    per_page: 100,
                    page: page,
                    type: 'all'
                });

                const pagedRepos = reposResponse.data;
                const repos = reposResponse.data
                    .filter(repo => !repo.fork) // Exclude forked repositories
                    .map(repo => repo.full_name);

                allRepos = allRepos.concat(repos);

                console.log(`Fetched ${repos.length} repositories from page ${page}. Total so far: ${allRepos.length}`);

                hasNextPage = pagedRepos.length === 100;
                page++;

                await this.delay(this.delayMs);
            }

            console.log(`Found ${allRepos.length} total repositories for ${this.username}`);
            return allRepos;

        } catch (error) {
            console.error(`Error fetching repositories for ${this.username}:`, error);
            throw error;
        }
    }

    async fetchCommitDiff(sha: string, repository: string): Promise<CommitDiff | null> {
        const [owner, repoName] = repository.split("/");
        if (!owner || !repoName) {
            throw new Error(`Invalid repository format: ${repository}. Expected format: owner/repo`);
        }

        try {
            console.log(`Fetching diff for commit ${sha.substring(0, 7)} from ${repository}...`);

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
                patch: commitData.files?.map(file => file.patch).join('\n\n') || "",
                fetched_at: new Date()
            };

            // Rate limiting delay
            await this.delay(this.delayMs);

            return commitDiff;

        } catch (error: any) {
            if (error.status === 404) {
                console.warn(`Commit ${sha} not found in ${repository}`);
                return null;
            }

            console.error(`Error fetching commit diff for ${sha} in ${repository}:`, error);
            throw error;
        }
    }
}
