import { MongoClient } from "mongodb";
import { IMongoClient } from "../IMongoClient";
import { CallToolResult } from "@modelcontextprotocol/sdk/types";

const DB_NAME = "github_data";
const DIFFS_COLLECTION = "commit_diffs";

export const getRepositoryHistory = async (
    userQuery: {
        username: 'CodeItQuick',
        since_date: string
    } | undefined,
    client: IMongoClient = new MongoClient("mongodb://localhost:27017/") as unknown as IMongoClient
): Promise<CallToolResult> => {
    if (!userQuery?.since_date) {
        return {
            content: [{
                type: "text",
                text: `Error: exact_date parameter is required. Use format: YYYY-MM-DD`
            }]
        };
    }

    try {
        await client.connect();
        const db = client.db(DB_NAME);
        const collection = db.collection(DIFFS_COLLECTION);

        const username = userQuery.username || "CodeItQuick";
        const sinceDate = new Date(userQuery.since_date);

        if (isNaN(sinceDate.getTime())) {
            return {
                content: [{
                    type: "text",
                    text: `Error: Invalid date format '${sinceDate}'. Use format: YYYY-MM-DD`
                }],
                isError: true
            };
        }

        const commits = await collection.find({
            author: username,
            date: { $gte: sinceDate.toISOString() }
        }).sort({ date: -1 }).toArray();

        if (commits.length === 0) {
            return {
                content: [{
                    type: "text",
                    text: `No commits found for user '${username}' on ${userQuery.since_date}`
                }]
            };
        }

        // Extract unique repository names
        const repositorySet = new Set<string>();
        commits.forEach((commit) => {
            if (commit.repository) {
                repositorySet.add(commit.repository);
            }
        });

        const repositories = Array.from(repositorySet).sort();

        if (repositories.length === 0) {
            return {
                content: [{
                    type: "text",
                    text: `No repositories found for user '${username}' on ${userQuery.since_date} (found ${commits.length} commits but no repository information)`
                }]
            };
        }

        // Create detailed summary with commit counts per repository
        const repositoryStats = repositories.map(repo => {
            const repoCommits = commits.filter(c => c.repository === repo);
            const totalAdditions = repoCommits.reduce((sum, c) => sum + (c.stats?.additions || 0), 0);
            const totalDeletions = repoCommits.reduce((sum, c) => sum + (c.stats?.deletions || 0), 0);
            return {
                name: repo,
                commits: repoCommits.length,
                additions: totalAdditions,
                deletions: totalDeletions
            };
        });

        const summary = `Repository History for '${username}' on ${userQuery.since_date}:\n` +
                       `Found ${repositories.length} active repositories across ${commits.length} commits\n\n` +
                       repositoryStats.map(stat =>
                           `- ${stat.name}: ${stat.commits} commits (+${stat.additions}/-${stat.deletions} lines)`
                       ).join('\n') +
                       `\n\nRepository List:\n` +
                       repositories.map(repo => `- ${repo}`).join('\n');

        return {
            content: [{
                type: "text",
                text: summary
            }]
        };

    } catch (error) {
        return {
            content: [{
                type: "text",
                text: `Error retrieving repository history: ${error}`
            }],
            isError: true
        };
    } finally {
        await client.close();
    }
};

