import { MongoClient } from "mongodb";
import { IMongoClient } from "./IMongoClient";

const DB_NAME = "github_data";
const DIFFS_COLLECTION = "commit_diffs";

export const getUserHistory = async (
    userQuery: {
        username: 'CodeItQuick',
        exact_date: string
    } | undefined,
    client: IMongoClient = new MongoClient("mongodb://localhost:27017/") as unknown as IMongoClient
) => {
    if (!userQuery?.exact_date) {
        return {
            content: [{
                type: "text",
                text: `Error: since_date parameter is required. Use format: YYYY-MM-DD`
            }]
        };
    }

    try {
        await client.connect();
        const db = client.db(DB_NAME);
        const collection = db.collection(DIFFS_COLLECTION);

        const username = userQuery.username || "CodeItQuick";
        const exactDate = new Date(userQuery.exact_date)

        if (isNaN(exactDate.getTime())) {
            return {
                content: [{
                    type: "text",
                    text: `Error: Invalid date format '${exactDate}'. Use format: YYYY-MM-DD`
                }]
            };
        }

        // Query commits by the specified user since the given date across all repositories
        let nextDay = new Date(exactDate);
        nextDay.setDate(exactDate.getDate() + 1)
        console.log(exactDate.toISOString())
        console.log(nextDay.toISOString())
        const commits = await collection.find({
            author: username, // Case-insensitive match
            date: { $gte: exactDate.toISOString(), $lt: nextDay.toISOString() }
        }).sort({ date: -1 }).toArray();

        if (commits.length === 0) {
            return {
                content: [{
                    type: "text",
                    text: `No commits found for user '${username}' across all repositories since ${exactDate}`
                }]
            };
        }

        const userHistory = commits.map((commit, idx) => {
            const filesChanged = commit.files?.map((f: { filename: string; }) => f.filename).join(', ') || 'No files';
            return `#${idx + 1} (commit_sha: ${commit.sha}): ${commit.commit_message} by ${commit.author} at ${commit.date}\n` +
                   `Repository: ${commit.repository || 'Unknown'}\n` +
                   `Files Changed: ${filesChanged}\n` +
                   `Stats: +${commit.stats?.additions || 0}/-${commit.stats?.deletions || 0} (~${commit.stats?.total || 0} lines)\n`;
                    // `Patch Content: \n ${patchContent}\n`;
        });

        const summary = `User History for '${username}' across all repositories since ${userQuery.exact_date}:\n` +
                       `Found ${commits.length} commits\n\n` +
                       userHistory.join('\n');

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
                text: `Error retrieving user history: ${error}`
            }]
        };
    } finally {
        await client.close();
    }
};
