import { MongoClient } from "mongodb";

const MONGO_URL = "mongodb://localhost:27017/";
const DB_NAME = "github_data";
const DIFFS_COLLECTION = "commit_diffs";

export const getNumLogs = async (days: { number_days: number } | undefined ) => {
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

        const commitLogs = commits.map((commit, idx) =>
            `#${idx + 1}: ${commit.commit_message} (${commit.stats.additions}+ ${commit.stats.deletions}- changes)`
        );

        return {
            content: [{
                type: "text",
                text: `The following commits have been made in the past ${daysAgo} days: ` +
                    commitLogs.join(', ')
            }]
        };

    } catch (error) {
        console.error('MongoDB error:', error);
        return {
            content: [{
                type: "text",
                text: `Error retrieving commits from MongoDB: ${error}`
            }]
        };
    } finally {
        await client.close();
    }
};
