import { Octokit } from "@octokit/rest";
import { CommitData, CommitDataRetriever } from "../../commit-data-adapter";

export type IGetCommitListForUser = Pick<Octokit, 'repos'> & {
    repos: Pick<Octokit['repos'], 'listCommits' | 'listForUser'>;
};

export class MultipleRepositoryGithubCommitSupplier implements CommitDataRetriever {
    private octokit: IGetCommitListForUser;
    private delayMs: number;
    private username: string;

    constructor(githubToken: string, username: string = "CodeItQuick", delayMs: number = 1200, octokit?: IGetCommitListForUser) {
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

                const repos = reposResponse.data
                    .filter(repo => !repo.fork) // Exclude forked repositories
                    .map(repo => repo.full_name);

                allRepos = allRepos.concat(repos);

                console.log(`Fetched ${repos.length} repositories from page ${page}. Total so far: ${allRepos.length}`);

                hasNextPage = repos.length === 100;
                page++;

                if (hasNextPage) {
                    await this.delay(this.delayMs);
                }
            }

            console.log(`Found ${allRepos.length} total repositories for ${this.username}`);
            return allRepos;

        } catch (error) {
            console.error(`Error fetching repositories for ${this.username}:`, error);
            throw error;
        }
    }

    async fetchCommits(repository: string, since?: Date, until?: Date): Promise<CommitData[]> {
        const [owner, repoName] = repository.split("/");
        if (!owner || !repoName) {
            throw new Error(`Invalid repository format: ${repository}. Expected format: owner/repo`);
        }

        let allCommits: CommitData[] = [];
        let page = 1;
        let hasNextPage = true;

        // Set default dates if not provided
        const sinceDate = since || new Date('2020-01-01');
        const untilDate = until || new Date();

        console.log(`Fetching commits from ${repository} between ${sinceDate.toISOString()} and ${untilDate.toISOString()}...`);

        let attemptNum = 0;
        while (hasNextPage) {
            try {
                console.log(`Fetching page ${page} for ${repository}...`);

                const commitsResponse = await this.octokit.repos.listCommits({
                    owner,
                    repo: repoName,
                    per_page: 100,
                    page: page,
                    since: sinceDate.toISOString(),
                    until: untilDate.toISOString()
                });

                const commits = commitsResponse.data as CommitData[];

                // Add repository metadata to each commit
                const commitsWithRepo = commits.map(commit => ({
                    ...commit,
                    repository,
                    fetched_at: new Date()
                }));

                allCommits = allCommits.concat(commitsWithRepo);

                console.log(`Fetched ${commits.length} commits from page ${page} of ${repository}. Total so far: ${allCommits.length}`);

                hasNextPage = commits.length === 100;
                page++;

                // Rate limiting: delay between requests
                if (hasNextPage) {
                    console.log(`Waiting ${this.delayMs}ms before next request...`);
                    await this.delay(this.delayMs);
                }

            } catch (error: any) {
                if (attemptNum < 2) {
                    console.log(`Rate limit exceeded for ${repository}. Waiting ${this.delayMs}ms...`);
                    await this.delay(this.delayMs);
                    attemptNum++;
                    continue; // Retry the same page
                }
                console.error(`Error fetching commits from ${repository}:`, error);
                throw error;
            }
            attemptNum = 0;
        }

        console.log(`Finished fetching from ${repository}. Total commits retrieved: ${allCommits.length}`);
        return allCommits;
    }
}
