import { MongoClient } from "mongodb";
import { IMongoClient } from "../IMongoClient";
import { CallToolResult } from "@modelcontextprotocol/sdk/types";

const DB_NAME = "github_data";
const SUMMARY_COLLECTION = "commit_summaries";

export const getSummaryLogs = async (
    file: { repository: string; start_date: string; end_date: string; author: string; } | undefined,
    client: IMongoClient = new MongoClient("mongodb://localhost:27017/") as unknown as IMongoClient
): Promise<CallToolResult> => {
    if (file?.repository === undefined) {
        return {
            content: [{
                type: "text",
                text: `Error retrieving repository context from undefined`
            }],
            isError: true
        };
    }

    try {
        await client.connect();
        const db = client.db(DB_NAME);
        const collection = db.collection(SUMMARY_COLLECTION);


        // Query summaries that modified the specified file
        const summaries = await collection.find({
            author: file?.author,
            repository: file?.repository,
            date: { $gte: new Date(file.start_date).toISOString(), $lt: new Date(file.end_date).toISOString() }
        }).sort({ date: -1 }).toArray();

        const summaryLogs = summaries.map((commit, idx) => {

            // Find the specific file changes for the requested filename
            const summaryContent = `${commit.sha}(message: ${commit.original_message})(${commit.date})(${commit.author}):\n${commit.summary}\n`;

            return `#Commit Summary #${idx + 1} \n---\n${summaryContent}\n`;
        });

        return {
            content: [{
                type: "text",
                text: `Summary notes for repository "${file?.repository}":\n\n` +
                    summaryLogs.join('\n---\n')
            }]
        };

    } catch (error) {
        console.error('MongoDB error:', error);
        return {
            content: [{
                type: "text",
                text: `Error retrieving commit patches from MongoDB: ${error}`
            }],
            isError: true
        };
    } finally {
        await client.close();
    }
};
