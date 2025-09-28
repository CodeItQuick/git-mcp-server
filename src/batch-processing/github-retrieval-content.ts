import { Octokit } from "@octokit/rest";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

const MONGO_URL = "mongodb://localhost:27017/";
const DB_NAME = "github_data";
const COLLECTION_NAME = "repository_content";

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

interface FileContent {
    path: string;
    name: string;
    sha: string;
    size: number;
    url: string;
    html_url: string;
    git_url: string;
    download_url: string | null;
    type: string;
    content?: string;
    encoding?: string;
    repository: string;
    fetched_at: Date;
}

export const fetchAndStoreRepositoryContent = async () => {
    const repo = "CodeItQuick/CodeItQuick.github.io";
    // Read token from environment
    const githubToken = process.env.GITHUB_TOKEN;
    if (!githubToken) throw new Error("GITHUB_TOKEN not found in environment");

    // Use Octokit to fetch repository content
    const octokit = new Octokit({ auth: githubToken });
    const [owner, repoName] = repo.split("/");

    let allContent: FileContent[] = [];
    const pathsToProcess: string[] = [''];  // Start with root directory

    console.log(`Starting to fetch repository content from ${repo}...`);

    while (pathsToProcess.length > 0) {
        const currentPath = pathsToProcess.shift()!;

        try {
            console.log(`Fetching content from path: ${currentPath || 'root'}...`);

            const contentResponse = await octokit.repos.getContent({
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
                    // For files, fetch the content if it's not too large (< 1MB)
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
                        repository: repo,
                        fetched_at: new Date()
                    };

                    // Fetch actual file content for text files under 1MB
                    if (item.size < 1024 * 1024 && item.download_url) {
                        try {
                            const fileResponse = await octokit.repos.getContent({
                                owner,
                                repo: repoName,
                                path: item.path
                            });

                            if ('content' in fileResponse.data && fileResponse.data.content) {
                                fileContent.content = fileResponse.data.content;
                                fileContent.encoding = fileResponse.data.encoding;
                            }

                            // Rate limiting between file content requests
                            await delay(200);

                        } catch (error: any) {
                            console.warn(`Could not fetch content for ${item.path}: ${error.message}`);
                        }
                    }

                    allContent.push(fileContent);
                    console.log(`Processed file: ${item.path} (${item.size} bytes)`);
                }
            }

            console.log(`Processed ${items.length} items from ${currentPath || 'root'}. Queue length: ${pathsToProcess.length}`);

            // Rate limiting: delay between directory requests
            await delay(1200);

        } catch (error: any) {
            if (error.status === 403 && error.headers && error.headers['x-ratelimit-remaining'] === '0') {
                const resetTime = new Date(parseInt(error.headers['x-ratelimit-reset']) * 1000);
                const waitTime = resetTime.getTime() - Date.now() + 1000; // Add 1 second buffer
                console.log(`Rate limit exceeded. Waiting until ${resetTime.toISOString()}...`);
                await delay(waitTime);
                // Re-add the current path to retry
                pathsToProcess.unshift(currentPath);
                continue;
            }
            console.error(`Error processing path ${currentPath}: ${error.message}`);
        }
    }

    console.log(`Finished fetching. Total files retrieved: ${allContent.length}`);

    // Connect to MongoDB
    const client = new MongoClient(MONGO_URL);
    await client.connect();
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);

    // Clear existing data for this repository and store all content
    await collection.deleteMany({ "repository": repo });

    if (allContent.length > 0) {
        await collection.insertMany(allContent);
    }

    await client.close();

    return {
        content: [{
            type: "text",
            text: `Stored ${allContent.length} files from ${repo} repository content in MongoDB.`
        }]
    };
};
