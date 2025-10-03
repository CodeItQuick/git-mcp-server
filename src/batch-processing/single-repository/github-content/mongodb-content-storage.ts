import { MongoClient } from "mongodb";
import { ContentDataStorage, FileContent } from "./content-data-adapter";

export interface IDatabase {
    collection(collectionName: string): {
        deleteMany: (filter: any) => Promise<any>;
        insertMany: (docs: any[]) => Promise<any>;
    };
}

export interface IDeleteInsertMany {
    connect(): Promise<void>;
    db(dbName: string): IDatabase;
    close(): Promise<void>;
}

export class MongoDBContentStorage implements ContentDataStorage {
    private mongoUrl: string;
    private dbName: string;
    private collectionName: string;
    private client: IDeleteInsertMany;

    constructor(
        mongoUrl: string = "mongodb://localhost:27017/",
        dbName: string = "github_data",
        collectionName: string = "repository_content",
        client: IDeleteInsertMany = new MongoClient("mongodb://localhost:27017/") as unknown as IDeleteInsertMany
    ) {
        this.mongoUrl = mongoUrl;
        this.dbName = dbName;
        this.collectionName = collectionName;
        this.client = client;
    }

    async storeContent(content: FileContent[], repository: string): Promise<void> {
        try {
            await this.client.connect();
            const db = this.client.db(this.dbName);
            const collection = db.collection(this.collectionName);

            // Clear existing content for this repository
            await collection.deleteMany({ "repository": repository });

            // Add repository info and timestamp to each file content item
            const contentWithRepo = content.map(fileContent => ({
                ...fileContent,
                repository: repository,
                fetched_at: new Date()
            }));

            if (contentWithRepo.length > 0) {
                await collection.insertMany(contentWithRepo);
                console.log(`Stored ${contentWithRepo.length} files for ${repository} in MongoDB`);
            } else {
                console.log(`No content to store for ${repository}`);
            }

        } catch (error) {
            throw new Error(`MongoDB storage error: ${error}`);
        } finally {
            await this.client.close();
        }
    }
}
