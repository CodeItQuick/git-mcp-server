import { FindCursor } from "mongodb";


export interface IDatabase {
    collection(collectionName: string): {
        deleteMany: (filter: any) => Promise<any>;
        insertMany: (docs: any[]) => Promise<any>;
        find: (query: any) => FindCursor;
        findOne: (query: any) => Promise<any>;
    };
}

export interface IMongoClient {
    connect(): Promise<void>;
    db(dbName: string): IDatabase;
    close(): Promise<void>;
}