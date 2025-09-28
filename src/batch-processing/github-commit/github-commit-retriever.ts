import { Octokit } from "@octokit/rest";
import { CommitDataRetriever, CommitData } from "../commit-data-adapter";

export class GitHubCommitRetriever implements CommitDataRetriever {
    private octokit: Octokit;
    private delayMs: number;

    constructor(githubToken: string, delayMs: number = 1200) {
        this.octokit = new Octokit({ auth: githubToken });
        this.delayMs = delayMs;
    }

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async fetchCommits(repository: string): Promise<CommitData[]> {
        const [owner, repoName] = repository.split("/");
        if (!owner || !repoName) {
            throw new Error(`Invalid repository format: ${repository}. Expected format: owner/repo`);
        }

        let allCommits: CommitData[] = [];
        let page = 1;
        let hasNextPage = true;

        console.log(`Starting to fetch commits from ${repository}...`);

        while (hasNextPage) {
            try {
                console.log(`Fetching page ${page}...`);

                const commitsResponse = await this.octokit.repos.listCommits({
                    owner,
                    repo: repoName,
                    per_page: 100,
                    page: page
                });

                const commits = commitsResponse.data as CommitData[];
                allCommits = allCommits.concat(commits);

                console.log(`Fetched ${commits.length} commits from page ${page}. Total so far: ${allCommits.length}`);

                // Check if there are more pages
                hasNextPage = commits.length === 100;
                page++;

                // Rate limiting: delay between requests to respect GitHub API limits
                if (hasNextPage) {
                    console.log(`Waiting ${this.delayMs}ms before next request...`);
                    await this.delay(this.delayMs);
                }

            } catch (error: any) {
                if (error.status === 403 && error.headers && error.headers['x-ratelimit-remaining'] === '0') {
                    const resetTime = new Date(parseInt(error.headers['x-ratelimit-reset']) * 1000);
                    const waitTime = resetTime.getTime() - Date.now() + 1000; // Add 1 second buffer
                    console.log(`Rate limit exceeded. Waiting until ${resetTime.toISOString()}...`);
                    await this.delay(waitTime);
                    continue; // Retry the same page
                }
                throw error;
            }
        }

        console.log(`Finished fetching. Total commits retrieved: ${allCommits.length}`);
        return allCommits;
    }
}
