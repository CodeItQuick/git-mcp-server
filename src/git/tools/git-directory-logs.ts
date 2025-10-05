import {FindCursor, MongoClient} from "mongodb";
import { IMongoClient } from "../IMongoClient";
import { CallToolResult } from "@modelcontextprotocol/sdk/types";

export const getDirectoryLogs = async (
    dir: { directory: string, repository: string; } | undefined,
    client: IMongoClient = new MongoClient("mongodb://localhost:27017/") as unknown as IMongoClient
) => {
    const DB_NAME = "github_data";
    const CONTENT_COLLECTION = "repository_content";

    if (dir?.repository === undefined) {
        return {
            content: [{
                type: "text",
                text: `Error retrieving repository context from undefined`
            }]
        };
    }

    try {
        await client.connect();
        const db = client.db(DB_NAME);
        const collection = db.collection(CONTENT_COLLECTION);

        const directory = dir?.directory || "";

        // Query files that are in the specified directory
        // Use regex to match files that start with the directory path
        const directoryPattern = directory ? `^${directory.replace(/\/$/, '')}/[^/]+$` : `^[^/]+$`;

        const files = await collection.find({
            path: { $regex: directoryPattern },
            type: "file",
            repository: dir?.repository
        }).sort({ path: 1 }).toArray();

        const fileLogs = files.map((file, idx) => {
            return `#${idx + 1}(file_sha: ${file.sha}): ${file.name}`;
        });

        const directoryDisplay = directory || "root";

        return {
            content: [{
                type: "text",
                text: `Directory: ${directoryDisplay}\nRepository: ${dir?.repository}\nFiles found: ${files.length}\n\n${fileLogs.join('\n')}`
            }]
        };
    } catch (error: any) {
        return {
            content: [{
                type: "text",
                text: `Error retrieving repository context: ${error.message}`
            }]
        };
    } finally {
        await client.close();
    }
};
