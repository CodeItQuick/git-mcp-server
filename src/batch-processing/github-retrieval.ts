import { Octokit } from "@octokit/rest";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

const MONGO_URL = "mongodb://localhost:27017/";
const DB_NAME = "github_data";
const COLLECTION_NAME = "commits";

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const fetchAndStoreCommits = async () => {
    const repo = "CodeItQuick/CodeItQuick.github.io";
    // Read token from environment
    const githubToken = process.env.GITHUB_TOKEN;
    if (!githubToken) throw new Error("GITHUB_TOKEN not found in environment");

    // Use Octokit to fetch commits
    const octokit = new Octokit({ auth: githubToken });
    const [owner, repoName] = repo.split("/");

    let allCommits: any[] = [];
    let page = 1;
    let hasNextPage = true;

    console.log(`Starting to fetch commits from ${repo}...`);

    while (hasNextPage) {
        try {
            console.log(`Fetching page ${page}...`);

            const commitsResponse = await octokit.repos.listCommits({
                owner,
                repo: repoName,
                per_page: 100,
                page: page
            });

            const commits = commitsResponse.data;
            allCommits = allCommits.concat(commits);

            console.log(`Fetched ${commits.length} commits from page ${page}. Total so far: ${allCommits.length}`);

            // Check if there are more pages
            hasNextPage = commits.length === 100;
            page++;

            // Rate limiting: delay between requests to respect GitHub API limits
            // GitHub allows 5,000 requests/hour, so we'll be conservative with 1.2 seconds between requests
            if (hasNextPage) {
                console.log('Waiting 1.2 seconds before next request...');
                await delay(1200);
            }

        } catch (error: any) {
            if (error.status === 403 && error.headers && error.headers['x-ratelimit-remaining'] === '0') {
                const resetTime = new Date(parseInt(error.headers['x-ratelimit-reset']) * 1000);
                const waitTime = resetTime.getTime() - Date.now() + 1000; // Add 1 second buffer
                console.log(`Rate limit exceeded. Waiting until ${resetTime.toISOString()}...`);
                await delay(waitTime);
                continue; // Retry the same page
            }
            throw error;
        }
    }

    console.log(`Finished fetching. Total commits retrieved: ${allCommits.length}`);

    // Connect to MongoDB
    const client = new MongoClient(MONGO_URL);
    await client.connect();
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);

    // Clear existing data and store all commits
    await collection.deleteMany({ "repository": repo });

    // Add repository info to each commit for better tracking
    const commitsWithRepo = allCommits.map(commit => ({
        ...commit,
        repository: repo,
        fetched_at: new Date()
    }));

    if (commitsWithRepo.length > 0) {
        await collection.insertMany(commitsWithRepo);
    }

    await client.close();

    return {
        content: [{
            type: "text",
            text: `Stored ${allCommits.length} commits from ${repo} in MongoDB across ${page - 1} pages.`
        }]
    };
};
