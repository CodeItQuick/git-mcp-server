import { MongoClient } from "mongodb";
import { IMongoClient } from "../IMongoClient";
import { CallToolResult } from "@modelcontextprotocol/sdk/types";

export const getCommitMessageLogs = async (
    days: { number_days: number, repository: 'CodeItQuick/CodeItQuick.github.io' | 'CodeItQuick/blackjack-ensemble-blue' } | undefined,
    client: IMongoClient = new MongoClient("mongodb://localhost:27017/") as unknown as IMongoClient
) => {
    const DB_NAME = "github_data";
    const DIFFS_COLLECTION = "commit_diffs";

    try {
        await client.connect();
        const db = client.db(DB_NAME);
        const collection = db.collection(DIFFS_COLLECTION);

        const daysAgo = days?.number_days || 7;
        const sinceDate = new Date();
        sinceDate.setDate(sinceDate.getDate() - daysAgo);

        // Query commits from the specified time period
        const commits = await collection.find({
            date: { $gte: sinceDate.toISOString() },
            repository: days?.repository
        }).sort({ date: -1 }).toArray();

        const commitLogs = commits.map((commit, idx) =>
            `#${idx + 1}(${commit.sha}): ${commit.commit_message} - ${commit.author} at ${commit.date} for ` +
            `${commit.files?.map((file: {filename: string;}) => file.filename)?.join(', ')})`
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
