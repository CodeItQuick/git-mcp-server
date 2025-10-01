import {  MongoClient } from "mongodb";
import { IMongoClient } from "./IMongoClient";

export const getFileContent = async (
    file: { filename: string, repository: 'CodeItQuick/CodeItQuick.github.io' | 'CodeItQuick/blackjack-ensemble-blue' } | undefined,
    client: IMongoClient = new MongoClient("mongodb://localhost:27017/") as unknown as IMongoClient
) => {
    const DB_NAME = "github_data";
    const CONTENT_COLLECTION = "repository_content";

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
        const collection = db.collection(CONTENT_COLLECTION);

        const filename = file?.filename;
        if (!filename) {
            return {
                content: [{
                    type: "text",
                    text: "Error: filename parameter is required"
                }]
            };
        }

        // Find the file by path (filename)
        const fileDoc = await collection.findOne({
            path: filename,
            type: "file",
            repository: file.repository
        });

        if (!fileDoc) {
            return {
                content: [{
                    type: "text",
                    text: `File "${filename}" not found in the repository`
                }]
            };
        }

        // Decode base64 content to regular text
        let decodedContent = "";
        if (fileDoc.content) {
            try {
                // Decode from base64 to UTF-8 text
                decodedContent = Buffer.from(fileDoc.content, 'base64').toString('utf-8');
            } catch (decodeError) {
                return {
                    content: [{
                        type: "text",
                        text: `Error decoding file content: ${decodeError}`
                    }]
                };
            }
        }

        return {
            content: [{
                type: "text",
                text: `File: ${filename}\nRepository: ${fileDoc.repository} commit_sha: ${fileDoc.sha}\n\n--- Content ---\n${decodedContent}`
            }]
        };

    } catch (error) {
        console.error('MongoDB error:', error);
        return {
            content: [{
                type: "text",
                text: `Error retrieving file content from MongoDB: ${error}`
            }]
        };
    } finally {
        await client.close();
    }
};
