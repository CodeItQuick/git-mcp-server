import { MongoClient } from "mongodb";
import { IMongoClient } from "./IMongoClient";

const DB_NAME = "github_data";
const DIFFS_COLLECTION = "commit_diffs";

export const getFileHistory = async (
    file: { filename: string, repository: 'CodeItQuick/CodeItQuick.github.io' | 'CodeItQuick/blackjack-ensemble-blue' } | undefined,
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

    try {
        await client.connect();
        const db = client.db(DB_NAME);
        const collection = db.collection(DIFFS_COLLECTION);

        const filename = file?.filename;
        if (!filename) {
            return {
                content: [{
                    type: "text",
                    text: "Error: filename parameter is required"
                }]
            };
        }

        // Query commits that modified the specified file
        const commits = await collection.find({
            "files.filename": filename,
            repository: file?.repository
        }).sort({ date: -1 }).toArray();

        if (commits.length === 0) {
            return {
                content: [{
                    type: "text",
                    text: `No commit history found for file "${filename}" in repository ${file.repository}`
                }]
            };
        }

        const historyEntries = commits.map((commit, idx) => {
            // Find the specific file changes for the requested filename
            const fileChanges = commit.files?.filter((f: { filename: string; }) => f.filename === filename) || [];
            const allFilesChanged = commit.files?.map((f: { filename: string; }) => f.filename).join(', ') || 'No files listed';

            const fileDetails = fileChanges.map((f: {
                patch: string;
                filename: string;
                status: string;
                sha: string;
                additions: number;
                deletions: number;
            }) => {
                const patchPreview = f.patch ? f.patch.split('\n').slice(0, 5).join('\n') + (f.patch.split('\n').length > 5 ? '\n...' : '') : 'No patch data available';
                return `    File: ${f.filename}
    Status: ${f.status}
    File SHA: ${f.sha}
    Changes: +${f.additions} -${f.deletions}
    Patch Preview:
${patchPreview}`;
            }).join('\n\n');

            const commitDate = new Date(commit.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            return `#${idx + 1} Commit: ${commit.sha}
Date: ${commitDate}
Author: ${commit.author}
Message: ${commit.commit_message}
All Files Changed: ${allFilesChanged}

File-Specific Changes:
${fileDetails}`;
        });

        return {
            content: [{
                type: "text",
                text: `File History for "${filename}" in ${file.repository}:\n\n${historyEntries.join('\n\n' + '='.repeat(80) + '\n\n')}`
            }]
        };

    } catch (error) {
        console.error('MongoDB error:', error);
        return {
            content: [{
                type: "text",
                text: `Error retrieving file history from MongoDB: ${error}`
            }]
        };
    } finally {
        await client.close();
    }
};
