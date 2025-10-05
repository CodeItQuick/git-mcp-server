import { MongoClient } from "mongodb";
import { IMongoClient } from "../IMongoClient";
import { CallToolResult } from "@modelcontextprotocol/sdk/types";

const DB_NAME = "github_data";
const DIFFS_COLLECTION = "commit_diffs";

export const getPatchLogs = async (
    file: { filename: string, repository: string; } | undefined,
    client: IMongoClient = new MongoClient("mongodb://localhost:27017/") as unknown as IMongoClient
) => {
    if (file?.repository === undefined) {
        return {
            content: [{
                type: "text",
                text: `Error retrieving repository context from undefined`
            }]
        };
    }
    if (file?.filename === undefined || file.filename.length === 0) {
        return {
            content: [{
                type: "text",
                text: `Error retrieving filename context from undefined`
            }]
        };
    }

    try {
        await client.connect();
        const db = client.db(DB_NAME);
        const collection = db.collection(DIFFS_COLLECTION);

        const filename = file?.filename;
        if (!filename) {
            throw new Error("Filename parameter is required");
        }

        // Query commits that modified the specified file
        const commits = await collection.find({
            "files.filename": filename,
            repository: file?.repository
        }).sort({ date: -1 }).toArray();

        const patchLogs = commits.map((commit, idx) => {

            // Find the specific file changes for the requested filename
            const filesChanged = commit.files?.map((f: { filename: string;}) => f.filename).join(', ');
            const patchContent = commit.files?.map((f: { patch: string; filename: string; status: string; sha: string; additions: number; deletions: number; }) =>
                                        `${f.filename}(${f.status})(file_sha: ${f.sha})(+${f.additions}-${f.deletions}):\n${f.patch}\n`) || 'No patch data available for this file';

            return `#${idx + 1} (commit_sha: ${commit.sha}): ${commit.commit_message} by ${commit.author} \n --- ${filesChanged} ---` +
                   `\n---\n${patchContent}\n`;
        });

        return {
            content: [{
                type: "text",
                text: `Patch notes for file "${filename}":\n\n` +
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
