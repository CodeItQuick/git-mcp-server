import { Octokit } from "@octokit/rest";
import { ContentDataRetriever, FileContent } from "./content-data-adapter";

export type IGetContent = Pick<Octokit, 'repos'> & {
    repos: Pick<Octokit['repos'], 'getContent'>;
};

export class GithubContentSupplier implements ContentDataRetriever {
    private octokit: IGetContent;
    private delayMs: number;

    constructor(githubToken: string, delayMs: number = 200, octakit: IGetContent) {
        this.octokit = octakit;
        this.delayMs = delayMs;
    }

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async fetchRepositoryContent(repository: string): Promise<FileContent[]> {
        const [owner, repoName] = repository.split("/");
        if (!owner || !repoName) {
            throw new Error(`Invalid repository format: ${repository}. Expected format: owner/repo`);
        }

        let allContent: FileContent[] = [];
        const pathsToProcess: string[] = [''];  // Start with root directory

        console.log(`Starting to fetch repository content from ${repository}...`);

        while (pathsToProcess.length > 0) {
            const currentPath = pathsToProcess.shift()!;

            try {
                console.log(`Fetching content from path: ${currentPath || 'root'}...`);

                const contentResponse = await this.octokit.repos.getContent({
                    owner,
                    repo: repoName,
                    path: currentPath
                });

                const items = Array.isArray(contentResponse.data)
                    ? contentResponse.data
                    : [contentResponse.data];

                for (const item of items) {
                    if (item.type === 'dir') {
                        // Add directory to processing queue
                        pathsToProcess.push(item.path);
                        console.log(`Added directory to queue: ${item.path}`);
                    } else if (item.type === 'file') {
                        // For files, create base file content
                        let fileContent: FileContent = {
                            path: item.path,
                            name: item.name,
                            sha: item.sha,
                            size: item.size,
                            url: item.url,
                            html_url: item.html_url ?? "",
                            git_url: item.git_url ?? "",
                            download_url: item.download_url,
                            type: item.type,
                            repository: repository,
                            fetched_at: new Date()
                        };

                        // Fetch actual file content for text files under 1MB
                        if (item.size < 1024 * 1024 && item.download_url) {
                            try {
                                const fileResponse = await this.octokit.repos.getContent({
                                    owner,
                                    repo: repoName,
                                    path: item.path
                                });

                                if ('content' in fileResponse.data && fileResponse.data.content) {
                                    fileContent.content = fileResponse.data.content;
                                    fileContent.encoding = fileResponse.data.encoding;
                                }

                                // Rate limiting between file content requests
                                await this.delay(this.delayMs);

                            } catch (error: any) {
                                console.warn(`Could not fetch content for ${item.path}: ${error.message}`);
                            }
                        }

                        allContent.push(fileContent);
                        console.log(`Processed file: ${item.path} (${item.size} bytes)`);
                    }
                }

                // Rate limiting between directory requests
                await this.delay(this.delayMs);

            } catch (error: any) {
                console.error(`Error processing path ${currentPath}: ${error.message}`);
                throw error;
            }
        }

        console.log(`Finished fetching ${allContent.length} files from ${repository}`);
        return allContent;
    }
}
