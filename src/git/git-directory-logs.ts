import { MongoClient } from "mongodb";

const MONGO_URL = "mongodb://localhost:27017/";
const DB_NAME = "github_data";
const CONTENT_COLLECTION = "repository_content";

export const getDirectoryLogs = async (dir: { directory: string } | undefined ) => {
    const client = new MongoClient(MONGO_URL);

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
            type: "file"
        }).sort({ path: 1 }).toArray();

        const fileLogs = files.map((file, idx) => {
            const fileSize = file.size ? `(${file.size} bytes)` : '';

            return `#${idx + 1}: ${file.name} ${fileSize}`;
        });

        const directoryDisplay = directory || "root";

        return {
            content: [{
                type: "text",
                text: `Files in directory "${directoryDisplay}":\n\n` +
                    (fileLogs.length > 0 ? fileLogs.join('\n') : 'No files found in this directory')
            }]
        };

    } catch (error) {
        console.error('MongoDB error:', error);
        return {
            content: [{
                type: "text",
                text: `Error retrieving directory contents from MongoDB: ${error}`
            }]
        };
    } finally {
        await client.close();
    }
};
