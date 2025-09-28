import { MongoClient } from "mongodb";

const MONGO_URL = "mongodb://localhost:27017/";
const DB_NAME = "github_data";
const DIFFS_COLLECTION = "commit_diffs";

export const getPatchLogs = async (days: { number_days: number } | undefined ) => {
    const client = new MongoClient(MONGO_URL);

    try {
        await client.connect();
        const db = client.db(DB_NAME);
        const collection = db.collection(DIFFS_COLLECTION);

        const daysAgo = days?.number_days || 7;
        const sinceDate = new Date();
        sinceDate.setDate(sinceDate.getDate() - daysAgo);

        // Query commits from the specified time period
        const commits = await collection.find({
            date: { $gte: sinceDate.toISOString() }
        }).sort({ date: -1 }).toArray();

        const patchLogs = commits.map((commit, idx) => {
            const shortSha = commit.sha ? commit.sha.substring(0, 7) : 'unknown';
            const patchContent = commit.patch || 'No patch data available';
            return `#${idx + 1} (${shortSha}): ${commit.commit_message}\n---\n${patchContent}\n`;
        });

        return {
            content: [{
                type: "text",
                text: `Patch notes for commits in the past ${daysAgo} days:\n\n` +
                    patchLogs.join('\n---\n')
            }]
        };

    } catch (error) {
        console.error('MongoDB error:', error);
        return {
            content: [{
                type: "text",
                text: `Error retrieving commit patches from MongoDB: ${error}`
            }]
        };
    } finally {
        await client.close();
    }
};
