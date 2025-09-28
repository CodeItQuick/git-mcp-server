import { Octokit } from "@octokit/rest";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

const MONGO_URL = "mongodb://localhost:27017/";
const DB_NAME = "github_data";
const COMMITS_COLLECTION = "commits";
const DIFFS_COLLECTION = "commit_diffs";

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

interface CommitDiff {
    sha: string;
    repository: string;
    commit_message: string;
    author: string;
    date: string;
    files: any[];
    stats: {
        additions: number;
        deletions: number;
        total: number;
    };
    patch?: string;
    fetched_at: Date;
}

export const fetchAndStoreCommitDiffs = async () => {
    const repo = "CodeItQuick/CodeItQuick.github.io";
    // Read token from environment
    const githubToken = process.env.GITHUB_TOKEN;
    if (!githubToken) throw new Error("GITHUB_TOKEN not found in environment");

    // Use Octokit to fetch commit details
    const octokit = new Octokit({ auth: githubToken });
    const [owner, repoName] = repo.split("/");

    // Connect to MongoDB
    const client = new MongoClient(MONGO_URL);
    await client.connect();
    const db = client.db(DB_NAME);
    const commitsCollection = db.collection(COMMITS_COLLECTION);
    const diffsCollection = db.collection(DIFFS_COLLECTION);

    console.log(`Starting to fetch commit diffs for ${repo}...`);

    // Retrieve commits from database
    const commits = await commitsCollection.find({ "repository": repo }).toArray();
    console.log(`Found ${commits.length} commits in database`);

    if (commits.length === 0) {
        console.log("No commits found in database. Please run github-retrieval first.");
        await client.close();
        return {
            content: [{
                type: "text",
                text: "No commits found in database. Please run github-retrieval first."
            }]
        };
    }

    // Clear existing diff data for this repository
    await diffsCollection.deleteMany({ "repository": repo });

    let processedDiffs: CommitDiff[] = [];
    let processedCount = 0;

    for (const commit of commits) {
        try {
            console.log(`Fetching diff for commit ${processedCount + 1}/${commits.length}: ${commit.sha?.substring(0, 7)}...`);

            // Fetch detailed commit information including diff
            const commitResponse = await octokit.repos.getCommit({
                owner,
                repo: repoName,
                ref: commit.sha
            });

            const commitData = commitResponse.data;

            const commitDiff: CommitDiff = {
                sha: commit.sha,
                repository: repo,
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

            processedDiffs.push(commitDiff);
            processedCount++;

            console.log(`Processed commit ${commit.sha?.substring(0, 7)} - ${commitDiff.stats.additions}+ ${commitDiff.stats.deletions}- changes across ${commitDiff.files.length} files`);

            // Batch insert every 50 diffs to avoid memory issues
            if (processedDiffs.length >= 50) {
                await diffsCollection.insertMany(processedDiffs);
                console.log(`Stored batch of ${processedDiffs.length} commit diffs in database`);
                processedDiffs = [];
            }

            // Rate limiting: delay between requests to respect GitHub API limits
            await delay(1200);

        } catch (error: any) {
            if (error.status === 403 && error.headers && error.headers['x-ratelimit-remaining'] === '0') {
                const resetTime = new Date(parseInt(error.headers['x-ratelimit-reset']) * 1000);
                const waitTime = resetTime.getTime() - Date.now() + 1000; // Add 1 second buffer
                console.log(`Rate limit exceeded. Waiting until ${resetTime.toISOString()}...`);
                await delay(waitTime);
                // Retry the same commit by decrementing processedCount
                processedCount--;
                continue;
            } else if (error.status === 404) {
                console.warn(`Commit ${commit.sha?.substring(0, 7)} not found (possibly deleted or inaccessible)`);
                processedCount++;
                continue;
            }
            console.error(`Error processing commit ${commit.sha}: ${error.message}`);
            processedCount++;
        }
    }

    // Insert any remaining diffs
    if (processedDiffs.length > 0) {
        await diffsCollection.insertMany(processedDiffs);
        console.log(`Stored final batch of ${processedDiffs.length} commit diffs in database`);
    }

    await client.close();

    console.log(`Finished fetching commit diffs. Total processed: ${processedCount}/${commits.length}`);

    return {
        content: [{
            type: "text",
            text: `Stored ${processedCount} commit diffs from ${repo} in MongoDB. Retrieved from ${commits.length} commits in database.`
        }]
    };
};
